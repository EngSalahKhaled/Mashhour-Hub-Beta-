import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Search, Users, Mail, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'erp_clients';

// ─── Modal ────────────────────────────────────────────────────────────────────
function ClientModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    name: '', email: '', phone: '', company: '', taxId: '', address: '', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (form.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      item?.id
        ? await api.put(`/erp/clients/${item.id}`, form)
        : await api.post('/erp/clients', form);
      toast.success(item?.id ? 'Client updated ✓' : 'Client created ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="erp-client-modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(4,17,33,0.92)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-card w-full max-w-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
          style={{ border: '1px solid rgba(0,212,255,0.15)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-7 py-5"
            style={{ borderBottom: '1px solid rgba(99,179,237,0.1)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00d4ff' }}>
                ERP — Clients
              </p>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? 'Edit Client' : 'Add New Client'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 42, height: 42,
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
                color: '#f43f5e', cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input className={`input-field ${errors.name ? 'border-rose-500/50 bg-rose-500/5' : ''}`} value={form.name} onChange={set('name')} placeholder="e.g. Ahmed Al-Rashidi" />
                {errors.name && <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1.5"><X size={12} /> {errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Company</label>
                <input className="input-field" value={form.company} onChange={set('company')} placeholder="e.g. TechCorp LLC" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input className={`input-field ${errors.email ? 'border-rose-500/50 bg-rose-500/5' : ''}`} type="email" value={form.email} onChange={set('email')} placeholder="client@example.com" />
                {errors.email && <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1.5"><X size={12} /> {errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <input className={`input-field ${errors.phone ? 'border-rose-500/50 bg-rose-500/5' : ''}`} value={form.phone} onChange={set('phone')} placeholder="+965 ..." />
                {errors.phone && <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1.5"><X size={12} /> {errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Tax ID / CR Number</label>
                <input className="input-field" value={form.taxId} onChange={set('taxId')} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Address</label>
                <input className="input-field" value={form.address} onChange={set('address')} placeholder="City, Country" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Notes</label>
              <textarea className="input-field resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Internal notes about this client..." />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-4 px-7 py-5"
            style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.6)' }}
          >
            <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary !px-8 !py-3">
              {saving
                ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
                : item?.id ? '✓ Save Changes' : '+ Add Client'
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ErpClients() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [search, setSearch]   = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/erp/clients');
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit   = (item) => { setEditing(item); setIsModal(true); };
  const handleCreate = ()     => { setEditing(null); setIsModal(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/erp/clients/${id}`);
      toast.success('Client deleted');
      load();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = items.filter(i =>
    (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Clients</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your business clients and contacts</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          className="input-field !pl-11"
          placeholder="Search clients by name, company or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: items.length, icon: Users, color: '#00d4ff' },
          { label: 'With Email', value: items.filter(i => i.email).length, icon: Mail, color: '#7c3aed' },
          { label: 'With Phone', value: items.filter(i => i.phone).length, icon: Phone, color: '#10b981' },
          { label: 'Companies', value: [...new Set(items.map(i => i.company).filter(Boolean))].length, icon: Building2, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-cyan-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(99,179,237,0.2)' }}>
          <p style={{ color: 'var(--text-muted)' }}>{search ? 'No clients match your search.' : 'No clients yet. Add your first one!'}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-bold"
                          style={{
                            width: 38, height: 38,
                            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
                            border: '1px solid rgba(0,212,255,0.2)',
                            color: '#00d4ff',
                          }}
                        >
                          {(item.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.company || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td>{item.phone || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors" style={{ color: '#f43f5e' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModal && (
        <ClientModal
          item={editing}
          onClose={() => setIsModal(false)}
          onSave={load}
        />
      )}
    </div>
  );
}
