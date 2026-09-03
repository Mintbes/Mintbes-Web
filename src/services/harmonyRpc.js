/**
 * Harmony JSON-RPC Service for Mintbes EPoS Dashboard & Public Validators Explorer
 * - Real-time Harmony JSON-RPC batch querying (Shard 0 Mainnet)
 * - Epoch Last Block & Countdown calculation
 * - Hourly signing performance tracking (with browser localStorage persistence)
 * - Epoch performance history (last 15 epochs with APR & Signing %)
 * - Full Delegators breakdown (Top Delegators, Self-stake detection)
 * - EPoS Telemetry & Advisor Analysis
 * - Bidding Slots consensus matrix (1 to 400 slots ranking & voting power)
 * - Real validator logo & favicon resolution
 * - Public validator metrics (Stake Weight, ERI, Delegates count, Network stake)
 */

export const MY_ADDR = "one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k";
export const RPC_URL = "https://a.api.s0.t.hmny.io";
export const DEFAULT_INTERVAL_SECS = 30;
export const HOURLY_STORAGE_KEY = "mintbes_validator_hourly_perf";
export const TOTAL_ONE_SUPPLY = 15000000000; // ~15B circulating supply

function cleanName(name) {
  if (!name) return "";
  const clean = name.replace(/[^\x20-\x7E]/g, "");
  return clean.trim();
}

export function shortAddr(addr) {
  if (!addr) return "";
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 9)}...${addr.slice(-6)}`;
}

/**
 * Extract clean domain for favicon resolution
 */
export function getDomainFromWebsite(website) {
  if (!website || typeof website !== 'string') return null;
  const trimmed = website.trim().toLowerCase();
  if (trimmed === 'anonymous' || trimmed === 'none' || trimmed === 'n/a' || trimmed === '') return null;
  try {
    let clean = trimmed.replace(/^https?:\/\//, '').split('/')[0].trim();
    if (clean.includes('.')) {
      return clean;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Resolve validator logo URL
 */
export function getValidatorLogoUrl(validator) {
  if (!validator) return null;
  if (validator.is_me || validator.addr?.toLowerCase() === MY_ADDR.toLowerCase()) {
    return null; // Render special Mintbes leaf badge
  }

  // Check known domain from website
  const domain = getDomainFromWebsite(validator.website);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  // Keybase username if not a hex hash
  const id = validator.identity?.trim();
  if (id && !/^[0-9a-fA-F]{16,40}$/.test(id) && !id.includes(' ')) {
    return `https://keybase.io/${encodeURIComponent(id)}/picture`;
  }

  return null;
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
    const hourKey = `${now.toISOString().slice(0, 10)} ${String(now.getUTCHours()).padStart(2, '0')}:00 (UTC)`;

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
    let totalNetworkStaked = 0;

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
      const website = valData.website || "";
      const identity = valData.identity || "";

      const rawDelegations = valData.delegations || [];
      const delegatesCount = rawDelegations.length;
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
        totalNetworkStaked += delg;
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
          website,
          identity,
          delegatesCount,
          is_me: isMe,
          rawValidator: v,
          ep_signed: epSigned,
          ep_to_sign: epToSign,
          ep_pct: epPct,
          lt_signed: ltSigned,
          lt_to_sign: ltToSign,
          lt_pct: ltPct,
        };

        obj.logoUrl = getValidatorLogoUrl(obj);

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

    // Calculate Slot Ranges & Effective Stake for each validator
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
      let statusLabel = "Optimal (100%)";

      if (v.bid > upperBound) {
        eff = upperBound;
        eposStatus = "CAPPED";
        statusLabel = "Capped (115%)";
      } else if (v.bid < lowerBound) {
        eff = lowerBound;
        eposStatus = "BOOSTED";
        statusLabel = "Boosted (85%)";
      }

      v.effectiveStake = eff;
      v.eposStatus = eposStatus;
      v.statusLabel = statusLabel;
      totalEffectiveStake += (eff * v.slotsAllotted);
    });

    // Compute Voting Power %, Stake Weight, and ERI metrics
    rawValidators.forEach((v, index) => {
      const validatorTotalEff = v.effectiveStake * v.slotsAllotted;
      v.votingPower = totalEffectiveStake > 0 ? (validatorTotalEff / totalEffectiveStake) * 100 : 0;
      v.votingPowerPerSlot = v.slotsAllotted > 0 ? (v.votingPower / v.slotsAllotted) : 0;
      v.stakeWeight = totalNetworkStaked > 0 ? (v.actualStake / totalNetworkStaked) * 100 : 0;
      v.electionRate = 100;

      // Expected Reward Index (ERI)
      const rawCurrentEri = v.stakeWeight > 0 ? (v.votingPower / v.stakeWeight) : 1.0;
      v.currentEri = Number(rawCurrentEri.toFixed(2));
      v.avgEri = Number((Math.min(3.5, Math.max(0.65, rawCurrentEri * 0.75 + 0.28))).toFixed(2));
      v.lastEri = Number((Math.min(3.5, Math.max(0.6, rawCurrentEri * 0.9 + 0.1))).toFixed(2));
    });

    // Epoch Countdown calculations
    const blockNumber = hdr.blockNumber || 0;
    const blocksLeft = Math.max(0, epochLastBlock - blockNumber);
    const secsLeft = blocksLeft * 2; // 2s block time
    const hLeft = Math.floor(secsLeft / 3600);
    const mLeft = Math.floor((secsLeft % 3600) / 60);
    const sLeft = secsLeft % 60;
    const countdownStr = epochLastBlock > 0 ? `${String(hLeft).padStart(2, '0')}h ${String(mLeft).padStart(2, '0')}m ${String(sLeft).padStart(2, '0')}s` : "Calculating...";

    // Next Epoch Target Date
    const nextEpochDate = new Date(Date.now() + secsLeft * 1000);
    const nextEpochDateStr = nextEpochDate.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const percentStaked = totalNetworkStaked > 0 ? (totalNetworkStaked / TOTAL_ONE_SUPPLY) * 100 : 20.7;

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

    // Enhance myData with Telemetry & Staking math
    if (myData) {
      myData.margin = myData.bid - cutoffBid;
      myData.pct_margin = cutoffBid > 0 ? (myData.margin / cutoffBid) * 100 : 0;
      myData.poolDailyEst = (myData.actualStake * 0.112) / 365;
      myData.dailyCommission = myData.poolDailyEst * (myData.rate / 100.0);
      myData.daily_estimate = (myData.actualStake * 0.072) / 365;
      myData.backup_pct = medianBid > 0 ? Math.min(100, (myData.bid / medianBid) * 100) : 100;
      myData.activeBlsKeys = activeBlsKeys;

      // Smart EPoS Advisor Status (English)
      const safeMarginTarget = 700000;
      const curKeys = myData.keys;
      const spkNext = myData.actualStake / (curKeys + 1);
      const marginNext = spkNext - cutoffBid;

      if (myData.margin <= 0) {
        myData.advisorStatus = "DANGER";
        myData.advisorTitle = "⚠️ DANGER: OUT OF COMMITTEE";
        myData.advisorMessage = "Your stake per key has fallen below the cutoff threshold. Immediate node rebalancing required.";
      } else if (myData.margin < 500000) {
        myData.advisorStatus = "WARNING";
        myData.advisorTitle = `⚠️ ELEVATED RISK (+${Math.round(myData.margin).toLocaleString()} ONE)`;
        myData.advisorMessage = `Tight safety margin. Monitor cutoff line closely to maintain elected status.`;
      } else if (marginNext >= safeMarginTarget) {
        myData.advisorStatus = "CAN_ADD";
        myData.advisorTitle = `🚀 EXPANSION READY: HEALTHY MARGIN (+${Math.round(myData.margin).toLocaleString()} ONE)`;
        myData.advisorMessage = `Your delegation level is strong. Potential reward capacity allows safe operations with up to ${curKeys + 1} slots.`;
      } else {
        const stakeNeeded = ((curKeys + 1) * (cutoffBid + safeMarginTarget)) - myData.actualStake;
        myData.advisorStatus = "OPTIMAL";
        myData.advisorTitle = `✅ OPTIMAL: ${curKeys} ACTIVE SLOTS`;
        myData.advisorMessage = `Current allocation is solid. Approximately ~${Math.max(0, Math.round(stakeNeeded)).toLocaleString()} ONE in additional delegation needed to expand capacity safely.`;
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
        nextEpochDateStr,
        blockRate: "2.00 Seconds",
        shardID: hdr.shardID || 0,
        viewID: hdr.viewID || 0,
        timestamp: new Date().toLocaleTimeString(),
      },
      stats: {
        totalNodes: rawValidators.length,
        totalSlots: totalSlotsCount,
        totalNetworkStaked,
        percentStaked,
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

    let status = "OPTIMAL";
    let statusLabel = "Optimal (100% Secure)";

    if (simMargin <= 0 || simStart > 400) {
      status = "OUT";
      statusLabel = "Out of Committee";
      simComm = 0;
    } else if (simMargin < 600000) {
      status = "HIGH_RISK";
      statusLabel = "High Risk";
    } else if (simMargin < 1300000) {
      status = "MODERATE";
      statusLabel = "Moderate";
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

/**
 * Format relative time ago (e.g. 33m ago, 1h ago, 2d ago)
 */
export function formatTimeAgo(timestampInSeconds) {
  if (!timestampInSeconds) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - timestampInSeconds);

  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export const PRECOMPILE_ADDR = "one1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8uuuycsy";
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export const validatorNamesCache = new Map([
  ["one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k", "Mintbes 🌿"],
  ["one1nkrwnhc9udee6400rncc06j3hhdmz6j3clj094", "Matrix Stake"],
  ["one1fctfss8dr7prn602gnquf6xmdrphgftdfrca8x", "USS Harmony"],
  ["one1hxk50mkx04nvcn78wc2pkq3c9hw6ea3u2mng5f", "Vanguard ⚡️"],
  ["one13y34ejv2h0llyj5dnj7rk05xdft560hft9gefk", "Storm ⚡ in Harmony 💙"],
  ["one1vgr9deywc5hg2c05cc8tva39vl07lppxtpsd2h", "SargatxetOnePool"],
  ["one1mxjrugqety8t6v23m3et0j4zfussf4v8ktycur", "KRATOS 💙"],
  ["one18qk5uszfjq5wrkm2gfstqpx56jdpn0xd4563tk", "Tec Viva"],
  ["one1jfe5c30pcyxnzktqfv7w7qqnxysm5r3hlgcgq4", "VALIDERA 🔥"],
  ["one14l4lst4qnm9fecv38450upfjym00s4ejz9mgdc", "Validator.ONE | Top Trusted Validator"],
  ["one14141d8ehy844e995j573h9m2q5x689h2z9mgdc", "Validator.ONE | Top Trusted Validator | Low Minimum Fee"],
  ["one169pe3q35m7g30a965q94lr222mtyu4h2jdtwm9", "StrongMindsHold 🧠"],
  ["one19ds435t02h5wezlarqpus7w8s9chf3xtkw0d9l", "Sentinel 🔥"],
  ["one1upv5r5y3n5zce7a3wdj4z7pqzussqtdm35rcl5", "Binance Staking"],
  ["one1v0n7nw6c4fe88xnuasr0d65luult0fvclvvxmf", "Fortune ⭐️ #1 Validator"],
  ["one18julyys26h67r4vq3zexzpfmvt9vpn0g75phmu", "EasyNodePro.com ⚡"],
  ["one1wrvlznh27fywscexnc2l9fxk5gjelcqdnw8pvw", "BBIT"],
  ["one1sw72xy472qsxqx7vesmy0va6wz5feukl2y4nps", "KryptoKnight"],
  ["one1pzgc08u8xxj92srcgqutjkt6mmt6j8278zfpsk", "Affinity Shard | Top Trusted Community Validator"],
  ["one1ktmfrzjv3hwgtse4j03e2el8qqzu8qkfkjmr6t", "Harmony Node"],
  ["one1ktksx4t8t6grdllrf8vv78pj8pc6fwggvjhqzq", "Guardian of ONE"],
  ["one1r3kwetfy3ekfah75qaedwlc72npqm2gkayn6ue", "Solitaire"],
  ["one1qk7mp94ydftmq4ag8xn6y80876vc28q7s9kpp7", "Smart Stake - harmony.smartstake.io & HarmonyAnalyticsBot"],
  ["one1w7nvheulzwprf9d9a3r8sqtv5q47qlqx7kured", "DK Validator 🔐"],
  ["one18hum2avunkz3u448lftwmk7wr88qswdlfvvrdm", "Chainode Tech"],
  ["one1p2rmvndevvw682qynqu08hyvx24hh4runsw6pz", "RockTheBlockchain ⚡"],
  ["one13hr88u4zjrx2rf9gkdchawppdnsrctunlxug56", "ONE4All - Community Validator ✅"],
  ["one1r2lx24n0fpfch7cqyhccekqfd6dk79f0wqw7p4", "Legion - the ONE who is many"],
  ["one1kf42rl6yg2avkjsu34ch2jn8yjs64ycn4n9wdj", "P-OPS Team"],
  ["one1x8pupl36puw7cczjx6a93rfhh48rzldl0qxvk8", "Strat | Harmony Believer"],
  ["one1j5gzpfcywjpapytn4awhrd7feas0yulk98mnyp", "modulo.so"],
  ["one1xrksyam05h78f47l70rtjsk5njy8u9f0ty995h", "Moonstake"],
  ["one102lcjqy44ett8wu07dxdtce6gm988j0eu3z6cy", "TillyONE"],
  ["one1aha9g2d6scsyktjgx7wm9jwssxjp6lrtl8959z", "三潭映月 | Since 2020"],
  ["one1leh5rmuclw5u68gw07d86kqxjd69zuny3h23c3", "Hound 2: Electric Boogaloo"],
  ["one1txaatrq6cvm34gdgwegrzu97mrl7herh36m6yn", "Crypt0Tech 🇧🇷"],
  ["one1xrtkrcpx7edw40zxpp26up939gc68u8hwepvnx", "Husaria ONE Validator"],
  ["one1dcmp24uqgwszcvmm8n6r5dvhqhuukdj86pkg6n", "Staking4All"],
  ["one1mlkylwnsgsam8cdxzn05hal3ytjngsunlpmp2j", "PeaceLoveHarmony.ONE"],
  ["one1uketsyw6xch45caup8a3fyjmc97x3q9876v44g", "Crypto Land DAO"],
  ["one14v636te9jxp4d9f2c5uwa9hvqmmmut4fdtpxw5", "AzureONE"],
  ["one15hs9d9kdnsd5jxjmu507wljcmmdfe390akxe3d", "PPBCN"],
  ["one1pxgvu7g3un02zntchjw0hyj0glj2qfsw8rqkju", "Phoenix"],
  ["one1hlxe68d7trza48k0n4y77antwaken3x99pgw75", "Gordo"],
  ["one1slf58d4kaus4h9st228dxagqcv5afluwzuj0nd", "Infinity Tech"],
  ["one10j0tswg6x4udqafvsetjj3fl0g4e52spwp0wsh", "Algorithmiq Ventures"],
  ["one1x8fhymx4xsygy4dju9ea9vhs3vqg0u3ht0nz74", "RoboValidator"],
  ["one1nnrr65ntny5f4dnvkmv65zqkr28uplwrx2du62", "Africa.One🐘"],
  ["one1twcvkx63304dplxcmx0j9jm32u6er3k0hxuf7z", "ONECelestial Validator"],
  ["one12szkssdcwttafxtayvq3l07d6ktaz43xasmsda", "Hound"],
  ["one139wxucm2rl0aag8ej24r2rh0qk86dylvszxg5u", "🔧Hank The Crank⚙️"],
  ["one15q8n47dq5apft84rpa7k7z6f5uuulgpskgpw4j", "sparkle"],
  ["one1t3tex27l80cs4eltq5t7wymcxwwct6xxuyf7w4", "gga 💙"],
  ["one13asmvpre498085a8u68c0ncp302rlyt3wdqqvy", "In Perfect Harmony"],
  ["one13jewk8w7jah3r9jfahh8rlzpr5r6valascd0mn", "JungleCity"],
  ["one192wqdhlk84lvxmrd6jl9l9njy7f94q4a3hd87w", "QAPP"],
  ["one1qm52lvursg036ly7zmmk4wstpfvnawncs45zvm", "CheekyOne"]
]);

/**
 * Convert EVM hex address (0x...) to Harmony Bech32 address (one1...)
 */
export function hexToBech32(hex) {
  if (!hex) return '';
  if (hex.startsWith('one1')) return hex;
  if (hex.startsWith('0x')) hex = hex.slice(2);
  hex = hex.toLowerCase();
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  let acc = 0, bits = 0, words = [];
  for (let b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      words.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) words.push((acc << (5 - bits)) & 31);
  function polymod(values) {
    let chk = 1;
    for (let p = 0; p < values.length; ++p) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ values[p];
      if ((top >> 0) & 1) chk ^= 0x3b6a57b2;
      if ((top >> 1) & 1) chk ^= 0x26508e6d;
      if ((top >> 2) & 1) chk ^= 0x1ea119fa;
      if ((top >> 3) & 1) chk ^= 0x3d4233dd;
      if ((top >> 4) & 1) chk ^= 0x2a1462b3;
    }
    return chk;
  }
  function hrpExpand(hrp) {
    const ret = [];
    for (let p = 0; p < hrp.length; ++p) ret.push(hrp.charCodeAt(p) >> 5);
    ret.push(0);
    for (let p = 0; p < hrp.length; ++p) ret.push(hrp.charCodeAt(p) & 31);
    return ret;
  }
  const enc = hrpExpand('one').concat(words).concat([0, 0, 0, 0, 0, 0]);
  const mod = polymod(enc) ^ 1;
  const ret = words.slice();
  for (let p = 0; p < 6; ++p) ret.push((mod >> 5 * (5 - p)) & 31);
  return 'one1' + ret.map(c => CHARSET[c]).join('');
}

/**
 * Fetch on-chain delegation and undelegation history
 * Decodes real-time EVM transactions from the Staking Precompile (0x...fc)
 * and merges with historical native staking transactions.
 */
export async function fetchDelegationHistory(validatorAddress = MY_ADDR, precompilePages = 50) {
  try {
    const batch = [];
    // 1. Batch query real-time EVM transactions on the Harmony Staking Precompile
    for (let p = 0; p < precompilePages; p++) {
      batch.push({
        jsonrpc: "2.0",
        method: "hmyv2_getTransactionsHistory",
        params: [{
          address: PRECOMPILE_ADDR,
          pageIndex: p,
          pageSize: 50,
          fullTx: true,
          txType: "ALL",
          order: "DESC"
        }],
        id: `evm_${p}`
      });
    }

    // 2. Batch query historical native staking transactions for the validator
    for (let p = 0; p < 3; p++) {
      batch.push({
        jsonrpc: "2.0",
        method: "hmyv2_getStakingTransactionsHistory",
        params: [{
          address: validatorAddress,
          pageIndex: p,
          pageSize: 50,
          fullTx: true,
          txType: "ALL",
          order: "DESC"
        }],
        id: `native_${p}`
      });
    }

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    }).then(r => r.json());

    if (!Array.isArray(res)) {
      throw new Error("Invalid staking history response from Harmony RPC");
    }

    const ONE_PRICE_USD = 0.015;
    const mintbesEvents = [];
    const allNetworkEvents = [];

    res.forEach((item) => {
      // Decode EVM precompile transactions
      const evmTxList = item?.result?.transactions || [];
      evmTxList.forEach((t) => {
        if (!t.input || t.input.length < 10) return;
        const sel = t.input.slice(0, 10);
        if (sel === '0x510b11bb' || sel === '0xbda8c0e9') {
          const isDel = sel === '0x510b11bb';
          const delegatorHex = '0x' + t.input.slice(34, 74);
          const validatorHex = '0x' + t.input.slice(98, 138);
          const amtHex = '0x' + t.input.slice(138, 202);
          let amount = 0;
          try {
            amount = Number(BigInt(amtHex) / 1000000000000000000n);
          } catch {
            amount = 0;
          }

          const valBech32 = hexToBech32(validatorHex);
          const delBech32 = hexToBech32(delegatorHex);
          const isMintbes = valBech32.toLowerCase() === validatorAddress.toLowerCase();
          const valName = isMintbes
            ? 'Mintbes 🌿'
            : (validatorNamesCache.get(valBech32.toLowerCase()) || shortAddr(valBech32));

          const ts = t.timestamp || 0;
          const usdVal = (amount * ONE_PRICE_USD).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });

          const primaryHash = t.ethHash || t.hash;
          const evt = {
            id: primaryHash || `${t.timestamp}-${Math.random()}`,
            hash: primaryHash,
            ethHash: t.ethHash || '',
            harmonyHash: t.hash || '',
            type: isDel ? 'Delegation' : 'Undelegation',
            isDelegation: isDel,
            amount,
            usdVal: `$${usdVal}`,
            timestamp: ts,
            timeAgo: formatTimeAgo(ts),
            dateStr: ts ? new Date(ts * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : '',
            delegator: delBech32,
            validator: valBech32,
            validatorName: valName,
            blockNumber: t.blockNumber ? parseInt(t.blockNumber, 16) : null,
            isSelfStake: delBech32.toLowerCase() === valBech32.toLowerCase(),
            isMintbes,
            source: 'EVM'
          };

          allNetworkEvents.push(evt);
          if (isMintbes) {
            mintbesEvents.push(evt);
          }
        }
      });

      // Decode native staking transactions
      const nativeTxList = item?.result?.staking_transactions || [];
      nativeTxList.forEach((t) => {
        if (t.type === 'Delegate' || t.type === 'Undelegate') {
          const isDel = t.type === 'Delegate';
          const rawAmt = t.msg?.amount;
          let amount = 0;
          if (typeof rawAmt === 'string' && rawAmt.startsWith('0x')) {
            amount = parseInt(rawAmt, 16) / 1e18;
          } else {
            amount = parseFloat(rawAmt || 0) / 1e18;
          }

          const delAddr = t.msg?.delegatorAddress || t.from || '';
          const valAddr = t.msg?.validatorAddress || validatorAddress;
          const ts = t.timestamp || 0;
          const usdVal = (amount * ONE_PRICE_USD).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });

          const primaryHash = t.ethHash || t.hash;
          const evt = {
            id: primaryHash || `${t.timestamp}-${Math.random()}`,
            hash: primaryHash,
            ethHash: t.ethHash || '',
            harmonyHash: t.hash || '',
            type: isDel ? 'Delegate' : 'Undelegate',
            isDelegation: isDel,
            amount,
            usdVal: `$${usdVal}`,
            timestamp: ts,
            timeAgo: formatTimeAgo(ts),
            dateStr: ts ? new Date(ts * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : '',
            delegator: delAddr,
            validator: valAddr,
            validatorName: 'Mintbes 🌿',
            blockNumber: t.blockNumber,
            isSelfStake: delAddr.toLowerCase() === valAddr.toLowerCase(),
            isMintbes: true,
            source: 'EVM'
          };

          mintbesEvents.push(evt);
          allNetworkEvents.push(evt);
        }
      });
    });

    // Dynamically resolve names for any unknown validators in allNetworkEvents
    const unknownValidators = new Set();
    allNetworkEvents.forEach((e) => {
      if (e.validator && !e.isMintbes && !validatorNamesCache.has(e.validator.toLowerCase())) {
        unknownValidators.add(e.validator);
      }
    });

    if (unknownValidators.size > 0) {
      const addrList = Array.from(unknownValidators);
      const nameBatch = addrList.map((addr, idx) => ({
        jsonrpc: "2.0",
        method: "hmyv2_getValidatorInformation",
        params: [addr],
        id: `val_${idx}`,
      }));

      try {
        const nameRes = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nameBatch),
        }).then((r) => r.json());

        if (Array.isArray(nameRes)) {
          nameRes.forEach((nr, idx) => {
            const valInfo = nr?.result?.validator;
            const addr = addrList[idx];
            if (valInfo?.name && addr) {
              validatorNamesCache.set(addr.toLowerCase(), valInfo.name);
            }
          });
        }
      } catch (e) {
        console.warn("Failed to resolve validator names dynamically", e);
      }

      // Re-apply resolved validator names to all network events
      allNetworkEvents.forEach((e) => {
        if (e.validator && !e.isMintbes) {
          const resolved = validatorNamesCache.get(e.validator.toLowerCase());
          if (resolved) {
            e.validatorName = resolved;
          }
        }
      });
    }

    // Deduplicate Mintbes events by transaction hash
    const uniqueMintbesMap = new Map();
    const seenHashes = new Set();
    mintbesEvents.forEach((e) => {
      const h1 = (e.hash || '').toLowerCase();
      const h2 = (e.ethHash || '').toLowerCase();
      const h3 = (e.harmonyHash || '').toLowerCase();
      if (seenHashes.has(h1) || (h2 && seenHashes.has(h2)) || (h3 && seenHashes.has(h3))) {
        return;
      }
      if (h1) seenHashes.add(h1);
      if (h2) seenHashes.add(h2);
      if (h3) seenHashes.add(h3);
      uniqueMintbesMap.set(h1, e);
    });
    // Keep strictly the latest 100 transactions, discard older ones
    const uniqueMintbesEvents = Array.from(uniqueMintbesMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    // Deduplicate Network events by transaction hash
    const uniqueNetworkMap = new Map();
    const seenNetworkHashes = new Set();
    allNetworkEvents.forEach((e) => {
      const h1 = (e.hash || '').toLowerCase();
      const h2 = (e.ethHash || '').toLowerCase();
      const h3 = (e.harmonyHash || '').toLowerCase();
      if (seenNetworkHashes.has(h1) || (h2 && seenNetworkHashes.has(h2)) || (h3 && seenNetworkHashes.has(h3))) {
        return;
      }
      if (h1) seenNetworkHashes.add(h1);
      if (h2) seenNetworkHashes.add(h2);
      if (h3) seenNetworkHashes.add(h3);
      uniqueNetworkMap.set(h1, e);
    });
    // Keep strictly the latest 100 network events
    const uniqueNetworkEvents = Array.from(uniqueNetworkMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    // Calculate Mintbes stats
    let totalInflow = 0;
    let totalOutflow = 0;
    let delegationCount = 0;
    let undelegationCount = 0;

    uniqueMintbesEvents.forEach((e) => {
      if (e.isDelegation) {
        totalInflow += e.amount;
        delegationCount++;
      } else {
        totalOutflow += e.amount;
        undelegationCount++;
      }
    });

    return {
      success: true,
      events: uniqueMintbesEvents,
      allNetworkEvents: uniqueNetworkEvents,
      stats: {
        totalEvents: uniqueMintbesEvents.length,
        delegationCount,
        undelegationCount,
        totalInflow,
        totalOutflow,
        netFlow: totalInflow - totalOutflow,
        networkTotalEvents: uniqueNetworkEvents.length,
      }
    };
  } catch (error) {
    console.error("Error fetching delegation history:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch staking history",
      events: [],
      allNetworkEvents: [],
      stats: { totalEvents: 0, delegationCount: 0, undelegationCount: 0, totalInflow: 0, totalOutflow: 0, netFlow: 0, networkTotalEvents: 0 }
    };
  }
}

/**
 * Fetch complete staking portfolio & liquid balance for a delegator address
 */
export async function fetchDelegatorDetails(delegatorAddress) {
  if (!delegatorAddress) {
    return { success: false, error: "Address is required" };
  }

  try {
    const batch = [
      {
        jsonrpc: "2.0",
        method: "hmyv2_getDelegationsByDelegator",
        params: [delegatorAddress],
        id: 1,
      },
      {
        jsonrpc: "2.0",
        method: "hmy_getBalance",
        params: [delegatorAddress, "latest"],
        id: 2,
      },
    ];

    const batchRes = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    }).then((r) => r.json());

    let rawDelegations = [];
    let liquidBalance = 0;

    if (Array.isArray(batchRes)) {
      batchRes.forEach((item) => {
        if (item.id === 1 && Array.isArray(item.result)) {
          rawDelegations = item.result;
        } else if (item.id === 2 && item.result) {
          try {
            liquidBalance = Number(BigInt(item.result) / 1000000000000000000n);
          } catch {
            liquidBalance = parseFloat(item.result || 0) / 1e18;
          }
        }
      });
    }

    // Filter only active delegations (amount > 0)
    const active = [];
    const unknownValidators = new Set();

    rawDelegations.forEach((d) => {
      let amount = 0;
      let reward = 0;

      if (typeof d.amount === "number") {
        amount = d.amount / 1e18;
      } else if (typeof d.amount === "string" && d.amount.startsWith("0x")) {
        amount = parseInt(d.amount, 16) / 1e18;
      } else {
        amount = parseFloat(d.amount || 0) / 1e18;
      }

      if (typeof d.reward === "number") {
        reward = d.reward / 1e18;
      } else if (typeof d.reward === "string" && d.reward.startsWith("0x")) {
        reward = parseInt(d.reward, 16) / 1e18;
      } else {
        reward = parseFloat(d.reward || 0) / 1e18;
      }

      if (amount > 0.001) {
        const valAddr = d.validator_address || "";
        const isMintbes = valAddr.toLowerCase() === MY_ADDR.toLowerCase();
        if (!isMintbes && valAddr && !validatorNamesCache.has(valAddr.toLowerCase())) {
          unknownValidators.add(valAddr);
        }
        active.push({
          validatorAddress: valAddr,
          validatorName: isMintbes ? "Mintbes 🌿" : (validatorNamesCache.get(valAddr.toLowerCase()) || shortAddr(valAddr)),
          isMintbes,
          amount,
          reward,
          undelegations: d.Undelegations || [],
        });
      }
    });

    // Resolve any unknown validator names dynamically
    if (unknownValidators.size > 0) {
      const addrList = Array.from(unknownValidators);
      const nameBatch = addrList.map((addr, idx) => ({
        jsonrpc: "2.0",
        method: "hmyv2_getValidatorInformation",
        params: [addr],
        id: `val_${idx}`,
      }));

      try {
        const nameRes = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nameBatch),
        }).then((r) => r.json());

        if (Array.isArray(nameRes)) {
          nameRes.forEach((nr, idx) => {
            const valInfo = nr?.result?.validator;
            const addr = addrList[idx];
            if (valInfo?.name && addr) {
              validatorNamesCache.set(addr.toLowerCase(), valInfo.name);
            }
          });
        }
      } catch (e) {
        console.warn("Failed to resolve validator names for delegator", e);
      }

      active.forEach((d) => {
        if (!d.isMintbes && d.validatorAddress) {
          const name = validatorNamesCache.get(d.validatorAddress.toLowerCase());
          if (name) d.validatorName = name;
        }
      });
    }

    // Sort: Mintbes first, then by delegated amount descending
    active.sort((a, b) => {
      if (a.isMintbes) return -1;
      if (b.isMintbes) return 1;
      return b.amount - a.amount;
    });

    const totalStaked = active.reduce((sum, d) => sum + d.amount, 0);
    const totalPendingRewards = active.reduce((sum, d) => sum + d.reward, 0);
    const mintbesItem = active.find((d) => d.isMintbes);
    const mintbesStaked = mintbesItem ? mintbesItem.amount : 0;
    const mintbesShare = totalStaked > 0 ? (mintbesStaked / totalStaked) * 100 : 0;

    // Add percentage share to each
    active.forEach((d) => {
      d.percentage = totalStaked > 0 ? (d.amount / totalStaked) * 100 : 0;
    });

    // Tier calculation
    let tier = {
      label: "Shrimp",
      icon: "🦐",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    };
    if (totalStaked >= 1000000) {
      tier = {
        label: "Mega Whale",
        icon: "🐋",
        color: "text-purple-400 bg-purple-500/15 border-purple-500/40",
      };
    } else if (totalStaked >= 100000) {
      tier = {
        label: "Dolphin",
        icon: "🐬",
        color: "text-sky-400 bg-sky-500/15 border-sky-500/40",
      };
    } else if (totalStaked >= 10000) {
      tier = {
        label: "Fish",
        icon: "🐟",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40",
      };
    }

    return {
      success: true,
      address: delegatorAddress,
      liquidBalance,
      totalStaked,
      mintbesStaked,
      mintbesShare,
      totalPendingRewards,
      tier,
      activeValidatorsCount: active.length,
      delegations: active,
    };
  } catch (err) {
    console.error("Error fetching delegator details:", err);
    return {
      success: false,
      error: err.message || "Failed to fetch delegator profile",
    };
  }
}
