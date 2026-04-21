import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Image, FileText, Settings,
  ChevronDown, ChevronLeft, ChevronRight, LogOut, Layers, Briefcase, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navItems } from '../constants/navigation';
import toast from 'react-hot-toast';

const ICON_MAP = { LayoutDashboard, Users, Image, FileText, Settings, Layers, Briefcase, Globe };

function NavIcon({ name, size = 18 }) {
  const Comp = ICON_MAP[name];
  return Comp ? <Comp size={size} /> : null;
}

const sidebarVariants = {
  open: {
    width: 'var(--sidebar-width)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  closed: {
    width: 'var(--sidebar-collapsed)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function Sidebar({ isOpen, setIsOpen, dir }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [openGroup, setOpenGroup]   = useState(null);
  const { logout }                  = useAuth();
  const navigate                    = useNavigate();
  const isRTL                       = dir === 'rtl';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);

  // Mobile: isOpen prop controls overlay sidebar
  // Desktop: collapsed state controls width
  const desktopState = collapsed ? 'closed' : 'open';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        className="hidden lg:flex flex-col h-full z-30 flex-shrink-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d1528 0%, #0a0f1e 100%)',
          borderRight: isRTL ? 'none' : '1px solid rgba(99,179,237,0.08)',
          borderLeft:  isRTL ? '1px solid rgba(99,179,237,0.08)' : 'none',
        }}
        variants={sidebarVariants}
        animate={desktopState}
        initial={desktopState}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openGroup={openGroup}
          toggleGroup={toggleGroup}
          handleLogout={handleLogout}
          isRTL={isRTL}
        />
      </motion.aside>

      {/* ── Mobile Sidebar (slide-in) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="lg:hidden fixed top-0 left-0 h-full z-30 flex flex-col overflow-hidden"
            style={{
              width: 'var(--sidebar-width)',
              background: 'linear-gradient(180deg, #0d1528 0%, #0a0f1e 100%)',
              borderRight: '1px solid rgba(99,179,237,0.08)',
            }}
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SidebarContent
              collapsed={false}
              setCollapsed={() => {}}
              openGroup={openGroup}
              toggleGroup={toggleGroup}
              handleLogout={handleLogout}
              isRTL={isRTL}
              onNavClick={() => setIsOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ collapsed, setCollapsed, openGroup, toggleGroup, handleLogout, isRTL, onNavClick }) {
  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(99,179,237,0.08)', height: 'var(--navbar-height)' }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>M</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Mashhor Hub</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin Console</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200"
          style={{
            width: 28, height: 28,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(99,179,237,0.12)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          {collapsed
            ? (isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
            : (isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
          }
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item, i) => (
            <motion.li
              key={item.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {item.children ? (
                /* ── Group item ── */
                <>
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
                      e.currentTarget.style.color = 'var(--accent-cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <NavIcon name={item.icon} size={18} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                        <motion.span
                          animate={{ rotate: openGroup === item.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={14} />
                        </motion.span>
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {openGroup === item.id && !collapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden ml-8 mt-1 space-y-0.5"
                      >
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <NavLink
                              to={child.path}
                              onClick={onNavClick}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? 'text-cyan-400 bg-cyan-400/10 font-semibold'
                                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/06'
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* ── Regular item ── */
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onNavClick}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-400/10 font-semibold border border-cyan-400/20'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/08'
                    }`
                  }
                >
                  <span className="flex-shrink-0"><NavIcon name={item.icon} size={18} /></span>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              )}
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(99,179,237,0.08)' }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244,63,94,0.1)';
            e.currentTarget.style.color = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}
