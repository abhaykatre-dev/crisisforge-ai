import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconPlayerPlay, IconRefresh, IconFlask, IconVirus,
    IconWorld, IconDroplets, IconUsers, IconAlertTriangle,
    IconChartLine, IconChartBar, IconClockPlay
} from '@tabler/icons-react';
import {
    AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../api';
import type { Scenario, SimulationResult } from '../api';

// Map crisis types to visual accents
const CRISIS_STYLES: Record<string, { color: string; icon: typeof IconVirus; bg: string }> = {
    'covid':        { color: '#ef4444', icon: IconVirus,         bg: 'rgba(239,68,68,0.12)' },
    'earthquake':   { color: '#f59e0b', icon: IconWorld,         bg: 'rgba(245,158,11,0.12)' },
    'flood':        { color: '#3b82f6', icon: IconDroplets,      bg: 'rgba(59,130,246,0.12)' },
    'monsoon':      { color: '#3b82f6', icon: IconDroplets,      bg: 'rgba(59,130,246,0.12)' },
    'staff':        { color: '#8b5cf6', icon: IconUsers,         bg: 'rgba(139,92,246,0.12)' },
    'hazard':       { color: '#ec4899', icon: IconAlertTriangle, bg: 'rgba(236,72,153,0.12)' },
    'default':      { color: '#06b6d4', icon: IconFlask,        bg: 'rgba(6,182,212,0.12)' },
};

const SEVERITY_COLORS: Record<string, string> = {
    critical:      '#ef4444',
    severe:        '#f59e0b',
    moderate:      '#fbbf24',
    catastrophic:  '#ec4899',
    high:          '#f97316',
};

function getCrisisStyle(crisis_type: string) {
    const key = Object.keys(CRISIS_STYLES).find(k => crisis_type.toLowerCase().includes(k));
    return CRISIS_STYLES[key ?? 'default'];
}

function getSeverityColor(severity: string) {
    const key = Object.keys(SEVERITY_COLORS).find(k => severity.toLowerCase().includes(k));
    return SEVERITY_COLORS[key ?? 'moderate'] ?? '#06b6d4';
}

export default function ScenarioBuilder() {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [selected, setSelected] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const [duration, setDuration] = useState(30);
    const [surge, setSurge] = useState(2.0);
    const [basePats, setBasePats] = useState(40);
    const [beds, setBeds] = useState(200);
    const [icu, setIcu] = useState(30);
    const [vents, setVents] = useState(20);

    useEffect(() => {
        api.getScenarios().then(d => {
            setScenarios(d.scenarios);
            if (d.scenarios.length > 0) {
                const first = d.scenarios[0];
                setSelected(first);
                setDuration(first.duration_days);
                setSurge(first.surge_multiplier);
            }
        });
    }, []);

    const handleSelect = (s: Scenario) => {
        setSelected(s);
        setDuration(s.duration_days);
        setSurge(s.surge_multiplier);
        setResult(null);
    };

    const runSimulation = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const res = await api.simulate({
                crisis_type: selected.crisis_type,
                duration_days: duration,
                surge_multiplier: surge,
                base_daily_patients: basePats,
                hospital_beds: beds,
                hospital_icu: icu,
                hospital_ventilators: vents,
            });
            setResult(res);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const inflowData = result
        ? result.inflow_forecast.days.map((d, i) => ({
            day: d,
            predicted: Math.round(result.inflow_forecast.mean[i]),
            baseline: Math.round(result.inflow_forecast.base_no_crisis[i]),
            p90: Math.round(result.inflow_forecast.p90[i]),
        }))
        : [];

    const resourceData = result
        ? result.resource_forecast.days.map((d, i) => ({
            day: d,
            beds: result.resource_forecast.beds_needed[i],
            icu: result.resource_forecast.icu_needed[i],
            ventilators: result.resource_forecast.ventilators_needed[i],
            staff: result.resource_forecast.staff_needed[i],
        }))
        : [];

    const PARAM_ROWS = [
        { label: 'Duration',          unit: 'days',  value: duration,  set: setDuration,  min: 7,  max: 180, color: '#06b6d4', step: 1,   fmt: (v: number) => `${v}` },
        { label: 'Surge Multiplier',  unit: 'x',     value: surge,     set: (v: number) => setSurge(v / 10),  min: 10, max: 50,  color: '#f59e0b', step: 1,   fmt: (v: number) => `${(v / 10).toFixed(1)}×`, rawValue: surge * 10 },
        { label: 'Base Daily Pts.',   unit: 'pts',   value: basePats,  set: setBasePats,  min: 5,  max: 200, color: '#10b981', step: 1,   fmt: (v: number) => `${v}` },
        { label: 'Hospital Beds',     unit: '',      value: beds,      set: setBeds,      min: 10, max: 1000, color: '#3b82f6', step: 10,  fmt: (v: number) => `${v}` },
        { label: 'ICU Beds',          unit: '',      value: icu,       set: setIcu,       min: 1,  max: 200, color: '#8b5cf6', step: 1,   fmt: (v: number) => `${v}` },
        { label: 'Ventilators',       unit: '',      value: vents,     set: setVents,     min: 1,  max: 150, color: '#ec4899', step: 1,   fmt: (v: number) => `${v}` },
    ];

    return (
        <div>
            <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span className="page-header-icon"><IconFlask size={20} /></span>
                    <h2>Scenario Builder</h2>
                </div>
                <p>Configure crisis parameters and generate AI-powered predictive models</p>
            </motion.div>

            <div className="scenario-builder">
                {/* ── Left Panel ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Crisis Presets */}
                    <div className="scenario-panel">
                        <div className="panel-heading">
                            <span className="panel-heading-dot" style={{ background: '#06b6d4' }} />
                            Crisis Presets
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {scenarios.map((s, i) => {
                                const style = getCrisisStyle(s.crisis_type);
                                const sevColor = getSeverityColor(s.severity);
                                const Icon = style.icon;
                                const isActive = selected?.id === s.id;
                                return (
                                    <motion.button
                                        key={s.id}
                                        className={`scenario-preset ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelect(s)}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            borderLeftColor: isActive ? style.color : 'transparent',
                                            background: isActive ? style.bg : 'transparent',
                                        }}
                                    >
                                        <span className="preset-icon-wrap" style={{
                                            background: style.bg,
                                            color: style.color,
                                        }}>
                                            <Icon size={16} />
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                            <div className="preset-name">{s.name}</div>
                                            <div className="preset-meta">
                                                <span className="preset-sev-dot" style={{ background: sevColor }} />
                                                {s.severity} · {s.duration_days}d
                                            </div>
                                        </div>
                                        {isActive && (
                                            <motion.span layoutId="active-check" className="preset-check" style={{ color: style.color }}>
                                                ✓
                                            </motion.span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="scenario-panel">
                        <div className="panel-heading">
                            <span className="panel-heading-dot" style={{ background: '#8b5cf6' }} />
                            Parameters
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {PARAM_ROWS.map(p => {
                                const displayVal = p.rawValue !== undefined ? p.fmt(p.rawValue) : p.fmt(p.value);
                                const sliderVal = p.rawValue !== undefined ? p.rawValue : p.value;
                                const pct = ((sliderVal - p.min) / (p.max - p.min)) * 100;
                                return (
                                    <div key={p.label} className="param-row">
                                        <div className="param-header">
                                            <span className="param-label">{p.label}</span>
                                            <span className="param-value" style={{ color: p.color }}>{displayVal}</span>
                                        </div>
                                        <div className="slider-track-wrap">
                                            <div className="slider-track-fill" style={{ width: `${pct}%`, background: p.color }} />
                                            <input
                                                type="range"
                                                className="form-slider"
                                                min={p.min} max={p.max} step={p.step}
                                                value={sliderVal}
                                                onChange={e => p.set(+e.target.value)}
                                                style={{ '--thumb-color': p.color } as React.CSSProperties}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <motion.button
                            className="run-btn"
                            onClick={runSimulation}
                            disabled={loading || !selected}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {loading
                                ? <><IconRefresh size={17} className="spin" /> Running simulation…</>
                                : <><IconPlayerPlay size={17} /> Run Simulation</>
                            }
                        </motion.button>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {!result && !loading && (
                        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <IconClockPlay size={48} strokeWidth={1} />
                            <p className="empty-title">Ready to Simulate</p>
                            <p className="empty-sub">Select a crisis preset, tune the parameters, then hit Run Simulation to see AI predictions.</p>
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div className="loading-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="loading-spinner" />
                            <p className="loading-text">Running simulation engine…</p>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {result && (
                            <>
                                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="chart-head">
                                        <span className="chart-head-icon" style={{ color: '#06b6d4' }}><IconChartLine size={18} /></span>
                                        <div>
                                            <h3>Patient Inflow Prediction</h3>
                                            <span className="chart-sub">30-day probabilistic forecast</span>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={290}>
                                        <AreaChart data={inflowData}>
                                            <defs>
                                                <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gConf" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, fontSize: 12 }} />
                                            <Area type="monotone" dataKey="p90" stroke="none" fill="url(#gConf)" name="90th Percentile" />
                                            <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Baseline" />
                                            <Area type="monotone" dataKey="predicted" stroke="#06b6d4" fill="url(#gPred)" strokeWidth={2.5} dot={false} name="Predicted Inflow" />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <div className="chart-head">
                                        <span className="chart-head-icon" style={{ color: '#8b5cf6' }}><IconChartBar size={18} /></span>
                                        <div>
                                            <h3>Resource Consumption Forecast</h3>
                                            <span className="chart-sub">Beds · ICU · Staff · Ventilators</span>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={290}>
                                        <LineChart data={resourceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, fontSize: 12 }} />
                                            <Line type="monotone" dataKey="beds"        stroke="#06b6d4" strokeWidth={2} dot={false} name="Beds Needed" />
                                            <Line type="monotone" dataKey="icu"         stroke="#ef4444" strokeWidth={2} dot={false} name="ICU Needed" />
                                            <Line type="monotone" dataKey="ventilators" stroke="#f59e0b" strokeWidth={2} dot={false} name="Ventilators" />
                                            <Line type="monotone" dataKey="staff"       stroke="#8b5cf6" strokeWidth={2} dot={false} name="Staff Needed" />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
