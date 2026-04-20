import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconLayoutDashboard, IconFlask, IconArrowsExchange,
    IconBrain, IconBell, IconMapPin, IconChartBar,
    IconGitCompare, IconLogout, IconSun, IconMoon,
    IconMenu2, IconX, IconShieldHeart, IconChevronRight,
    IconChevronLeft, IconActivity
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import '../index.css';

const NAV_ITEMS = [
    { path: '/',          label: 'Dashboard',           icon: IconLayoutDashboard, color: '#06b6d4', glow: 'rgba(6,182,212,0.35)'   },
    { path: '/scenarios', label: 'Scenario Builder',    icon: IconFlask,           color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
    { path: '/compare',   label: 'Strategy Comparator', icon: IconGitCompare,      color: '#60a5fa', glow: 'rgba(96,165,250,0.35)'  },
    { path: '/transfers', label: 'Transfer Hub',         icon: IconArrowsExchange,  color: '#34d399', glow: 'rgba(52,211,153,0.35)'  },
    { path: '/ai',        label: 'AI Predictor',         icon: IconBrain,           color: '#fbbf24', glow: 'rgba(251,191,36,0.35)'  },
    { path: '/telegram',  label: 'Notifications',        icon: IconBell,            color: '#f472b6', glow: 'rgba(244,114,182,0.35)' },
    { path: '/map',       label: 'Hospital Map',         icon: IconMapPin,           color: '#f87171', glow: 'rgba(248,113,113,0.35)' },
    { path: '/reports',   label: 'Analytics',            icon: IconChartBar,         color: '#06b6d4', glow: 'rgba(6,182,212,0.35)'   },
];

export default function Sidebar() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { user, logOut }   = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed]   = useState(false);
    const [tooltip, setTooltip]       = useState<string | null>(null);
    const isLight = theme === 'light';

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);
    useEffect(() => {
        const fn = () => { if (window.innerWidth > 768) setMobileOpen(false); };
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    const W = collapsed ? 68 : 252;

    return (
        <>
            {/* ── Mobile hamburger ── */}
            <motion.button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={mobileOpen ? 'x' : 'm'} initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.15 }}>
                        {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
                    </motion.span>
                </AnimatePresence>
            </motion.button>

            {/* ── Mobile overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
                )}
            </AnimatePresence>

            {/* ── Sidebar shell ── */}
            <motion.aside
                className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
                animate={{ width: W }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                style={{ overflow: 'hidden', width: W }}
            >

                {/* ── Logo ── */}
                <div className="sb-logo-row" style={{ padding: collapsed ? '18px 0' : '18px 16px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <div className="sb-logo-ring">
                        <img src="/logo.jpg" alt="logo" className="sb-logo-img" />
                    </div>
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.div
                                className="sb-brand"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.18 }}
                            >
                                <span className="sb-brand-name">CrisisForge</span>
                                <span className="sb-brand-sub">
                                    <IconShieldHeart size={9} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                                    AI Command Platform
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Live badge ── */}
                <div className="sb-live-bar" style={{ padding: collapsed ? '0 0 8px' : '0 16px 8px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <span className="live-dot" />
                    {!collapsed && <span className="live-label">Live Monitoring Active</span>}
                </div>

                {/* ── Nav ── */}
                <nav className="sb-nav">
                    {!collapsed && <p className="nav-section-label">Menu</p>}
                    {NAV_ITEMS.map((item, i) => {
                        const active = location.pathname === item.path;
                        return (
                            <div key={item.path} style={{ position: 'relative' }}
                                onMouseEnter={() => collapsed && setTooltip(item.label)}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <motion.button
                                    className={`nav-item ${active ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
                                    style={{
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        padding: collapsed ? '10px 0' : '9px 12px',
                                        background: active ? `${item.color}15` : 'transparent',
                                        borderLeft: active ? `3px solid ${item.color}` : '3px solid transparent',
                                        boxShadow: active ? `inset 0 0 16px ${item.glow}` : 'none',
                                    }}
                                >
                                    <span className="nav-icon-wrap" style={{
                                        background: active ? `${item.color}20` : 'transparent',
                                        color: active ? item.color : 'var(--nav-icon-color)',
                                        boxShadow: active ? `0 0 10px ${item.glow}` : 'none',
                                    }}>
                                        <item.icon size={18} stroke={active ? 2 : 1.7} />
                                    </span>
                                    <AnimatePresence initial={false}>
                                        {!collapsed && (
                                            <motion.span
                                                className="nav-label"
                                                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ color: active ? item.color : 'var(--nav-text)', fontWeight: active ? 600 : 450 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {!collapsed && active && (
                                        <motion.span layoutId="chevron" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} style={{ marginLeft: 'auto', color: item.color }}>
                                            <IconChevronRight size={13} />
                                        </motion.span>
                                    )}
                                </motion.button>

                                {/* Tooltip when collapsed */}
                                {collapsed && tooltip === item.label && (
                                    <motion.div
                                        className="nav-tooltip"
                                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                        style={{ borderLeft: `3px solid ${item.color}` }}
                                    >
                                        {item.label}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* ── Collapse toggle ── */}
                <motion.button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260 }}>
                        <IconChevronLeft size={15} />
                    </motion.span>
                    {!collapsed && <span style={{ fontSize: '0.72rem' }}>Collapse</span>}
                </motion.button>

                {/* ── Footer ── */}
                <div className="sb-footer">
                    <motion.button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                        style={{ justifyContent: collapsed ? 'center' : undefined, padding: collapsed ? '9px' : undefined }}
                    >
                        <motion.span animate={{ rotate: isLight ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200 }} style={{ display: 'flex' }}>
                            {isLight ? <IconMoon size={15} style={{ color: '#818cf8' }} /> : <IconSun size={15} style={{ color: '#fbbf24' }} />}
                        </motion.span>
                        {!collapsed && <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>}
                    </motion.button>

                    {user && (
                        <div className="user-card" style={{ padding: collapsed ? '8px 0' : undefined, justifyContent: collapsed ? 'center' : undefined }}>
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=06b6d4&color=fff&bold=true&size=64`}
                                alt="av" className="user-avatar"
                            />
                            <AnimatePresence initial={false}>
                                {!collapsed && (
                                    <motion.div className="user-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <span className="user-name">{user.displayName || 'Health Officer'}</span>
                                        <span className="user-role"><IconActivity size={9} style={{ marginRight: 3 }} />Verified Access</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!collapsed && (
                                <motion.button className="logout-btn" onClick={() => logOut()} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }} title="Sign Out">
                                    <IconLogout size={14} />
                                </motion.button>
                            )}
                        </div>
                    )}

                    {!collapsed && <p className="footer-credit">Built with ♥ by Bit Bandits</p>}
                </div>
            </motion.aside>

            {/* ── Dynamic main content margin ── */}
            <style>{`.main-content { margin-left: ${W}px !important; transition: margin-left 0.4s cubic-bezier(0.4,0,0.2,1); }`}</style>
        </>
    );
}
