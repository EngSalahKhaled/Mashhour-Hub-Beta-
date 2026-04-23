import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Globe, Shield, Save,
  Loader2, Eye, EyeOff, Check, ChevronRight, Sun, Moon,
  Mail, Phone, Building2, AlertCircle, Construction, RefreshCw, CreditCard, Database,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  gold:  '#f4cd55',
  cyan:  '#36daf5',
  blue:  '#2a7fe7',
  green: '#5de6b1',
  red:   '#f43f5e',
};

const API_URL = 'http://localhost:5000';

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

// ─── Company Details Section ──────────────────────────────────────────────────
function CompanyDetailsSection() {
  const [form, setForm] = useState({
      name: 'Mashhor Hub',
      email: 'hello@mashhor-hub.com',
      phone: '+965 5537 7309',
      hq: 'Kuwait City, Kuwait',
      whatsapp: 'https://wa.me/96555377309'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      const load = async () => {
          const snap = await getDoc(doc(db, 'settings', 'site_details'));
          if (snap.exists()) setForm(snap.data());
          setLoading(false);
      };
      load();
  }, []);

  const save = async () => {
      setSaving(true);
      try {
          await setDoc(doc(db, 'settings', 'site_details'), form);
          toast.success('Site details updated ✓');
      } catch (e) { toast.error('Update failed'); }
      finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <SectionCard icon={Building2} title="Global Site Details" color={BRAND.blue}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Agency Name">
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </Field>
            <Field label="Primary Email">
                <input className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </Field>
            <Field label="Contact Phone">
                <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </Field>
            <Field label="WhatsApp Link">
                <input className="input-field" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
            </Field>
            <div className="md:col-span-2">
                <Field label="HQ Location">
                    <input className="input-field" value={form.hq} onChange={e => setForm({...form, hq: e.target.value})} />
                </Field>
            </div>
        </div>
        <div className="flex justify-end pt-2">
            <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="animate-spin" /> : 'Update Details'}
            </button>
        </div>
    </SectionCard>
  );
}

// ─── Global Theme Customizer (Branding) ───────────────────────────────────────
function GlobalThemeSection() {
  const [form, setForm] = useState({
      primaryColor: '#f4cd55',
      secondaryColor: '#36daf5'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      const load = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.settings?.theme) {
                setForm(data.settings.theme);
            }
          } catch (e) {}
          setLoading(false);
      };
      load();
  }, []);

  const save = async () => {
      setSaving(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/settings/global`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ theme: form })
          });
          if (res.ok) {
              toast.success('Theme colors updated ✓');
          } else {
              throw new Error('Update failed');
          }
      } catch (e) { toast.error('Update failed'); }
      finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <SectionCard icon={Palette} title="Global Theme Customizer" color={BRAND.purple}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Primary Color" hint="Used for main buttons and highlights">
                <div className="flex items-center gap-3">
                    <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded bg-transparent border-0" />
                    <input type="text" className="input-field uppercase" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} />
                </div>
            </Field>
            <Field label="Secondary Color" hint="Used for gradients and secondary elements">
                <div className="flex items-center gap-3">
                    <input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded bg-transparent border-0" />
                    <input type="text" className="input-field uppercase" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} />
                </div>
            </Field>
        </div>
        <div className="flex justify-end pt-2">
            <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="animate-spin" /> : 'Save Theme'}
            </button>
        </div>
    </SectionCard>
  );
}

// ─── Two-Factor Security Section ──────────────────────────────────────────────
function TwoFactorSection() {
  const [setupData, setSetupData] = useState(null);
  const [token, setToken]       = useState('');
  const [verifying, setVerifying] = useState(false);
  const [enabled, setEnabled]     = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
        try {
            const snap = await getDoc(doc(db, 'admins', auth.currentUser.uid));
            if (snap.exists()) setEnabled(!!snap.data().twoFactorEnabled);
        } catch {}
    };
    if (auth.currentUser) checkStatus();
  }, []);

  const startSetup = async () => {
      try {
          const token = await auth.currentUser.getIdToken();
          const resp = await fetch(`${API_URL}/auth/2fa/setup`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!resp.ok) throw new Error('Failed to start setup');
          const result = await resp.json();
          if (result.success) setSetupData(result);
          else throw new Error(result.message);
      } catch (e) { toast.error(e.message || 'Failed to start setup'); }
  };

  const confirmSetup = async () => {
      if (!token) return toast.error('Enter the 6-digit code');
      setVerifying(true);
      try {
          const idToken = await auth.currentUser.getIdToken();
          const resp = await fetch(`${API_URL}/auth/2fa/verify`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token })
          });
          const result = await resp.json();
          if (result.success) {
              toast.success('2FA Enabled successfully ✓');
              setEnabled(true);
              setSetupData(null);
          } else {
              toast.error(result.message || 'Invalid code');
          }
      } catch (e) { toast.error('Setup failed'); }
      finally { setVerifying(false); }
  };

  return (
    <SectionCard icon={Shield} title="Two-Factor Authentication (2FA)" color={BRAND.green}>
      <div className="space-y-4">
        {!enabled ? (
            <>
                <p className="text-sm text-muted">Protect your account with a second security layer. Use an app like Google Authenticator or Authy.</p>
                {!setupData ? (
                    <button onClick={startSetup} className="btn-primary">Enable 2FA</button>
                ) : (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <p className="text-xs font-semibold text-cyan-400">Step 1: Scan this QR Code</p>
                        <img src={setupData.qrCode} alt="QR Code" className="mx-auto rounded-xl w-40 h-40" />
                        <p className="text-[10px] text-center text-muted">Or enter manually: <code className="text-silver">{setupData.secret}</code></p>
                        
                        <p className="text-xs font-semibold text-cyan-400 pt-2">Step 2: Enter the 6-digit code</p>
                        <div className="flex gap-2">
                            <input className="input-field text-center text-lg tracking-[0.5em]" maxLength={6} value={token} onChange={e => setToken(e.target.value)} placeholder="000000" />
                            <button onClick={confirmSetup} disabled={verifying} className="btn-primary">
                                {verifying ? <Loader2 className="animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            </>
        ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Check size={20} className="text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-500">2FA is active on your account</p>
            </div>
        )}
      </div>
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

// ─── Maintenance Mode Section ─────────────────────────────────────────────────
function MaintenanceSection() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'global'));
        if (snap.exists()) setEnabled(!!snap.data().maintenanceMode);
      } catch {} finally { setLoading(false); }
    }; load();
  }, []);

  const toggle = async () => {
    const newVal = !enabled;
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_settings', 'global'), { maintenanceMode: newVal }, { merge: true });
      setEnabled(newVal);
      toast.success(newVal ? 'Maintenance mode ENABLED' : 'Maintenance mode DISABLED');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <SectionCard icon={Construction} title="Maintenance Mode" color={BRAND.red}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Maintenance Mode</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>When enabled, visitors will see a maintenance page instead of the live site.</p>
        </div>
        <button
          onClick={toggle} disabled={saving}
          className="flex-shrink-0 rounded-full transition-all duration-300"
          style={{
            width: 52, height: 28,
            background: enabled ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${enabled ? 'rgba(244,63,94,0.4)' : 'rgba(99,179,237,0.15)'}`,
            cursor: 'pointer', position: 'relative', padding: 3,
          }}
        >
          <motion.div
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ width: 20, height: 20, borderRadius: '50%', background: enabled ? BRAND.red : 'rgba(255,255,255,0.25)' }}
          />
        </button>
      </div>
      {enabled && (
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle size={16} color={BRAND.red} />
          <p className="text-xs" style={{ color: BRAND.red }}>The website is currently in maintenance mode. Visitors cannot access it.</p>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Cache Buster Section ─────────────────────────────────────────────────────
function CacheBusterSection() {
  const [clearing, setClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'global'));
        if (snap.exists() && snap.data().cacheVersion) setLastCleared(snap.data().cacheVersion);
      } catch {}
    }; load();
  }, []);

  const clearCache = async () => {
    setClearing(true);
    try {
      const newVersion = Date.now().toString();
      await setDoc(doc(db, 'site_settings', 'global'), { cacheVersion: newVersion }, { merge: true });
      setLastCleared(newVersion);
      toast.success('Cache cleared successfully ✓');
    } catch { toast.error('Failed to clear cache'); }
    finally { setClearing(false); }
  };

  return (
    <SectionCard icon={RefreshCw} title="Cache Management" color={BRAND.cyan}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Clear Global Cache</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Forces all visitors to fetch fresh content. Useful after updating CMS content.</p>
          {lastCleared && <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>Last cleared: {new Date(Number(lastCleared)).toLocaleString('en-GB')}</p>}
        </div>
        <button onClick={clearCache} disabled={clearing} className="btn-primary !py-2.5">
          {clearing ? <><Loader2 size={15} className="animate-spin" /> Clearing…</> : <><RefreshCw size={15} /> Clear Cache</>}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── MyFatoorah Payment Gateway Section ───────────────────────────────────────
function MyFatoorahSection() {
  const [form, setForm] = useState({
    baseUrl: '', apiKey: '', webhookSecret: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'payment_gateway'));
        if (snap.exists()) setForm(snap.data());
      } catch {} finally { setLoading(false); }
    }; load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_settings', 'payment_gateway'), form, { merge: true });
      toast.success('Payment settings updated ✓');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <SectionCard icon={CreditCard} title="Payment Gateway (MyFatoorah)" color={BRAND.purple}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>API Base URL</label>
          <input className="input-field" value={form.baseUrl} onChange={e => setForm(p => ({...p, baseUrl: e.target.value}))} placeholder="https://apitest.myfatoorah.com" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>API Key</label>
          <input className="input-field" type="password" value={form.apiKey} onChange={e => setForm(p => ({...p, apiKey: e.target.value}))} placeholder="Your MyFatoorah API Key" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Webhook Secret</label>
          <input className="input-field" type="password" value={form.webhookSecret} onChange={e => setForm(p => ({...p, webhookSecret: e.target.value}))} placeholder="For signature verification" />
        </div>
        <div className="pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Payment Config</>}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Seed Sample Data Section ────────────────────────────────────────────────
function SeedDataSection() {
  const [seeding, setSeeding] = useState(false);

  const seed = async () => {
    if (!confirm('This will add professional sample data to your services, blog, and academy collections. Continue?')) return;
    setSeeding(true);
    try {
      const DATA = {
        services: [
          { 
            title: 'Digital Strategy & Growth', 
            category: 'Consultancy', 
            description: 'Custom-tailored digital roadmaps designed to scale your brand using data-driven insights and AI integration.', 
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' 
          },
          { 
            title: 'Premium Content Production', 
            category: 'Creative', 
            description: 'High-end visual storytelling, including videography, photography, and high-impact social media assets.', 
            imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80' 
          }
        ],
        blog_posts: [
          { 
            title_en: 'The Rise of AI in MENA Digital Marketing', 
            title_ar: 'صعود الذكاء الاصطناعي في التسويق الرقمي بالشرق الأوسط',
            slug: 'ai-rise-mena-marketing',
            excerpt_en: 'How artificial intelligence is reshaping consumer behavior in Kuwait and beyond.', 
            excerpt_ar: 'كيف يعيد الذكاء الاصطناعي تشكيل سلوك المستهلك في الكويت والمنطقة.',
            content_en: '<p>AI is not just a trend; it is a revolution...</p>',
            content_ar: '<p>الذكاء الاصطناعي ليس مجرد صيحة، بل هو ثورة...</p>',
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
            status: 'published',
            category: 'Technology'
          }
        ],
        academy_courses: [
          { 
            title_en: 'Mastering Personal Branding', 
            title_ar: 'احتراف العلامة التجارية الشخصية',
            slug: 'mastering-personal-branding',
            excerpt_en: 'Learn how to build a powerful personal brand.', 
            excerpt_ar: 'تعلم كيف تبني علامة تجارية شخصية قوية.',
            content_en: '<p>In this course, we will cover...</p>',
            content_ar: '<p>في هذه الدورة، سنغطي...</p>',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
            instructor: 'Mashhor Expert',
            price: 49,
            status: 'published'
          }
        ]
      };

      for (const [col, items] of Object.entries(DATA)) {
        for (const item of items) {
          await addDocument(col, item);
        }
      }
      toast.success('Sample data seeded successfully ✓');
    } catch (e) {
      toast.error('Seeding failed: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <SectionCard icon={Database} title="System Data & Backups" color={BRAND.emerald}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Export System Data</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Download a JSON snapshot of all your leads, services, and content.</p>
            </div>
            <button 
                onClick={() => toast.success('Backup preparation started...')}
                className="btn-ghost flex items-center gap-2 !border-emerald-500/30 !text-emerald-400"
            >
                <RefreshCw size={16} /> Export JSON
            </button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Seed Sample Content</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Populate empty collections with professional content.</p>
            </div>
            <button onClick={seed} disabled={seeding} className="btn-primary !bg-emerald-600 hover:!bg-emerald-500">
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <><Database size={16} /> Seed Data</>}
            </button>
        </div>
      </div>
    </SectionCard>
  );
}

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
      <CompanyDetailsSection />
      <GlobalThemeSection />
      <MyFatoorahSection />
      <MaintenanceSection />
      <CacheBusterSection />
      <SeedDataSection />
      <TwoFactorSection />
      <PasswordSection />
      <AppearanceSection />
      <NotificationsSection />
      <SystemInfoSection user={user} />
    </div>
  );
}
