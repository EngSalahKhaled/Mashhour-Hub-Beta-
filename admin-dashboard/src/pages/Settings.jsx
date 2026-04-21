import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Globe, Shield, Save,
  Loader2, Eye, EyeOff, Check, ChevronRight, Sun, Moon,
  Mail, Phone, Building2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../services/firebase';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  gold:  '#f4cd55',
  cyan:  '#36daf5',
  blue:  '#2a7fe7',
  green: '#5de6b1',
  red:   '#f43f5e',
};

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, color = BRAND.cyan, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={20} color={color} />
        </div>
        <p className="flex-1 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-5 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ user }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success('Profile updated ✓');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard icon={User} title="Profile Information" color={BRAND.cyan} defaultOpen>
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-2xl text-2xl font-bold"
          style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
            border: '2px solid rgba(0,212,255,0.25)',
            color: BRAND.cyan,
          }}
        >
          {(displayName || user?.email || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {displayName || 'Admin User'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: 'rgba(93,230,177,0.1)', color: BRAND.green, border: '1px solid rgba(93,230,177,0.2)' }}
          >
            ✓ Email Verified
          </span>
        </div>
      </div>

      <Field label="Display Name">
        <input
          className="input-field"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
        />
      </Field>

      <Field label="Email Address" hint="Email cannot be changed here — managed through Firebase Auth.">
        <div
          className="input-field flex items-center gap-2 opacity-60 cursor-not-allowed"
          style={{ pointerEvents: 'none' }}
        >
          <Mail size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
        </div>
      </Field>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Profile</>}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────────
function PasswordSection() {
  const [current,  setCurrent]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  const strength = newPass.length === 0 ? 0
    : newPass.length < 6 ? 1
    : newPass.length < 10 ? 2
    : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) && /[^a-zA-Z0-9]/.test(newPass) ? 4
    : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#36daf5', '#5de6b1'];

  const handleChange = async () => {
    if (!current) return toast.error('Enter your current password');
    if (newPass.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPass !== confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      toast.success('Password changed successfully ✓');
      setCurrent(''); setNewPass(''); setConfirm('');
    } catch (err) {
      if (err.code === 'auth/wrong-password') toast.error('Current password is incorrect');
      else toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard icon={Lock} title="Change Password" color={BRAND.gold}>
      <Field label="Current Password">
        <div className="relative">
          <input
            className="input-field pr-10"
            type={showCur ? 'text' : 'password'}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Enter current password"
          />
          <button
            onClick={() => setShowCur(!showCur)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </Field>

      <Field label="New Password">
        <div className="relative">
          <input
            className="input-field pr-10"
            type={showNew ? 'text' : 'password'}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Min. 8 characters"
          />
          <button
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {/* Strength bar */}
        {newPass && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ background: level <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: strengthColor[strength] }}>
              {strengthLabel[strength]}
            </p>
          </div>
        )}
      </Field>

      <Field label="Confirm New Password">
        <div className="relative">
          <input
            className="input-field pr-10"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
          />
          {confirm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {confirm === newPass
                ? <Check size={15} color={BRAND.green} />
                : <AlertCircle size={15} color={BRAND.red} />
              }
            </div>
          )}
        </div>
      </Field>

      <div className="flex justify-end">
        <button onClick={handleChange} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <><Lock size={15} /> Change Password</>}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Appearance Section ───────────────────────────────────────────────────────
function AppearanceSection() {
  const [accent,    setAccent]    = useState('cyan');
  const [density,   setDensity]   = useState('default');

  const accents = [
    { id: 'cyan',   color: '#36daf5', label: 'Cyan' },
    { id: 'gold',   color: '#f4cd55', label: 'Gold' },
    { id: 'blue',   color: '#2a7fe7', label: 'Blue' },
    { id: 'green',  color: '#5de6b1', label: 'Green' },
    { id: 'purple', color: '#a855f7', label: 'Purple' },
  ];

  const densities = [
    { id: 'compact',  label: 'Compact' },
    { id: 'default',  label: 'Default' },
    { id: 'relaxed',  label: 'Relaxed' },
  ];

  return (
    <SectionCard icon={Palette} title="Appearance" color={BRAND.blue}>
      <Field label="Accent Color">
        <div className="flex gap-3 mt-1">
          {accents.map(({ id, color, label }) => (
            <button
              key={id}
              onClick={() => { setAccent(id); toast.success(`Accent: ${label}`); }}
              title={label}
              className="flex flex-col items-center gap-1.5"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div
                className="rounded-xl transition-all duration-200"
                style={{
                  width: 36, height: 36,
                  background: color,
                  border: accent === id ? `3px solid white` : '3px solid transparent',
                  boxShadow: accent === id ? `0 0 12px ${color}60` : 'none',
                  transform: accent === id ? 'scale(1.15)' : 'scale(1)',
                }}
              />
              <span className="text-xs" style={{ color: accent === id ? color : 'var(--text-muted)' }}>{label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Layout Density" hint="Controls spacing and padding across the dashboard.">
        <div className="flex gap-2">
          {densities.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setDensity(id); toast.success(`Density: ${label}`); }}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: density === id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${density === id ? 'rgba(0,212,255,0.3)' : 'rgba(99,179,237,0.1)'}`,
                color: density === id ? BRAND.cyan : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      <div
        className="p-4 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(244,205,85,0.06)', border: '1px solid rgba(244,205,85,0.15)' }}
      >
        <Moon size={16} color={BRAND.gold} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Dashboard always runs in dark mode by design</p>
        </div>
        <div
          className="rounded-full flex items-center"
          style={{ width: 44, height: 24, background: 'rgba(93,230,177,0.2)', padding: '2px' }}
        >
          <div
            className="rounded-full"
            style={{ width: 20, height: 20, background: BRAND.green, marginLeft: 'auto' }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Notifications Section ────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    newLeads: true,
    weeklyReport: false,
    systemAlerts: true,
  });

  const toggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    toast.success('Preference updated');
  };

  const rows = [
    { key: 'newLeads',     label: 'New Lead Submitted',  desc: 'Get notified when a contact form is submitted'  },
    { key: 'weeklyReport', label: 'Weekly Report',       desc: 'Receive a weekly summary of leads & traffic'    },
    { key: 'systemAlerts', label: 'System Alerts',       desc: 'Firebase errors, quota warnings, etc.'         },
  ];

  return (
    <SectionCard icon={Bell} title="Notification Preferences" color={BRAND.green}>
      {rows.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            className="flex-shrink-0 rounded-full transition-all duration-300"
            style={{
              width: 44, height: 24,
              background: prefs[key] ? 'rgba(93,230,177,0.25)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${prefs[key] ? 'rgba(93,230,177,0.4)' : 'rgba(99,179,237,0.15)'}`,
              cursor: 'pointer', position: 'relative', padding: 2,
            }}
          >
            <motion.div
              animate={{ x: prefs[key] ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: prefs[key] ? BRAND.green : 'rgba(255,255,255,0.25)',
              }}
            />
          </button>
        </div>
      ))}
    </SectionCard>
  );
}

// ─── System Info Section ──────────────────────────────────────────────────────
function SystemInfoSection({ user }) {
  const info = [
    { label: 'Project ID',   value: 'mashhour-hub' },
    { label: 'Auth Domain',  value: 'mashhour-hub.firebaseapp.com' },
    { label: 'Admin Email',  value: user?.email || '—' },
    { label: 'Last Sign In', value: user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
    { label: 'UID',          value: user?.uid ? `${user.uid.slice(0, 16)}…` : '—' },
    { label: 'Firebase',     value: 'v10 (Firestore + Auth)' },
  ];

  return (
    <SectionCard icon={Shield} title="System & Firebase Info" color={BRAND.red}>
      <div className="grid grid-cols-2 gap-3">
        {info.map(({ label, value }) => (
          <div
            key={label}
            className="p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,237,0.07)' }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{value}</p>
          </div>
        ))}
      </div>
      <div
        className="p-3 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(93,230,177,0.06)', border: '1px solid rgba(93,230,177,0.2)' }}
      >
        <Check size={16} color={BRAND.green} className="flex-shrink-0" />
        <p className="text-xs" style={{ color: BRAND.green }}>
          Firebase is fully configured and connected. Auth + Firestore are active.
        </p>
      </div>
    </SectionCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your account, appearance and system configuration
        </p>
      </motion.div>

      {/* Sections */}
      <ProfileSection user={user} />
      <PasswordSection />
      <AppearanceSection />
      <NotificationsSection />
      <SystemInfoSection user={user} />
    </div>
  );
}
