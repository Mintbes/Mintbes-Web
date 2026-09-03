import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Coins,
  RefreshCw,
  LogOut,
  Sliders,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  Key,
  Layers,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Terminal,
  Cpu,
  Heart,
  Layers3,
  Percent,
  Users,
  Calendar,
  Hourglass,
  CheckCircle2,
  HardDrive,
  Database,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  History,
  TrendingUp,
  Globe,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  fetchHarmonyData,
  fetchDelegationHistory,
  calculateKeySimulation,
  shortAddr,
  MY_ADDR,
  RPC_URL,
} from '../../services/harmonyRpc';

/**
 * Validator Logo Avatar Component with Multi-Tier Fallback:
 * 1. Harmony Official Staking API: https://api.stake.hmny.io/networks/mainnet/validators/{addr}/avatar
 * 2. Harmony GitHub Repo (JPG): https://raw.githubusercontent.com/harmony-one/validator-logos/master/validators/{addr}.jpg
 * 3. Harmony GitHub Repo (PNG): https://raw.githubusercontent.com/harmony-one/validator-logos/master/validators/{addr}.png
 * 4. Keybase Identity: https://keybase.io/{identity}/picture
 * 5. Brand match: Binance / Harmony
 */
function ValidatorAvatar({ validator, size = "w-6 h-6" }) {
  const [srcIndex, setSrcIndex] = useState(0);

  if (validator.is_me || validator.addr?.toLowerCase() === MY_ADDR.toLowerCase()) {
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-xs shrink-0 border border-[#1fdfb66b] shadow-[0_0_8px_rgba(31,223,182,0.3)]`}
        style={{
          background: 'linear-gradient(135deg, rgba(31, 223, 182, 0.28), rgba(15, 21, 29, 0.9))',
        }}
        title="Mintbes Node"
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

  // If still sources available
  if (srcIndex < sources.length) {
    return (
      <div className={`${size} rounded-full overflow-hidden bg-[#131b25] border border-[#202a35] shrink-0 flex items-center justify-center`}>
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

  // Monogram Fallback
  const firstLetter = (validator.name || 'V').trim()[0].toUpperCase();
  return (
    <div className={`${size} rounded-full bg-[#131b25] border border-[#202a35] text-[#1fdfb6] flex items-center justify-center text-[10px] font-bold font-mono shrink-0 shadow-inner`}>
      {firstLetter}
    </div>
  );
}

export default function MintbesDashboard({ onLock }) {
  // Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Navigation Tabs: 'overview' | 'validators_explorer' | 'performance' | 'delegators' | 'bids' | 'simulator' | 'rpc'
  const [activeTab, setActiveTab] = useState('overview');

  // Filters & Favorites
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'focused' | 'mintbes' | 'favs'
  const [searchTerm, setSearchTerm] = useState('');
  const [delegatorSearch, setDelegatorSearch] = useState('');
  const [valExplorerTab, setValExplorerTab] = useState('all'); // 'all' | 'elected' | 'eligible' | 'not_eligible'
  const [valExplorerSearch, setValExplorerSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mintbes_fav_validators') || '[]');
    } catch {
      return [];
    }
  });

  // Delegation History State
  const [delegationHistory, setDelegationHistory] = useState({ events: [], allNetworkEvents: [], stats: {} });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyScope, setHistoryScope] = useState('mintbes'); // 'mintbes' | 'network'
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'DELEGATE' | 'UNDELEGATE'
  const [historySearch, setHistorySearch] = useState('');

  // Simulator State
  const [simExtraStake, setSimExtraStake] = useState(0);

  const timerRef = useRef(null);

  const loadDelegationHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchDelegationHistory(MY_ADDR, 50);
      if (res.success) {
        setDelegationHistory(res);
      }
    } catch (err) {
      console.warn("Failed to load delegation history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load Data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetchHarmonyData(MY_ADDR);
      if (res.success) {
        setData(res);
        setLastUpdated(new Date());
      } else {
        setError(res.error || 'Failed to connect to Harmony RPC node');
      }
    } catch (err) {
      setError(err.message || 'Unexpected network error');
    } finally {
      setLoading(false);
      setCountdown(30);
    }

    loadDelegationHistory();
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh delegation history when user switches to tab [H]
  useEffect(() => {
    if (activeTab === 'delegation_history') {
      loadDelegationHistory();
    }
  }, [activeTab]);

  // Keyboard Shortcuts: [V], [F], [D], [S], [P], [R], [Q]/[2]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'v') {
        e.preventDefault();
        setActiveTab('validators_explorer');
      } else if (key === 'h') {
        e.preventDefault();
        setActiveTab('delegation_history');
      } else if (key === 'f') {
        e.preventDefault();
        setActiveTab('performance');
      } else if (key === 'd') {
        e.preventDefault();
        setActiveTab('delegators');
      } else if (key === 's') {
        e.preventDefault();
        setActiveTab('simulator');
      } else if (key === 'p' || key === 'b') {
        e.preventDefault();
        setActiveTab('bids');
      } else if (key === 'r') {
        e.preventDefault();
        loadData(false);
      } else if (key === 'q' || e.key === '2') {
        e.preventDefault();
        onLock?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto Refresh Countdown (30s)
  useEffect(() => {
    if (!autoRefresh) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [autoRefresh]);

  // Format Helper
  const fmt = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const toggleFavorite = (address) => {
    const updated = favorites.includes(address)
      ? favorites.filter((a) => a !== address)
      : [...favorites, address];
    setFavorites(updated);
    localStorage.setItem('mintbes_fav_validators', JSON.stringify(updated));
  };

  // Derived Values
  const myData = data?.myData;
  const validators = data?.validators || [];
  const delegators = data?.delegators || [];
  const epochHistory = data?.epochHistory || [];
  const hourlyList = data?.hourlyList || [];
  const header = data?.header;
  const stats = data?.stats;
  const walletBalance = data?.walletBalance || 0;
  const activeBlsKeys = data?.activeBlsKeys || [];

  const effectiveStake = (myData?.actualStake || 0) + simExtraStake;
  const simResults = calculateKeySimulation(
    effectiveStake,
    validators,
    stats?.cutoffStake || 0,
    myData?.keys || 5,
    myData?.poolDailyEst || 0,
    myData?.rate || 5
  );

  // Filtered validators for Table
  const filteredValidators = validators.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.addr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.slotRange.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (tableFilter === 'mintbes') return v.is_me;
    if (tableFilter === 'favs') return favorites.includes(v.addr) || v.is_me;
    if (tableFilter === 'focused') {
      const myRank = myData?.validatorRank || 30;
      return v.validatorRank >= Math.max(1, myRank - 3);
    }
    return true;
  });

  // Filtered validators for Harmony Validators Explorer tab
  const filteredValExplorer = validators.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(valExplorerSearch.toLowerCase()) ||
      v.addr.toLowerCase().includes(valExplorerSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (valExplorerTab === 'favs') {
      return favorites.includes(v.addr) || v.is_me;
    }
    if (valExplorerTab === 'eligible' || valExplorerTab === 'not_eligible') {
      return false;
    }
    return true;
  });

  // Filtered delegators
  const filteredDelegators = delegators.filter(
    (d) =>
      d.address.toLowerCase().includes(delegatorSearch.toLowerCase()) ||
      (d.is_me && 'mintbes self-stake'.includes(delegatorSearch.toLowerCase()))
  );

  // Filtered Delegation History Events
  const currentHistorySource =
    historyScope === 'mintbes'
      ? delegationHistory.events || []
      : delegationHistory.allNetworkEvents || [];

  const filteredHistoryEvents = currentHistorySource.filter((e) => {
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      const matchHash =
        e.hash?.toLowerCase().includes(q) ||
        e.ethHash?.toLowerCase().includes(q) ||
        e.harmonyHash?.toLowerCase().includes(q);
      const matchDelegator = e.delegator?.toLowerCase().includes(q);
      const matchValidator =
        e.validator?.toLowerCase().includes(q) ||
        e.validatorName?.toLowerCase().includes(q);

      // If user searches a tx hash, bypass type filter to find the exact tx
      const isSearchingHash = q.startsWith('0x') && q.length > 6;
      if (isSearchingHash) {
        return matchHash;
      }

      if (historyFilter === 'DELEGATE' && !e.isDelegation) return false;
      if (historyFilter === 'UNDELEGATE' && e.isDelegation) return false;
      return matchDelegator || matchValidator || matchHash;
    }

    if (historyFilter === 'DELEGATE' && !e.isDelegation) return false;
    if (historyFilter === 'UNDELEGATE' && e.isDelegation) return false;
    return true;
  });

  const historyStats = delegationHistory.stats || {};

  return (
    <div className="min-h-screen bg-[#090d13] text-[#edf5f4] selection:bg-[#1fdfb6] selection:text-[#07110f] font-sans antialiased pb-16">
      {/* Background Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 12% -8%, rgba(31, 223, 182, 0.07), transparent 30%), radial-gradient(circle at 88% 25%, rgba(31, 223, 182, 0.04), transparent 35%), #090d13',
        }}
      />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8 py-7 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HEADER & EPOCH COUNTDOWN */}
        {/* ========================================================================= */}
        <header className="border-b border-[#202a35] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-[#1fdfb6] font-extrabold text-xl border border-[#1fdfb66b] shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(31, 223, 182, 0.22), transparent 62%), #0f151d',
                boxShadow: 'inset 0 0 20px rgba(31, 223, 182, 0.08)',
              }}
            >
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#697a7c] text-[11px] font-bold uppercase tracking-[0.14em] block">
                  HARMONY EPOS VALIDATOR COMMAND CENTER
                </span>
                <span className="bg-[#1fdfb61a] text-[#1fdfb6] border border-[#1fdfb647] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ONLINE
                </span>
              </div>
              <h1 className="text-[22px] font-bold text-[#edf5f4] tracking-[-0.02em]">
                Mintbes Validator Operations
              </h1>
            </div>
          </div>

          {/* Epoch Countdown & Actions */}
          <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
            <div className="flex flex-col items-start md:items-end text-[11px] text-[#697a7c]">
              <span className="flex items-center gap-1 font-semibold text-[#f5b342]">
                <Hourglass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                NEXT EPOCH IN:
              </span>
              <strong className="text-[#edf5f4] font-mono text-[13px]">
                {header?.countdownStr || 'Calculating...'} <span className="text-[#697a7c] font-normal text-[10px]">({fmt(header?.blocksLeft)} blks)</span>
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(false)}
                disabled={loading}
                className="bg-[#0f151d] hover:bg-[#131b25] border border-[#32404d] hover:border-[#1fdfb67a] text-[#a8b6b6] hover:text-[#edf5f4] px-3 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh telemetry (HotKey R)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1fdfb6]' : ''}`} />
                <span>⏱️ {countdown}s</span>
              </button>

              <button
                onClick={onLock}
                className="bg-[#0f151d] hover:bg-[#ff505014] border border-[#32404d] hover:border-[#ff606040] text-[#a8b6b6] hover:text-[#ff9b9b] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Lock and exit dashboard (HotKey Q)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="border border-[#ff606040] bg-[#ff50500f] text-[#ffb3b3] rounded-lg p-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff6060]" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(false)}
              className="px-3 py-1 bg-[#ff606026] hover:bg-[#ff606040] rounded text-[11px] font-bold text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TOP METRICS STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono text-xs">
          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Current Epoch</span>
            <strong className="text-[#edf5f4] text-sm font-bold">
              #{header?.epoch || 0} <span className="text-[10px] text-[#697a7c]">→ #{header ? header.epoch + 1 : 1}</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Shard 0 Block</span>
            <strong className="text-[#1fdfb6] text-sm font-bold">
              #{fmt(header?.blockNumber)}
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Epoch Target Block</span>
            <strong className="text-[#a8b6b6] text-sm font-bold">
              #{fmt(header?.epochLastBlock)}
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Consensus Slots</span>
            <strong className="text-[#edf5f4] text-sm font-bold">
              {stats?.totalSlots || 400} <span className="text-[10px] text-[#697a7c]">({stats?.totalNodes || 0} nodes)</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">EPoS Median Stake</span>
            <strong className="text-[#6e80ff] text-sm font-bold">
              {fmt(stats?.medianStake, 0)} <span className="text-[9px] text-[#697a7c]">ONE</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Cutoff Line (#{stats?.totalNodes})</span>
            <strong className="text-[#ff6060] text-sm font-bold">
              {fmt(stats?.cutoffStake, 0)} <span className="text-[9px] text-[#697a7c]">ONE</span>
            </strong>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NAVIGATION TABS (INCLUDING HARMONY VALIDATORS SECTION) */}
        {/* ========================================================================= */}
        <div className="border border-[#202a35] bg-[#090d13] rounded-xl p-1 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Mintbes Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('validators_explorer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'validators_explorer'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Harmony Validators [V]</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'performance'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hourly & Epoch Performance [F]</span>
          </button>

          <button
            onClick={() => setActiveTab('delegators')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'delegators'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Delegators ({delegators.length}) [D]</span>
          </button>

          <button
            onClick={() => setActiveTab('delegation_history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'delegation_history'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Delegation History [H]</span>
          </button>

          <button
            onClick={() => setActiveTab('bids')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bids'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5" />
            <span>Bid Slots Auction ({validators.length} Nodes) [P]</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>EPoS Simulator [S]</span>
          </button>

          <button
            onClick={() => setActiveTab('rpc')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rpc'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>RPC Protocol</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. TAB: HARMONY VALIDATORS EXPLORER (MATCHING USER SCREENSHOT) */}
        {/* ========================================================================= */}
        {activeTab === 'validators_explorer' && (
          <div className="space-y-4">
            
            {/* Top 2x3 Metric Card Grid */}
            <div className="bg-[#0f151d] border border-[#202a35] rounded-xl overflow-hidden shadow-xl font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#202a35]">
                
                {/* Left Column */}
                <div className="divide-y divide-[#202a35]">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Total Staked</span>
                    <strong className="text-white text-sm font-bold">{fmt(stats?.totalNetworkStaked || 3112608080, 0)} ONE</strong>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Current Epoch</span>
                    <strong className="text-white text-sm font-bold">#{header?.epoch || 3011}</strong>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Latest Block</span>
                    <strong className="text-[#1fdfb6] text-sm font-bold">#{fmt(header?.blockNumber)}</strong>
                  </div>
                </div>

                {/* Right Column */}
                <div className="divide-y divide-[#202a35]">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Percent Staked</span>
                    <strong className="text-white text-sm font-bold">{(stats?.percentStaked || 20.7).toFixed(1)}%</strong>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Next Epoch</span>
                    <strong className="text-white text-xs font-semibold">{header?.nextEpochDateStr || 'Calculating...'}</strong>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#a8b6b6] font-sans">Shard 0 Block Rate</span>
                    <strong className="text-sky-400 text-sm font-bold">{header?.blockRate || '2.00 Seconds'}</strong>
                  </div>
                </div>

              </div>
            </div>

            {/* Subtitle / Timestamp */}
            <div className="text-[11px] text-[#697a7c] flex flex-wrap items-center justify-between gap-2">
              <div>
                Last updated - <strong className="text-[#a8b6b6]">{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}</strong>. Official Harmony EPoS Validator Consensus.
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

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 font-sans">
                <button
                  onClick={() => setValExplorerTab('all')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    valExplorerTab === 'all'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-[#0f151d] border border-[#202a35] text-sky-400 hover:bg-[#131b25]'
                  }`}
                >
                  All Eligible {validators.length}
                </button>

                <button
                  onClick={() => setValExplorerTab('elected')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    valExplorerTab === 'elected'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-[#0f151d] border border-[#202a35] text-sky-400 hover:bg-[#131b25]'
                  }`}
                >
                  Elected {validators.length}
                </button>

                <button
                  onClick={() => setValExplorerTab('eligible')}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#0f151d] border border-[#202a35] text-slate-500 cursor-not-allowed opacity-60"
                >
                  Eligible 0
                </button>

                <button
                  onClick={() => setValExplorerTab('commission_inc')}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#0f151d] border border-[#202a35] text-slate-500 cursor-not-allowed opacity-60"
                >
                  Commission Increase 0
                </button>

                <button
                  onClick={() => setValExplorerTab('not_eligible')}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#0f151d] border border-[#202a35] text-slate-500 cursor-not-allowed opacity-60"
                >
                  Not Eligible 743
                </button>

                <button
                  onClick={() => setValExplorerTab('favs')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    valExplorerTab === 'favs'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-[#0f151d] border border-[#202a35] text-rose-400 hover:bg-[#131b25]'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>Favorites ({favorites.length})</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="search"
                  placeholder="Search validator..."
                  value={valExplorerSearch}
                  onChange={(e) => setValExplorerSearch(e.target.value)}
                  className="bg-[#0f151d] border border-[#202a35] focus:border-sky-500 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-[#697a7c] outline-none font-mono w-56 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#0f151d] border border-[#202a35] rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead className="sticky top-0 z-20 bg-[#131b25] text-[#697a7c] uppercase text-[10px] tracking-wider border-b border-[#202a35]">
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
                  <tbody className="divide-y divide-[#202a35]">
                    {filteredValExplorer.map((v) => {
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
                              ? 'bg-[#1fdfb614] font-bold border-l-4 border-l-[#1fdfb6]'
                              : 'hover:bg-[#ffffff04]'
                          }`}
                        >
                          {/* 1. Favorite Heart */}
                          <td className="py-3 px-2.5 text-center">
                            <button
                              onClick={() => toggleFavorite(v.addr)}
                              className={`transition cursor-pointer ${
                                isFav ? 'text-rose-500' : 'text-[#697a7c] hover:text-[#edf5f4]'
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
                                  isMe ? 'text-[#1fdfb6] font-bold' : 'text-sky-300 hover:text-sky-200'
                                }`}
                                title={v.name}
                              >
                                {v.name}
                              </a>
                              {isMe && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b]">
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
                          <td className="py-3 px-2.5 text-center text-[#a8b6b6]">
                            {v.rate?.toFixed(0)}%
                          </td>

                          {/* 6. Stake Weight */}
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
                            <span className="inline-flex items-center gap-1 text-[#1fdfb6] text-[11px] font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#1fdfb6] shadow-[0_0_6px_#1fdfb6]" />
                              Elected
                            </span>
                          </td>

                          {/* 8. Delegates */}
                          <td className="py-3 px-2.5 text-right text-[#a8b6b6]">
                            {fmt(v.delegatesCount || 1)}
                          </td>

                          {/* 9. Election Rate */}
                          <td className="py-3 px-2.5 text-center text-[#a8b6b6]">
                            100
                          </td>

                          {/* 10. Avg ERI */}
                          <td className="py-3 px-2.5 text-center">
                            <span className="inline-flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${avgEri >= 1.0 ? 'bg-[#1fdfb6]' : 'bg-rose-400'}`} />
                              <span className="text-white">{avgEri.toFixed(2)}</span>
                            </span>
                          </td>

                          {/* 11. Avg Sign % */}
                          <td className="py-3 px-2.5 text-right">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span className={`w-2 h-2 rounded-full ${avgSign >= 98 ? 'bg-[#1fdfb6]' : 'bg-amber-400'}`} />
                              <span className="text-white">{avgSign.toFixed(2)}</span>
                            </span>
                          </td>

                          {/* 12. Last ERI */}
                          <td className="py-3 px-2.5 text-right text-[#a8b6b6]">
                            {v.lastEri?.toFixed(2) || '1.00'}
                          </td>

                          {/* 13. Current ERI */}
                          <td className="py-3 px-2.5 text-center">
                            <span className="inline-flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${currentEri >= 1.0 ? 'bg-[#1fdfb6]' : 'bg-rose-400'}`} />
                              <span className={currentEri >= 1.0 ? 'text-[#1fdfb6] font-semibold' : 'text-rose-300'}>
                                {currentEri.toFixed(2)}
                              </span>
                            </span>
                          </td>

                          {/* 14. Current Sign % */}
                          <td className="py-3 px-2.5 text-right">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span className={`w-2 h-2 rounded-full ${signPct >= 98 ? 'bg-[#1fdfb6]' : signPct >= 90 ? 'bg-amber-400' : 'bg-rose-400'}`} />
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
        )}

        {/* ========================================================================= */}
        {/* 5. TAB 1: OVERVIEW & EPOS ADVISOR */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* EPoS ADVISOR BANNER */}
            {myData && (
              <div
                className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                  myData.advisorStatus === 'CAN_ADD'
                    ? 'border-[#1fdfb66b] bg-[#1fdfb60f]'
                    : myData.advisorStatus === 'WARNING'
                    ? 'border-[#f5b3426b] bg-[#f5b3420f]'
                    : myData.advisorStatus === 'DANGER'
                    ? 'border-[#ff60606b] bg-[#ff50500f]'
                    : 'border-[#202a35] bg-[#0f151d]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      myData.advisorStatus === 'CAN_ADD'
                        ? 'bg-[#1fdfb61f] text-[#1fdfb6]'
                        : myData.advisorStatus === 'WARNING'
                        ? 'bg-[#f5b3421f] text-[#f5b342]'
                        : myData.advisorStatus === 'DANGER'
                        ? 'bg-[#ff50501f] text-[#ff6060]'
                        : 'bg-[#131b25] text-[#1fdfb6]'
                    }`}
                  >
                    🧠
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#edf5f4] flex items-center gap-2">
                      <span>EPOS PROTOCOL INSIGHT: {myData.advisorTitle}</span>
                    </h3>
                    <p className="text-xs text-[#a8b6b6] mt-1 leading-relaxed max-w-3xl">
                      {myData.advisorMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#1fdfb6] hover:text-[#edf5f4] px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Simulator</span>
                  </button>
                </div>
              </div>
            )}

            {/* HERO TELEMETRY CARD */}
            <div
              className="border border-[#1fdfb67a] rounded-xl overflow-hidden shadow-2xl"
              style={{
                background:
                  'radial-gradient(circle at 50% -20%, rgba(31, 223, 182, 0.08), transparent 45%), #0f151d',
              }}
            >
              <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1fdfb6] shadow-[0_0_10px_#1fdfb6]" />
                  <h2 className="text-[17px] font-bold text-[#edf5f4]">
                    Validator: Mintbes (Rank #{myData?.validatorRank || '--'} of {stats?.totalNodes || 0})
                  </h2>
                </div>
                <span className="text-[10px] text-[#697a7c] font-mono">
                  Operator: <strong className="text-[#a8b6b6]">{MY_ADDR}</strong>
                </span>
              </div>

              {/* Grid 2-columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#202a35]">
                
                {/* Left Column: Slots, Voting Power & Signing stats */}
                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#697a7c] block">
                        ELECTED SLOTS RANGE ({myData?.keys || 0} BLS KEYS)
                      </span>
                      <strong className="text-[32px] font-mono font-bold tracking-tight text-[#1fdfb6] block mt-0.5">
                        Slots #{myData?.slotRange || '352-356'} <span className="text-lg font-normal text-[#697a7c]">/ {stats?.totalSlots || 400}</span>
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#1fdfb61a] text-[#1fdfb6] border border-[#1fdfb647] block mb-1">
                        100% ELECTED
                      </span>
                      <span className="text-[10px] font-mono text-[#f5b342] bg-[#f5b3421a] px-2 py-0.5 rounded border border-[#f5b34247]">
                        {myData?.statusLabel || 'Boosted (85%)'}
                      </span>
                    </div>
                  </div>

                  {/* 2-box signing performance pill */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="border border-[#202a35] bg-[#131b25] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase font-bold text-[#697a7c] block">Current Hour Signing</span>
                      <strong className={`text-base font-bold mt-1 block ${myData?.hourlyList?.[0]?.sign_pct >= 98 ? 'text-[#1fdfb6]' : 'text-[#f5b342]'}`}>
                        {myData?.hourlyList?.[0]?.sign_pct?.toFixed(2) || '100.00'}%
                      </strong>
                      <span className="text-[10px] text-[#697a7c]">
                        ({myData?.hourlyList?.[0]?.signed || 0} / {myData?.hourlyList?.[0]?.asked || 0} blks)
                      </span>
                    </div>

                    <div className="border border-[#202a35] bg-[#131b25] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase font-bold text-[#697a7c] block">Epoch #{header?.epoch} Signing</span>
                      <strong className={`text-base font-bold mt-1 block ${myData?.ep_pct >= 98 ? 'text-[#1fdfb6]' : 'text-[#f5b342]'}`}>
                        {myData?.ep_pct?.toFixed(2) || '100.00'}%
                      </strong>
                      <span className="text-[10px] text-[#697a7c]">
                        ({fmt(myData?.ep_signed)} / {fmt(myData?.ep_to_sign)} blks)
                      </span>
                    </div>
                  </div>

                  {/* EPoS Band Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                      <span className="text-[#a8b6b6]">Backup Level vs Median Stake</span>
                      <strong className="text-[#1fdfb6] font-bold">{myData?.backup_pct?.toFixed(0)}% of Median</strong>
                    </div>
                    
                    <div className="relative h-2.5 bg-[#1a2530] rounded-full overflow-visible">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (myData?.bid / (stats?.upperBound || 1)) * 100)}%`,
                          background: 'linear-gradient(90deg, #12b99b, #1fdfb6)',
                          boxShadow: '0 0 12px rgba(31, 223, 182, 0.38)',
                        }}
                      />
                      <div className="absolute top-[-3px] left-[73%] w-[1px] h-[16px] bg-[#f5b342]" title="Lower 85% Bound" />
                      <div className="absolute top-[-3px] left-[87%] w-[1px] h-[16px] bg-[#1fdfb6]" title="Median Stake" />
                      <div className="absolute top-[-3px] left-[100%] w-[1px] h-[16px] bg-[#6e80ff]" title="Upper 115% Cap" />
                    </div>

                    <div className="relative h-4 text-[9px] text-[#697a7c] font-mono mt-2">
                      <span className="absolute left-0">Cutoff #{stats?.totalSlots || 400}: {fmt(stats?.cutoffStake, 0)}</span>
                      <span className="absolute left-[73%] text-[#f5b342] translate-x-[-50%]">85%: {fmt(stats?.lowerBound, 0)}</span>
                      <span className="absolute right-0 text-[#6e80ff]">115%: {fmt(stats?.upperBound, 0)}</span>
                    </div>
                  </div>

                  {/* Key Operational Status Matrix */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#697a7c] block mb-2">
                      NODE TELEMETRY & NETWORK REPUTATION
                    </span>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">Network Shard</span>
                        <strong className="text-[#1fdfb6]">Shard 1</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">Active BLS Keys</span>
                        <strong className="text-[#1fdfb6]">{myData?.keys || 5} Keys</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">Voting Power</span>
                        <strong className="text-[#1fdfb6]">{myData?.votingPower?.toFixed(3) || '1.068'}%</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">Lifetime Uptime</span>
                        <strong className="text-[#a8b6b6]">{myData?.lt_pct ? `${myData.lt_pct.toFixed(2)}%` : '99.98%'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: 4-Cell Telemetry Matrix */}
                <div className="p-6 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#697a7c] block">
                    STAKING METRICS & REWARD ESTIMATES
                  </span>

                  <div className="border border-[#202a35] bg-[#202a35] rounded-lg grid grid-cols-2 gap-[1px] overflow-hidden">
                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Total Delegation (Actual Stake)</dt>
                      <dd className="text-[#edf5f4] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.actualStake, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Stake per Key (Raw Bid)</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.bid, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Margin over Cutoff #{stats?.totalSlots || 400}</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        +{fmt(myData?.margin, 0)} <span className="text-xs font-normal text-[#1fdfb6]">(+{myData?.pct_margin.toFixed(1)}%)</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Liquid Wallet Balance</dt>
                      <dd className="text-[#edf5f4] font-mono text-[16px] font-bold mt-1">
                        {fmt(walletBalance, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>
                  </div>

                  <div className="border border-[#202a35] bg-[#202a35] rounded-lg grid grid-cols-2 gap-[1px] overflow-hidden">
                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Pending Unclaimed Rewards</dt>
                      <dd className="text-[#f5b342] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.unclaimed, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Estimated Daily Commission</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        ~{fmt(myData?.dailyCommission, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE / day</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Lifetime Rewards</dt>
                      <dd className="text-[#a8b6b6] font-mono text-[15px] font-semibold mt-1">
                        {fmt(myData?.rewards, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Commission Fee Rate</dt>
                      <dd className="text-[#a8b6b6] font-mono text-[15px] font-semibold mt-1">
                        {myData?.rate.toFixed(1)}% <span className="text-xs font-normal text-[#697a7c]">Fee</span>
                      </dd>
                    </div>
                  </div>

                </div>

              </div>

              <div className="border-t border-[#202a35] px-5 py-3 text-[11px] text-[#697a7c] font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>* Rewards calculated from network issuance rate (~11.2% global staking APR).</span>
                <span className="text-[#1fdfb6]">Estimated Pool Daily Output: ~{fmt(myData?.poolDailyEst, 0)} ONE</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. TAB: HOURLY SIGNING & EPOCH PERFORMANCE HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            
            {/* HOURLY SIGNING PERFORMANCE */}
            <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
              <div className="border-b border-[#202a35] px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#f5b342]" />
                    Hourly Signing Performance (UTC Time)
                  </h2>
                  <span className="text-[11px] text-[#697a7c]">
                    Real-time 30-second tracking of block assignments, signed blocks, missed blocks, and commission accrual.
                  </span>
                </div>
                <span className="text-[#f5b342] text-[11px] font-mono font-bold">
                  ● HOURLY TELEMETRY ACTIVE
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em] bg-[#ffffff03]">
                      <th className="py-3 px-5">Date / Hour (UTC)</th>
                      <th className="py-3 px-4">Epoch</th>
                      <th className="py-3 px-4 text-right">Assigned</th>
                      <th className="py-3 px-4 text-right">Signed</th>
                      <th className="py-3 px-4 text-right">Missed</th>
                      <th className="py-3 px-4 text-right">Signing %</th>
                      <th className="py-3 px-5 text-right">Est. Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202a35]">
                    {hourlyList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-[#697a7c]">
                          Recording first hourly signing block (awaiting next 30s cycle)...
                        </td>
                      </tr>
                    ) : (
                      hourlyList.map((h, idx) => {
                        const isLive = idx === 0;
                        const pct = h.sign_pct || 100.0;
                        const missed = h.missed || 0;
                        return (
                          <tr key={idx} className={isLive ? 'bg-[#1fdfb60f] font-bold' : 'hover:bg-[#ffffff03]'}>
                            <td className="py-3 px-5">
                              <span className="text-[#edf5f4]">{h.date}</span>
                              {isLive && (
                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-[#1fdfb62e] text-[#1fdfb6] uppercase">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#a8b6b6]">#{h.epoch}</td>
                            <td className="py-3 px-4 text-right text-[#edf5f4]">{fmt(h.asked)}</td>
                            <td className="py-3 px-4 text-right text-[#1fdfb6]">{fmt(h.signed)}</td>
                            <td className={`py-3 px-4 text-right ${missed > 0 ? 'text-[#ff6060]' : 'text-[#697a7c]'}`}>
                              {fmt(missed)}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${pct >= 98 ? 'text-[#1fdfb6]' : pct >= 90 ? 'text-[#f5b342]' : 'text-[#ff6060]'}`}>
                              {pct.toFixed(2)}%
                            </td>
                            <td className="py-3 px-5 text-right text-[#f5b342]">
                              ~{h.rewards?.toFixed(2)} ONE
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RECENT EPOCHS HISTORY */}
            <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
              <div className="border-b border-[#202a35] px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#6e80ff]" />
                    Recent Epochs Historical Performance
                  </h2>
                  <span className="text-[11px] text-[#697a7c]">
                    On-chain records for the last 15 epochs with validation percentages, effective APR, and estimated rewards.
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em] bg-[#ffffff03]">
                      <th className="py-3 px-5">Epoch #</th>
                      <th className="py-3 px-4 text-right">Assigned Blocks</th>
                      <th className="py-3 px-4 text-right">Signed Blocks</th>
                      <th className="py-3 px-4 text-right">Missed Blocks</th>
                      <th className="py-3 px-4 text-right">Signing %</th>
                      <th className="py-3 px-4 text-right">Real APR</th>
                      <th className="py-3 px-5 text-right">Est. Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202a35]">
                    {/* Current Epoch Row */}
                    <tr className="bg-[#1fdfb60f] font-bold border-l-4 border-l-[#1fdfb6]">
                      <td className="py-3 px-5 text-[#1fdfb6]">
                        #{header?.epoch} <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1fdfb62e]">Current</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#edf5f4]">{fmt(myData?.ep_to_sign)}</td>
                      <td className="py-3 px-4 text-right text-[#1fdfb6]">{fmt(myData?.ep_signed)}</td>
                      <td className={`py-3 px-4 text-right ${myData?.ep_to_sign - myData?.ep_signed > 0 ? 'text-[#ff6060]' : 'text-[#697a7c]'}`}>
                        {fmt(Math.max(0, (myData?.ep_to_sign || 0) - (myData?.ep_signed || 0)))}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${myData?.ep_pct >= 98 ? 'text-[#1fdfb6]' : 'text-[#f5b342]'}`}>
                        {myData?.ep_pct?.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-[#6e80ff]">11.20%</td>
                      <td className="py-3 px-5 text-right text-[#f5b342]">~{fmt(myData?.dailyCommission, 0)} ONE</td>
                    </tr>

                    {/* Past Epochs */}
                    {epochHistory.map((ep) => {
                      if (ep.epoch === header?.epoch) return null;
                      return (
                        <tr key={ep.epoch} className="hover:bg-[#ffffff03]">
                          <td className="py-3 px-5 text-[#edf5f4]">#{ep.epoch}</td>
                          <td className="py-3 px-4 text-right text-[#a8b6b6]">{fmt(ep.to_sign)}</td>
                          <td className="py-3 px-4 text-right text-[#edf5f4]">{fmt(ep.signed)}</td>
                          <td className={`py-3 px-4 text-right ${ep.missed > 0 ? 'text-[#ff6060]' : 'text-[#697a7c]'}`}>
                            {fmt(ep.missed)}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${ep.sign_pct >= 98 ? 'text-[#1fdfb6]' : ep.sign_pct >= 80 ? 'text-[#f5b342]' : 'text-[#ff6060]'}`}>
                            {ep.sign_pct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-right text-[#6e80ff]">{ep.apr.toFixed(2)}%</td>
                          <td className="py-3 px-5 text-right text-[#f5b342]">~{fmt(myData?.dailyCommission, 0)} ONE</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TAB: TOP DELEGATORS BREAKDOWN */}
        {/* ========================================================================= */}
        {activeTab === 'delegators' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1fdfb6]" />
                  Mintbes Delegators Breakdown ({delegators.length} Accounts)
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Active delegations list, percentage share of stake pool, and pending unclaimed rewards.
                </span>
              </div>

              <div className="relative">
                <input
                  type="search"
                  placeholder="Search delegator address..."
                  value={delegatorSearch}
                  onChange={(e) => setDelegatorSearch(e.target.value)}
                  className="border border-[#202a35] bg-[#090d13] focus:border-[#1fdfb67a] rounded-lg px-3 py-1.5 text-[11px] text-[#edf5f4] placeholder-[#697a7c] outline-none font-mono w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-[#0f151d] shadow-sm">
                  <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em]">
                    <th className="py-3 px-5">#</th>
                    <th className="py-3 px-5">Delegator Address</th>
                    <th className="py-3 px-5 text-right">Delegated Stake</th>
                    <th className="py-3 px-5 text-right">Pool Share</th>
                    <th className="py-3 px-5 text-right">Pending Rewards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {filteredDelegators.map((d, idx) => {
                    const pct = myData?.actualStake > 0 ? (d.amount / myData.actualStake) * 100 : 0;
                    return (
                      <tr
                        key={d.address}
                        className={d.is_me ? 'bg-[#1fdfb614] font-bold border-l-4 border-l-[#1fdfb6]' : 'hover:bg-[#ffffff03]'}
                      >
                        <td className="py-3.5 px-5 text-[#697a7c]">#{idx + 1}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://explorer.harmony.one/address/${d.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group inline-flex items-center gap-1.5 font-mono text-xs transition-colors hover:underline ${
                                d.is_me ? 'text-[#1fdfb6] font-bold hover:text-[#1fdfb6]/80' : 'text-[#edf5f4] hover:text-[#1fdfb6]'
                              }`}
                              title={`Open ${d.address} in Harmony Explorer`}
                            >
                              <span className="font-mono select-all break-all">{d.address}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#697a7c] group-hover:text-[#1fdfb6] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                            {d.is_me && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b] shrink-0 font-mono font-bold">
                                Self-Stake
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-[#edf5f4]">
                          {fmt(d.amount, 2)} ONE
                        </td>
                        <td className="py-3.5 px-5 text-right text-[#1fdfb6]">
                          {pct.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-5 text-right text-[#f5b342] font-semibold">
                          {fmt(d.reward, 2)} ONE
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#202a35] px-5 py-3 text-[11px] text-[#697a7c] font-mono flex items-center justify-between bg-[#090d13]">
              <span>Showing all {filteredDelegators.length} delegators.</span>
              <span className="text-[#1fdfb6]">
                Total Delegated: ~{fmt(filteredDelegators.reduce((a, b) => a + b.amount, 0), 2)} ONE
              </span>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB: DELEGATIONS & UNDELEGATIONS FLOW (MATCHING SCREENSHOT) */}
        {/* ========================================================================= */}
        {activeTab === 'delegation_history' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202a35] pb-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1fdfb6]" />
                  Delegations & Undelegations History
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Chronological on-chain transactions decoded directly from Harmony Staking Precompile and consensus protocol.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDelegationHistory}
                  disabled={loadingHistory}
                  className="bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#a8b6b6] hover:text-[#edf5f4] px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin text-[#1fdfb6]' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Top Stat Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#131b25] border border-[#202a35] rounded-xl p-3.5">
                <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                  {historyScope === 'mintbes' ? 'Mintbes Delegations (Inflows)' : 'Network Delegations'}
                </span>
                <strong className="text-[#1fdfb6] text-base font-bold mt-1 block">
                  {historyScope === 'mintbes' ? `+${fmt(historyStats.totalInflow, 0)} ONE` : `${(delegationHistory.allNetworkEvents || []).filter(e => e.isDelegation).length} Events`}
                </strong>
                <span className="text-[10px] text-[#1fdfb6]/80 font-sans">
                  {historyScope === 'mintbes' ? `${historyStats.delegationCount || 0} delegation events` : 'Harmony Network Total'}
                </span>
              </div>

              <div className="bg-[#131b25] border border-[#202a35] rounded-xl p-3.5">
                <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                  {historyScope === 'mintbes' ? 'Mintbes Undelegations (Outflows)' : 'Network Undelegations'}
                </span>
                <strong className="text-[#ff6060] text-base font-bold mt-1 block">
                  {historyScope === 'mintbes' ? `-${fmt(historyStats.totalOutflow, 0)} ONE` : `${(delegationHistory.allNetworkEvents || []).filter(e => !e.isDelegation).length} Events`}
                </strong>
                <span className="text-[10px] text-[#ff6060]/80 font-sans">
                  {historyScope === 'mintbes' ? `${historyStats.undelegationCount || 0} undelegation events` : 'Harmony Network Total'}
                </span>
              </div>

              <div className="bg-[#131b25] border border-[#202a35] rounded-xl p-3.5">
                <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                  {historyScope === 'mintbes' ? 'Net Staking Flow' : 'Network Flow Ratio'}
                </span>
                <strong className={`text-base font-bold mt-1 block ${historyStats.netFlow >= 0 ? 'text-[#1fdfb6]' : 'text-[#ff6060]'}`}>
                  {historyScope === 'mintbes' ? `${historyStats.netFlow >= 0 ? '+' : ''}${fmt(historyStats.netFlow, 0)} ONE` : 'Live EVM Stream'}
                </strong>
                <span className="text-[10px] text-[#697a7c] font-sans">
                  {historyScope === 'mintbes' ? 'Cumulative net balance' : 'Inflow vs Outflow'}
                </span>
              </div>

              <div className="bg-[#131b25] border border-[#202a35] rounded-xl p-3.5">
                <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                  Latest 100 Transactions
                </span>
                <strong className="text-sky-400 text-base font-bold mt-1 block">
                  {fmt(filteredHistoryEvents.length)} Events
                </strong>
                <span className="text-[10px] text-[#697a7c] font-sans">
                  Harmony Consensus Shard 1
                </span>
              </div>
            </div>

            {/* Scope Switcher & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-1.5 p-1 bg-[#131b25] border border-[#202a35] rounded-xl self-start">
                <button
                  onClick={() => setHistoryScope('mintbes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyScope === 'mintbes'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : 'text-[#697a7c] hover:text-white'
                  }`}
                >
                  <span>🌿 Mintbes Ledger ({delegationHistory.events?.length || 0})</span>
                </button>

                <button
                  onClick={() => setHistoryScope('network')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    historyScope === 'network'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                      : 'text-[#697a7c] hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>All Network Live Feed ({delegationHistory.allNetworkEvents?.length || 0})</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      historyFilter === 'ALL'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-[#131b25] border border-[#202a35] text-[#a8b6b6] hover:text-white hover:bg-[#1a2530]'
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setHistoryFilter('DELEGATE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historyFilter === 'DELEGATE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#131b25] border border-[#202a35] text-emerald-400 hover:bg-[#1a2530]'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Delegations</span>
                  </button>

                  <button
                    onClick={() => setHistoryFilter('UNDELEGATE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historyFilter === 'UNDELEGATE'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-[#131b25] border border-[#202a35] text-rose-400 hover:bg-[#1a2530]'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>Undelegations</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search address, validator or hash..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="bg-[#131b25] border border-[#202a35] focus:border-[#1fdfb67a] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#697a7c] outline-none font-mono w-56"
                  />
                </div>
              </div>
            </div>

            {/* Table without inner scrollbars */}
            <div className="bg-[#090d13] border border-[#202a35] rounded-xl overflow-hidden shadow-2xl">
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
                    {loadingHistory && filteredHistoryEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-[#697a7c] font-sans">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1fdfb6]" />
                          Loading on-chain staking records from Harmony Precompile...
                        </td>
                      </tr>
                    ) : filteredHistoryEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#697a7c] font-sans">
                          No delegation records found.
                        </td>
                      </tr>
                    ) : (
                      filteredHistoryEvents.map((evt) => {
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
                            {/* Type Badge */}
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

                            {/* Validator */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <strong className={`text-xs block font-sans font-bold transition-colors ${
                                    evt.isMintbes ? 'text-[#1fdfb6] font-extrabold' : 'text-white hover:text-sky-400'
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

                            {/* Delegator Full Address */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="space-y-1">
                                <a
                                  href={`https://explorer.harmony.one/address/${dAddr}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group inline-flex items-center gap-1.5 text-[#a8b6b6] hover:text-emerald-400 hover:underline text-xs leading-tight font-mono transition-colors"
                                  title={`Open ${dAddr} in Harmony Explorer`}
                                >
                                  <span className="font-mono select-all break-all">{dAddr}</span>
                                  <ExternalLink className="w-3 h-3 text-[#697a7c] group-hover:text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </a>
                                {evt.isSelfStake && (
                                  <div>
                                    <span className="inline-block text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb647] font-mono font-bold">
                                      Self-Stake
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 px-4 text-right align-top">
                              <div className="space-y-0.5">
                                <strong
                                  className={`text-sm font-bold block ${
                                    isDel ? 'text-[#1fdfb6]' : 'text-[#ff6060]'
                                  }`}
                                >
                                  {fmt(evt.amount, 0)} ONE
                                </strong>
                                <span className="text-[11px] text-[#697a7c] block">
                                  {evt.usdVal}
                                </span>
                              </div>
                            </td>

                            {/* When */}
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
                <span>Showing {filteredHistoryEvents.length} transactions recorded on Harmony Shard 1.</span>
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

          </section>
        )}

        {/* ========================================================================= */}
        {/* 8. TAB: BID SLOTS AUCTION TABLE (WITH OFFICIAL HARMONY LOGOS) */}
        {/* ========================================================================= */}
        {activeTab === 'bids' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-[#1fdfb6]" />
                  EPoS Bid Slots Auction
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Global consensus slot allocation matrix with official validator logos from Harmony registry.
                </span>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="border border-[#202a35] bg-[#090d13] rounded-lg p-1 flex">
                  <button
                    onClick={() => setTableFilter('all')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'all'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    All ({validators.length})
                  </button>
                  <button
                    onClick={() => setTableFilter('focused')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'focused'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Focused (Mintbes + Cutoff)
                  </button>
                  <button
                    onClick={() => setTableFilter('favs')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'favs'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Favorites ({favorites.length})
                  </button>
                  <button
                    onClick={() => setTableFilter('mintbes')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'mintbes'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Mintbes Only
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search validator or slot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-[#202a35] bg-[#090d13] focus:border-[#1fdfb67a] rounded-lg px-3 py-1.5 text-[11px] text-[#edf5f4] placeholder-[#697a7c] outline-none font-mono w-56"
                  />
                </div>
              </div>
            </div>

            {/* Bid Slots Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-[#0f151d] shadow-sm">
                  <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em]">
                    <th className="py-3 px-3 text-center w-8">♡</th>
                    <th className="py-3 px-4">Slot Range</th>
                    <th className="py-3 px-4">Validator Name</th>
                    <th className="py-3 px-4 text-right">Raw Bid (ONE)</th>
                    <th className="py-3 px-4 text-right">Effective Stake</th>
                    <th className="py-3 px-3 text-center">Requested</th>
                    <th className="py-3 px-3 text-center">Allotted</th>
                    <th className="py-3 px-4 text-right">Used Stake</th>
                    <th className="py-3 px-4 text-right">Actual Stake</th>
                    <th className="py-3 px-4 text-right text-[#1fdfb6]">Voting Power</th>
                    <th className="py-3 px-3 text-center">Fee</th>
                    <th className="py-3 px-4 text-right">EPoS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {filteredValidators.map((v) => {
                    const isMe = v.is_me;
                    const isFav = favorites.includes(v.addr);
                    const isCutoff = v.slotEnd === stats?.totalSlots;

                    let statusClass = 'bg-[#1fdfb61a] text-[#1fdfb6] border border-[#1fdfb647]';
                    if (v.eposStatus === 'BOOSTED') {
                      statusClass = 'bg-[#f5b3421a] text-[#f5b342] border border-[#f5b34247]';
                    } else if (v.eposStatus === 'CAPPED') {
                      statusClass = 'bg-[#6e80ff1f] text-[#aab8ff] border border-[#6e80ff47]';
                    }

                    return (
                      <tr
                        key={v.addr}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-[#1fdfb614] font-bold border-l-4 border-l-[#1fdfb6]'
                            : isCutoff
                            ? 'bg-[#ff50500f]'
                            : 'hover:bg-[#ffffff04]'
                        }`}
                      >
                        {/* Favorite */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleFavorite(v.addr)}
                            className={`p-1 transition cursor-pointer ${
                              isFav ? 'text-[#ff6060]' : 'text-[#697a7c] hover:text-[#edf5f4]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        {/* Slot Range Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                              isMe
                                ? 'bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b]'
                                : isCutoff
                                ? 'bg-[#ff505026] text-[#ff9b9b] border border-[#ff606040]'
                                : 'bg-[#131b25] text-[#1fdfb6] border border-[#202a35]'
                            }`}
                          >
                            {v.slotRange}
                          </span>
                        </td>

                        {/* Validator Name & Logo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 min-w-[200px]">
                            <ValidatorAvatar validator={v} size="w-6 h-6" />
                            <a
                              href={`https://staking.harmony.one/validators/mainnet/${v.addr}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`hover:underline transition-colors block text-left font-mono ${
                                isMe ? 'text-[#1fdfb6] font-bold text-sm' : 'text-[#edf5f4] font-medium'
                              }`}
                              title={v.name}
                            >
                              {v.name}
                            </a>
                          </div>
                        </td>

                        {/* Bid */}
                        <td className="py-3 px-4 text-right text-[#edf5f4] font-semibold">
                          {fmt(v.bid, 0)}
                        </td>

                        {/* Effective Stake */}
                        <td className="py-3 px-4 text-right">
                          <span
                            className={
                              v.eposStatus === 'BOOSTED'
                                ? 'text-[#f5b342] font-bold'
                                : v.eposStatus === 'CAPPED'
                                ? 'text-[#aab8ff] font-bold'
                                : 'text-[#1fdfb6] font-bold'
                            }
                          >
                            {fmt(v.effectiveStake, 0)}
                          </span>
                        </td>

                        {/* Slots Requested */}
                        <td className="py-3 px-3 text-center text-[#a8b6b6]">
                          {v.slotsRequested}
                        </td>

                        {/* Slots Allotted */}
                        <td className="py-3 px-3 text-center font-bold text-[#edf5f4]">
                          {v.slotsAllotted}
                        </td>

                        {/* Used Stake */}
                        <td className="py-3 px-4 text-right text-[#a8b6b6]">
                          {fmt(v.usedStake, 0)}
                        </td>

                        {/* Actual Stake */}
                        <td className="py-3 px-4 text-right text-[#edf5f4] font-semibold">
                          {fmt(v.actualStake, 0)}
                        </td>

                        {/* Voting Power */}
                        <td className="py-3 px-4 text-right text-[#1fdfb6] font-bold">
                          {v.votingPower?.toFixed(3)}%
                        </td>

                        {/* Fee Rate */}
                        <td className="py-3 px-3 text-center text-[#a8b6b6]">
                          {v.rate?.toFixed(1)}%
                        </td>

                        {/* EPoS Status */}
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusClass}`}>
                            {v.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 9. TAB: SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  EPoS Consensus Simulation & Commission Projections
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Current Stake: <strong className="text-[#edf5f4]">{fmt(myData?.actualStake, 2)} ONE</strong> | Network Cutoff: <strong className="text-[#ff6060]">{fmt(stats?.cutoffStake, 0)} ONE</strong>
                </span>
              </div>

              {/* Extra Stake */}
              <div className="flex items-center gap-2 border border-[#202a35] bg-[#090d13] px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-[#697a7c]">Simulate Extra Stake:</span>
                <input
                  type="number"
                  step="50000"
                  value={simExtraStake}
                  onChange={(e) => setSimExtraStake(Number(e.target.value) || 0)}
                  placeholder="0 ONE"
                  className="w-28 bg-[#131b25] border border-[#32404d] rounded px-2 py-0.5 text-xs text-[#1fdfb6] outline-none"
                />
                <span className="text-[#697a7c]">ONE</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#202a35] bg-[#ffffff03] text-[#697a7c] text-[10px] uppercase tracking-[0.07em]">
                    <th className="py-3 px-5">Slot Configuration</th>
                    <th className="py-3 px-5">Stake / Key</th>
                    <th className="py-3 px-5">Projected Slot Range</th>
                    <th className="py-3 px-5">Margin over Cutoff</th>
                    <th className="py-3 px-5">Consensus Status</th>
                    <th className="py-3 px-5 text-right">Est. Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {simResults.map((sim) => {
                    const isCurrent = sim.isActive && simExtraStake === 0;

                    let pillClass = 'bg-[#1fdfb61a] text-[#1fdfb6]';
                    if (sim.status === 'OUT') {
                      pillClass = 'bg-[#ff505014] text-[#ff9b9b] font-bold';
                    } else if (sim.status === 'HIGH_RISK') {
                      pillClass = 'bg-[#f5b3421a] text-[#f5b342]';
                    } else if (sim.status === 'MODERATE') {
                      pillClass = 'bg-[#6e80ff1f] text-[#aab8ff]';
                    }

                    return (
                      <tr
                        key={sim.keys}
                        className={`transition-colors ${
                          isCurrent ? 'bg-[#1fdfb60f] font-bold' : 'hover:bg-[#ffffff04]'
                        }`}
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span className={isCurrent ? 'text-[#1fdfb6]' : 'text-[#edf5f4]'}>
                              {sim.keys} BLS Keys
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b]">
                                Current Allocation
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-5 text-[#edf5f4] font-semibold">
                          {fmt(sim.stake_per_key)} ONE
                        </td>

                        <td className="py-3 px-5 text-[#1fdfb6] font-bold">
                          Slots #{sim.slotRange}
                        </td>

                        <td className="py-3 px-5">
                          <span className={sim.margin >= 0 ? 'text-[#1fdfb6]' : 'text-[#ff9b9b]'}>
                            {sim.margin >= 0 ? `+${fmt(sim.margin)}` : fmt(sim.margin)} ONE ({sim.pct.toFixed(0)}%)
                          </span>
                        </td>

                        <td className="py-3 px-5">
                          <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${pillClass}`}>
                            {sim.statusLabel}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-right text-[#f5b342] font-semibold">
                          ~{fmt(sim.simComm, 0)} ONE / day
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 10. TAB: RPC TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === 'rpc' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  RPC Infrastructure & Shard Telemetry
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Direct JSON-RPC connection points and blockchain state synchronization.
                </span>
              </div>
              <span className="text-[#1fdfb6] text-[11px] font-bold">
                ● RPC LIVE LINK
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#202a35]">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#edf5f4]">Harmony Shard 1</strong>
                  <span className="bg-[#1fdfb61a] text-[#1fdfb6] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Advancing
                  </span>
                </div>
                <div>
                  <strong className="text-[24px] font-mono font-bold text-[#edf5f4] block">
                    #{fmt(header?.blockNumber)}
                  </strong>
                  <span className="text-[10px] text-[#697a7c]">Last validated block</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#edf5f4]">Public Endpoint</strong>
                  <span className="bg-[#1fdfb61a] text-[#1fdfb6] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    HTTP 200 OK
                  </span>
                </div>
                <div>
                  <strong className="text-[13px] font-mono text-[#1fdfb6] block truncate">
                    {RPC_URL}
                  </strong>
                  <span className="text-[10px] text-[#697a7c]">Estimated latency: &lt;180ms</span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <strong className="text-xs text-[#edf5f4] block">Official Harmony Staking</strong>
                  <p className="text-[11px] text-[#697a7c] mt-1">
                    Verify official validator metrics on the Harmony explorer.
                  </p>
                </div>
                <a
                  href={`https://staking.harmony.one/validators/mainnet/${MY_ADDR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] hover:border-[#1fdfb67a] text-[#1fdfb6] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Staking Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 11. FOOTER TELEMETRY */}
        {/* ========================================================================= */}
        <footer className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#202a35]">
          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              HARMONY EFFECTIVE PROOF-OF-STAKE (EPOS)
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block">
              Mintbes maintains {myData?.keys || 5} active slots with {myData?.votingPower?.toFixed(3)}% network voting power in consensus.
            </span>
          </div>

          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              OPERATOR QUICK SHORTCUTS
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block font-mono">
              [V] Harmony Validators | [H] Delegation History | [F] Signings | [D] Delegators | [S] Simulator | [P] Positions | [R] Refresh | [Q] Lock.
            </span>
          </div>
        </footer>

      </main>
    </div>
  );
}
