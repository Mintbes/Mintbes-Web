/**
 * Harmony JSON-RPC Service for Mintbes EPoS Dashboard
 * Updated to match the latest epos_dashboard.py logic (30s interval, streamlined batch)
 */

export const MY_ADDR = "one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k";
export const RPC_URL = "https://a.api.s0.t.hmny.io";
export const DEFAULT_INTERVAL_SECS = 30;

// Clean string helper
function cleanName(name, maxLen = 22) {
  if (!name) return "";
  const clean = name.replace(/[^\x20-\x7E]/g, "");
  return clean.trim().slice(0, maxLen);
}

/**
 * Fetch complete dashboard data from Harmony JSON-RPC
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

    // 2. Batch Request for all validators + Wallet balance (matching Python script)
    const batch = electedAddrs.map((addr, i) => ({
      jsonrpc: "2.0",
      method: "hmyv2_getValidatorInformation",
      params: [addr],
      id: i,
    }));

    // Add balance query for validatorAddress (id: 9998)
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

      // Handle balance query (id: 9998)
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

      // Handle Validator Information
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

    // Sort validators by stake_per_key descending
    validators.sort((a, b) => b.stake_per_key - a.stake_per_key);

    const totalSlots = validators.reduce((acc, v) => acc + v.keys, 0);
    const cutoffNode = validators[validators.length - 1] || { stake_per_key: 0 };
    const cutoffStake = cutoffNode.stake_per_key;
    const medianIdx = Math.floor(validators.length / 2);
    const medianStake = validators[medianIdx]?.stake_per_key || 0;

    // Enhance myData calculations
    if (myData) {
      const myIdx = validators.findIndex((v) => v.is_me);
      myData.rank = myIdx + 1;
      myData.margin = myData.stake_per_key - cutoffStake;
      myData.pct_margin = cutoffStake > 0 ? (myData.margin / cutoffStake) * 100 : 0;
      myData.daily_estimate = (myData.total_delg * 0.072) / 365;
      myData.backup_pct = medianStake > 0 ? Math.min(100, (myData.stake_per_key / medianStake) * 100) : 100;
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
        medianStake,
        cutoffStake,
      },
      myData,
      walletBalance,
      validators,
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
 * Calculates EPoS Key simulation given total stake and all validator list
 */
export function calculateKeySimulation(totalStake, validators, cutoffStake, activeKeys = 4) {
  if (!totalStake || !validators || !validators.length) return [];

  const results = [];
  for (let k = 1; k <= 8; k++) {
    const simSpk = totalStake / k;
    const simRank = validators.filter((v) => v.stake_per_key >= simSpk).length + 1;
    const simMargin = simSpk - cutoffStake;
    const simPct = cutoffStake > 0 ? (simMargin / cutoffStake) * 100 : 0;
    const isActive = k === activeKeys;

    let status = "OPTIMO";
    let statusLabel = "Óptimo";
    let color = "emerald";

    if (simMargin <= 0) {
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
      rank: simRank,
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
