import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────
interface FairnessData {
  overall_fairness_score: number;
  rural_vs_urban_wait_ratio: number;
  avg_rural_wait_min: number;
  avg_urban_wait_min: number;
  records_in_window: number;
  computed_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 10_000;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getColor(score: number): string {
  if (score >= 0.9) return '#10b981';
  if (score >= 0.7) return '#f59e0b';
  return '#ef4444';
}

function getGradient(score: number): string {
  if (score >= 0.9) return 'linear-gradient(135deg, #10b981, #34d399)';
  if (score >= 0.7) return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
  return 'linear-gradient(135deg, #ef4444, #f87171)';
}

function getLabel(score: number): string {
  if (score >= 0.9) return 'EQUITABLE';
  if (score >= 0.7) return 'MODERATE';
  return 'BIASED';
}

function getStatusDesc(score: number): string {
  if (score >= 0.9) return 'Resource allocation is fair across all regions';
  if (score >= 0.7) return 'Minor disparities detected — monitor closely';
  return 'Significant bias detected — intervention required';
}

/** Draw an SVG arc path for the gauge ring. */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// ─── Component ────────────────────────────────────────────────────
export default function FairnessMeter() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [data, setData]       = useState<FairnessData | null>(null);
  const [prev, setPrev]       = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScore = () => {
    fetch(`${API_BASE}/api/fairness/score`)
      .then(r => r.json())
      .then((d: FairnessData) => {
        setPrev(data?.overall_fairness_score ?? null);
        setData(d);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScore();
    intervalRef.current = setInterval(fetchScore, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const SIZE   = 200;
  const cx     = SIZE / 2;
  const cy     = SIZE / 2;
  const R      = 80;
  const STROKE = 13;
  const START  = -135;
  const END    = 135;
  const SWEEP  = END - START;

  const score     = data?.overall_fairness_score ?? 0;
  const fillDeg   = START + SWEEP * score;
  const color     = getColor(score);
  const gradient  = getGradient(score);
  const label     = getLabel(score);
  const desc      = getStatusDesc(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border-subtle)`,
        borderTop: `3px solid ${color}`,
        borderRadius: 0,
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: '1 / -1',
      }}
    >
      {/* Ambient glow behind gauge */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: 'translate(-50%, -50%)',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Left side: Header & Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{
            color: '#64748b',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: 0,
            fontFamily: 'var(--font-mono)',
          }}>
            ◈ FAIRFLOW SCORE
          </p>
        </div>

        {/* Status badge */}
        {!loading && !error && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: color,
              background: `${color}1a`,
              border: `1px solid ${color}55`,
              borderRadius: 2,
              padding: '4px 14px',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)',
            }}>
              {label}
            </span>
            <p style={{
              fontSize: '0.68rem',
              color: isLight ? '#475569' : '#94a3b8',
              margin: '8px 0 0',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.4,
              maxWidth: 200,
            }}>
              {desc}
            </p>
          </motion.div>
        )}

        {error && (
          <p style={{ color: '#ef444499', fontSize: '0.65rem', margin: '12px 0 0' }}>
            Backend unreachable
          </p>
        )}
        
        {/* Live pulse indicator */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: 0.5,
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#10b981',
            animation: 'livePulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.6rem', color: isLight ? '#64748b' : '#475569', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            LIVE · 10s REFRESH
          </span>
        </div>
      </div>

      {/* Center: SVG Gauge */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d={describeArc(cx, cy, R, START, END)}
            fill="none"
            stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const deg = START + SWEEP * t;
            const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
            const inner = R - STROKE;
            const outer = R + STROKE / 2;
            const ix = cx + inner * Math.cos(toRad(deg));
            const iy = cy + inner * Math.sin(toRad(deg));
            const ox = cx + outer * Math.cos(toRad(deg));
            const oy = cy + outer * Math.sin(toRad(deg));
            return (
              <line
                key={t}
                x1={ix} y1={iy} x2={ox} y2={oy}
                stroke={isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)"}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Fill arc */}
          {!loading && !error && (
            <motion.path
              d={describeArc(cx, cy, R, START, fillDeg)}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              initial={{ pathLength: prev !== null ? prev : 0 }}
              animate={{ pathLength: score }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              filter="url(#glow)"
            />
          )}
        </svg>

        {/* Centre text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          {loading ? (
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid #06b6d4',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : error ? (
            <span style={{ fontSize: '1.6rem' }}>⚠</span>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.span
                  key={score}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {(score * 100).toFixed(0)}
                </motion.span>
              </AnimatePresence>
              <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                / 100
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side: Stats grid */}
      {!loading && !error && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(100px, 1fr) minmax(100px, 1fr)',
            gap: 1,
            border: '1px solid var(--border-subtle)',
            background: 'var(--border-subtle)',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
        >
          <StatCell isLight={isLight} label="Rural Wait" value={`${data.avg_rural_wait_min.toFixed(1)}m`} />
          <StatCell isLight={isLight} label="Urban Wait" value={`${data.avg_urban_wait_min.toFixed(1)}m`} />
          <StatCell
            isLight={isLight}
            label="R/U Ratio"
            value={data.rural_vs_urban_wait_ratio.toFixed(3)}
            warn={data.rural_vs_urban_wait_ratio > 1.2}
          />
          <StatCell isLight={isLight} label="Records (24h)" value={String(data.records_in_window)} />
        </motion.div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
    </motion.div>
  );
}

function StatCell({ label, value, warn = false, isLight = false }: { label: string; value: string; warn?: boolean, isLight?: boolean }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4,
      alignItems: 'center',
      textAlign: 'center',
      height: '100%',
    }}>
      <span style={{ fontSize: '0.58rem', color: isLight ? '#64748b' : '#475569', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: warn ? '#f59e0b' : (isLight ? '#1e293b' : '#e2e8f0'), fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}
