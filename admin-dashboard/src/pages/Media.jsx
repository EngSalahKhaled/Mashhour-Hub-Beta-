import { motion } from 'framer-motion';
import { Upload, Lock, ExternalLink, CheckCircle } from 'lucide-react';

const BLAZE_FEATURES = [
  '5 GB تخزين مجاني',
  '1 GB يومياً تحميل مجاني',
  'رفع ومسح الصور مباشرة',
  'ربط مع مكتبة الوسائط في اللوحة',
];

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Media Library</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>رفع وإدارة الصور عبر Firebase Storage</p>
      </div>

      {/* Upgrade Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 flex flex-col items-center justify-center text-center gap-6 max-w-lg mx-auto mt-10"
        style={{ border: '1px solid rgba(245,158,11,0.25)' }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 72, height: 72,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        >
          <Lock size={32} color="#f59e0b" />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Firebase Storage غير مفعّل
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            خاصية رفع الصور تحتاج ترقية مشروعك إلى{' '}
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Blaze Plan</span>
            {' '}في Firebase.
            <br />
            الترقية مجانية وبتدفع بس لو تعديت الحد المجاني.
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 text-right w-full max-w-xs">
          {BLAZE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle size={16} color="#10b981" className="flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="https://console.firebase.google.com/project/mashhour-hub/usage/details"
          target="_blank"
          rel="noreferrer"
          className="btn-primary gap-2"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)' }}
        >
          <ExternalLink size={16} />
          ترقية المشروع على Firebase Console
        </a>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          بعد الترقية يوصلني وأفعّل الـ Storage في ثانية واحدة ✅
        </p>
      </motion.div>

      {/* Info note */}
      <div
        className="glass-card p-4 max-w-lg mx-auto flex items-start gap-3"
        style={{ border: '1px solid rgba(0,212,255,0.15)' }}
      >
        <Upload size={18} color="var(--accent-cyan)" className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            باقي اللوحة شغّالة بالكامل ✅
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            الـ Auth، Firestore، الـ Leads، والـ CMS كلها شغّالة. الـ Media Library بس اللي محتاج Blaze.
          </p>
        </div>
      </div>
    </div>
  );
}
