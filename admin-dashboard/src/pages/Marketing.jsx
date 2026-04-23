import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, AlertCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketingPage() {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !htmlBody.trim()) {
      toast.error('الرجاء إدخال عنوان ومحتوى الرسالة');
      return;
    }

    if (!window.confirm('هل أنت متأكد من إرسال هذه الرسالة لجميع العملاء في هذه الشريحة؟')) {
      return;
    }

    setLoading(true);
    setStats(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/marketing/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, htmlBody, segment })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل إرسال النشرة البريدية');

      toast.success('تم الإرسال بنجاح!');
      setStats(data.stats);
      setSubject('');
      setHtmlBody('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Mail className="text-cyan-400" />
            أتمتة التسويق (النشرات البريدية)
          </h1>
          <p className="text-slate-400 mt-1">
            إرسال رسائل بريدية مجمعة للعملاء والمشتركين في النشرة.
          </p>
        </div>
      </div>

      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الشريحة المستهدفة (الجمهور)</label>
            <div className="relative">
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-3 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">جميع العملاء والمشتركين (All Leads)</option>
                <option value="newsletter">المشتركين في النشرة فقط (Newsletter)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">عنوان الرسالة (Subject)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: عرض حصري لعملاء مشهور هب بمناسبة العيد"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">محتوى الرسالة (يدعم HTML)</label>
            <textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              rows={8}
              placeholder="<h1>مرحباً بك!</h1><p>لدينا عرض مميز لك...</p>"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500"
              dir="ltr"
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              يمكنك استخدام وسوم HTML لتنسيق الرسالة. سيتم تغليف المحتوى داخل قالب مشهور هب الرسمي (الهيدر والفوتر).
            </p>
          </div>

          {stats && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h3 className="text-emerald-400 font-bold mb-2">تقرير الإرسال:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>إجمالي المستهدفين: {stats.totalAttempted}</li>
                <li className="text-emerald-400">نجاح: {stats.successCount}</li>
                <li className="text-red-400">فشل: {stats.failCount}</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? 'جاري الإرسال...' : 'إرسال النشرة البريدية'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
