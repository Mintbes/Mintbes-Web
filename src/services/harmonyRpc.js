/**
 * Harmony JSON-RPC Service for Mintbes EPoS Dashboard
 * Enhanced with SmartStake Auction Engine:
 * - Slot-by-slot ranking (1 to 400 slots)
 * - Raw Bid vs Effective Stake (85% - 115% EPoS bounds)
 * - Voting Power percentage calculation
 */

export const MY_ADDR = "one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k";
export const RPC_URL = "https://a.api.s0.t.hmny.io";
export const DEFAULT_INTERVAL_SECS = 30;

function cleanName(name, maxLen = 24) {
  if (!name) return "";
  const clean = name.replace(/[^\x20-\x7E]/g, "");
  return clean.trim().slice(0, maxLen);
}

/**
 * Fetch complete dashboard data with SmartStake slot decomposition
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
    const validators = [];
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
        const stakePerKey = delg / keys.length;
        const obj = {
          name,
          addr,
          keys: keys.length,
          blsKeys: keys,
          stake_per_key: stakePerKey,
          total_delg: delg,
          rewards,
          unclaimed,
          rate,
          is_me: isMe,
          rawValidator: v,
        };
        validators.push(obj);
        if (isMe) {
          myData = obj;
        }
      }
    }

    // =========================================================================
    // SMARTSTAKE ENGINE: DECOMPOSE INTO 396+ INDIVIDUAL SLOTS (BLS KEYS)
    // =========================================================================
    const allSlots = [];
    validators.forEach((val) => {
      val.blsKeys.forEach((keyHex, idx) => {
        allSlots.push({
          validatorName: val.name,
          address: val.addr,
          keyHex,
          keyIndex: idx + 1,
          totalKeys: val.keys,
          rawBid: val.stake_per_key,
          totalDelegation: val.total_delg,
          rate: val.rate,
          isMe: val.is_me,
        });
      });
    });

    // Sort all slots globally by rawBid descending
    allSlots.sort((a, b) => b.rawBid - a.rawBid);

    // Add slot rank
    allSlots.forEach((slot, index) => {
      slot.slotRank = index + 1;
    });

    const totalSlots = allSlots.length;
    const medianSlotIdx = Math.floor(totalSlots / 2);
    const medianSlotBid = allSlots[medianSlotIdx]?.rawBid || 0;
    const upperBound = medianSlotBid * 1.15; // 115% EPoS cap
    const lowerBound = medianSlotBid * 0.85; // 85% EPoS boost

    const cutoffSlot = allSlots[allSlots.length - 1] || { rawBid: 0 };
    const cutoffBid = cutoffSlot.rawBid;

    // Compute Effective Stake and Voting Power
    let totalEffectiveStake = 0;
    allSlots.forEach((s) => {
      let eff = s.rawBid;
      let eposStatus = "OPTIMAL";
      let statusLabel = "Óptimo (100%)";

      if (s.rawBid > upperBound) {
        eff = upperBound;
        eposStatus = "CAPPED";
        statusLabel = "Topado (115%)";
      } else if (s.rawBid < lowerBound) {
        eff = lowerBound;
        eposStatus = "BOOSTED";
        statusLabel = "Bonificado (85%)";
      }

      s.effectiveStake = eff;
      s.eposStatus = eposStatus;
      s.statusLabel = statusLabel;
      totalEffectiveStake += eff;
    });

    // Calculate voting power % per slot
    allSlots.forEach((s) => {
      s.votingPower = totalEffectiveStake > 0 ? (s.effectiveStake / totalEffectiveStake) * 100 : 0;
    });

    // Sort validators by validator rank (average stake per key)
    validators.sort((a, b) => b.stake_per_key - a.stake_per_key);

    // Filter Mintbes slots
    const mintbesSlots = allSlots.filter((s) => s.isMe);
    const totalMintbesVotingPower = mintbesSlots.reduce((sum, s) => sum + s.votingPower, 0);

    // Enhance myData
    if (myData) {
      const myIdx = validators.findIndex((v) => v.is_me);
      myData.rank = myIdx + 1;
      myData.margin = myData.stake_per_key - cutoffBid;
      myData.pct_margin = cutoffBid > 0 ? (myData.margin / cutoffBid) * 100 : 0;
      myData.daily_estimate = (myData.total_delg * 0.072) / 365;
      myData.backup_pct = medianSlotBid > 0 ? Math.min(100, (myData.stake_per_key / medianSlotBid) * 100) : 100;
      myData.mintbesSlots = mintbesSlots;
      myData.totalVotingPower = totalMintbesVotingPower;
      myData.firstSlotRank = mintbesSlots[0]?.slotRank || 0;
      myData.lastSlotRank = mintbesSlots[mintbesSlots.length - 1]?.slotRank || 0;
      myData.effectiveStakePerSlot = mintbesSlots[0]?.effectiveStake || myData.stake_per_key;
      myData.eposStatus = mintbesSlots[0]?.eposStatus || "OPTIMAL";
      myData.statusLabel = mintbesSlots[0]?.statusLabel || "Óptimo";
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
        totalNodes: validators.length,
        totalSlots,
        medianStake: medianSlotBid,
        cutoffStake: cutoffBid,
        upperBound,
        lowerBound,
        totalEffectiveStake,
      },
      myData,
      walletBalance,
      validators,
      slots: allSlots,
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
 * Calculates EPoS Key simulation against the global slots auction
 */
export function calculateKeySimulation(totalStake, allSlots, cutoffBid, activeKeys = 5) {
  if (!totalStake) return [];

  const results = [];
  const otherSlots = (allSlots || []).filter((s) => !s.isMe);

  for (let k = 1; k <= 8; k++) {
    const simSpk = totalStake / k;

    // Simulate where this bid would land in the global slots list
    const simSlotRank = otherSlots.filter((s) => s.rawBid >= simSpk).length + 1;
    const simMargin = simSpk - cutoffBid;
    const simPct = cutoffBid > 0 ? (simMargin / cutoffBid) * 100 : 0;
    const isActive = k === activeKeys;

    let status = "OPTIMO";
    let statusLabel = "Óptimo (100% Seguro)";
    let color = "emerald";

    if (simMargin <= 0 || simSlotRank > (allSlots?.length || 400)) {
      status = "FUERA";
      statusLabel = "Fuera del Comité";
      color = "rose";
    } else if (simMargin < 600000) {
      status = "ALTO_RIESGO";
      statusLabel = "Alto Riesgo";
      color = "amber";
    } else if (simMargin < 1300000) {
      status = "MODERADO";
      statusLabel = "Moderado";
      color = "cyan";
    }

    results.push({
      keys: k,
      stake_per_key: simSpk,
      slotRankStart: simSlotRank,
      slotRankEnd: simSlotRank + k - 1,
      margin: simMargin,
      pct: simPct,
      isActive,
      status,
      statusLabel,
      color,
    });
  }

  return results;
}
