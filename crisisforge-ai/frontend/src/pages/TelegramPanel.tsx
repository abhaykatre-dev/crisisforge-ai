import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Bell, RefreshCw, AlertTriangle, Ambulance, CheckCircle2, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { api } from '../api';
import { useTheme } from '../contexts/ThemeContext';

export default function TelegramPanel() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [botToken, setBotToken] = useState('8713401692:AAG25sDsrG9h2OwnI4tPUr9Zedvp6P_Zybs');
    const [chatId, setChatId] = useState('6906252580');
    const [messageType, setMessageType] = useState('alerts');
    const [customMessage, setCustomMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [preview, setPreview] = useState('');
    const [status, setStatus] = useState<Record<string, unknown> | null>(null);
    const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

    useEffect(() => {
        api.telegramStatus().then(setStatus).catch(() => { });
        loadPreview('alerts');
    }, []);

    const loadPreview = async (type: string) => {
        try {
            const res = await api.telegramPreview(type);
            setPreview(res.preview);
        } catch (err) { setPreview('Failed to load preview'); }
    };

    const handleTypeChange = (type: string) => {
        setMessageType(type);
        loadPreview(type);
    };

    const sendMessage = async () => {
        setSending(true);
        setResult(null);
        try {
            const res = await api.telegramSend({
                bot_token: botToken,
                chat_id: chatId,
                message_type: messageType,
                custom_message: customMessage,
            });
            const apiResult = res.result as Record<string, unknown>;
            setResult({ success: !!apiResult.success, message: apiResult.success ? 'Message sent! ' : String(apiResult.error || 'Send failed') });
        } catch (err: any) {
            setResult({ success: false, message: err.message || 'Failed to send' });
        }
        setSending(false);
    };

    return (
        <div>
            <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--accent-cyan)' }}><Bell size={18} /></span>
                    <h2>Notifications Center</h2>
                </div>
                <p>Multi-channel crisis alert management — Push, Email &amp; SMS</p>
            </motion.div>

            {/* Notification Channel Tabs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ display: 'flex', gap: 12, marginBottom: 24 }}
            >
                {/* Push — Active */}
                <div style={{
                    flex: 1, padding: '14px 18px', borderRadius: 14,
                    background: isLight ? '#f0f4fc' : 'rgba(6,182,212,0.08)',
                    border: '2px solid rgba(6,182,212,0.35)',
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    boxShadow: isLight ? '0 2px 14px rgba(6,182,212,0.15)' : 'none',
                }}>
                    <Smartphone size={20} style={{ color: '#06b6d4', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Push Notifications</p>
                        <p style={{ fontSize: '0.72rem', color: '#06b6d4', margin: '3px 0 0' }}> Active — via Telegram Bot API</p>
                    </div>
                </div>

                {/* Email — Planned */}
                <div style={{
                    flex: 1, padding: '14px 18px', borderRadius: 14,
                    background: isLight ? '#f0f4fc' : 'var(--bg-card)',
                    border: isLight ? '1.5px solid rgba(139,92,246,0.25)' : '1.5px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: isLight ? '0 2px 12px rgba(12,26,46,0.08)' : 'var(--shadow-card)',
                }}>
                    <Mail size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Email Alerts</p>
                        <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-muted)', margin: '3px 0 0' }}>SendGrid API — Planned</p>
                    </div>
                </div>

                {/* SMS — Planned */}
                <div style={{
                    flex: 1, padding: '14px 18px', borderRadius: 14,
                    background: isLight ? '#f0f4fc' : 'var(--bg-card)',
                    border: isLight ? '1.5px solid rgba(16,185,129,0.25)' : '1.5px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: isLight ? '0 2px 12px rgba(12,26,46,0.08)' : 'var(--shadow-card)',
                }}>
                    <MessageSquare size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>SMS Alerts</p>
                        <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-muted)', margin: '3px 0 0' }}>Twilio API — Planned</p>
                    </div>
                </div>
            </motion.div>

            <div className="charts-grid">
                {/* Configuration */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 style={{ marginBottom: 16 }}><Bot size={18} style={{ color: '#06b6d4' }} /> Bot Configuration</h3>

                    <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 16, borderLeft: '3px solid #10b981' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 0 }}>
                            <CheckCircle2 size={14} style={{ color: '#10b981', display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                            System connected to CrisisForge Command Channel. Operator interventions are actively monitored.
                        </p>
                    </div>

                    {/* Message Type */}
                    <h4 style={{ margin: '16px 0 8px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message Type</h4>
                    <div className="tab-group" style={{ width: '100%' }}>
                        <button className={`tab-btn ${messageType === 'alerts' ? 'active' : ''}`} onClick={() => handleTypeChange('alerts')}>
                            <Bell size={14} /> Alerts
                        </button>
                        <button className={`tab-btn ${messageType === 'transfers' ? 'active' : ''}`} onClick={() => handleTypeChange('transfers')}>
                            <Ambulance size={14} /> Transfers
                        </button>
                        <button className={`tab-btn ${messageType === 'custom' ? 'active' : ''}`} onClick={() => handleTypeChange('custom')}>
                            <Send size={14} /> Custom
                        </button>
                    </div>

                    {messageType === 'custom' && (
                        <textarea
                            placeholder="Enter your custom message..."
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 14px', marginTop: 12,
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)', borderRadius: 8,
                                color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical',
                            }}
                        />
                    )}

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={sendMessage} disabled={sending}>
                        {sending ? <><RefreshCw size={16} /> Sending...</> : <><Send size={16} /> Send Telegram Alert</>}
                    </button>

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            {result.success ? <CheckCircle2 size={16} style={{ color: '#10b981' }} /> : <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
                            <span style={{ color: result.success ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>{result.message}</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Preview */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 style={{ marginBottom: 16 }}>📝 Message Preview</h3>
                    <pre style={{
                        background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8,
                        fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.6,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        border: '1px solid var(--border-subtle)',
                        maxHeight: 500, overflowY: 'auto',
                    }}>
                        {preview || 'Loading preview...'}
                    </pre>

                    {/* Alert Thresholds */}
                    <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alert Thresholds</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                { label: 'Bed Critical', value: '90%', color: '#ef4444' },
                                { label: 'Bed Warning', value: '80%', color: '#f59e0b' },
                                { label: 'ICU Critical', value: '85%', color: '#ef4444' },
                                { label: 'ICU Warning', value: '75%', color: '#f59e0b' },
                                { label: 'Ventilator', value: '85%', color: '#ef4444' },
                                { label: 'Staff', value: '90%', color: '#f59e0b' },
                            ].map((t, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.label}</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: t.color }}>{t.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bot Status */}
                    <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            Bot Status: {status ? (status.configured ? ' Configured (env vars)' : ' Not configured — use the form above') : ' Checking...'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
