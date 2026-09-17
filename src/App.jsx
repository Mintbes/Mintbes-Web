import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoShowcase from './components/VideoShowcase';
import PromptVault from './components/PromptVault';
import EcosystemBridge from './components/EcosystemBridge';
import Footer from './components/Footer';
import PrivateGate from './components/dashboard/PrivateGate';
import MintbesDashboard from './components/dashboard/MintbesDashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A0F] text-white p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-md bg-[#0B0F17] border border-rose-500/30 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-400">Error al cargar la aplicación</h2>
            <p className="text-xs text-slate-400 font-mono text-left bg-[#070A0F] p-3 rounded-lg overflow-auto max-h-40">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.hash = '';
                window.location.reload();
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#00AEE9] to-[#69FABD] text-[#070A0F] font-bold rounded-xl text-sm"
            >
              Reiniciar App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#dashboard' || hash === '#node' || hash === '#admin') {
        return 'dashboard';
      }
    }
    return 'public';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mintbes_authenticated') === 'true';
    }
    return false;
  });

  // Hash listener
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#dashboard' || hash === '#node' || hash === '#admin') {
        setCurrentView('dashboard');
      } else if (!hash) {
        setCurrentView('public');
      }
    };

    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPublic = () => {
    setCurrentView('public');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnlock = () => {
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem('mintbes_authenticated');
    setIsAuthenticated(false);
    handleBackToPublic();
  };

  // If in dashboard view (Archive Diagnostics)
  if (currentView === 'dashboard') {
    return (
      <ErrorBoundary>
        {!isAuthenticated ? (
          <PrivateGate
            onUnlock={handleUnlock}
            onBack={handleBackToPublic}
          />
        ) : (
          <MintbesDashboard
            onLock={handleLock}
          />
        )}
      </ErrorBoundary>
    );
  }

  // Public Flagship Landing Page
  return (
    <ErrorBoundary>
      <div className="font-sans antialiased text-slate-100 bg-[#070A0F] selection:bg-[#00AEE9] selection:text-black min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        <Navbar onOpenDashboard={handleOpenDashboard} />
        <main className="flex-grow w-full max-w-full overflow-x-hidden">
          <Hero />
          <VideoShowcase />
          <PromptVault />
          <EcosystemBridge onOpenDashboard={handleOpenDashboard} />
        </main>
        <Footer onOpenDashboard={handleOpenDashboard} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
