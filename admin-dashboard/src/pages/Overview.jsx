import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Briefcase, Layers, Image,
  TrendingUp, TrendingDown, ArrowRight,
} from 'lucide-react';
import { getCollection } from '../services/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────
const ACCENT_MAP = {
  cyan:    { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   shadow: 'rgba(0,212,255,0.2)'   },
  purple:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', shadow: 'rgba(124,58,237,0.2)' },
  emerald: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', shadow: 'rgba(16,185,129,0.2)' },
  amber:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', shadow: 'rgba(245,158,11,0.2)' },
};

const ICON_MAP = { Users, Briefcase, Layers, Image };

// Mock analytics data — replace with real Firestore queries
const CHART_DATA = [
  { name: 'Jan', leads: 12, visitors: 820 },
  { name: 'Feb', leads: 19, visitors: 1100 },
  { name: 'Mar', leads: 14, visitors: 970  },
  { name: 'Apr', leads: 28, visitors: 1540 },
  { name: 'May', leads: 22, visitors: 1280 },
  { name: 'Jun', leads: 35, visitors: 1820 },
  { name: 'Jul', leads: 41, visitors: 2100 },
];

const RECENT_LEADS = [
  { name: 'Ahmed Al-Rashidi',  service: 'SEO Package',      status: 'new',       time: '2h ago'  },
  { name: 'Sara Al-Mutairi',   service: 'Social Media Mgmt', status: 'contacted', time: '5h ago'  },
  { name: 'Mohammed Al-Enezi', service: 'Web Development',  status: 'closed',    time: '1d ago'  },
  { name: 'Fatima Al-Sayed',   service: 'Brand Identity',   status: 'new',       time: '2d ago'  },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, icon, accent, value, change, changeLabel, delay = 0 }) {
  const a = ACCENT_MAP[accent] || ACCENT_MAP.cyan;
  const Icon = ICON_MAP[icon] || Users;
  const isUp = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-6 relative overflow-hidden cursor-default group"
    >
      {/* Accent glow in corner */}
      <div
        className="absolute -top-4 -right-4 rounded-full opacity-40 group-hover:opacity-60 transition-opacity"
        style={{ width: 80, height: 80, background: a.color, filter: 'blur(30px)' }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: a.bg, boxShadow: `0 4px 16px ${a.shadow}` }}
        >
          <Icon size={20} color={a.color} />
        </div>
        {/* Change badge */}
        <span className={isUp ? 'stat-badge-up' : 'stat-badge-down'}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}%
        </span>
      </div>

      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value === null ? '—' : value}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{changeLabel}</p>
    </motion.div>
  );
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const cls = status === 'new' ? 'chip-new' : status === 'contacted' ? 'chip-contacted' : 'chip-closed';
  return <span className={cls}>{status}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const [stats, setStats] = useState({ leads: null, projects: null, services: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [leads, projects, services] = await Promise.all([
          getCollection('leads'),
          getCollection('projects'),
          getCollection('services'),
        ]);
        setStats({ leads: leads.length, projects: projects.length, services: services.length });
      } catch {
        // Collections may not exist yet in Firebase
        setStats({ leads: 0, projects: 0, services: 0 });
      }
    };
    load();
  }, []);

  const CARDS = [
    { label: 'Total Leads',      icon: 'Users',    accent: 'cyan',    value: stats.leads,    change: 12,  changeLabel: 'vs. last month' },
    { label: 'Active Projects',  icon: 'Briefcase',accent: 'purple',  value: stats.projects, change: 5,   changeLabel: 'vs. last month' },
    { label: 'Services Listed',  icon: 'Layers',   accent: 'emerald', value: stats.services, change: 0,   changeLabel: 'No change'      },
    { label: 'Monthly Visitors', icon: 'Image',    accent: 'amber',   value: '2.1K',         change: -3,  changeLabel: 'vs. last month' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Dashboard Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Welcome back, Admin. Here's what's happening today.
        </motion.p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.08} />)}
      </div>

      {/* Chart + Recent Leads */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                Growth Analytics
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Leads & Visitors • 2025</p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)' }}
            >
              Monthly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(99,179,237,0.06)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads"    stroke="#00d4ff" strokeWidth={2} fill="url(#gradLeads)"    dot={false} />
              <Area type="monotone" dataKey="visitors" stroke="#7c3aed" strokeWidth={2} fill="url(#gradVisitors)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Recent Leads</h2>
            <a href="/leads" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent-cyan)' }}>
              View all <ArrowRight size={12} />
            </a>
          </div>
          <ul className="space-y-4">
            {RECENT_LEADS.map((lead, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div
                  className="flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(0,212,255,0.15)',
                  }}
                >
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {lead.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lead.service}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusChip status={lead.status} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.time}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
