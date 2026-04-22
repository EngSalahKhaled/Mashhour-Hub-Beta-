import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, RefreshCw, Filter, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { auth } from '../services/firebase';

const API_URL = 'http://localhost:5000';

export default function SystemLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const resp = await fetch(`${API_URL}/api/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await resp.json();
            if (result.success) setLogs(result.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filtered = logs.filter(l => 
        l.action?.toLowerCase().includes(search.toLowerCase()) || 
        l.user?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>System Activity Logs</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Monitor all administrative actions and security events</p>
                </div>
                <button onClick={fetchLogs} className="btn-ghost flex items-center gap-2">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                        className="input-field pl-10" 
                        placeholder="Search logs by action, user or details..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn-ghost flex items-center gap-2"><Filter size={16} /> Filters</button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Time</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Action</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">User</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Details</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center"><RefreshCw className="animate-spin mx-auto mb-2" /> Loading logs...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-muted">No activity found</td></tr>
                        ) : filtered.map((log, i) => (
                            <motion.tr 
                                key={log.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="p-4 text-xs font-mono text-muted">
                                    {new Date(log.createdAt).toLocaleString('en-GB', { 
                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                    })}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {log.action?.includes('Delete') ? <AlertCircle size={14} className="text-red-400" /> : <ShieldCheck size={14} className="text-emerald-400" />}
                                        <span className="text-sm font-semibold">{log.action || 'Unknown Action'}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/5">{log.user}</span>
                                </td>
                                <td className="p-4 text-xs text-muted max-w-xs truncate" title={log.details}>
                                    {log.details || '—'}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">SUCCESS</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <Info size={16} className="text-blue-400" />
                <p className="text-xs text-blue-400/80">Activity logs are stored for 90 days. For critical security audits, please contact support.</p>
            </div>
        </div>
    );
}
