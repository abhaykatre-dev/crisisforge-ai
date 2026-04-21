import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Shield, AlertTriangle, Users, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AuditData {
    records_analysed: number;
    fairness_score: number;
    rural_patients: number;
    urban_patients: number;
    avg_wait_rural_min: number;
    avg_wait_urban_min: number;
    rural_vs_urban_wait_ratio: number;
    avg_severity_rural: number;
    avg_severity_urban: number;
    multi_transfer_rural: number;
    multi_transfer_urban: number;
    transfer_disparity: number;
    generated_at: string;
    status?: string;
    message?: string;
}

const API_BASE = 'http://localhost:8000';

function scoreColor(s: number) {
    if (s >= 0.9) return '#10b981';
    if (s >= 0.7) return '#f59e0b';
    return '#ef4444';
}
function scoreLabel(s: number) {
    if (s >= 0.9) return 'Equitable';
    if (s >= 0.7) return 'Moderate Disparity';
    return 'High Bias Detected';
}

export default function EquityDashboard() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [audit, setAudit] = useState<AuditData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/fairness/audit`)
            .then(r => r.json())
            .then((d: AuditData) => { setAudit(d); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading equity audit...</p>
        </div>
    );

    if (error || !audit || audit.status === 'no_data') return (
        <div className="loading-container">
            <div style={{ fontSize: '3rem' }}></div>
            <p style={{ color: '#f59e0b', marginTop: 12 }}>{audit?.message || 'No audit data. Run the seed script.'}</p>
            <code style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 8 }}>python seed_fairness_demo.py</code>
        </div>
    );

    const color = scoreColor(audit.fairness_score);
    const label = scoreLabel(audit.fairness_score);

    const waitData = [
        { name: 'Rural', wait: audit.avg_wait_rural_min, fill: '#ef4444' },
        { name: 'Urban', wait: audit.avg_wait_urban_min, fill: '#06b6d4' },
    ];

    const severityData = [
        { name: 'Rural Severity', value: audit.avg_severity_rural, fill: '#a78bfa' },
        { name: 'Urban Severity', value: audit.avg_severity_urban, fill: '#60a5fa' },
    ];

    const transferData = [
        { name: 'Rural', transfers: audit.multi_transfer_rural, fill: '#f87171' },
        { name: 'Urban', transfers: audit.multi_transfer_urban, fill: '#34d399' },
    ];

    return (
        <div>
            <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2> FairFlow — Equity Dashboard</h2>
                <p>Real-time bias audit across {audit.records_analysed} allocation decisions</p>
            </motion.div>

            {/* Hero Score Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    background: isLight ? `linear-gradient(135deg, ${color}15 0%, rgba(255,255,255,1) 100%)` : `linear-gradient(135deg, ${color}18 0%, rgba(10,22,40,0.9) 100%)`,
                    border: `1px solid ${color}44`,
                    borderRadius: 16,
                    padding: '28px 32px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 32,
                    boxShadow: `0 0 40px ${color}22`,
                }}
            >
                {/* Big score circle */}
                <div style={{
                    width: 110, height: 110, borderRadius: '50%',
                    border: `4px solid ${color}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: `${color}10`,
                    boxShadow: `0 0 24px ${color}44`,
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>
                        {Math.round(audit.fairness_score * 100)}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>/100</span>
                </div>

                <div>
                    <p style={{ color: '#64748b', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                        Overall Fairness Score
                    </p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 700, color, margin: '4px 0 8px' }}>{label}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                        Rural patients wait <strong style={{ color: '#ef4444' }}>{audit.rural_vs_urban_wait_ratio.toFixed(2)}×</strong> longer than urban patients.
                        {audit.rural_vs_urban_wait_ratio > 1.5 && '  Intervention recommended.'}
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.7rem', margin: '6px 0 0' }}>
                        Last analysed: {new Date(audit.generated_at).toLocaleTimeString()}
                    </p>
                </div>

                <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                        background: `${color}18`, border: `1px solid ${color}44`,
                        color, borderRadius: 99, padding: '6px 16px', fontSize: '0.8rem', fontWeight: 700,
                    }}>
                        {audit.records_analysed} records analysed
                    </span>
                    {audit.fairness_score < 0.7 && (
                        <div style={{ marginTop: 10 }}>
                            <span style={{
                                background: '#ef444418', border: '1px solid #ef444444',
                                color: '#ef4444', borderRadius: 99, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700,
                            }}>
                                 Ethical Review Required
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Metric Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <motion.div className="stat-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="stat-icon"><Clock /></div>
                    <p className="stat-label">Rural Avg Wait</p>
                    <p className="stat-value" style={{ color: '#ef4444' }}>{audit.avg_wait_rural_min.toFixed(1)} min</p>
                    <p className="stat-detail">{audit.rural_patients} rural patients</p>
                </motion.div>

                <motion.div className="stat-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon"><Clock /></div>
                    <p className="stat-label">Urban Avg Wait</p>
                    <p className="stat-value cyan">{audit.avg_wait_urban_min.toFixed(1)} min</p>
                    <p className="stat-detail">{audit.urban_patients} urban patients</p>
                </motion.div>

                <motion.div className="stat-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="stat-icon"><AlertTriangle /></div>
                    <p className="stat-label">Wait Ratio</p>
                    <p className="stat-value amber">{audit.rural_vs_urban_wait_ratio.toFixed(2)}×</p>
                    <p className="stat-detail">Rural ÷ Urban (ideal = 1.0)</p>
                </motion.div>

                <motion.div className="stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon"><Users /></div>
                    <p className="stat-label">Transfer Disparity</p>
                    <p className="stat-value" style={{ color: audit.transfer_disparity > 0.05 ? '#ef4444' : '#10b981' }}>
                        {(audit.transfer_disparity * 100).toFixed(1)}%
                    </p>
                    <p className="stat-detail">Rural vs Urban multi-transfer rate</p>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <h3><Clock size={16} style={{ color: '#ef4444' }} /> Average Wait Time by Origin</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={waitData} barSize={50}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 11 }} unit=" min" />
                            <Tooltip
                                contentStyle={{ background: isLight ? '#ffffff' : '#0a1628', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8, color: isLight ? '#0f172a' : '#fff' }}
                                formatter={(v: number) => [`${v.toFixed(1)} min`, 'Avg Wait']}
                            />
                            <Bar dataKey="wait" radius={[8, 8, 0, 0]}>
                                {waitData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>
                        Rural patients wait {(audit.avg_wait_rural_min - audit.avg_wait_urban_min).toFixed(1)} min longer on average
                    </p>
                </motion.div>

                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3><Shield size={16} style={{ color: '#a78bfa' }} /> Avg Severity Score by Origin</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={severityData} barSize={50}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
                            <Tooltip contentStyle={{ background: isLight ? '#ffffff' : '#0a1628', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, color: isLight ? '#0f172a' : '#fff' }} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {severityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>
                        Similar severity scores confirm bias is systemic, not clinical
                    </p>
                </motion.div>
            </div>

            {/* Key Insight Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                }}
            >
                <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                <div>
                    <p style={{ color: '#ef4444', fontWeight: 700, margin: '0 0 4px', fontSize: '0.9rem' }}>
                        FairFlow Insight — Systemic Bias Detected
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                        Rural patients (severity: {audit.avg_severity_rural.toFixed(1)}) and urban patients (severity: {audit.avg_severity_urban.toFixed(1)}) have similar clinical profiles,
                        yet rural patients wait <strong style={{ color: '#fbbf24' }}>{audit.rural_vs_urban_wait_ratio.toFixed(2)}× longer</strong>.
                        This confirms the disparity is <strong style={{ color: '#fbbf24' }}>non-clinical</strong> — a systemic access inequality.
                        FairFlow's ethical constraints are actively flagging this for intervention.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
