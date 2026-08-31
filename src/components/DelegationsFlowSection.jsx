import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Activity,
  Layers
} from 'lucide-react';
import { fetchDelegationHistory, shortAddr, MY_ADDR } from '../services/harmonyRpc';

export default function DelegationsFlowSection() {
  const [data, setData] = useState({ events: [], allNetworkEvents: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('mintbes'); // 'mintbes' | 'network'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'DELEGATE' | 'UNDELEGATE'
  const [search, setSearch] = useState('');
  const [copiedHash, setCopiedHash] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchDelegationHistory(MY_ADDR, 50);
      if (res.success) {
        setData(res);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Failed to load delegation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const fmt = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const currentSourceList = scope === 'mintbes' ? (data.events || []) : (data.allNetworkEvents || []);

  const filteredEvents = currentSourceList.filter((e) => {
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      const matchHash =
        e.hash?.toLowerCase().includes(query) ||
        e.ethHash?.toLowerCase().includes(query) ||
        e.harmonyHash?.toLowerCase().includes(query);
      const matchDelegator = e.delegator?.toLowerCase().includes(query);
      const matchValidator =
        e.validator?.toLowerCase().includes(query) ||
        e.validatorName?.toLowerCase().includes(query);

      // If user searches a tx hash, bypass type filter to find the exact tx
      const isSearchingHash = query.startsWith('0x') && query.length > 6;
      if (isSearchingHash) {
        return matchHash;
      }

      if (filterType === 'DELEGATE' && !e.isDelegation) return false;
      if (filterType === 'UNDELEGATE' && e.isDelegation) return false;
      return matchDelegator || matchValidator || matchHash;
    }

    if (filterType === 'DELEGATE' && !e.isDelegation) return false;
    if (filterType === 'UNDELEGATE' && e.isDelegation) return false;
    return true;
  });

  const stats = data.stats || {};
  const delCount = scope === 'mintbes' 
    ? (stats.delegationCount || 0) 
    : (data.allNetworkEvents || []).filter(e => e.isDelegation).length;
  const undelCount = scope === 'mintbes' 
    ? (stats.undelegationCount || 0) 
    : (data.allNetworkEvents || []).filter(e => !e.isDelegation).length;

  return (
    <section id="delegations" className="py-20 bg-[#090d13] text-[#edf5f4] relative overflow-hidden border-t border-b border-[#1c2633]">
      {/* Background Subtle Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(31, 223, 182, 0.05), transparent 45%), radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.04), transparent 45%), #090d13',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. HEADER & ACTIONS */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ● Live EVM Staking Ledger
              </span>
              <span className="text-[11px] text-[#697a7c] font-mono">
                Updated: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Delegations & Undelegations History</span>
            </h2>
            <p className="text-xs text-[#a8b6b6] mt-1 max-w-2xl">
              Real-time on-chain staking activity decoded directly from the Harmony Staking Precompile and consensus protocol.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="bg-[#0f151d] hover:bg-[#131b25] border border-[#202a35] hover:border-[#1fdfb67a] text-[#a8b6b6] hover:text-[#edf5f4] px-3 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATS SUMMARY CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 font-mono text-xs">
          <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
            <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
              {scope === 'mintbes' ? 'Mintbes Delegations (Inflows)' : 'Network Delegations'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <strong className="text-emerald-400 text-lg font-bold">
                {scope === 'mintbes' ? `+${fmt(stats.totalInflow, 0)}` : `${delCount} events`}
              </strong>
              {scope === 'mintbes' && <span className="text-xs text-[#697a7c]">ONE</span>}
            </div>
            <span className="text-[10px] text-emerald-400/80 font-sans mt-0.5 block">
              {delCount} total delegation transactions
            </span>
          </div>

          <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
            <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
              {scope === 'mintbes' ? 'Mintbes Undelegations (Outflows)' : 'Network Undelegations'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <strong className="text-rose-400 text-lg font-bold">
                {scope === 'mintbes' ? `-${fmt(stats.totalOutflow, 0)}` : `${undelCount} events`}
              </strong>
              {scope === 'mintbes' && <span className="text-xs text-[#697a7c]">ONE</span>}
            </div>
            <span className="text-[10px] text-rose-400/80 font-sans mt-0.5 block">
              {undelCount} undelegation events
            </span>
          </div>

          <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
            <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
              {scope === 'mintbes' ? 'Net Staking Flow (Mintbes)' : 'Network Activity Ratio'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              {scope === 'mintbes' ? (
                <strong className={`text-lg font-bold ${stats.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.netFlow >= 0 ? '+' : ''}{fmt(stats.netFlow, 0)} <span className="text-xs text-[#697a7c]">ONE</span>
                </strong>
              ) : (
                <strong className="text-sky-400 text-lg font-bold">
                  {delCount + undelCount > 0 ? ((delCount / (delCount + undelCount)) * 100).toFixed(1) : '50'}% Inflow
                </strong>
              )}
            </div>
            <span className="text-[10px] text-[#697a7c] font-sans mt-0.5 block">
              {scope === 'mintbes' ? 'Cumulative net balance' : 'Inflow vs outflow balance'}
            </span>
          </div>

          <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
            <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
              Transactions Loaded
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <strong className="text-sky-400 text-lg font-bold">
                {fmt(filteredEvents.length)}
              </strong>
              <span className="text-xs text-[#697a7c]">Tx Verified</span>
            </div>
            <span className="text-[10px] text-[#697a7c] font-sans mt-0.5 block">
              Harmony Shard 1 Precompile
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SCOPE SELECTOR, FILTERS AND SEARCH */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 font-sans">
          
          {/* Scope Toggle: Mintbes vs All Network */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0f151d] border border-[#202a35] rounded-xl self-start">
            <button
              onClick={() => setScope('mintbes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'mintbes'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-[#697a7c] hover:text-white'
              }`}
            >
              <span>🌿 Mintbes Ledger ({data.events?.length || 0})</span>
            </button>

            <button
              onClick={() => setScope('network')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'network'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'text-[#697a7c] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Network Live Feed ({data.allNetworkEvents?.length || 0})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-[#0f151d] border border-[#202a35] text-[#a8b6b6] hover:text-white hover:bg-[#131b25]'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilterType('DELEGATE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'DELEGATE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0f151d] border border-[#202a35] text-emerald-400 hover:bg-[#131b25]'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                <span>Delegations</span>
              </button>

              <button
                onClick={() => setFilterType('UNDELEGATE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'UNDELEGATE'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-[#0f151d] border border-[#202a35] text-rose-400 hover:bg-[#131b25]'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                <span>Undelegations</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search address or tx hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0f151d] border border-[#202a35] focus:border-sky-500 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-[#697a7c] outline-none font-mono w-56 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. MAIN DELEGATIONS & UNDELEGATIONS TABLE (MATCHING SCREENSHOT) */}
        {/* ========================================================================= */}
        <div className="bg-[#0f151d] border border-[#202a35] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 z-20 bg-[#131b25] text-[#697a7c] uppercase text-[10px] tracking-wider border-b border-[#202a35]">
                <tr>
                  <th className="py-3.5 px-4 w-36">Type</th>
                  <th className="py-3.5 px-4">Validator</th>
                  <th className="py-3.5 px-4">Delegator</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right w-28">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202a35]">
                {loading && filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[#697a7c] font-sans">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                      Loading on-chain staking records from Harmony Precompile...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#697a7c] font-sans">
                      No delegation records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => {
                    const isDel = evt.isDelegation;
                    const dAddr = evt.delegator;
                    const dLine1 = dAddr ? dAddr.slice(0, 8) + '...' : '';
                    const dLine2 = dAddr ? dAddr.slice(-6) : '';

                    return (
                      <tr
                        key={evt.id}
                        className={`transition-colors ${
                          isDel ? 'hover:bg-[#1fdfb608]' : 'hover:bg-[#ff505008]'
                        }`}
                      >
                        {/* 1. Type Badge */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold font-sans ${
                                isDel
                                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <span className="text-sky-400">{isDel ? '⬆' : '⬇'}</span>
                              <span>{evt.type}</span>
                            </span>
                            <span className="block text-[10px] text-[#697a7c] font-sans">
                              EVM
                            </span>
                          </div>
                        </td>

                        {/* 2. Validator Moniker & Address */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <strong className={`text-xs block font-sans font-bold transition-colors ${
                                evt.isMintbes ? 'text-emerald-400 font-extrabold' : 'text-white hover:text-sky-400'
                              }`}>
                                {evt.validatorName}
                              </strong>
                              {evt.isMintbes && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                                  Your Node
                                </span>
                              )}
                            </div>
                            <a
                              href={`https://staking.harmony.one/validators/mainnet/${evt.validator}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#697a7c] hover:text-[#a8b6b6] block"
                              title={evt.validator}
                            >
                              {shortAddr(evt.validator)}
                            </a>
                          </div>
                        </td>

                        {/* 3. Delegator Address (2-line formatted like screenshot) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-0.5">
                            <a
                              href={`https://explorer.harmony.one/address/${dAddr}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#a8b6b6] hover:text-white hover:underline text-xs block leading-tight font-mono"
                              title={dAddr}
                            >
                              <div>{dLine1}</div>
                              <div>{dLine2}</div>
                            </a>
                            {evt.isSelfStake && (
                              <span className="inline-block text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Self-Stake
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Amount (Bold green / red + USD value) */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="space-y-0.5">
                            <strong
                              className={`text-sm font-bold block ${
                                isDel ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {fmt(evt.amount, 0)} ONE
                            </strong>
                            <span className="text-[11px] text-[#697a7c] block">
                              {evt.usdVal}
                            </span>
                          </div>
                        </td>

                        {/* 5. When (Relative time + Tooltip + Link to Tx) */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="space-y-0.5">
                            <a
                              href={`https://explorer.harmony.one/tx/${evt.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-300 hover:text-sky-400 transition-colors block font-sans"
                              title={`Block #${fmt(evt.blockNumber)} - ${evt.dateStr}`}
                            >
                              {evt.timeAgo}
                            </a>
                            <span className="text-[10px] text-[#697a7c] block">
                              Tx Verified
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#202a35] px-5 py-3 text-[11px] text-[#697a7c] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#090d13]">
            <span>
              Showing {filteredEvents.length} records on Harmony Shard 1 ({scope === 'mintbes' ? 'Mintbes Specific' : 'All Network Feed'}).
            </span>
            <a
              href={`https://staking.harmony.one/validators/mainnet/${MY_ADDR}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-sans"
            >
              <span>Verify on Official Harmony Staking</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
