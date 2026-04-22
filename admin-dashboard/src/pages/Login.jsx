import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const [show2FA, setShow2FA]   = useState(false);
  const [mfaCode, setMfaCode]   = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const userCred = await login(email, password);
      
      // Check if user has 2FA enabled via backend
      const token = await userCred.user.getIdToken();
      localStorage.setItem('token', token); // Store token immediately for 2FA check
      
      const resp = await fetch(`${window.location.origin.replace('3000', '5000')}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await resp.json();
      
      if (result.user.customClaims?.twoFactorEnabled) {
          setShow2FA(true);
          toast.success('Credential valid. Enter 2FA code.');
      } else {
          toast.success('Welcome back! 👋');
          navigate('/');
      }
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
      e.preventDefault();
      setMfaLoading(true);
      try {
          const resp = await fetch(`${window.location.origin.replace('3000', '5000')}/api/auth/2fa/login-check`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token: mfaCode })
          });
          const result = await resp.json();
          if (result.success) {
              toast.success('Security check passed ✓');
              navigate('/');
          } else {
              toast.error('Invalid security code');
          }
      } catch (e) { toast.error('Verification failed'); }
      finally { setMfaLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,212,255,0.07) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(124,58,237,0.07) 0%, transparent 55%),
          #0a0f1e
        `,
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 rounded-full"
          style={{
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 rounded-full"
          style={{
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div
          className="glass-card border-gradient p-8 relative overflow-hidden"
        >
          {/* Subtle top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }}
          />

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center justify-center rounded-2xl mb-4"
              style={{
                width: 60, height: 60,
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>M</span>
            </motion.div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Mashhor Hub
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Admin Console — Secure Access
            </p>
          </div>

          {/* Form */}
          {!show2FA ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ left: 14, color: 'var(--text-muted)' }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@mashhorbhub.com"
                      className="input-field pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ left: 14, color: 'var(--text-muted)' }}
                    />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="input-field pl-10 pr-12"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="btn-primary w-full py-3 mt-2"
                  style={{ opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </motion.button>
              </form>
          ) : (
              <form onSubmit={handleVerify2FA} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Enter 6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold py-4"
                    autoFocus
                    required
                  />
                </div>
                <motion.button
                    type="submit"
                    disabled={mfaLoading}
                    className="btn-primary w-full py-3"
                >
                    {mfaLoading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                </motion.button>
                <button type="button" onClick={() => setShow2FA(false)} className="w-full text-xs text-muted hover:text-white">Go Back</button>
              </form>
          )}

          {/* Security note */}
          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            🔒 Protected by Firebase Authentication
          </p>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Mashhor Hub. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
