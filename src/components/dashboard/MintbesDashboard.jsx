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
  Percent
} from 'lucide-react';
import { fetchHarmonyData, calculateKeySimulation, MY_ADDR, RPC_URL } from '../../services/harmonyRpc';

export default function MintbesDashboard({ onLock }) {
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // Navigation
  const [activeViewTab, setActiveViewTab] = useState('overview'); // 'overview' | 'bids' | 'simulator' | 'rpc'
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'focused' | 'mintbes'
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mintbes_fav_validators') || '[]');
    } catch {
      return [];
    }
  });

  // Simulator
  const [simExtraStake, setSimExtraStake] = useState(0);

  const timerRef = useRef(null);

  // Load data function
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetchHarmonyData(MY_ADDR);
      if (res.success) {
        setData(res);
        setLastUpdated(new Date());
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

  // Keyboard shortcuts matching Python script ([1] Claim, [R] Refresh, [2]/[Q] Exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        setShowClaimModal(true);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadData(false);
      } else if (e.key === '2' || e.key.toLowerCase() === 'q') {
        e.preventDefault();
        onLock?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Countdown & auto refresh every 30s
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

  // Format numbers helper
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

  const cliCommand = `/home/harmony/hmy --node=${RPC_URL} staking collect-rewards --delegator-addr ${MY_ADDR} --gas-price 100 --chain-id mainnet --passphrase`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  // Derived values
  const myData = data?.myData;
  const validators = data?.validators || [];
  const header = data?.header;
  const stats = data?.stats;
  const walletBalance = data?.walletBalance || 0;

  const effectiveStake = (myData?.actualStake || 0) + simExtraStake;
  const simResults = calculateKeySimulation(
    effectiveStake,
    validators,
    stats?.cutoffStake || 0,
    myData?.keys || 5
  );

  // Filtered validators for SmartStake Table
  const filteredValidators = validators.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.addr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.slotRange.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (tableFilter === 'mintbes') {
      return v.is_me;
    }
    if (tableFilter === 'focused') {
      const myRank = myData?.validatorRank || 30;
      return v.validatorRank >= Math.max(1, myRank - 3);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090d13] text-[#edf5f4] selection:bg-[#1fdfb6] selection:text-[#07110f] font-sans antialiased pb-16">
      
      {/* Background Mesh (rollback.country styling) */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 12% -8%, rgba(31, 223, 182, 0.07), transparent 30%), radial-gradient(circle at 88% 25%, rgba(31, 223, 182, 0.04), transparent 35%), #090d13'
        }}
      />

      <main className="relative z-10 max-w-[1520px] mx-auto px-4 sm:px-8 py-7 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HEADER */}
        {/* ========================================================================= */}
        <header className="border-b border-[#202a35] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div 
              className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[#1fdfb6] font-extrabold text-xl border border-[#1fdfb66b] shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(31, 223, 182, 0.22), transparent 62%), #0f151d',
                boxShadow: 'inset 0 0 20px rgba(31, 223, 182, 0.08)'
              }}
            >
              🌿
            </div>
            <div>
              <span className="text-[#697a7c] text-[11px] font-bold uppercase tracking-[0.14em] block">
                HARMONY EPOS VALIDATOR TELEMETRY • SMARTSTAKE AUCTION ENGINE
              </span>
              <h1 className="text-[22px] font-bold text-[#edf5f4] tracking-[-0.02em]">
                Mintbes Validator Command Center
              </h1>
            </div>
          </div>

          {/* Actions & Auto-refresh */}
          <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
            <div className="flex flex-col items-start md:items-end text-[11px] text-[#697a7c]">
              <span>ÚLTIMA SINCRONIZACIÓN</span>
              <strong className="text-[#a8b6b6] font-mono text-[12px]">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Conectando...'}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(false)}
                disabled={loading}
                className="bg-[#0f151d] hover:bg-[#131b25] border border-[#32404d] hover:border-[#1fdfb67a] text-[#a8b6b6] hover:text-[#edf5f4] px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                title="Refrescar datos (Tecla R)"
              >
                <span className="text-[#1fdfb6] font-bold">R</span>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1fdfb6]' : ''}`} />
                <span>Refrescar <strong className="text-[#1fdfb6]">⏱️ {countdown}s</strong></span>
              </button>

              <button
                onClick={() => setShowClaimModal(true)}
                className="bg-[#f5b3421a] hover:bg-[#f5b34226] border border-[#f5b34247] text-[#f5b342] hover:text-[#ffca6e] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Cobrar Recompensas (Tecla 1)"
              >
                <span className="font-mono text-[10px] px-1 bg-[#f5b34226] rounded">1</span>
                <Coins className="w-3.5 h-3.5" />
                <span>Cobrar Rewards</span>
              </button>

              <button
                onClick={onLock}
                className="bg-[#0f151d] hover:bg-[#ff505014] border border-[#32404d] hover:border-[#ff606040] text-[#a8b6b6] hover:text-[#ff9b9b] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salir y bloquear panel (Tecla 2 o Q)"
              >
                <span className="font-mono text-[10px] px-1 bg-[#32404d] rounded text-[#edf5f4]">2</span>
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
        {/* 2. INTRO & SYSTEM STATUS */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2">
          <div>
            <div className="inline-flex items-center gap-2 text-[#1fdfb6] text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1fdfb6] shadow-[0_0_10px_#1fdfb6b3]" />
              SMARTSTAKE BID SLOTS AUCTION SYSTEM
            </div>
            <p className="text-[#a8b6b6] text-[13px] leading-relaxed max-w-2xl font-normal">
              Subasta de slots en tiempo real de Harmony EPoS. Cada validador compite asignando su stake entre llaves BLS. <strong>Mintbes</strong> ocupa los slots <strong>#{myData?.slotRange || '352-356'}</strong> con un <strong>{myData?.votingPower?.toFixed(3) || '1.068'}% de poder de voto</strong>.
            </p>
          </div>

          {/* Quick Metrics Rule Widget */}
          <div className="border border-[#202a35] bg-[#ffffff05] rounded-xl p-3.5 min-w-[320px] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block">Época</span>
              <strong className="text-[#edf5f4] text-sm">{header?.epoch || 0}</strong>
            </div>
            <div className="h-7 w-px bg-[#202a35]" />
            <div>
              <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block">Total Slots</span>
              <strong className="text-[#1fdfb6] text-sm">{stats?.totalSlots || 400}</strong>
            </div>
            <div className="h-7 w-px bg-[#202a35]" />
            <div>
              <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block">Corte Slot #{stats?.totalSlots || 400}</span>
              <strong className="text-[#ff6060] text-sm">{fmt(stats?.cutoffStake, 0)} ONE</strong>
            </div>
          </div>
        </div>

        {/* Page Segmented Navigation Tabs */}
        <div className="border border-[#202a35] bg-[#090d13] rounded-xl p-1 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveViewTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
              activeViewTab === 'overview'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            🌿 Telemetría Mintbes
          </button>
          <button
            onClick={() => setActiveViewTab('bids')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
              activeViewTab === 'bids'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            📑 Tabla SmartStake "Bid Slots" ({validators.length} Nodos)
          </button>
          <button
            onClick={() => setActiveViewTab('simulator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
              activeViewTab === 'simulator'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            🎛️ Simulador BLS (+2, +1, -1, -2)
          </button>
          <button
            onClick={() => setActiveViewTab('rpc')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
              activeViewTab === 'rpc'
                ? 'bg-[#131b25] text-[#1fdfb6] shadow-[0_1px_5px_rgba(0,0,0,0.3)]'
                : 'text-[#697a7c] hover:text-[#edf5f4]'
            }`}
          >
            ⚡ Protocolo RPC
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. HERO PANEL: MINTBES SMARTSTAKE ONCHAIN TELEMETRY */}
        {/* ========================================================================= */}
        {(activeViewTab === 'overview' || activeViewTab === 'bids') && (
          <div 
            className="border border-[#1fdfb67a] rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'radial-gradient(circle at 50% -20%, rgba(31, 223, 182, 0.08), transparent 45%), #0f151d'
            }}
          >
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1fdfb6] shadow-[0_0_10px_#1fdfb6]" />
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  Estado SmartStake de Mintbes en la Subasta EPoS
                </h2>
              </div>
              <span className="text-[10px] text-[#697a7c] font-mono">
                Operator Address: <strong className="text-[#a8b6b6]">{MY_ADDR}</strong>
              </span>
            </div>

            {/* Grid 2-columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#202a35]">
              
              {/* Left Column: Ranking, Slot Range, Voting Power */}
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#697a7c] block">
                      RANGO DE SLOTS SMARTSTAKE ({myData?.slotsAllotted || 0} LLAVES BLS)
                    </span>
                    <strong className="text-[32px] font-mono font-bold tracking-tight text-[#1fdfb6] block mt-0.5">
                      Slots #{myData?.slotRange || '352-356'} <span className="text-lg font-normal text-[#697a7c]">/ {stats?.totalSlots || 400}</span>
                    </strong>
                    <span className="text-xs text-[#a8b6b6] font-mono block mt-1">
                      Puesto consolidado de nodo: <strong className="text-[#edf5f4]">#{myData?.validatorRank || '--'} de {stats?.totalNodes || 0} validadores</strong>
                    </span>
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

                {/* Voting Power Box */}
                <div className="border border-[#202a35] bg-[#131b25] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1fdfb61a] border border-[#1fdfb647] flex items-center justify-center text-[#1fdfb6]">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#697a7c] tracking-wider block">Poder de Voto Total (Voting Power)</span>
                      <strong className="text-xl font-mono text-[#1fdfb6] font-bold">{myData?.votingPower?.toFixed(3) || '1.068'}% de la Red</strong>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-[#a8b6b6]">
                    <span>{myData?.votingPowerPerSlot?.toFixed(3) || '0.214'}% por llave</span>
                  </div>
                </div>

                {/* EPoS Auction Visualizer Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                    <span className="text-[#a8b6b6]">Banda EPoS (85% - 115% de Mediana)</span>
                    <strong className="text-[#1fdfb6] font-bold">{myData?.backup_pct?.toFixed(0)}% de Mediana</strong>
                  </div>
                  
                  <div className="relative h-2.5 bg-[#1a2530] rounded-full overflow-visible">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (myData?.bid / (stats?.upperBound || 1)) * 100)}%`,
                        background: 'linear-gradient(90deg, #12b99b, #1fdfb6)',
                        boxShadow: '0 0 12px rgba(31, 223, 182, 0.38)'
                      }}
                    />
                    {/* Markers */}
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

                {/* Key Simulation chips from SmartStake table */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#697a7c] block mb-2">
                    PROYECCIÓN DE SLOTS DE MINTBES SI CAMBIAS LLAVES (SMARTSTAKE SHIFT)
                  </span>
                  <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                    <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                      <span className="text-[9px] text-[#697a7c] block uppercase">BLS +2 (7 Keys)</span>
                      <strong className="text-[#a8b6b6]">{myData?.bls_2 || '396-402'}</strong>
                    </div>
                    <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                      <span className="text-[9px] text-[#697a7c] block uppercase">BLS +1 (6 Keys)</span>
                      <strong className="text-[#a8b6b6]">{myData?.bls_1 || '396-401'}</strong>
                    </div>
                    <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                      <span className="text-[9px] text-[#697a7c] block uppercase">BLS -1 (4 Keys)</span>
                      <strong className="text-[#1fdfb6]">{myData?.['bls_-1'] || '295-298'}</strong>
                    </div>
                    <div className="bg-[#131b25] border border-[#202a35] rounded-lg p-2 text-center">
                      <span className="text-[9px] text-[#697a7c] block uppercase">BLS -2 (3 Keys)</span>
                      <strong className="text-[#1fdfb6]">{myData?.['bls_-2'] || '218-220'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 4-Cell Telemetry Matrix */}
              <div className="p-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#697a7c] block">
                  MÉTRICAS PRINCIPALES DE STAKING
                </span>

                <div className="border border-[#202a35] bg-[#202a35] rounded-lg grid grid-cols-2 gap-[1px] overflow-hidden">
                  <div className="bg-[#131b25] p-3">
                    <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Actual Stake (Total Delegado)</dt>
                    <dd className="text-[#edf5f4] font-mono text-[16px] font-bold mt-1">
                      {fmt(myData?.actualStake, 2)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
                    </dd>
                  </div>

                  <div className="bg-[#131b25] p-3">
                    <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Raw Bid / Llave</dt>
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
                    <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Ritmo Estimado Diario</dt>
                    <dd className="text-[#1fdfb6] font-mono text-[16px] font-bold mt-1">
                      ~{fmt(myData?.daily_estimate, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE / día</span>
                    </dd>
                  </div>

                  <div className="bg-[#131b25] p-3">
                    <dt className="text-[#697a7c] text-[9px] uppercase tracking-wider font-semibold">Used Stake (En Consenso)</dt>
                    <dd className="text-[#a8b6b6] font-mono text-[15px] font-semibold mt-1">
                      {fmt(myData?.usedStake, 0)} <span className="text-xs font-normal text-[#697a7c]">ONE</span>
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
              <span>* Los slots con bid &lt;85% reciben bonificación de Effective Stake hasta {fmt(stats?.lowerBound, 0)} ONE.</span>
              <span className="text-[#1fdfb6]">Mediana Red: {fmt(stats?.medianStake, 0)} ONE</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB: EXACT SMARTSTAKE "BID SLOTS" TABLE */}
        {/* ========================================================================= */}
        {(activeViewTab === 'overview' || activeViewTab === 'bids') && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4] flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-[#1fdfb6]" />
                  Bid Slots (SmartStake Model)
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Subasta de slots consolidada con simulación de impacto al añadir o retirar llaves BLS (+2, +1, -1, -2).
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
                          <span className={v.eposStatus === 'BOOSTED' ? 'text-[#f5b342] font-bold' : v.eposStatus === 'CAPPED' ? 'text-[#aab8ff] font-bold' : 'text-[#1fdfb6] font-bold'}>
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
                          {v.bls_2}
                        </td>

                        {/* BLS +1 */}
                        <td className="py-3 px-3 text-center bg-[#1fdfb608] text-[#1fdfb6] font-mono font-medium">
                          {v.bls_1}
                        </td>

                        {/* BLS -1 */}
                        <td className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342] font-mono font-medium">
                          {v['bls_-1']}
                        </td>

                        {/* BLS -2 */}
                        <td className="py-3 px-3 text-center bg-[#f5b34208] text-[#f5b342] font-mono font-medium">
                          {v['bls_-2']}
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
        {/* 5. TAB: DYNAMIC SIMULATOR */}
        {/* ========================================================================= */}
        {activeViewTab === 'simulator' && (
          <section className="border border-[#202a35] bg-[#0f151d] rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-[#202a35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#edf5f4]">
                  Simulador EPoS: Proyección de Slots en la Subasta de {stats?.totalSlots || 400} Llaves
                </h2>
                <span className="text-[11px] text-[#697a7c]">
                  Calcula a qué rango exacto de slots SmartStake ascenderían o descenderían tus llaves según la cantidad de llaves activas.
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
                  <tr className="border-b border-[#202a35] bg-[#ffffff03] text-[#697a7c] text-[9px] uppercase tracking-[0.07em]">
                    <th className="py-3 px-5">Configuración Llaves</th>
                    <th className="py-3 px-5">Raw Bid / Llave</th>
                    <th className="py-3 px-5">Rango de Slots Proyectado</th>
                    <th className="py-3 px-5">Margen sobre Corte #{stats?.totalSlots || 400}</th>
                    <th className="py-3 px-5 text-right">Estado de Consenso</th>
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

                        <td className="py-3 px-5 text-right">
                          <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${pillClass}`}>
                            {sim.statusLabel}
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
        {/* 6. TAB: RPC TELEMETRY */}
        {/* ========================================================================= */}
        {activeViewTab === 'rpc' && (
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
        {/* 7. FOOTER TELEMETRY */}
        {/* ========================================================================= */}
        <footer className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#202a35]">
          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              PROTOCOLO HARMONY EPOS & SUBASTA SMARTSTAKE
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block">
              La tabla "Bid Slots" reproduce el algoritmo exacto de SmartStake. Las {myData?.slotsAllotted || 5} llaves de Mintbes compiten individualmente ocupando los slots #{myData?.slotRange || '352-356'} con un {myData?.votingPower?.toFixed(3)}% de poder de voto acumulado.
            </span>
          </div>

          <div className="border-l-2 border-[#32404d] pl-3.5 py-1">
            <strong className="text-[#a8b6b6] text-[10px] uppercase tracking-[0.05em] block mb-1">
              PARÁMETROS OPERACIONALES MINTBES
            </strong>
            <span className="text-[#697a7c] text-[10px] leading-relaxed block font-mono">
              Validator: {MY_ADDR.slice(0, 16)}... | Auto-Refresh: 30s | Atajos: [R] Refrescar, [1] Claim, [2] Salir.
            </span>
          </div>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* 8. CLAIM REWARDS MODAL */}
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
                    <h3 className="text-base font-bold text-[#edf5f4]">Cobro de Recompensas EPoS</h3>
                    <p className="text-[10px] text-[#697a7c] font-mono">Validator: Mintbes • Shard 0</p>
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
                    RECOMPENSAS LISTAS PARA COBRAR
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
                    onClick={() => copyToClipboard(cliCommand)}
                    className="text-[#1fdfb6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd ? '¡Copiado!' : 'Copiar comando'}
                  </button>
                </div>
                <div className="bg-[#090d13] border border-[#202a35] rounded-lg p-3 font-mono text-[11px] text-[#1fdfb6] break-all select-all">
                  {cliCommand}
                </div>
              </div>

              <div className="border border-[#202a35] bg-[#090d13] rounded-lg p-3 text-[11px] text-[#697a7c] leading-relaxed">
                💡 <strong>Nota del Operador:</strong> Ejecuta este comando en la terminal de tu nodo validador para transferir los tokens acumulados directamente a tu balance líquido.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#131b25] hover:bg-[#1a2530] text-[#a8b6b6] hover:text-[#edf5f4] text-xs font-semibold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => copyToClipboard(cliCommand)}
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

    </div>
  );
}
