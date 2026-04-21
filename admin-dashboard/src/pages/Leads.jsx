import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Loader2, Users, Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, updateDocument } from '../services/firebase';

// CRM Collection Tabs
const CRM_TABS = [
  { key: 'leads',       label: 'Leads',        icon: Users,    collection: 'leads'       },
  { key: 'subscribers', label: 'Subscribers',   icon: Mail,     collection: 'subscribers' },
  { key: 'influencers', label: 'Influencers',   icon: UserPlus, collection: 'influencers' },
];

const STATUSES    = ['new', 'contacted', 'closed'];

const STATUS_STYLES = {
  new:       { cls: 'chip-new',       label: 'New'       },
  contacted: { cls: 'chip-contacted', label: 'Contacted' },
  closed:    { cls: 'chip-closed',    label: 'Closed'    },
};

function StatusDropdown({ leadId, current, onChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const select = async (status) => {
    setOpen(false);
    if (status === current) return;
    setUpdating(true);
    try {
      await updateDocument(COLLECTION, leadId, { status });
      onChange(leadId, status);
      toast.success(`Status → ${STATUS_STYLES[status].label}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        disabled={updating}
      >
        {updating ? (
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <span className={STATUS_STYLES[current]?.cls || 'chip-new'}>
            {STATUS_STYLES[current]?.label || current}
          </span>
        )}
        <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 z-20 rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: 130,
            }}
          >
            {STATUSES.map((s) => (
              <li key={s}>
                <button
                  onClick={() => select(s)}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors"
                  style={{
                    background: s === current ? 'rgba(0,212,255,0.08)' : 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = s === current ? 'rgba(0,212,255,0.08)' : 'transparent'; }}
                >
                  <span className={STATUS_STYLES[s].cls}>{STATUS_STYLES[s].label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  const currentTab = CRM_TABS.find(t => t.key === activeTab) || CRM_TABS[0];

  const load = async (col) => {
    setLoading(true);
    try { setLeads(await getCollection(col || currentTab.collection)); }
    catch { setLeads([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(currentTab.collection); setFilter('all'); setSearch(''); }, [activeTab]);

  const updateStatus = (id, status) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

  const filtered = leads.filter((l) => {
    const matchFilter = filter === 'all' || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name, l.email, l.phone, l.service, l.formType].some((v) => v?.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s).length }), {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>CRM Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage all form submissions — Leads, Subscribers, and Influencer applications
        </p>
      </div>

      {/* CRM Collection Tabs */}
      <div className="flex gap-2">
        {CRM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'rgba(99,179,237,0.1)'}`,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ key: 'all', label: 'All Leads', count: leads.length }, ...STATUSES.map((s) => ({ key: s, label: STATUS_STYLES[s].label, count: counts[s] }))].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-4 text-left transition-all duration-200 cursor-pointer"
            style={{
              border: filter === tab.key ? '1px solid rgba(0,212,255,0.35)' : undefined,
              background: filter === tab.key ? 'rgba(0,212,255,0.06)' : undefined,
            }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tab.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tab.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Search + Table */}
      <div className="glass-card overflow-x-auto">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search name, email, service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {leads.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            {leads.length === 0 ? 'No leads yet. Add a contact form to your website to start collecting leads.' : 'No leads match your filter.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service Needed</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          width: 32, height: 32,
                          background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(0,212,255,0.15)',
                        }}
                      >
                        {lead.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${lead.email}`} style={{ color: 'var(--accent-cyan)' }} className="text-sm hover:underline">
                      {lead.email || '—'}
                    </a>
                  </td>
                  <td>
                    <a href={`tel:${lead.phone}`} style={{ color: 'var(--text-secondary)' }} className="text-sm">
                      {lead.phone || '—'}
                    </a>
                  </td>
                  <td>
                    <span className="text-sm">{lead.service || lead.serviceNeeded || '—'}</span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lead.createdAt?.toDate
                        ? lead.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <StatusDropdown
                      leadId={lead.id}
                      current={lead.status || 'new'}
                      onChange={updateStatus}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
