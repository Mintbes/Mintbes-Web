import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  PieChart,
  Wallet,
  Coins,
  ShieldCheck,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { fetchDelegatorDetails } from '../../services/harmonyRpc';

const COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-blue-500',
  'bg-cyan-500'
];

export default function DelegatorModal({ address, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchDelegatorDetails(address)
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setData(res);
        } else {
          setError(res.error || 'Failed to load delegator profile');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error fetching delegator details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [address]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (n, dec = 0) => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
  };

  if (!address) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl bg-[#0b1017] border border-[#202a35] rounded-2xl shadow-2xl overflow-hidden text-[#edf5f4] font-sans my-auto"
        >
          {/* ========================================================================= */}
          {/* 1. HEADER SECTION */}
          {/* ========================================================================= */}
          <div className="border-b border-[#202a35] bg-[#0f151d] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <PieChart className="w-3 h-3" />
                    Delegator Intelligence Profile
                  </span>

                  {data?.tier && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 ${data.tier.color}`}>
                      <span>{data.tier.icon}</span>
                      <span>{data.tier.label}</span>
                    </span>
                  )}

                  {data?.mintbesShare !== undefined && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                      data.mintbesShare >= 50
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}>
                      <span>🌿 Mintbes Share: {data.mintbesShare.toFixed(1)}%</span>
                    </span>
                  )}
                </div>

                {/* Address Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm text-white select-all break-all bg-[#131b25] px-3 py-1.5 rounded-lg border border-[#202a35]">
                    {address}
                  </span>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#697a7c] hover:text-white transition-colors cursor-pointer"
                    title="Copiar dirección"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={`https://explorer.harmony.one/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#697a7c] hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Ver en Harmony Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-[#697a7c] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. BODY CONTENT */}
          {/* ========================================================================= */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-sm text-[#a8b6b6] font-mono">
                  Consultando el portfolio de staking del delegador en la blockchain de Harmony...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center space-y-2">
                <p className="text-sm text-rose-400 font-bold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono font-medium hover:bg-rose-500/30 cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* 4 KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                  {/* 1. Total Staked en Red */}
                  <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
                    <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                      Total Staked en Harmony
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-white mt-1 block">
                      {fmt(data.totalStaked, 0)} <span className="text-xs text-[#697a7c]">ONE</span>
                    </strong>
                    <span className="text-[10px] text-sky-400 font-sans mt-0.5 block">
                      {data.activeValidatorsCount} {data.activeValidatorsCount === 1 ? 'validador' : 'validadores'}
                    </span>
                  </div>

                  {/* 2. Staked en Mintbes */}
                  <div className="bg-[#0f151d] border border-emerald-500/30 bg-emerald-500/[0.03] rounded-xl p-4">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-sans font-bold">
                      Staked en Mintbes 🌿
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">
                      {fmt(data.mintbesStaked, 0)} <span className="text-xs text-emerald-400/70">ONE</span>
                    </strong>
                    <span className="text-[10px] text-emerald-400/80 font-sans mt-0.5 block">
                      {data.mintbesShare.toFixed(1)}% de su cartera total
                    </span>
                  </div>

                  {/* 3. Saldo Líquido no delegado */}
                  <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
                    <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                      Saldo Líquido en Wallet
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-white mt-1 block">
                      {fmt(data.liquidBalance, 2)} <span className="text-xs text-[#697a7c]">ONE</span>
                    </strong>
                    <span className="text-[10px] text-[#697a7c] font-sans mt-0.5 block">
                      {data.liquidBalance > 100 ? '🟢 Capital no delegado' : '⚪ Casi 100% invertido'}
                    </span>
                  </div>

                  {/* 4. Rewards Pendientes Totales */}
                  <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4">
                    <span className="text-[10px] text-[#697a7c] uppercase tracking-wider block font-sans">
                      Rewards por Reclamar
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-[#f5b342] mt-1 block">
                      {fmt(data.totalPendingRewards, 2)} <span className="text-xs text-[#f5b342]/70">ONE</span>
                    </strong>
                    <span className="text-[10px] text-[#f5b342]/80 font-sans mt-0.5 block">
                      Acumulados en la red
                    </span>
                  </div>
                </div>

                {/* VISUAL MULTI-SEGMENT ALLOCATION BAR */}
                <div className="bg-[#0f151d] border border-[#202a35] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#a8b6b6] font-bold">Distribución Visual del Staking</span>
                    <span className="text-[#697a7c]">
                      {data.delegations.length} {data.delegations.length === 1 ? 'posición activa' : 'posiciones activas'}
                    </span>
                  </div>

                  {/* Segmented Bar */}
                  <div className="h-4 w-full bg-[#131b25] rounded-full overflow-hidden flex shadow-inner">
                    {data.delegations.map((d, i) => {
                      const color = d.isMintbes ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : COLORS[i % COLORS.length];
                      return (
                        <div
                          key={d.validatorAddress}
                          style={{ width: `${Math.max(d.percentage, 1)}%` }}
                          className={`${color} h-full transition-all relative group cursor-pointer`}
                          title={`${d.validatorName}: ${fmt(d.amount, 0)} ONE (${d.percentage.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 flex-wrap text-xs font-mono pt-1">
                    {data.delegations.slice(0, 5).map((d, i) => (
                      <div key={d.validatorAddress} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${d.isMintbes ? 'bg-emerald-500' : COLORS[i % COLORS.length]}`} />
                        <span className={d.isMintbes ? 'text-emerald-400 font-bold' : 'text-[#a8b6b6]'}>
                          {d.validatorName.split(' ')[0]} ({d.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                    {data.delegations.length > 5 && (
                      <span className="text-[#697a7c] text-[11px]">+{data.delegations.length - 5} otros</span>
                    )}
                  </div>
                </div>

                {/* DETAILED VALIDATORS BREAKDOWN TABLE */}
                <div className="bg-[#0f151d] border border-[#202a35] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#202a35] bg-[#131b25] flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Desglose de Validadores Activos
                    </h4>
                    <span className="text-[11px] text-[#697a7c] font-mono">
                      Ordenado por capital delegado
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-[#202a35] text-[#697a7c] text-[10px] uppercase tracking-wider bg-[#090d13]">
                          <th className="py-2.5 px-4">Validador</th>
                          <th className="py-2.5 px-4 text-right">Cantidad Delegada</th>
                          <th className="py-2.5 px-4 text-right">% Cartera</th>
                          <th className="py-2.5 px-4 text-right">Rewards Pendientes</th>
                          <th className="py-2.5 px-4 text-center">Explorador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#202a35]">
                        {data.delegations.map((d) => (
                          <tr
                            key={d.validatorAddress}
                            className={`transition-colors ${
                              d.isMintbes
                                ? 'bg-emerald-500/10 font-bold border-l-4 border-l-emerald-500'
                                : 'hover:bg-[#131b25]'
                            }`}
                          >
                            {/* Validator Moniker & Address */}
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <strong className={d.isMintbes ? 'text-emerald-400 font-extrabold text-xs' : 'text-white text-xs'}>
                                    {d.validatorName}
                                  </strong>
                                  {d.isMintbes && (
                                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold font-mono">
                                      Tu Nodo
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#697a7c] block break-all font-mono">
                                  {d.validatorAddress}
                                </span>
                              </div>
                            </td>

                            {/* Delegated Amount */}
                            <td className="py-3 px-4 text-right">
                              <strong className={d.isMintbes ? 'text-emerald-400 font-bold' : 'text-white'}>
                                {fmt(d.amount, 2)} ONE
                              </strong>
                            </td>

                            {/* % of Portfolio */}
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                d.isMintbes ? 'bg-emerald-500/20 text-emerald-300' : 'text-[#a8b6b6]'
                              }`}>
                                {d.percentage.toFixed(2)}%
                              </span>
                            </td>

                            {/* Pending Rewards */}
                            <td className="py-3 px-4 text-right text-[#f5b342] font-medium">
                              {fmt(d.reward, 2)} ONE
                            </td>

                            {/* Explorer Link */}
                            <td className="py-3 px-4 text-center">
                              <a
                                href={`https://explorer.harmony.one/address/${d.validatorAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-1 rounded hover:bg-[#202a35] text-[#697a7c] hover:text-emerald-400 transition-colors"
                                title="Abrir en Explorer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. FOOTER ACTIONS */}
          {/* ========================================================================= */}
          <div className="border-t border-[#202a35] bg-[#090d13] px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <a
                href={`https://explorer.harmony.one/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8b6b6] hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <span>Ver Billetera en Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[#202a35]">|</span>

              <a
                href={`https://harmony.subscan.io/account/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8b6b6] hover:text-sky-400 flex items-center gap-1.5 transition-colors"
              >
                <span>Subscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#131b25] hover:bg-[#1a2530] border border-[#202a35] text-white font-semibold transition-colors cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
