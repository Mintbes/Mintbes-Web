/**
 * Harmony JSON-RPC Service for Mintbes EPoS Dashboard
 * Full SmartStake "Bid Slots" Engine:
 * - Slot Ranges (1-20, 21-42, etc.)
 * - Bid (Raw Stake per Key)
 * - Effective Stake (Bounded 85% - 115%)
 * - Slots Requested vs Slots Allotted
 * - Used Stake vs Actual Stake
 * - Dynamic BLS Key Simulations (BLS +2, BLS +1, BLS -1, BLS -2)
 */

export const MY_ADDR = "one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k";
export const RPC_URL = "https://a.api.s0.t.hmny.io";
export const DEFAULT_INTERVAL_SECS = 30;

function cleanName(name, maxLen = 28) {
  if (!name) return "";
  const clean = name.replace(/[^\x20-\x7E]/g, "");
  return clean.trim().slice(0, maxLen);
}

/**
 * Fetch complete dashboard data with SmartStake "Bid Slots" structure
 */
export async function fetchHarmonyData(validatorAddress = MY_ADDR) {
  try {
    // 1. Fetch Header & Elected Validators in parallel
    const [headerRes, electedRes] = await Promise.all([
      fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "hmyv2_latestHeader",
          params: [],
          id: 1,
        }),
      }).then((r) => r.json()),
      fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "hmyv2_getElectedValidatorAddresses",
          params: [],
          id: 2,
        }),
      }).then((r) => r.json()),
    ]);

    const hdr = headerRes?.result || {};
    const electedAddrs = electedRes?.result || [];

    if (!electedAddrs.length) {
      throw new Error("No elected validator addresses returned from Harmony RPC.");
    }

    // 2. Batch Request for all validators + Wallet balance
    const batch = electedAddrs.map((addr, i) => ({
      jsonrpc: "2.0",
      method: "hmyv2_getValidatorInformation",
      params: [addr],
      id: i,
    }));

    // Balance query (id: 9998)
    batch.push({
      jsonrpc: "2.0",
      method: "hmy_getBalance",
      params: [validatorAddress, "latest"],
      id: 9998,
    });

    const batchRes = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    }).then((r) => r.json());

    if (!Array.isArray(batchRes)) {
      throw new Error("Invalid batch response from Harmony RPC.");
    }

    let walletBalance = 0.0;
    const rawValidators = [];
    let myData = null;

    for (const item of batchRes) {
      const iId = item?.id;

      if (iId === 9998) {
        const balRaw = item?.result;
        if (balRaw !== undefined && balRaw !== null) {
          try {
            if (typeof balRaw === "string" && balRaw.startsWith("0x")) {
              walletBalance = parseInt(balRaw, 16) / 1e18;
            } else {
              walletBalance = parseFloat(balRaw) / 1e18;
            }
          } catch (e) {
            console.warn("Failed to parse balance", e);
          }
        }
        continue;
      }

      const v = item?.result || {};
      const valData = v.validator || {};
      const addr = valData.address || "";
      const rawName = valData.name || (addr ? `${addr.slice(0, 12)}...` : "Unknown");
      const name = cleanName(rawName);
      const delg = (parseFloat(v["total-delegation"] || 0)) / 1e18;
      const keys = valData["bls-public-keys"] || [];
      const rewards = (parseFloat(v.lifetime?.["reward-accumulated"] || 0)) / 1e18;
      const rate = (parseFloat(valData.rate || 0)) * 100;

      const delegations = valData.delegations || [];
      const myDel = delegations.find((d) => d["delegator-address"] === validatorAddress);
      const unclaimed = myDel ? (parseFloat(myDel.reward || 0) / 1e18) : 0.0;

      const isMe = addr.toLowerCase() === validatorAddress.toLowerCase();

      if (keys.length > 0 && delg > 0) {
        const bid = delg / keys.length;
        const obj = {
          name,
          addr,
          keys: keys.length,
          blsKeys: keys,
          slotsRequested: keys.length,
          slotsAllotted: keys.length,
          bid,
          actualStake: delg,
          usedStake: bid * keys.length,
          rewards,
          unclaimed,
          rate,
          is_me: isMe,
          rawValidator: v,
        };
        rawValidators.push(obj);
        if (isMe) {
          myData = obj;
        }
      }
    }

    // Sort by Bid descending
    rawValidators.sort((a, b) => b.bid - a.bid);

    // Flatten all slots globally to compute Median and Bounds
    const allSlots = [];
    rawValidators.forEach((v) => {
      for (let k = 0; k < v.slotsAllotted; k++) {
        allSlots.push({
          address: v.addr,
          validatorName: v.name,
          bid: v.bid,
          isMe: v.is_me,
        });
      }
    });

    const totalSlotsCount = allSlots.length;
    const medianSlotIdx = Math.floor(totalSlotsCount / 2);
    const medianBid = allSlots[medianSlotIdx]?.bid || 0;
    const upperBound = medianBid * 1.15; // 115% EPoS cap
    const lowerBound = medianBid * 0.85; // 85% EPoS boost

    const cutoffSlot = allSlots[allSlots.length - 1] || { bid: 0 };
    const cutoffBid = cutoffSlot.bid;

    // Calculate Slot Ranges & Simulations (BLS +2, +1, -1, -2) for each validator
    let currentSlot = 1;
    let totalEffectiveStake = 0;

    rawValidators.forEach((v, index) => {
      v.validatorRank = index + 1;
      v.slotStart = currentSlot;
      v.slotEnd = currentSlot + v.slotsAllotted - 1;
      v.slotRange = v.slotsAllotted === 1 ? `${currentSlot}` : `${currentSlot}-${v.slotEnd}`;
      currentSlot += v.slotsAllotted;

      // Effective Stake
      let eff = v.bid;
      let eposStatus = "OPTIMAL";
      let statusLabel = "Óptimo (100%)";

      if (v.bid > upperBound) {
        eff = upperBound;
        eposStatus = "CAPPED";
        statusLabel = "Topado (115%)";
      } else if (v.bid < lowerBound) {
        eff = lowerBound;
        eposStatus = "BOOSTED";
        statusLabel = "Bonificado (85%)";
      }

      v.effectiveStake = eff;
      v.eposStatus = eposStatus;
      v.statusLabel = statusLabel;
      totalEffectiveStake += (eff * v.slotsAllotted);

      // BLS Simulations (+2, +1, -1, -2)
      [2, 1, -1, -2].forEach((delta) => {
        const newKeys = v.slotsRequested + delta;
        const bracketKey = `bls_${delta > 0 ? '+' : ''}${delta}`;
        const explicitKey = delta > 0 ? `bls_plus_${delta}` : `bls_minus_${Math.abs(delta)}`;
        const shortKey = `bls_${delta}`;

        if (newKeys <= 0) {
          v[bracketKey] = "-";
          v[explicitKey] = "-";
          v[shortKey] = "-";
          return;
        }

        const simBid = v.actualStake / newKeys;
        const otherSlots = allSlots.filter((s) => s.address !== v.addr);
        const simStart = otherSlots.filter((s) => s.bid >= simBid).length + 1;
        const simEnd = simStart + newKeys - 1;
        const rangeStr = `${simStart}-${simEnd}`;

        v[bracketKey] = rangeStr;
        v[explicitKey] = rangeStr;
        v[shortKey] = rangeStr;
      });
    });

    // Compute Voting Power % per validator
    rawValidators.forEach((v) => {
      const validatorTotalEff = v.effectiveStake * v.slotsAllotted;
      v.votingPower = totalEffectiveStake > 0 ? (validatorTotalEff / totalEffectiveStake) * 100 : 0;
      v.votingPowerPerSlot = v.slotsAllotted > 0 ? (v.votingPower / v.slotsAllotted) : 0;
    });

    // Enhance myData
    if (myData) {
      myData.margin = myData.bid - cutoffBid;
      myData.pct_margin = cutoffBid > 0 ? (myData.margin / cutoffBid) * 100 : 0;
      myData.daily_estimate = (myData.actualStake * 0.072) / 365;
      myData.backup_pct = medianBid > 0 ? Math.min(100, (myData.bid / medianBid) * 100) : 100;
    }

    return {
      success: true,
      header: {
        epoch: hdr.epoch || 0,
        blockNumber: hdr.blockNumber || 0,
        shardID: hdr.shardID || 0,
        viewID: hdr.viewID || 0,
        timestamp: new Date().toLocaleTimeString(),
      },
      stats: {
        totalNodes: rawValidators.length,
        totalSlots: totalSlotsCount,
        medianStake: medianBid,
        cutoffStake: cutoffBid,
        upperBound,
        lowerBound,
        totalEffectiveStake,
      },
      myData,
      walletBalance,
      validators: rawValidators,
    };
  } catch (error) {
    console.error("Error fetching Harmony EPoS data:", error);
    return {
      success: false,
      error: error.message || "Failed to communicate with Harmony RPC",
    };
  }
}

/**
 * Calculates EPoS Key simulation against all validator slots
 */
export function calculateKeySimulation(totalStake, allValidators, cutoffBid, activeKeys = 5) {
  if (!totalStake) return [];

  // Flatten other slots
  const otherSlots = [];
  (allValidators || []).forEach((v) => {
    if (!v.is_me) {
      for (let k = 0; k < v.slotsAllotted; k++) {
        otherSlots.push({ bid: v.bid });
      }
    }
  });

  const results = [];
  for (let k = 1; k <= 8; k++) {
    const simBid = totalStake / k;
    const simStart = otherSlots.filter((s) => s.bid >= simBid).length + 1;
    const simEnd = simStart + k - 1;
    const simMargin = simBid - cutoffBid;
    const simPct = cutoffBid > 0 ? (simMargin / cutoffBid) * 100 : 0;
    const isActive = k === activeKeys;

    let status = "OPTIMO";
    let statusLabel = "Óptimo (100% Seguro)";

    if (simMargin <= 0 || simStart > 400) {
      status = "FUERA";
      statusLabel = "Fuera del Comité";
    } else if (simMargin < 600000) {
      status = "ALTO_RIESGO";
      statusLabel = "Alto Riesgo";
    } else if (simMargin < 1300000) {
      status = "MODERADO";
      statusLabel = "Moderado";
    }

    results.push({
      keys: k,
      stake_per_key: simBid,
      slotRange: `${simStart}-${simEnd}`,
      slotRankStart: simStart,
      slotRankEnd: simEnd,
      margin: simMargin,
      pct: simPct,
      isActive,
      status,
      statusLabel,
    });
  }

  return results;
}
