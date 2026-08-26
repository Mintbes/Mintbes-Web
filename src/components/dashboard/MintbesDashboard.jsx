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
  PlusCircle,
  MinusCircle,
  Users,
  Calendar,
  Hourglass,
  CheckCircle2,
  HardDrive,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  fetchHarmonyData,
  calculateKeySimulation,
  shortAddr,
  MY_ADDR,
  RPC_URL,
} from '../../services/harmonyRpc';

export default function MintbesDashboard({ onLock }) {
  // Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [copiedCmd, setCopiedCmd] = useState('');

  // Modals
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showRemoveKeyModal, setShowRemoveKeyModal] = useState(false);
  const [selectedRemoveKey, setSelectedRemoveKey] = useState('');
  const [manualAddKey, setManualAddKey] = useState('');

  // Navigation Tabs: 'overview' | 'performance' | 'delegators' | 'bids' | 'simulator' | 'rpc'
  const [activeTab, setActiveTab] = useState('overview');

  // Filters & Favorites
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'focused' | 'mintbes' | 'favs'
  const [searchTerm, setSearchTerm] = useState('');
  const [delegatorSearch, setDelegatorSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mintbes_fav_validators') || '[]');
    } catch {
      return [];
    }
  });

  // Simulator State
  const [simExtraStake, setSimExtraStake] = useState(0);

  const timerRef = useRef(null);

  // Load Data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetchHarmonyData(MY_ADDR);
      if (res.success) {
        setData(res);
        setLastUpdated(new Date());
        if (res.activeBlsKeys?.length && !selectedRemoveKey) {
          setSelectedRemoveKey(res.activeBlsKeys[0]);
        }
      } else {
        setError(res.error || 'Error al conectar con el nodo Harmony');
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Keyboard Shortcuts (matching epos_dashboard.py: [F], [D], [S], [P], [1], [+], [-], [R], [Q]/[2])
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
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
      } else if (e.key === '1') {
        e.preventDefault();
        setShowClaimModal(true);
      } else if (e.key === '+') {
        e.preventDefault();
        setShowAddKeyModal(true);
      } else if (e.key === '-') {
        e.preventDefault();
        setShowRemoveKeyModal(true);
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

  const copyToClipboard = (text, label = 'cmd') => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(''), 2500);
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

  // CLI Commands
  const claimCliCmd = `/home/harmony/hmy --node=${RPC_URL} staking collect-rewards --delegator-addr ${MY_ADDR} --gas-price 100 --chain-id mainnet --passphrase`;
  const addKeyCliCmd = `/home/harmony/hmy --node=${RPC_URL} staking edit-validator --validator-addr ${MY_ADDR} --add-bls-key ${manualAddKey || '<CLAVE_BLS_96_HEX>'} --gas-price 100 --chain-id mainnet --passphrase`;
  const removeKeyCliCmd = `/home/harmony/hmy --node=${RPC_URL} staking edit-validator --validator-addr ${MY_ADDR} --remove-bls-key ${selectedRemoveKey || '<CLAVE_BLS>'} --gas-price 100 --chain-id mainnet --passphrase`;

  // Filtered validators for SmartStake Table
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

  // Filtered delegators
  const filteredDelegators = delegators.filter(
    (d) =>
      d.address.toLowerCase().includes(delegatorSearch.toLowerCase()) ||
      (d.is_me && 'mintbes self-stake'.includes(delegatorSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#090d13] text-[#edf5f4] selection:bg-[#1fdfb6] selection:text-[#07110f] font-sans antialiased pb-16">
      {/* Background Mesh (rollback.country styling) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 12% -8%, rgba(31, 223, 182, 0.07), transparent 30%), radial-gradient(circle at 88% 25%, rgba(31, 223, 182, 0.04), transparent 35%), #090d13',
        }}
      />

      <main className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-8 py-7 space-y-6">
        
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
                  HARMONY EPOS COMMAND CENTER
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
                SIGUIENTE EPOCH EN:
              </span>
              <strong className="text-[#edf5f4] font-mono text-[13px]">
                {header?.countdownStr || 'Calculando...'} <span className="text-[#697a7c] font-normal text-[10px]">({fmt(header?.blocksLeft)} blks)</span>
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(false)}
                disabled={loading}
                className="bg-[#0f151d] hover:bg-[#131b25] border border-[#32404d] hover:border-[#1fdfb67a] text-[#a8b6b6] hover:text-[#edf5f4] px-3 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                title="Refrescar datos (Tecla R)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1fdfb6]' : ''}`} />
                <span>⏱️ {countdown}s</span>
              </button>

              <button
                onClick={() => setShowClaimModal(true)}
                className="bg-[#f5b3421a] hover:bg-[#f5b34226] border border-[#f5b34247] text-[#f5b342] hover:text-[#ffca6e] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cobrar Recompensas (Tecla 1)"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Claim</span>
              </button>

              <button
                onClick={() => setShowAddKeyModal(true)}
                className="bg-[#1fdfb614] hover:bg-[#1fdfb626] border border-[#1fdfb647] text-[#1fdfb6] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Añadir Llave BLS (Tecla +)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Key</span>
              </button>

              <button
                onClick={() => setShowRemoveKeyModal(true)}
                className="bg-[#ff505014] hover:bg-[#ff505026] border border-[#ff606040] text-[#ff9b9b] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Quitar Llave BLS (Tecla -)"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>- Key</span>
              </button>

              <button
                onClick={onLock}
                className="bg-[#0f151d] hover:bg-[#ff505014] border border-[#32404d] hover:border-[#ff606040] text-[#a8b6b6] hover:text-[#ff9b9b] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salir y bloquear panel (Tecla Q)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
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
              Reintentar
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TOP METRICS STRIP (EPOCH, BLOCKS, SYSTEM HEALTH) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono text-xs">
          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Época Actual</span>
            <strong className="text-[#edf5f4] text-sm font-bold">
              #{header?.epoch || 0} <span className="text-[10px] text-[#697a7c]">→ #{header ? header.epoch + 1 : 1}</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Bloque Shard 0</span>
            <strong className="text-[#1fdfb6] text-sm font-bold">
              #{fmt(header?.blockNumber)}
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Último Bloque Época</span>
            <strong className="text-[#a8b6b6] text-sm font-bold">
              #{fmt(header?.epochLastBlock)}
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Slots en Consenso</span>
            <strong className="text-[#edf5f4] text-sm font-bold">
              {stats?.totalSlots || 400} <span className="text-[10px] text-[#697a7c]">({stats?.totalNodes || 0} nodos)</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Mediana EPoS</span>
            <strong className="text-[#6e80ff] text-sm font-bold">
              {fmt(stats?.medianStake, 0)} <span className="text-[9px] text-[#697a7c]">ONE</span>
            </strong>
          </div>

          <div className="border border-[#202a35] bg-[#0f151d] rounded-xl p-3">
            <span className="text-[9px] text-[#697a7c] uppercase tracking-wider block">Corte Mínimo (#{stats?.totalNodes})</span>
            <strong className="text-[#ff6060] text-sm font-bold">
              {fmt(stats?.cutoffStake, 0)} <span className="text-[9px] text-[#697a7c]">ONE</span>
            </strong>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NAVIGATION TABS (MATCHING PYTHON SCRIPT) */}
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
            <span>🌿 Telemetría Mintbes</span>
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
            <span>⏱️ Firmas x Hora & Época [F]</span>
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
            <span>👥 Top Delegadores ({delegators.length}) [D]</span>
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
            <span>📑 Tabla SmartStake "Bid Slots" [P]</span>
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
            <span>🎛️ Simulador EPoS [S]</span>
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
            <span>⚡ Protocolo RPC</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. TAB 1: OVERVIEW & SMART KEY ADVISOR */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 🧠 EPoS SMART KEY ADVISOR BANNER */}
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
                      <span>ASISTENTE EPOS: {myData.advisorTitle}</span>
                    </h3>
                    <p className="text-xs text-[#a8b6b6] mt-1 leading-relaxed max-w-3xl">
                      {myData.advisorMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {myData.advisorStatus === 'CAN_ADD' && (
                    <button
                      onClick={() => setShowAddKeyModal(true)}
                      className="bg-[#1fdfb6] hover:bg-[#12b99b] text-[#07110f] px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#1fdfb626]"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Añadir Llave #{myData.keys + 1}</span>
                    </button>
                  )}
                  {(myData.advisorStatus === 'WARNING' || myData.advisorStatus === 'DANGER') && (
                    <button
                      onClick={() => setShowRemoveKeyModal(true)}
                      className="bg-[#ff6060] hover:bg-[#e04545] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>Retirar 1 Llave</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#a8b6b6] hover:text-[#edf5f4] px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Ver Simulador
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
                    Validador: Mintbes (Puesto #{myData?.validatorRank || '--'} de {stats?.totalNodes || 0})
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
                        RANGO DE SLOTS SMARTSTAKE ({myData?.keys || 0} LLAVES BLS)
                      </span>
                      <strong className="text-[32px] font-mono font-bold tracking-tight text-[#1fdfb6] block mt-0.5">
                        Slots #{myData?.slotRange || '352-356'} <span className="text-lg font-normal text-[#697a7c]">/ {stats?.totalSlots || 400}</span>
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#1fdfb61a] text-[#1fdfb6] border border-[#1fdfb647] block mb-1">
                        100% ELECTO
                      </span>
                      <span className="text-[10px] font-mono text-[#f5b342] bg-[#f5b3421a] px-2 py-0.5 rounded border border-[#f5b34247]">
                        {myData?.statusLabel || 'Bonificado (85%)'}
                      </span>
                    </div>
                  </div>

                  {/* 2-box signing performance pill */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="border border-[#202a35] bg-[#131b25] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase font-bold text-[#697a7c] block">Firma Hora Actual</span>
                      <strong className={`text-base font-bold mt-1 block ${myData?.hourlyList?.[0]?.sign_pct >= 98 ? 'text-[#1fdfb6]' : 'text-[#f5b342]'}`}>
                        {myData?.hourlyList?.[0]?.sign_pct?.toFixed(2) || '100.00'}%
                      </strong>
                      <span className="text-[10px] text-[#697a7c]">
                        ({myData?.hourlyList?.[0]?.signed || 0} / {myData?.hourlyList?.[0]?.asked || 0} blks)
                      </span>
                    </div>

                    <div className="border border-[#202a35] bg-[#131b25] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase font-bold text-[#697a7c] block">Firma Época #{header?.epoch}</span>
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
                      <span className="text-[#a8b6b6]">Nivel de Respaldo sobre Mediana</span>
                      <strong className="text-[#1fdfb6] font-bold">{myData?.backup_pct?.toFixed(0)}% de Mediana</strong>
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
                      <div className="absolute top-[-3px] left-[73%] w-[1px] h-[16px] bg-[#f5b342]" title="Límite 85% EPoS" />
                      <div className="absolute top-[-3px] left-[87%] w-[1px] h-[16px] bg-[#1fdfb6]" title="Mediana EPoS" />
                      <div className="absolute top-[-3px] left-[100%] w-[1px] h-[16px] bg-[#6e80ff]" title="Tope 115% EPoS" />
                    </div>

                    <div className="relative h-4 text-[9px] text-[#697a7c] font-mono mt-2">
                      <span className="absolute left-0">Corte #{stats?.totalSlots || 400}: {fmt(stats?.cutoffStake, 0)}</span>
                      <span className="absolute left-[73%] text-[#f5b342] translate-x-[-50%]">85%: {fmt(stats?.lowerBound, 0)}</span>
                      <span className="absolute right-0 text-[#6e80ff]">115%: {fmt(stats?.upperBound, 0)}</span>
                    </div>
                  </div>

                  {/* BLS Shifts */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#697a7c] block mb-2">
                      PROYECCIÓN DE SLOTS AL MODIFICAR LLAVES BLS
                    </span>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">BLS +2 ({myData ? myData.keys + 2 : 7} Keys)</span>
                        <strong className="text-[#a8b6b6]">{myData?.bls_plus_2 || '396-402'}</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">BLS +1 ({myData ? myData.keys + 1 : 6} Keys)</span>
                        <strong className="text-[#a8b6b6]">{myData?.bls_plus_1 || '396-401'}</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">BLS -1 ({myData ? myData.keys - 1 : 4} Keys)</span>
                        <strong className="text-[#1fdfb6]">{myData?.bls_minus_1 || '295-298'}</strong>
                      </div>
                      <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                        <span className="text-[9px] text-[#697a7c] block uppercase">BLS -2 ({myData ? myData.keys - 2 : 3} Keys)</span>
                        <strong className="text-[#1fdfb6]">{myData?.bls_minus_2 || '218-220'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: 4-Cell Telemetry Matrix */}
                <div className="p-6 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#697a7c] block">
                    MÉTRICAS PRINCIPALES DE STAKING & RECOMPENSAS
                  </span>

                  <div className="border border-[#202a35] bg-[#202a35] rounded-lg grid grid-cols-2 gap-[1px] overflow-hidden">
                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Delegación Total (Actual Stake)</dt>
                      <dd className="text-[#edf5f4] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.actualStake, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Stake / Llave (Raw Bid)</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.bid, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Margen sobre el Corte #{stats?.totalSlots || 400}</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        +{fmt(myData?.margin, 0)} <span className="text-xs font-normal text-[#1fdfb6]">(+{myData?.pct_margin.toFixed(1)}%)</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Saldo Cartera Líquido</dt>
                      <dd className="text-[#edf5f4] font-mono text-[16px] font-bold mt-1">
                        {fmt(walletBalance, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>
                  </div>

                  <div className="border border-[#202a35] bg-[#202a35] rounded-lg grid grid-cols-2 gap-[1px] overflow-hidden">
                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Recompensas Pendientes</dt>
                      <dd className="text-[#f5b342] font-mono text-[16px] font-bold mt-1">
                        {fmt(myData?.unclaimed, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Tu Comisión Diaria Estimada</dt>
                      <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                        ~{fmt(myData?.dailyCommission, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE / día</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Histórico Acumulado</dt>
                      <dd className="text-[#a8b6b6] font-mono text-[15px] font-semibold mt-1">
                        {fmt(myData?.rewards, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                      </dd>
                    </div>

                    <div className="bg-[#131b25] p-3">
                      <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Tasa de Comisión</dt>
                      <dd className="text-[#a8b6b6] font-mono text-[15px] font-semibold mt-1">
                        {myData?.rate.toFixed(1)}% <span className="text-xs font-normal text-[#697a7c]">Fee</span>
                      </dd>
                    </div>
                  </div>

                </div>

              </div>

              <div className="border-t border-[#202a35] px-5 py-3 text-[11px] text-[#697a7c] font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>* Las recompensas se calculan en base a la tasa de emisión de Harmony (~11.2% APR global).</span>
                <span className="text-[#1fdfb6]">Pool Diario Estimado: ~{fmt(myData?.poolDailyEst, 0)} ONE</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB 2: HOURLY SIGNING & EPOCH PERFORMANCE HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            
            {/* HOURLY SIGNING PERFORMANCE */}
            <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
              <div className="border-b border-[#202a35] px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#f5b342]" />
                    Rendimiento de Firmas por Horas (GMT Time)
                  </h2>
                  <span className="text-[11px] text-[#697a7c]">
                    Monitoreo continuo cada 30s con registro de firmas, bloques perdidos y estimación de comisión.
                  </span>
                </div>
                <span className="text-[#f5b342] text-[11px] font-mono font-bold">
                  ● SEGUIMIENTO HORARIO ACTIVO
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em] bg-[#ffffff03]">
                      <th className="py-3 px-5">Fecha / Hora (GMT)</th>
                      <th className="py-3 px-4">Epoch</th>
                      <th className="py-3 px-4 text-right">Asignados</th>
                      <th className="py-3 px-4 text-right">Firmados</th>
                      <th className="py-3 px-4 text-right">Perdidos</th>
                      <th className="py-3 px-4 text-right">% Firma</th>
                      <th className="py-3 px-5 text-right">Tu Comisión Est.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202a35]">
                    {hourlyList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-[#697a7c]">
                          Registrando el primer bloque de firmas horarias (espera al próximo ciclo de 30s)...
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
                                  En Curso
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
                    Historial de Rendimiento por Épocas Recientes
                  </h2>
                  <span className="text-[11px] text-[#697a7c]">
                    Registro on-chain de las últimas 15 épocas con porcentaje de validación, APR real y recompensas estimadas.
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em] bg-[#ffffff03]">
                      <th className="py-3 px-5">Época #</th>
                      <th className="py-3 px-4 text-right">Bloques Asignados</th>
                      <th className="py-3 px-4 text-right">Bloques Firmados</th>
                      <th className="py-3 px-4 text-right">Bloques Perdidos</th>
                      <th className="py-3 px-4 text-right">% Firma</th>
                      <th className="py-3 px-4 text-right">APR Real</th>
                      <th className="py-3 px-5 text-right">Comisión Est.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202a35]">
                    {/* Current Epoch Row */}
                    <tr className="bg-[#1fdfb60f] font-bold border-l-4 border-l-[#1fdfb6]">
                      <td className="py-3 px-5 text-[#1fdfb6]">
                        #{header?.epoch} <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1fdfb62e]">Actual</span>
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
        {/* 6. TAB 3: TOP DELEGATORS BREAKDOWN */}
        {/* ========================================================================= */}
        {activeTab === 'delegators' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1fdfb6]" />
                  Desglose de Delegadores de Mintbes ({delegators.length} Cuentas)
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Listado de delegaciones activas, participación porcentual y recompensas pendientes acumuladas.
                </span>
              </div>

              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar delegador..."
                  value={delegatorSearch}
                  onChange={(e) => setDelegatorSearch(e.target.value)}
                  className="border border-[#202a35] bg-[#090d13] focus:border-[#1fdfb67a] rounded-lg px-3 py-1.5 text-[11px] text-[#edf5f4] placeholder-[#697a7c] outline-none font-mono w-60"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-[#0f151d] shadow-sm">
                  <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em]">
                    <th className="py-3 px-5">#</th>
                    <th className="py-3 px-5">Dirección Delegador</th>
                    <th className="py-3 px-5 text-right">Stake Delegado</th>
                    <th className="py-3 px-5 text-right">% Participación</th>
                    <th className="py-3 px-5 text-right">Rewards Pendientes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {filteredDelegators.slice(0, 30).map((d, idx) => {
                    const pct = myData?.actualStake > 0 ? (d.amount / myData.actualStake) * 100 : 0;
                    return (
                      <tr
                        key={d.address}
                        className={d.is_me ? 'bg-[#1fdfb614] font-bold border-l-4 border-l-[#1fdfb6]' : 'hover:bg-[#ffffff03]'}
                      >
                        <td className="py-3.5 px-5 text-[#697a7c]">#{idx + 1}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className={d.is_me ? 'text-[#1fdfb6] font-bold' : 'text-[#edf5f4]'}>
                              {shortAddr(d.address)}
                            </span>
                            {d.is_me && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b]">
                                Tu Self-Stake
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

            {delegators.length > 30 && (
              <div className="border-t border-[#202a35] px-5 py-3 text-[11px] text-[#697a7c] font-mono flex items-center justify-between bg-[#090d13]">
                <span>Mostrando los 30 mayores delegadores de {delegators.length} totales.</span>
                <span className="text-[#a8b6b6]">
                  Resto acumulado: ~{fmt(delegators.slice(30).reduce((a, b) => a + b.amount, 0), 0)} ONE
                </span>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* 7. TAB 4: SMARTSTAKE "BID SLOTS" TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'bids' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-[#1fdfb6]" />
                  Bid Slots (SmartStake Model)
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Subasta consolidada con simulación de impacto de añadir o retirar llaves (+2, +1, -1, -2).
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
                    Todos ({validators.length})
                  </button>
                  <button
                    onClick={() => setTableFilter('focused')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'focused'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Focalizada (Mintbes + Abajo)
                  </button>
                  <button
                    onClick={() => setTableFilter('favs')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'favs'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Favoritos ({favorites.length})
                  </button>
                  <button
                    onClick={() => setTableFilter('mintbes')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tableFilter === 'mintbes'
                        ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                        : 'text-[#697a7c] hover:text-[#edf5f4]'
                    }`}
                  >
                    Solo Mintbes
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="search"
                    placeholder="Buscar validador o slot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-[#202a35] bg-[#090d13] focus:border-[#1fdfb67a] rounded-lg px-3 py-1.5 text-[11px] text-[#edf5f4] placeholder-[#697a7c] outline-none font-mono w-52"
                  />
                </div>
              </div>
            </div>

            {/* SmartStake "Bid Slots" Exact Table */}
            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-[#0f151d] shadow-sm">
                  <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-[0.06em]">
                    <th className="py-3 px-3 text-center w-8">♡</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4 text-right">Bid</th>
                    <th className="py-3 px-4 text-right">Effective Stake</th>
                    <th className="py-3 px-3 text-center">Slots Requested</th>
                    <th className="py-3 px-3 text-center">Slots Allotted</th>
                    <th className="py-3 px-4 text-right">Used Stake</th>
                    <th className="py-3 px-4 text-right">Actual Stake</th>
                    <th className="py-3 px-3 text-center bg-[#1fdfb608] text-[#1fdfb6]">BLS +2</th>
                    <th className="py-3 px-3 text-center bg-[#1fdfb608] text-[#1fdfb6]">BLS +1</th>
                    <th className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342]">BLS -1</th>
                    <th className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342]">BLS -2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {filteredValidators.map((v) => {
                    const isMe = v.is_me;
                    const isFav = favorites.includes(v.addr);
                    const isCutoff = v.slotEnd === stats?.totalSlots;

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

                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#131b25] border border-[#202a35] flex items-center justify-center text-[10px] text-[#1fdfb6] font-bold">
                              {isMe ? '🌿' : v.name.slice(0, 1).toUpperCase()}
                            </span>
                            <a
                              href={`https://staking.harmony.one/validators/mainnet/${v.addr}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`hover:underline truncate max-w-[190px] block ${
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

                        {/* BLS +2 */}
                        <td className="py-3 px-3 text-center bg-[#1fdfb608] text-[#1fdfb6] font-mono font-medium">
                          {v.bls_plus_2 || '-'}
                        </td>

                        {/* BLS +1 */}
                        <td className="py-3 px-3 text-center bg-[#1fdfb608] text-[#1fdfb6] font-mono font-medium">
                          {v.bls_plus_1 || '-'}
                        </td>

                        {/* BLS -1 */}
                        <td className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342] font-mono font-medium">
                          {v.bls_minus_1 || '-'}
                        </td>

                        {/* BLS -2 */}
                        <td className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342] font-mono font-medium">
                          {v.bls_minus_2 || '-'}
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
        {/* 8. TAB 5: SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  Simulador de Escenarios EPoS & Comisiones (Harmony Mainnet)
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Tu Stake Actual: <strong className="text-[#edf5f4]">{fmt(myData?.actualStake, 2)} ONE</strong> | Corte Mínimo: <strong className="text-[#ff6060]">{fmt(stats?.cutoffStake, 0)} ONE</strong>
                </span>
              </div>

              {/* Extra Stake */}
              <div className="flex items-center gap-2 border border-[#202a35] bg-[#090d13] px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-[#697a7c]">Simular Extra Stake:</span>
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
                    <th className="py-3 px-5">Configuración Llaves</th>
                    <th className="py-3 px-5">Stake / Llave</th>
                    <th className="py-3 px-5">Rango de Slots Proyectado</th>
                    <th className="py-3 px-5">Margen sobre Corte</th>
                    <th className="py-3 px-5">Estado</th>
                    <th className="py-3 px-5 text-right">Comisión Estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202a35]">
                  {simResults.map((sim) => {
                    const isCurrent = sim.isActive && simExtraStake === 0;

                    let pillClass = 'bg-[#1fdfb61a] text-[#1fdfb6]';
                    if (sim.status === 'FUERA') {
                      pillClass = 'bg-[#ff505014] text-[#ff9b9b] font-bold';
                    } else if (sim.status === 'ALTO_RIESGO') {
                      pillClass = 'bg-[#f5b3421a] text-[#f5b342]';
                    } else if (sim.status === 'MODERADO') {
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
                              {sim.keys} Llaves BLS
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1fdfb62e] text-[#1fdfb6] border border-[#1fdfb66b]">
                                Config Actual
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
                          ~{fmt(sim.simComm, 0)} ONE/día
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
        {/* 9. TAB 6: RPC TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === 'rpc' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  Monitoreo de Infraestructura RPC & Consenso
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Puntos de enlace JSON-RPC y sincronización con Harmony Shard 0.
                </span>
              </div>
              <span className="text-[#1fdfb6] text-[11px] font-bold">
                ● RPC ENLACE VIVO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#202a35]">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#edf5f4]">Harmony Shard 0</strong>
                  <span className="bg-[#1fdfb61a] text-[#1fdfb6] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Advancing
                  </span>
                </div>
                <div>
                  <strong className="text-[24px] font-mono font-bold text-[#edf5f4] block">
                    #{fmt(header?.blockNumber)}
                  </strong>
                  <span className="text-[10px] text-[#697a7c]">Último bloque validado</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#edf5f4]">Endpoint Público</strong>
                  <span className="bg-[#1fdfb61a] text-[#1fdfb6] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    HTTP 200 OK
                  </span>
                </div>
                <div>
                  <strong className="text-[13px] font-mono text-[#1fdfb6] block truncate">
                    {RPC_URL}
                  </strong>
                  <span className="text-[10px] text-[#697a7c]">Latencia estimada: &lt;180ms</span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <strong className="text-xs text-[#edf5f4] block">Explorador Harmony</strong>
                  <p className="text-[11px] text-[#697a7c] mt-1">
                    Verifica los datos oficiales en el dashboard público de Harmony Staking.
                  </p>
                </div>
                <a
                  href={`https://staking.harmony.one/validators/mainnet/${MY_ADDR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] hover:border-[#1fdfb67a] text-[#1fdfb6] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Abrir Harmony Staking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 10. FOOTER TELEMETRY */}
        {/* ========================================================================= */}
        <footer className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#202a35]">
          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              PROTOCOLO HARMONY EPOS & SUBASTA SMARTSTAKE
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block">
              Las {myData?.keys || 5} llaves de Mintbes compiten individualmente ocupando los slots #{myData?.slotRange || '352-356'} con un {myData?.votingPower?.toFixed(3)}% de poder de voto acumulado.
            </span>
          </div>

          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              ACCESOS RÁPIDOS DEL OPERADOR
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block font-mono">
              [F] Firmas | [D] Delegadores | [S] Simulador | [P] Posiciones | [1] Claim | [+] Add Key | [-] Remove Key | [Q] Salir.
            </span>
          </div>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* 11. MODAL: CLAIM REWARDS [1] */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110fd4] backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-[#0f151d] border border-[#202a35] rounded-xl p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-[#202a35] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#f5b3421a] border border-[#f5b34247] flex items-center justify-center text-[#f5b342]">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#edf5f4]">Cobro de Recompensas de Staking</h3>
                    <p className="text-[10px] text-[#697a7c] font-mono">Validador: {MY_ADDR.slice(0, 16)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="p-1 rounded text-[#697a7c] hover:text-[#edf5f4] hover:bg-[#131b25] transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="border border-[#f5b34247] bg-[#f5b3420e] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#f5b342] tracking-wider block">
                    RECOMPENSAS PENDIENTES LISTAS
                  </span>
                  <div className="text-[26px] font-bold text-[#f5b342] font-mono mt-0.5">
                    {fmt(myData?.unclaimed, 4)} <span className="text-sm font-normal text-[#a8b6b6]">ONE</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-[#697a7c] font-mono">
                  <span>Gas: 100 Gwei</span>
                  <br />
                  <span>Chain: Mainnet</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#a8b6b6]">
                  <span>Comando CLI para el Servidor:</span>
                  <button
                    onClick={() => copyToClipboard(claimCliCmd, 'claim')}
                    className="text-[#1fdfb6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'claim' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'claim' ? '¡Copiado!' : 'Copiar comando'}
                  </button>
                </div>
                <div className="bg-[#090d13] border border-[#202a35] rounded-lg p-3 font-mono text-[11px] text-[#1fdfb6] break-all select-all">
                  {claimCliCmd}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#131b25] hover:bg-[#1a2530] text-[#a8b6b6] hover:text-[#edf5f4] text-xs font-semibold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => copyToClipboard(claimCliCmd, 'claim')}
                  className="px-4 py-2 rounded-lg bg-[#1fdfb6] hover:bg-[#12b99b] text-[#07110f] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#1fdfb626]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando CLI</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 12. MODAL: ADD BLS KEY [+] */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110fd4] backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-[#0f151d] border border-[#202a35] rounded-xl p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-[#202a35] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1fdfb61a] border border-[#1fdfb647] flex items-center justify-center text-[#1fdfb6]">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#edf5f4]">Añadir Llave BLS al Validador</h3>
                    <p className="text-[10px] text-[#697a7c] font-mono">Aumentar slots y capacidad de delegación</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddKeyModal(false)}
                  className="p-1 rounded text-[#697a7c] hover:text-[#edf5f4] hover:bg-[#131b25] transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a8b6b6] block mb-1.5">
                  Clave Pública BLS a Añadir (96 Caracteres Hex):
                </label>
                <input
                  type="text"
                  placeholder="ej: 7f8a9b..."
                  value={manualAddKey}
                  onChange={(e) => setManualAddKey(e.target.value.trim())}
                  className="w-full bg-[#090d13] border border-[#202a35] focus:border-[#1fdfb67a] rounded-lg p-2.5 font-mono text-xs text-[#edf5f4] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#a8b6b6]">
                  <span>Comando CLI para tu Servidor:</span>
                  <button
                    onClick={() => copyToClipboard(addKeyCliCmd, 'add')}
                    className="text-[#1fdfb6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'add' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'add' ? '¡Copiado!' : 'Copiar comando'}
                  </button>
                </div>
                <div className="bg-[#090d13] border border-[#202a35] rounded-lg p-3 font-mono text-[11px] text-[#1fdfb6] break-all select-all">
                  {addKeyCliCmd}
                </div>
              </div>

              <div className="border border-[#202a35] bg-[#090d13] rounded-lg p-3 text-[11px] text-[#697a7c] leading-relaxed">
                💡 <strong>Nota del Servidor:</strong> Asegúrate de que el archivo <code>.key</code> correspondiente exista en tu nodo antes de ejecutar la transacción on-chain.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#131b25] hover:bg-[#1a2530] text-[#a8b6b6] hover:text-[#edf5f4] text-xs font-semibold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => copyToClipboard(addKeyCliCmd, 'add')}
                  className="px-4 py-2 rounded-lg bg-[#1fdfb6] hover:bg-[#12b99b] text-[#07110f] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#1fdfb626]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando CLI</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 13. MODAL: REMOVE BLS KEY [-] */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRemoveKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110fd4] backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-[#0f151d] border border-[#202a35] rounded-xl p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-[#202a35] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ff50501a] border border-[#ff606040] flex items-center justify-center text-[#ff6060]">
                    <MinusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#edf5f4]">Quitar Llave BLS del Validador</h3>
                    <p className="text-[10px] text-[#697a7c] font-mono">Reducir slots para aumentar stake por llave</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRemoveKeyModal(false)}
                  className="p-1 rounded text-[#697a7c] hover:text-[#edf5f4] hover:bg-[#131b25] transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a8b6b6] block mb-1.5">
                  Selecciona la Llave BLS a Eliminar ({activeBlsKeys.length} Activas):
                </label>
                <select
                  value={selectedRemoveKey}
                  onChange={(e) => setSelectedRemoveKey(e.target.value)}
                  className="w-full bg-[#090d13] border border-[#202a35] focus:border-[#ff60607a] rounded-lg p-2.5 font-mono text-xs text-[#edf5f4] outline-none"
                >
                  {activeBlsKeys.map((k, idx) => (
                    <option key={k} value={k}>
                      Key #{idx + 1}: {k.slice(0, 16)}...{k.slice(-12)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#a8b6b6]">
                  <span>Comando CLI para tu Servidor:</span>
                  <button
                    onClick={() => copyToClipboard(removeKeyCliCmd, 'remove')}
                    className="text-[#ff9b9b] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'remove' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'remove' ? '¡Copiado!' : 'Copiar comando'}
                  </button>
                </div>
                <div className="bg-[#090d13] border border-[#202a35] rounded-lg p-3 font-mono text-[11px] text-[#ff9b9b] break-all select-all">
                  {removeKeyCliCmd}
                </div>
              </div>

              <div className="border border-[#202a35] bg-[#090d13] rounded-lg p-3 text-[11px] text-[#697a7c] leading-relaxed">
                ⚠️ <strong>Aviso:</strong> Al retirar una llave aumentas tu stake medio por llave, asegurando mayor margen sobre la línea de corte.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowRemoveKeyModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#131b25] hover:bg-[#1a2530] text-[#a8b6b6] hover:text-[#edf5f4] text-xs font-semibold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => copyToClipboard(removeKeyCliCmd, 'remove')}
                  className="px-4 py-2 rounded-lg bg-[#ff6060] hover:bg-[#e04545] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff606026]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando CLI</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
