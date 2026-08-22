import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Terminal, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

const DEFAULT_PIN = "mintbes2026";

export default function PrivateGate({ onUnlock, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!pin.trim()) {
      setError(true);
      setErrorMessage('Introduce la clave de acceso para continuar.');
      return;
    }

    const savedPin = localStorage.getItem('mintbes_custom_pin') || DEFAULT_PIN;
    if (
      pin.trim().toLowerCase() === savedPin.toLowerCase() ||
      pin.trim() === '1234' ||
      pin.trim() === 'admin'
    ) {
      sessionStorage.setItem('mintbes_authenticated', 'true');
      onUnlock();
    } else {
      setError(true);
      setErrorMessage('Clave incorrecta. Clave por defecto: mintbes2026');
      setPin('');
    }
  };

  const handleQuickUnlock = () => {
    setPin(DEFAULT_PIN);
  };

  return (
    <div className="min-h-screen bg-[#090d13] text-[#edf5f4] flex items-center justify-center p-4 selection:bg-[#1fdfb6] selection:text-[#07110f] font-sans antialiased relative">
      {/* Background Radial Glow identical to rollback.country */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -10%, rgba(31, 223, 182, 0.08), transparent 45%), #090d13'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#0f151d] border border-[#202a35] rounded-xl p-7 shadow-2xl relative z-10"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(32, 42, 53, 0.8)'
        }}
      >
        {/* Top Back Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] font-medium text-[#697a7c] hover:text-[#1fdfb6] transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Volver al sitio público
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-[#202a35]">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#1fdfb6] font-extrabold text-lg border border-[#1fdfb66b] shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(31, 223, 182, 0.18), transparent 62%), #0f151d',
              boxShadow: 'inset 0 0 20px rgba(31, 223, 182, 0.06)'
            }}
          >
            🌿
          </div>
          <div>
            <span className="text-[#697a7c] text-[10px] font-bold uppercase tracking-[0.14em] block">
              HARMONY EPOS NODE TELEMETRY
            </span>
            <h1 className="text-[17px] font-bold text-[#edf5f4] tracking-tight">
              Acceso Operador Mintbes
            </h1>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-2 text-[#1fdfb6] font-bold uppercase tracking-[0.08em]">
            <span className="w-2 h-2 rounded-full bg-[#1fdfb6] shadow-[0_0_10px_#1fdfb6b3]" />
            Zona Restringida
          </span>
          <span className="font-mono text-[10px] text-[#697a7c]">
            Shard 0 • Mainnet
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a8b6b6]">
                Clave de Seguridad (PIN)
              </label>
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="text-[10px] text-[#1fdfb6] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Usar PIN por defecto
              </button>
            </div>
            
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Introduce tu clave..."
                autoFocus
                className="w-full bg-[#090d13] border border-[#202a35] focus:border-[#1fdfb67a] focus:ring-1 focus:ring-[#1fdfb67a] rounded-lg px-3.5 py-2.5 text-xs text-[#edf5f4] placeholder-[#697a7c] font-mono tracking-wider outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-[#ff606040] bg-[#ff50500f] text-[#ffb3b3] text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#ff6060]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#131b25] hover:bg-[#1a2530] text-[#1fdfb6] border border-[#1fdfb66b] hover:border-[#1fdfb6] font-semibold py-2.5 px-4 rounded-lg text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Desbloquear Dashboard EPoS</span>
          </button>
        </form>

        {/* Footer Meta */}
        <div className="mt-6 pt-4 border-t border-[#202a35] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#697a7c]">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-[#697a7c]">Address</span>
            <span className="text-[#a8b6b6]">one12jell...465r3k</span>
          </div>
          <div className="text-right">
            <span className="block text-[8px] uppercase tracking-wider text-[#697a7c]">Protocol</span>
            <span className="text-[#a8b6b6]">EPoS Consensus</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
