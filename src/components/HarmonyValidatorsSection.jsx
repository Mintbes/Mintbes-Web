import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  RefreshCw,
  Maximize2,
  Minimize2,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import { fetchHarmonyData, MY_ADDR } from '../services/harmonyRpc';

function ValidatorAvatar({ validator, size = "w-6 h-6" }) {
  const [srcIndex, setSrcIndex] = useState(0);

  if (validator.is_me || validator.addr?.toLowerCase() === MY_ADDR.toLowerCase()) {
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-xs shrink-0 border border-emerald-400/50 bg-emerald-950/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]`}
        title="Mintbes Validator"
      >
        🌿
      </div>
    );
  }

  const sources = [];
  if (validator.addr) {
    sources.push(`https://api.stake.hmny.io/networks/mainnet/validators/${validator.addr}/avatar`);
    sources.push(`https://raw.githubusercontent.com/harmony-one/validator-logos/master/validators/${validator.addr}.jpg`);
    sources.push(`https://raw.githubusercontent.com/harmony-one/validator-logos/master/validators/${validator.addr}.png`);
  }

  const nameLower = (validator.name || '').toLowerCase();
  if (nameLower.includes('binance')) {
    sources.push('https://binance.com/favicon.ico');
  } else if (nameLower.includes('harmony') && !nameLower.includes('believer')) {
    sources.push('https://harmony.one/favicon.ico');
  }

  if (validator.identity && !validator.identity.includes(' ') && validator.identity.length < 30) {
    sources.push(`https://keybase.io/${encodeURIComponent(validator.identity)}/picture`);
  }

  if (srcIndex < sources.length) {
    return (
      <div className={`${size} rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center`}>
        <img
          key={sources[srcIndex]}
          src={sources[srcIndex]}
          alt={validator.name}
          onError={() => setSrcIndex((prev) => prev + 1)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      </div>
    );
  }

  const firstLetter = (validator.name || 'V').trim()[0].toUpperCase();
  return (
    <div className={`${size} rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center text-[10px] font-bold font-mono shrink-0`}>
      {firstLetter}
    </div>
  );
}

export default function HarmonyValidatorsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'elected' | 'eligible' | 'not_eligible' | 'favs'
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mintbes_fav_validators') || '[]');
    } catch {
      return [];
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHarmonyData(MY_ADDR);
      if (res.success) {
        setData(res);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn("Failed to fetch validators in public explorer:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (address) => {
    const updated = favorites.includes(address)
      ? favorites.filter((a) => a !== address)
      : [...favorites, address];
    setFavorites(updated);
    localStorage.setItem('mintbes_fav_validators', JSON.stringify(updated));
  };

  const fmt = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const header = data?.header;
  const stats = data?.stats;
  const validators = data?.validators || [];

  const electedCount = validators.length;
  const totalStakedSum = stats?.totalNetworkStaked || 3112608080;
  const percentStaked = stats?.percentStaked || 20.7;

  // Filtered validators
  const filteredValidators = validators.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.addr.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (favoritesOnly || activeTab === 'favs') {
      return favorites.includes(v.addr) || v.is_me;
    }
    if (activeTab === 'eligible') {
      return false;
    }
    if (activeTab === 'not_eligible') {
      return false;
    }
    return true;
  });

  return (
    <section id="validators" className="py-20 bg-[#0c1219] text-[#edf5f4] relative overflow-hidden border-t border-b border-[#1c2633]">
      {/* Background Subtle Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 10% 10%, rgba(31, 223, 182, 0.05), transparent 40%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.04), transparent 40%), #0c1219'
        }}
      />

      <div className={`mx-auto px-4 sm:px-6 relative z-10 transition-all ${isExpanded ? 'max-w-[1720px]' : 'max-w-7xl'}`}>
        
        {/* ========================================================================= */}
        {/* 1. HEADER TITLE & ACTION BUTTONS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Harmony Validators</span>
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Mainnet Shard 0
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                favoritesOnly
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                  : 'bg-[#151e29] border-[#253242] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title="Show Favorites"
            >
              <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg border bg-[#151e29] border-[#253242] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg border bg-[#151e29] border-[#253242] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse View" : "Expand Fullscreen Width"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP 2x3 METRIC CARD GRID (MATCHING USER SCREENSHOT) */}
        {/* ========================================================================= */}
        <div className="bg-[#151e29] border border-[#253242] rounded-xl overflow-hidden shadow-xl mb-4 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#253242]">
            
            {/* Left Column (Total Staked, Current Epoch, Latest Block) */}
            <div className="divide-y divide-[#253242]">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Total Staked</span>
                <strong className="text-white text-sm font-bold">{fmt(totalStakedSum, 0)} ONE</strong>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Current Epoch</span>
                <strong className="text-white text-sm font-bold">#{header?.epoch || 3010}</strong>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Latest Block</span>
                <strong className="text-emerald-400 text-sm font-bold">#{fmt(header?.blockNumber)}</strong>
              </div>
            </div>

            {/* Right Column (Percent Staked, Next Epoch, Shard 0 Block Rate) */}
            <div className="divide-y divide-[#253242]">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Percent Staked</span>
                <strong className="text-white text-sm font-bold">{percentStaked.toFixed(1)}%</strong>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Next Epoch</span>
                <strong className="text-white text-xs font-semibold">{header?.nextEpochDateStr || 'Calculating...'}</strong>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Shard 0 Block Rate</span>
                <strong className="text-sky-400 text-sm font-bold">{header?.blockRate || '2.00 Seconds'}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Subtitle / Timestamp */}
        <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            Last updated - <strong className="text-slate-300">{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}</strong>. Official Harmony EPoS Validator Consensus.
          </div>
          <a
            href="https://staking.harmony.one"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-medium"
          >
            <span>Harmony Staking Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* ========================================================================= */}
        {/* 3. FILTER TABS (MATCHING USER SCREENSHOT) */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 font-sans">
            <button
              onClick={() => { setActiveTab('all'); setFavoritesOnly(false); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' && !favoritesOnly
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-[#151e29] border border-[#253242] text-sky-400 hover:bg-[#1a2533]'
              }`}
            >
              All Eligible {electedCount}
            </button>

            <button
              onClick={() => { setActiveTab('elected'); setFavoritesOnly(false); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'elected' && !favoritesOnly
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-[#151e29] border border-[#253242] text-sky-400 hover:bg-[#1a2533]'
              }`}
            >
              Elected {electedCount}
            </button>

            <button
              onClick={() => { setActiveTab('eligible'); setFavoritesOnly(false); }}
              className="px-3 py-1 rounded text-xs font-semibold bg-[#151e29] border border-[#253242] text-slate-500 cursor-not-allowed opacity-60"
            >
              Eligible 0
            </button>

            <button
              onClick={() => { setActiveTab('commission_inc'); setFavoritesOnly(false); }}
              className="px-3 py-1 rounded text-xs font-semibold bg-[#151e29] border border-[#253242] text-slate-500 cursor-not-allowed opacity-60"
            >
              Commission Increase 0
            </button>

            <button
              onClick={() => { setActiveTab('not_eligible'); setFavoritesOnly(false); }}
              className="px-3 py-1 rounded text-xs font-semibold bg-[#151e29] border border-[#253242] text-slate-500 cursor-not-allowed opacity-60"
            >
              Not Eligible 743
            </button>
          </div>

          <div className="relative">
            <input
              type="search"
              placeholder="Search validator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#151e29] border border-[#253242] focus:border-sky-500 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none font-mono w-56 transition-colors"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. VALIDATORS TABLE WITH EXACT SCREENSHOT COLUMNS */}
        {/* ========================================================================= */}
        <div className="bg-[#151e29] border border-[#253242] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 z-20 bg-[#121922] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#253242]">
                <tr>
                  <th className="py-3 px-2.5 text-center w-8">♡</th>
                  <th className="py-3 px-2 text-center w-8"></th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3 text-right">Total Staked</th>
                  <th className="py-3 px-2.5 text-center">Commission</th>
                  <th className="py-3 px-3 text-right">Stake Weight</th>
                  <th className="py-3 px-2.5 text-center">Status</th>
                  <th className="py-3 px-2.5 text-right">Delegates</th>
                  <th className="py-3 px-2.5 text-center">Election Rate</th>
                  <th className="py-3 px-2.5 text-center">Avg ERI</th>
                  <th className="py-3 px-2.5 text-right">Avg Sign %</th>
                  <th className="py-3 px-2.5 text-right">Last ERI</th>
                  <th className="py-3 px-2.5 text-center">Current ERI</th>
                  <th className="py-3 px-2.5 text-right">Current Sign %</th>
                  <th className="py-3 px-3 text-center">Stake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202c3a]">
                {filteredValidators.map((v, idx) => {
                  const isMe = v.is_me;
                  const isFav = favorites.includes(v.addr);
                  const signPct = v.ep_pct || 100.0;
                  const avgSign = v.lt_pct || 99.9;
                  const currentEri = v.currentEri || 1.0;
                  const avgEri = v.avgEri || 1.0;

                  return (
                    <tr
                      key={v.addr}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-emerald-500/10 font-bold border-l-4 border-l-emerald-400'
                          : 'hover:bg-[#1a2533]'
                      }`}
                    >
                      {/* 1. Favorite Heart */}
                      <td className="py-3 px-2.5 text-center">
                        <button
                          onClick={() => toggleFavorite(v.addr)}
                          className={`transition cursor-pointer ${
                            isFav ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Save favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* 2. Logo */}
                      <td className="py-3 px-2 text-center">
                        <div className="flex justify-center">
                          <ValidatorAvatar validator={v} size="w-6 h-6" />
                        </div>
                      </td>

                      {/* 3. Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 max-w-[210px] truncate">
                          <a
                            href={`https://staking.harmony.one/validators/mainnet/${v.addr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`hover:underline truncate ${
                              isMe ? 'text-emerald-400 font-bold' : 'text-sky-300 hover:text-sky-200'
                            }`}
                            title={v.name}
                          >
                            {v.name}
                          </a>
                          {isMe && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Your Node
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Total Staked */}
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {fmt(v.actualStake, 0)}
                      </td>

                      {/* 5. Commission */}
                      <td className="py-3 px-2.5 text-center text-slate-300">
                        {v.rate?.toFixed(0)}%
                      </td>

                      {/* 6. Stake Weight (with background progress fill) */}
                      <td className="py-3 px-3 text-right relative">
                        <div
                          className="absolute inset-y-1.5 right-1 rounded bg-sky-500/15 pointer-events-none"
                          style={{ width: `${Math.min(100, (v.stakeWeight || 0) * 8)}%` }}
                        />
                        <span className="relative z-10 text-slate-200 font-semibold">
                          {v.stakeWeight?.toFixed(2)}%
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                          Elected
                        </span>
                      </td>

                      {/* 8. Delegates */}
                      <td className="py-3 px-2.5 text-right text-slate-300">
                        {fmt(v.delegatesCount || 1)}
                      </td>

                      {/* 9. Election Rate */}
                      <td className="py-3 px-2.5 text-center text-slate-300">
                        100
                      </td>

                      {/* 10. Avg ERI */}
                      <td className="py-3 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${avgEri >= 1.0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="text-white">{avgEri.toFixed(2)}</span>
                        </span>
                      </td>

                      {/* 11. Avg Sign % */}
                      <td className="py-3 px-2.5 text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span className={`w-2 h-2 rounded-full ${avgSign >= 98 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-white">{avgSign.toFixed(2)}</span>
                        </span>
                      </td>

                      {/* 12. Last ERI */}
                      <td className="py-3 px-2.5 text-right text-slate-300">
                        {v.lastEri?.toFixed(2) || '1.00'}
                      </td>

                      {/* 13. Current ERI */}
                      <td className="py-3 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${currentEri >= 1.0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className={currentEri >= 1.0 ? 'text-emerald-300 font-semibold' : 'text-rose-300'}>
                            {currentEri.toFixed(2)}
                          </span>
                        </span>
                      </td>

                      {/* 14. Current Sign % */}
                      <td className="py-3 px-2.5 text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span className={`w-2 h-2 rounded-full ${signPct >= 98 ? 'bg-emerald-400' : signPct >= 90 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                          <span className="text-white font-bold">{signPct >= 100 ? '100' : signPct.toFixed(2)}</span>
                        </span>
                      </td>

                      {/* 15. Stake Button */}
                      <td className="py-3 px-3 text-center">
                        <a
                          href={`https://staking.harmony.one/validators/mainnet/${v.addr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-sans text-[11px] font-bold px-3 py-1 rounded transition-colors shadow-sm"
                        >
                          Stake
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
