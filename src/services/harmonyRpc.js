/**
 * Harmony JSON-RPC Service for Mintbes EPoS Dashboard
 * Fully updated with the complete features from epos_dashboard.py:
 * - Epoch Last Block & Countdown calculation
 * - Hourly signing performance tracking (with localStorage persistence)
 * - Epoch performance history (last 15 epochs with APR & Signing %)
 * - Full Delegators breakdown (Top 20 + rest, Self-stake detection)
 * - EPoS Smart Key Advisor (Key addition/removal safety analysis)
 * - SmartStake "Bid Slots" Auction Engine (1-400 slots, BLS +2/+1/-1/-2 shifts)
 */

export const MY_ADDR = "one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k";
export const RPC_URL = "https://a.api.s0.t.hmny.io";
export const DEFAULT_INTERVAL_SECS = 30;
export const HOURLY_STORAGE_KEY = "mintbes_validator_hourly_perf";

function cleanName(name, maxLen = 28) {
  if (!name) return "";
  const clean = name.replace(/[^\x20-\x7E]/g, "");
  return clean.trim().slice(0, maxLen);
}

export function shortAddr(addr) {
  if (!addr) return "";
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 9)}...${addr.slice(-6)}`;
}

/**
 * Hourly performance tracking stored in browser localStorage
 */
export function trackHourlyPerformance(epoch, epSigned, epToSign, myStake, myRate) {
  try {
    let hist = { hourly: [], lastSnapshot: null };
    const saved = localStorage.getItem(HOURLY_STORAGE_KEY);
    if (saved) {
      hist = JSON.parse(saved);
    }

    const now = new Date();
    const hourKey = `${now.toISOString().slice(0, 10)} ${String(now.getUTCHours()).padStart(2, '0')}:00 (GMT)`;

    const poolDaily = (myStake * 0.112) / 365;
    const validatorHourComm = (poolDaily / 24.0) * (myRate / 100.0);

    const last = hist.lastSnapshot;
    let hourlyList = hist.hourly || [];

    if (!last || last.epoch !== epoch) {
      hist.lastSnapshot = {
        epoch,
        signed: epSigned,
        to_sign: epToSign,
        time: Date.now(),
        hour_key: hourKey,
      };

      const found = hourlyList.find((h) => h.date === hourKey && h.epoch === epoch);
      if (!found) {
        hourlyList.unshift({
          date: hourKey,
          epoch,
          asked: 0,
          signed: 0,
          missed: 0,
          sign_pct: 100.0,
          rewards: 0.0,
          start_signed: epSigned,
          start_to_sign: epToSign,
        });
      }
      hist.hourly = hourlyList.slice(0, 48);
      localStorage.setItem(HOURLY_STORAGE_KEY, JSON.stringify(hist));
      return hist.hourly;
    }

    let curEntry = hourlyList.find((h) => h.date === hourKey && h.epoch === epoch);

    if (!curEntry) {
      const startS = last.signed || 0;
      const startTs = last.to_sign || 0;
      const asked = Math.max(0, epToSign - startTs);
      const sgn = Math.max(0, epSigned - startS);
      const missed = Math.max(0, asked - sgn);
      const pct = asked > 0 ? (sgn / asked) * 100 : 100.0;
      const rew = validatorHourComm * (asked > 0 ? sgn / asked : 1.0);

      curEntry = {
        date: hourKey,
        epoch,
        asked,
        signed: sgn,
        missed,
        sign_pct: pct,
        rewards: rew,
        start_signed: startS,
        start_to_sign: startTs,
      };
      hourlyList.unshift(curEntry);
    } else {
      const startS = curEntry.start_signed !== undefined ? curEntry.start_signed : last.signed;
      const startTs = curEntry.start_to_sign !== undefined ? curEntry.start_to_sign : last.to_sign;
      const asked = Math.max(0, epToSign - startTs);
      const sgn = Math.max(0, epSigned - startS);
      const missed = Math.max(0, asked - sgn);
      const pct = asked > 0 ? (sgn / asked) * 100 : 100.0;
      const rew = validatorHourComm * (asked > 0 ? sgn / asked : 1.0);

      curEntry.asked = asked;
      curEntry.signed = sgn;
      curEntry.missed = missed;
      curEntry.sign_pct = pct;
      curEntry.rewards = rew;
    }

    hist.lastSnapshot = {
      epoch,
      signed: epSigned,
      to_sign: epToSign,
      time: Date.now(),
      hour_key: hourKey,
    };

    hist.hourly = hourlyList.slice(0, 48);
    localStorage.setItem(HOURLY_STORAGE_KEY, JSON.stringify(hist));
    return hist.hourly;
  } catch (err) {
    console.warn("Failed to track hourly performance in localStorage:", err);
    return [];
  }
}

/**
 * Fetch complete dashboard data from Harmony JSON-RPC
 */
export async function fetchHarmonyData(validatorAddress = MY_ADDR) {
  try {
    // 1. Fetch Header & Elected Validators
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
    const currentEpoch = hdr.epoch || 0;

    if (!electedAddrs.length) {
      throw new Error("No elected validator addresses returned from Harmony RPC.");
    }

    // 2. Fetch Epoch Last Block
    let epochLastBlock = 0;
    try {
      const epochRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "hmy_epochLastBlock",
          params: [currentEpoch],
          id: 100,
        }),
      }).then((r) => r.json());
      epochLastBlock = epochRes?.result || 0;
    } catch {
      epochLastBlock = 0;
    }

    // 3. Batch Request for all validators + Wallet balance
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
    const myDelegators = [];
    const epochHistory = [];
    let activeBlsKeys = [];

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

      const rawDelegations = valData.delegations || [];
      const myDel = rawDelegations.find((d) => d["delegator-address"] === validatorAddress);
      const unclaimed = myDel ? (parseFloat(myDel.reward || 0) / 1e18) : 0.0;

      // Signing performance
      const perf = v["current-epoch-performance"] || {};
      const signInfo = perf["current-epoch-signing-percent"] || {};
      const epSigned = signInfo["current-epoch-signed"] || signInfo["num-rx-signed"] || 0;
      const epToSign = signInfo["current-epoch-to-sign"] || signInfo["num-tx-to-sign"] || 0;
      let epPct = 0.0;
      if (signInfo["current-epoch-signing-percentage"]) {
        epPct = parseFloat(signInfo["current-epoch-signing-percentage"]) * 100;
      } else if (epToSign > 0) {
        epPct = (epSigned / epToSign) * 100;
      }

      // Lifetime blocks
      const lt = v.lifetime || {};
      const ltBlocks = lt.blocks || {};
      const ltSigned = ltBlocks.signed || 0;
      const ltToSign = ltBlocks["to-sign"] || 0;
      const ltPct = ltToSign > 0 ? (ltSigned / ltToSign) * 100 : 0.0;

      const isMe = addr.toLowerCase() === validatorAddress.toLowerCase();

      if (isMe) {
        activeBlsKeys = keys;

        // Parse Epoch History from lifetime
        const rawEpApr = {};
        (lt["epoch-apr"] || []).forEach((e) => {
          if (e.epoch !== undefined) {
            rawEpApr[e.epoch] = parseFloat(e.apr || 0) * 100;
          }
        });

        const rawEpBlks = {};
        (lt["epoch-blocks"] || []).forEach((e) => {
          if (e.epoch !== undefined) {
            rawEpBlks[e.epoch] = e.blocks || {};
          }
        });

        const sortedEpochKeys = Object.keys(rawEpBlks)
          .map(Number)
          .sort((a, b) => b - a)
          .slice(0, 15);

        sortedEpochKeys.forEach((epK) => {
          const bInfo = rawEpBlks[epK] || {};
          const s = bInfo.signed || 0;
          const ts = bInfo["to-sign"] || 0;
          const pct = ts > 0 ? (s / ts) * 100 : 0;
          epochHistory.push({
            epoch: epK,
            signed: s,
            to_sign: ts,
            missed: Math.max(0, ts - s),
            sign_pct: pct,
            apr: rawEpApr[epK] || 0.0,
          });
        });

        // Parse Delegators
        rawDelegations.forEach((d) => {
          const dAddr = d["delegator-address"] || "";
          const dAmount = (parseFloat(d.amount || 0)) / 1e18;
          const dReward = (parseFloat(d.reward || 0)) / 1e18;
          if (dAmount > 0 || dReward > 0) {
            myDelegators.push({
              address: dAddr,
              amount: dAmount,
              reward: dReward,
              is_me: dAddr.toLowerCase() === validatorAddress.toLowerCase(),
            });
          }
        });
        myDelegators.sort((a, b) => b.amount - a.amount);
      }

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
          ep_signed: epSigned,
          ep_to_sign: epToSign,
          ep_pct: epPct,
          lt_signed: ltSigned,
          lt_to_sign: ltToSign,
          lt_pct: ltPct,
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

    // Epoch Countdown calculations
    const blockNumber = hdr.blockNumber || 0;
    const blocksLeft = Math.max(0, epochLastBlock - blockNumber);
    const secsLeft = blocksLeft * 2; // 2s block time
    const hLeft = Math.floor(secsLeft / 3600);
    const mLeft = Math.floor((secsLeft % 3600) / 60);
    const sLeft = secsLeft % 60;
    const countdownStr = epochLastBlock > 0 ? `${String(hLeft).padStart(2, '0')}h ${String(mLeft).padStart(2, '0')}m ${String(sLeft).padStart(2, '0')}s` : "Calculando...";

    // Track hourly performance
    let hourlyList = [];
    if (myData) {
      hourlyList = trackHourlyPerformance(
        currentEpoch,
        myData.ep_signed,
        myData.ep_to_sign,
        myData.actualStake,
        myData.rate
      );
    }

    // Enhance myData with Smart Advisor & Staking math
    if (myData) {
      myData.margin = myData.bid - cutoffBid;
      myData.pct_margin = cutoffBid > 0 ? (myData.margin / cutoffBid) * 100 : 0;
      myData.poolDailyEst = (myData.actualStake * 0.112) / 365;
      myData.dailyCommission = myData.poolDailyEst * (myData.rate / 100.0);
      myData.daily_estimate = (myData.actualStake * 0.072) / 365;
      myData.backup_pct = medianBid > 0 ? Math.min(100, (myData.bid / medianBid) * 100) : 100;
      myData.activeBlsKeys = activeBlsKeys;

      // Smart Key Advisor Logic (matching epos_dashboard.py)
      const safeMarginTarget = 700000;
      const curKeys = myData.keys;
      const spkNext = myData.actualStake / (curKeys + 1);
      const marginNext = spkNext - cutoffBid;

      if (myData.margin <= 0) {
        myData.advisorStatus = "DANGER";
        myData.advisorTitle = "⚠️ PELIGRO: FUERA DE ELECCIÓN";
        myData.advisorMessage = "Tu stake por llave está por debajo del corte. Retira 1 llave BLS de inmediato.";
        myData.advisorAction = "remove";
      } else if (myData.margin < 500000) {
        myData.advisorStatus = "WARNING";
        myData.advisorTitle = `⚠️ RIESGO ALTO (+${Math.round(myData.margin).toLocaleString()} ONE)`;
        myData.advisorMessage = `Margen muy ajustado. Considera retirar 1 llave para subir a ${Math.round(myData.actualStake / (curKeys - 1)).toLocaleString()} ONE/llave.`;
        myData.advisorAction = "remove";
      } else if (marginNext >= safeMarginTarget) {
        const extraDaily = ((curKeys + 1) * myData.poolDailyEst / curKeys) * (myData.rate / 100) - myData.dailyCommission;
        myData.advisorStatus = "CAN_ADD";
        myData.advisorTitle = `🚀 PUEDES AÑADIR LA LLAVE #${curKeys + 1}`;
        myData.advisorMessage = `Tienes suficiente delegación segura. Añade una llave para ganar +${Math.round(extraDaily).toLocaleString()} ONE/día más de comisión.`;
        myData.advisorAction = "add";
      } else {
        const stakeNeeded = ((curKeys + 1) * (cutoffBid + safeMarginTarget)) - myData.actualStake;
        myData.advisorStatus = "OPTIMAL";
        myData.advisorTitle = `✅ ÓPTIMO: MANTÉN ${curKeys} LLAVES`;
        myData.advisorMessage = `Tu configuración es perfecta. Te faltan ~${Math.max(0, Math.round(stakeNeeded)).toLocaleString()} ONE de delegación para activar de forma segura la llave #${curKeys + 1}.`;
        myData.advisorAction = "keep";
      }
    }

    return {
      success: true,
      header: {
        epoch: currentEpoch,
        blockNumber,
        epochLastBlock,
        blocksLeft,
        secsLeft,
        countdownStr,
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
      delegators: myDelegators,
      epochHistory,
      hourlyList,
      activeBlsKeys,
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
export function calculateKeySimulation(totalStake, allValidators, cutoffBid, activeKeys = 5, poolDailyEst = 0, myRate = 5) {
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

    let simComm = 0;
    if (activeKeys > 0 && poolDailyEst > 0) {
      simComm = (poolDailyEst * (k / activeKeys)) * (myRate / 100.0);
    }

    let status = "OPTIMO";
    let statusLabel = "Óptimo (100% Seguro)";

    if (simMargin <= 0 || simStart > 400) {
      status = "FUERA";
      statusLabel = "Fuera del Comité";
      simComm = 0;
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
      simComm,
    });
  }

  return results;
}
