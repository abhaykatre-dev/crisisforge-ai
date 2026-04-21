import { Component, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ScenarioBuilder from './pages/ScenarioBuilder';
import StrategyComparator from './pages/StrategyComparator';
import Reports from './pages/Reports';
import TransferHub from './pages/TransferHub';
import AIPredictor from './pages/AIPredictor';
import TelegramPanel from './pages/TelegramPanel';
import HospitalMap from './pages/HospitalMap';
import EquityDashboard from './pages/EquityDashboard';
import './index.css';


/* ─── Error Boundary ─── */
interface EBState { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#f1f5f9' }}>
          <h2 style={{ color: '#ef4444', marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ background: '#0a1628', padding: 16, borderRadius: 8, color: '#94a3b8', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Login from './pages/Login';

/* ─── Top Navbar ─── */
const SEARCHABLE_PAGES = [
  { name: 'Dashboard', path: '/' },
  { name: 'Scenarios', path: '/scenarios' },
  { name: 'Comparator', path: '/compare' },
  { name: 'Transfers', path: '/transfers' },
  { name: 'AI Predictor', path: '/ai' },
  { name: 'Equity Audit', path: '/equity' },
  { name: 'Hospital Map', path: '/map' },
  { name: 'Analytics', path: '/reports' }
];

function TopNav() {
  const [clock, setClock] = useState('');
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const searchResults = search.trim() === '' ? [] : SEARCHABLE_PAGES.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 56,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
      gap: 24,
      position: 'relative'
    }}>
      {/* Left — Logo and Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <img 
          src={isLight ? "/logo-light.png" : "/logo-dark.png"} 
          alt="CrisisForge" 
          style={{ height: '50px', width: 'auto', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/')}
        />

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '● LIVE FEED',   color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' }
          ].map(p => (
            <span key={p.label} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              fontWeight: 600,
              color: p.color,
              background: p.bg,
              border: `1px solid ${p.border}`,
              padding: '3px 9px',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Centre — Search */}
      <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
        <input
          type="text"
          placeholder="SEARCH PAGES..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '8px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            outline: 'none',
            letterSpacing: '0.04em',
          }}
        />
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-active)',
            borderTop: 'none',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {searchResults.map(res => (
              <div 
                key={res.path} 
                onClick={() => {
                  navigate(res.path);
                  setSearch('');
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {res.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — Clock + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Live clock */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#2563eb',
          letterSpacing: '0.08em',
          border: '1px solid rgba(37,99,235,0.3)',
          padding: '4px 10px',
          background: 'rgba(37,99,235,0.06)',
        }}>
          ◷ {clock}
        </span>

        {/* Avatar trigger */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: showProfile ? '0 0 0 2px var(--border-active)' : 'none',
            }}>
            CF
          </div>

          {/* Profile Modal */}
          {showProfile && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 240,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Crisis Forge Operator
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  ID: {user?.uid || 'GUEST-001'}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {user?.email || 'operator@crisisforge.ai'}
                </p>
              </div>
              
              <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Active Node</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Access</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Level 4 (Admin)</span>
                </div>
              </div>

              <button 
                onClick={() => { setShowProfile(false); logOut(); }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                TERMINATE SESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── App Layout ─── */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAuthEnabled } = useAuth();

  // If Firebase is not configured, skip auth and let everyone in
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const { user, loading, isAuthEnabled } = useAuth();

  // Show the sidebar/background only when the user is authenticated (or auth is disabled)
  const isAuthenticated = !isAuthEnabled || !!user;
  const isLoginPage = location.pathname === '/login';
  const showShell = isAuthenticated && !isLoginPage;

  return (
    <div className="app-layout">
      {showShell && <Sidebar />}

      <main className={`main-content ${!showShell ? 'no-sidebar' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Navbar */}
        {showShell && <TopNav />}

        <ErrorBoundary>
          {loading ? (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
              <p style={{ fontFamily: 'var(--font-mono)' }}>INITIALIZING SESSION...</p>
            </div>
          ) : (
            <div style={{ padding: '32px' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/scenarios" element={<ProtectedRoute><ScenarioBuilder /></ProtectedRoute>} />
                <Route path="/compare" element={<ProtectedRoute><StrategyComparator /></ProtectedRoute>} />
                <Route path="/transfers" element={<ProtectedRoute><TransferHub /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AIPredictor /></ProtectedRoute>} />
                <Route path="/telegram" element={<ProtectedRoute><TelegramPanel /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><HospitalMap /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/equity" element={<ProtectedRoute><EquityDashboard /></ProtectedRoute>} />
              </Routes>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
