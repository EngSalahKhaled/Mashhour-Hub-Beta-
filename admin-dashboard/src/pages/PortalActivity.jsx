import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, User, FileText, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PortalActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/logs/portal`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setLogs(data.data);
        } else {
          toast.error(data.message || 'Error fetching portal activity');
        }
      } catch (err) {
        toast.error('Network error while fetching portal logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionDetails = (action, metadata) => {
    switch (action) {
      case 'USER_LOGGED_IN': return { icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10', text: 'تم تسجيل الدخول' };
      case 'USER_REGISTERED': return { icon: User, color: 'text-emerald-400', bg: 'bg-emerald-500/10', text: 'حساب جديد' };
      case 'INVOICE_DOWNLOADED': return { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', text: `قام بتحميل فاتورة` };
      case 'COURSE_VIEWED': return { icon: Play, color: 'text-amber-400', bg: 'bg-amber-500/10', text: `قام بمشاهدة الكورس` };
      default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10', text: action };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-cyan-400" />
            تتبع نشاط العملاء (Portal Audit Trails)
          </h1>
          <p className="text-slate-400 mt-1">تتبع تحركات العملاء والمؤثرين داخل الـ Portal لمعرفة من يقرأ فواتيرك ويشاهد الأكاديمية.</p>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-slate-700/50 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-slate-400 py-10">لا يوجد أي نشاط مسجل حتى الآن.</div>
        ) : (
          <div className="relative border-r-2 border-slate-700/50 pr-6 mr-3 space-y-8" dir="rtl">
            {logs.map((log, index) => {
              const details = getActionDetails(log.action, log.metadata);
              const Icon = details.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className={`absolute -right-10 top-1 w-8 h-8 rounded-full flex items-center justify-center ${details.bg} ${details.color} border border-slate-800`}>
                    <Icon size={14} />
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-200">
                        {log.metadata?.email || log.userId} 
                        <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md mr-2">{log.userType}</span>
                      </p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className={`text-sm ${details.color}`}>
                      {details.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
