import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IconLayoutDashboard, IconUsers, IconMicroscope, IconActivity,
    IconBrain, IconSettings, IconAlertTriangle, IconLogout,
    IconSun, IconMoon, IconBell, IconMap, IconChartBar,
    IconShieldHalf, IconTransferIn,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';
import '../index.css';

interface NavItem {
    path: string;
    label: string;
    sub: string;
    icon: React.ElementType;
    color: string;
    group: string;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'DASHBOARD', sub: 'Overview', icon: IconLayoutDashboard, color: '#2563eb', group: 'CORE' },
    { path: '/scenarios', label: 'SCENARIOS', sub: 'Crisis Builder', icon: IconUsers, color: '#8b5cf6', group: 'CORE' },
    { path: '/compare', label: 'COMPARATOR', sub: 'Strategy Matrix', icon: IconMicroscope, color: '#06b6d4', group: 'CORE' },
    { path: '/transfers', label: 'TRANSFERS', sub: 'Transfer Hub', icon: IconTransferIn, color: '#10b981', group: 'OPERATIONS' },
    { path: '/ai', label: 'AI PREDICTOR', sub: 'ML Engine', icon: IconBrain, color: '#f59e0b', group: 'OPERATIONS' },
    { path: '/equity', label: 'EQUITY AUDIT', sub: 'Fairness Engine', icon: IconShieldHalf, color: '#ef4444', group: 'OPERATIONS' },
    { path: '/map', label: 'HOSPITAL MAP', sub: 'Geo View', icon: IconMap, color: '#14b8a6', group: 'SYSTEM' },
    { path: '/reports', label: 'ANALYTICS', sub: 'Reports', icon: IconChartBar, color: '#a78bfa', group: 'SYSTEM' },
];

const GROUPS = ['CORE', 'OPERATIONS', 'SYSTEM'];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [, setMobileOpen] = useState(false);
    const isLight = theme === 'light';

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    return (
        <aside style={{
            width: '260px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 100,
            overflow: 'hidden',
        }}>

            {/* ── Branding Header ── */}
            <div style={{
                padding: '24px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                background: isLight ? 'var(--bg-secondary)' : 'linear-gradient(180deg, #0f172a 0%, var(--bg-secondary) 100%)',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20
            }}>
                {/* Logo Area — Complete Logo */}
                <div
                    onClick={() => navigate('/')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 0'
                    }}
                >
                    <img
                        src={isLight ? "/logo-light.png" : "/logo-dark.png"}
                        alt="CrisisForge"
                        style={{
                            height: '200px',
                            width: 'auto',
                            filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.15))',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* System status bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.2)',
                }}>
                    <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: '#10b981',
                        animation: 'livePulse 2s ease-in-out infinite',
                        flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#10b981', letterSpacing: '0.08em' }}>
                        ALL SYSTEMS OPERATIONAL
                    </span>
                </div>
            </div>

            {/* ── Nav Items ── */}
            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {GROUPS.map((group) => {
                    const items = NAV_ITEMS.filter(n => n.group === group);
                    if (items.length === 0) return null;
                    return (
                        <div key={group}>
                            {/* Group Label */}
                            <div style={{
                                padding: '10px 18px 4px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                color: '#334155',
                                textTransform: 'uppercase',
                            }}>
                                {group}
                            </div>

                            {items.map((item) => {
                                const active = location.pathname === item.path ||
                                    (item.path !== '/' && location.pathname.startsWith(item.path));

                                return (
                                    <motion.button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        whileHover={{ x: 2 }}
                                        transition={{ duration: 0.12 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '10px 18px',
                                            background: active
                                                ? `linear-gradient(90deg, ${item.color}1a 0%, transparent 100%)`
                                                : 'transparent',
                                            border: 'none',
                                            borderLeft: active ? `3px solid ${item.color}` : '3px solid transparent',
                                            cursor: 'pointer',
                                            color: active ? (isLight ? '#0f172a' : '#f1f5f9') : 'var(--text-secondary)',
                                            textAlign: 'left',
                                            gap: 12,
                                        }}
                                    >
                                        {/* Icon box */}
                                        <div style={{
                                            width: 30,
                                            height: 30,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: active ? `${item.color}22` : 'transparent',
                                            flexShrink: 0,
                                            border: active ? `1px solid ${item.color}44` : '1px solid transparent',
                                        }}>
                                            <item.icon
                                                size={16}
                                                stroke={active ? 2 : 1.5}
                                                color={active ? item.color : '#475569'}
                                            />
                                        </div>

                                        {/* Label + sublabel */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '0.75rem',
                                                fontWeight: active ? 700 : 500,
                                                letterSpacing: '0.04em',
                                                color: active ? (isLight ? '#0f172a' : '#f1f5f9') : '#64748b',
                                                lineHeight: 1.2,
                                            }}>
                                                {item.label}
                                            </div>
                                            <div style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.58rem',
                                                color: active ? item.color : '#334155',
                                                marginTop: 1,
                                                letterSpacing: '0.02em',
                                            }}>
                                                {item.sub}
                                            </div>
                                        </div>

                                        {/* Active indicator dot */}
                                        {active && (
                                            <div style={{
                                                width: 5, height: 5,
                                                borderRadius: '50%',
                                                background: item.color,
                                                flexShrink: 0,
                                                boxShadow: `0 0 8px ${item.color}`,
                                            }} />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div style={{
                padding: '12px 14px 16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
            }}>
                {/* Alerts + Theme row */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => navigate('/telegram')}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            background: 'rgba(220,38,38,0.1)',
                            border: '1px solid rgba(220,38,38,0.35)',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                        }}
                    >
                        <IconAlertTriangle size={14} stroke={2} />
                        ALERTS
                    </button>

                    <button
                        onClick={toggleTheme}
                        title={isLight ? 'Switch to Dark' : 'Switch to Light'}
                        style={{
                            padding: '10px 12px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        {isLight
                            ? <IconMoon size={16} stroke={1.5} />
                            : <IconSun size={16} stroke={1.5} />}
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={() => logOut()}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        padding: '9px 0',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        width: '100%',
                    }}
                >
                    <IconLogout size={15} stroke={1.5} />
                    LOGOUT
                </button>

                {/* Credits */}
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: '#1e293b',
                    textAlign: 'center',
                    letterSpacing: '0.05em',
                    margin: 0,
                }}>
                    CRISISFORGE AI — UNIT 04-A
                </p>
            </div>

            <style>{`
                @keyframes livePulse {
                    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
                    70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
                    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
                }
            `}</style>
        </aside>
    );
}
