import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Search, FileText, DollarSign, Clock, CheckCircle, XCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'erp_quotations';
const CLIENTS_COLLECTION = 'erp_clients';

const STATUS_STYLES = {
  Draft:    { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)' },
  Sent:     { bg: 'rgba(0,212,255,0.12)',    color: '#00d4ff', border: 'rgba(0,212,255,0.25)' },
  Accepted: { bg: 'rgba(16,185,129,0.12)',   color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  Rejected: { bg: 'rgba(244,63,94,0.12)',    color: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
};

// ─── Quotation Modal ──────────────────────────────────────────────────────────
function QuotationModal({ item, clients, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    clientId: '', status: 'Draft', taxRate: 15, discount: 0, expiryDate: '', notes: '',
    items: [{ desc: '', qty: 1, price: 0 }],
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const setItem = (idx, key) => (e) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [key]: e.target.value };
    setForm(p => ({ ...p, items: newItems }));
  };

  const addItem    = () => setForm(p => ({ ...p, items: [...p.items, { desc: '', qty: 1, price: 0 }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((sum, i) => sum + (Number(i.qty) * Number(i.price)), 0);
  const tax      = (subtotal - Number(form.discount)) * (Number(form.taxRate) / 100);
  const total    = subtotal - Number(form.discount) + tax;

  const handleSave = async () => {
    if (!form.clientId) return toast.error('Please select a client');
    if (form.items.length === 0 || !form.items[0].desc) return toast.error('At least one item is required');
    setSaving(true);
    try {
      const data = {
        ...form,
        subtotal, tax, total,
        quoteNumber: item?.quoteNumber || `Q-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      item?.id
        ? await api.put(`/erp/quotations/${item.id}`, data)
        : await api.post('/erp/quotations', data);
      toast.success(item?.id ? 'Quotation updated ✓' : 'Quotation created ✓');
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
        key="erp-quote-modal"
        className="fixed inset-0 z-[9999] flex"
        style={{ background: 'rgba(4,17,33,0.97)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-4 flex-shrink-0"
            style={{ background: 'rgba(13,21,40,0.95)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c3aed' }}>ERP — Quotations</p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? `Edit ${item.quoteNumber || 'Quotation'}` : 'New Quotation'}
              </h2>
            </div>
            <button onClick={onClose} className="flex items-center justify-center rounded-xl transition-all"
              style={{ width: 42, height: 42, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Client <span className="text-rose-500">*</span></label>
                  <select className="input-field" value={form.clientId} onChange={set('clientId')}>
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select className="input-field" value={form.status} onChange={set('status')}>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Expiry Date</label>
                  <input className="input-field" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
                </div>
              </div>

              {/* Items Table */}
              <div className="glass-card overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Line Items</h3>
                  <button onClick={addItem} className="btn-ghost !py-1.5 !px-3 !text-xs gap-1"><Plus size={14} /> Add Row</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((row, idx) => (
                      <tr key={idx}>
                        <td><input className="input-field !py-2 !text-sm" value={row.desc} onChange={setItem(idx, 'desc')} placeholder="Service / Product description" /></td>
                        <td><input className="input-field !py-2 !text-sm !text-center" type="number" min="1" value={row.qty} onChange={setItem(idx, 'qty')} /></td>
                        <td><input className="input-field !py-2 !text-sm !text-center" type="number" min="0" value={row.price} onChange={setItem(idx, 'price')} /></td>
                        <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {(Number(row.qty) * Number(row.price)).toFixed(2)}
                        </td>
                        <td>
                          {form.items.length > 1 && (
                            <button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-rose-500/10" style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Tax Rate (%)</label>
                      <input className="input-field" type="number" min="0" value={form.taxRate} onChange={set('taxRate')} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Discount (Flat)</label>
                      <input className="input-field" type="number" min="0" value={form.discount} onChange={set('discount')} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                    <textarea className="input-field resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Payment terms, notes..." />
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3 self-start" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span style={{ color: 'var(--text-primary)' }}>{subtotal.toFixed(2)} KWD</span>
                  </div>
                  {Number(form.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Discount</span>
                      <span style={{ color: '#f43f5e' }}>-{Number(form.discount).toFixed(2)} KWD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Tax ({form.taxRate}%)</span>
                    <span style={{ color: 'var(--text-primary)' }}>{tax.toFixed(2)} KWD</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg" style={{ borderColor: 'rgba(99,179,237,0.1)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="gradient-text">{total.toFixed(2)} KWD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 px-8 py-5 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.95)' }}>
            <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary !px-8 !py-3 !text-base">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : item?.id ? '✓ Save Changes' : '+ Create Quotation'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ErpQuotations() {
  const [items, setItems]       = useState([]);
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [isModal, setIsModal]   = useState(false);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const [quotRes, clientRes] = await Promise.all([
        api.get('/erp/quotations'),
        api.get('/erp/clients'),
      ]);
      setItems(quotRes.data || []);
      setClients(clientRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getClientName = (id) => clients.find(c => c.id === id)?.name || 'Unknown';

  const handleEdit   = (item) => { setEditing(item); setIsModal(true); };
  const handleCreate = ()     => { setEditing(null); setIsModal(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    try { await api.delete(`/erp/quotations/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = items.filter(i => {
    const matchSearch = (i.quoteNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                        getClientName(i.clientId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statCounts = {
    Draft: items.filter(i => i.status === 'Draft').length,
    Sent: items.filter(i => i.status === 'Sent').length,
    Accepted: items.filter(i => i.status === 'Accepted').length,
    Rejected: items.filter(i => i.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quotations</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create and manage price proposals</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Quotation
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statCounts).map(([status, count]) => {
          const s = STATUS_STYLES[status];
          return (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className="glass-card p-4 flex items-center gap-4 transition-all text-left"
              style={{ border: filterStatus === status ? `1px solid ${s.color}` : '1px solid transparent', cursor: 'pointer', background: 'none' }}>
              <div className="flex items-center justify-center rounded-xl"
                style={{ width: 44, height: 44, background: s.bg, border: `1px solid ${s.border}` }}>
                {status === 'Draft' && <FileText size={20} color={s.color} />}
                {status === 'Sent' && <Clock size={20} color={s.color} />}
                {status === 'Accepted' && <CheckCircle size={20} color={s.color} />}
                {status === 'Rejected' && <XCircle size={20} color={s.color} />}
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{status}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field !pl-11" placeholder="Search by quote # or client..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(99,179,237,0.2)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No quotations found.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const s = STATUS_STYLES[item.status] || STATUS_STYLES.Draft;
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="font-mono font-semibold text-sm" style={{ color: '#7c3aed' }}>
                          {item.quoteNumber || '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>{getClientName(item.clientId)}</td>
                      <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {Number(item.total || 0).toFixed(2)} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>KWD</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-GB') : item.createdAt?.slice(0, 10) || '—'}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModal && (
        <QuotationModal item={editing} clients={clients} onClose={() => setIsModal(false)} onSave={load} />
      )}
    </div>
  );
}
