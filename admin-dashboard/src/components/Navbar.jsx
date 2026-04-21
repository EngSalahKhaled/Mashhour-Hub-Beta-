import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Globe, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getInitials = (email = '') => email.slice(0, 2).toUpperCase();

export default function Navbar({ onMenuClick, dir, onToggleDir }) {
  const { user }         = useAuth();
  const [showSearch, setShowSearch] = useState(false);

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
        <button
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
          {/* Red dot */}
          <span
            className="absolute top-2 right-2 rounded-full"
            style={{ width: 6, height: 6, background: '#f43f5e' }}
          />
        </button>

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
