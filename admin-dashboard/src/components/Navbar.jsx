import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Globe, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getInitials = (email = '') => email.slice(0, 2).toUpperCase();

export default function Navbar({ onMenuClick, dir, onToggleDir }) {
  const { user }         = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Real-time listener for notifications
    const fetchNotifications = async () => {
        try {
            const resp = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await resp.json();
            if (result.success) {
                setNotifications(result.data);
                setUnreadCount(result.data.filter(n => !n.read).length);
            }
        } catch (e) { console.error('Notify fail', e); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
      await fetch('/api/notifications/clear-all', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({...n, read: true})));
      setUnreadCount(0);
  };

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 gap-4"
      style={{
        height: 'var(--navbar-height)',
        background: 'rgba(13, 21, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,179,237,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center rounded-xl transition-all duration-200"
          style={{
            width: 38, height: 38,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(99,179,237,0.12)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,179,237,0.12)'; }}
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div className="relative hidden sm:flex items-center">
          <AnimatePresence>
            {showSearch ? (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                placeholder="Search…"
                autoFocus
                onBlur={() => setShowSearch(false)}
                className="input-field py-2 pr-4 pl-10 text-sm"
                style={{ height: 38 }}
              />
            ) : null}
          </AnimatePresence>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: 38, height: 38,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(99,179,237,0.1)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              position: showSearch ? 'absolute' : 'relative',
              left: showSearch ? 8 : 'auto',
              zIndex: 1,
            }}
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Right: Lang toggle + Bell + Avatar */}
      <div className="flex items-center gap-2">
        {/* Language / Dir Toggle */}
        {onToggleDir && (
          <button
            onClick={onToggleDir}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
            }}
          >
            <Globe size={14} />
            {dir === 'rtl' ? 'EN' : 'AR'}
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
            <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
                width: 38, height: 38,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(99,179,237,0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
            }}
            >
            <Bell size={18} />
            {unreadCount > 0 && (
                <span
                    className="absolute top-2 right-2 rounded-full"
                    style={{ width: 8, height: 8, background: '#f43f5e', border: '2px solid #0d1528' }}
                />
            )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass-card p-4 shadow-2xl z-50 overflow-hidden"
                        style={{ background: 'rgba(13, 21, 40, 0.98)', border: '1px solid rgba(99,179,237,0.15)' }}
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <h4 className="text-sm font-bold">Notifications</h4>
                            <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:underline">Mark all as read</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto no-scrollbar space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-xs text-center py-4 text-muted">No new alerts</p>
                            ) : notifications.map(notify => (
                                <div key={notify.id} className={`p-3 rounded-lg text-xs transition-colors ${notify.read ? 'opacity-50' : 'bg-white/5 border border-white/5'}`}>
                                    <p className="font-semibold mb-1">{notify.title}</p>
                                    <p className="text-muted leading-relaxed">{notify.message}</p>
                                    <p className="text-[9px] mt-2 text-cyan-500/50">{new Date(notify.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-xl font-bold text-sm flex-shrink-0"
            style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              color: '#fff',
            }}
          >
            {getInitials(user?.email)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Admin
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
