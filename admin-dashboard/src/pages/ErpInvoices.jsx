import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Search, FileText, DollarSign, CreditCard, CheckCircle, Printer, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'erp_invoices';
const CLIENTS_COL = 'erp_clients';

const STATUS_MAP = {
  Unpaid:    { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  Partial:   { bg: 'rgba(0,212,255,0.12)',   color: '#00d4ff', border: 'rgba(0,212,255,0.25)' },
  Paid:      { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  Cancelled: { bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
};

function InvoiceModal({ item, clients, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    clientId: '', status: 'Unpaid', taxRate: 15, discount: 0, dueDate: '', notes: '', paymentMethod: '',
    items: [{ desc: '', qty: 1, price: 0 }],
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setItem = (idx, key) => (e) => {
    const arr = [...form.items]; arr[idx] = { ...arr[idx], [key]: e.target.value };
    setForm(p => ({ ...p, items: arr }));
  };
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { desc: '', qty: 1, price: 0 }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + Number(i.qty) * Number(i.price), 0);
  const tax = (subtotal - Number(form.discount)) * (Number(form.taxRate) / 100);
  const total = subtotal - Number(form.discount) + tax;

  const handleSave = async () => {
    if (!form.clientId) return toast.error('Select a client');
    if (!form.items[0]?.desc) return toast.error('Add at least one item');
    setSaving(true);
    try {
      const data = { ...form, subtotal, tax, total,
        invoiceNumber: item?.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`,
      };
      item?.id ? await api.put(`/erp/invoices/${item.id}`, data) : await api.post('/erp/invoices', data);
      toast.success(item?.id ? 'Invoice updated ✓' : 'Invoice created ✓');
      onSave(); onClose();
    } catch (err) { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div key="inv-modal" className="fixed inset-0 z-[9999] flex"
        style={{ background: 'rgba(4,17,33,0.97)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="flex flex-col w-full h-full overflow-hidden">
          <div className="flex items-center justify-between px-8 py-4 flex-shrink-0"
            style={{ background: 'rgba(13,21,40,0.95)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#10b981' }}>ERP — Invoices</p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? `Edit ${item.invoiceNumber || 'Invoice'}` : 'New Invoice'}
              </h2>
            </div>
            <button onClick={onClose} style={{ width: 42, height: 42, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', cursor: 'pointer', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Client *</label>
                  <select className="input-field" value={form.clientId} onChange={set('clientId')}>
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select className="input-field" value={form.status} onChange={set('status')}>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                  <input className="input-field" type="date" value={form.dueDate} onChange={set('dueDate')} />
                </div>
              </div>

              {/* Items */}
              <div className="glass-card overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Line Items</h3>
                  <button onClick={addItem} className="btn-ghost !py-1.5 !px-3 !text-xs gap-1"><Plus size={14} /> Add Row</button>
                </div>
                <table className="data-table">
                  <thead><tr><th style={{ width: '45%' }}>Description</th><th>Qty</th><th>Price</th><th>Total</th><th style={{ width: 50 }}></th></tr></thead>
                  <tbody>
                    {form.items.map((row, idx) => (
                      <tr key={idx}>
                        <td><input className="input-field !py-2 !text-sm" value={row.desc} onChange={setItem(idx, 'desc')} placeholder="Description" /></td>
                        <td><input className="input-field !py-2 !text-sm !text-center" type="number" min="1" value={row.qty} onChange={setItem(idx, 'qty')} /></td>
                        <td><input className="input-field !py-2 !text-sm !text-center" type="number" min="0" value={row.price} onChange={setItem(idx, 'price')} /></td>
                        <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{(Number(row.qty) * Number(row.price)).toFixed(2)}</td>
                        <td>{form.items.length > 1 && <button onClick={() => removeItem(idx)} style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Tax %</label><input className="input-field" type="number" value={form.taxRate} onChange={set('taxRate')} /></div>
                    <div><label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Discount</label><input className="input-field" type="number" value={form.discount} onChange={set('discount')} /></div>
                  </div>
                  <div><label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Notes</label><textarea className="input-field resize-none" rows={3} value={form.notes} onChange={set('notes')} /></div>
                </div>
                <div className="glass-card p-5 space-y-3 self-start" style={{ border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span style={{ color: 'var(--text-primary)' }}>{subtotal.toFixed(2)} KWD</span></div>
                  {Number(form.discount) > 0 && <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Discount</span><span style={{ color: '#f43f5e' }}>-{Number(form.discount).toFixed(2)}</span></div>}
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Tax ({form.taxRate}%)</span><span style={{ color: 'var(--text-primary)' }}>{tax.toFixed(2)}</span></div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg" style={{ borderColor: 'rgba(99,179,237,0.1)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="gradient-text">{total.toFixed(2)} KWD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 px-8 py-5 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.95)' }}>
            <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary !px-8 !py-3 !text-base">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : item?.id ? '✓ Save' : '+ Create Invoice'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>, document.body
  );
}

// ─── Print View ───────────────────────────────────────────────────────────────
function PrintInvoice({ invoice, client, onClose }) {
  const handlePrint = () => { window.print(); };
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white text-black overflow-y-auto print:static">
      <div className="max-w-3xl mx-auto p-10 print:p-6">
        {/* Print Header */}
        <div className="flex justify-between items-start mb-10 print:mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-500 mt-1 font-mono">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">Mashhor Hub</h2>
            <p className="text-sm text-gray-500">Kuwait City, Kuwait</p>
            <p className="text-sm text-gray-500">hello@mashhor-hub.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
            <p className="font-bold text-gray-900">{client?.name || 'Client'}</p>
            {client?.company && <p className="text-sm text-gray-600">{client.company}</p>}
            {client?.email && <p className="text-sm text-gray-600">{client.email}</p>}
            {client?.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Details</p>
            <p className="text-sm text-gray-600">Date: {invoice.createdAt?.toDate ? invoice.createdAt.toDate().toLocaleDateString('en-GB') : invoice.createdAt?.slice(0,10) || '—'}</p>
            <p className="text-sm text-gray-600">Due: {invoice.dueDate || 'On Receipt'}</p>
            <p className="text-sm font-semibold" style={{ color: invoice.status === 'Paid' ? '#10b981' : '#f59e0b' }}>Status: {invoice.status}</p>
          </div>
        </div>

        <table className="w-full mb-8" style={{ borderCollapse: 'collapse' }}>
          <thead><tr className="border-b-2 border-gray-200">
            <th className="py-3 text-left text-xs uppercase text-gray-400">Description</th>
            <th className="py-3 text-center text-xs uppercase text-gray-400">Qty</th>
            <th className="py-3 text-right text-xs uppercase text-gray-400">Price</th>
            <th className="py-3 text-right text-xs uppercase text-gray-400">Total</th>
          </tr></thead>
          <tbody>
            {(invoice.items || []).map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-sm">{row.desc}</td>
                <td className="py-3 text-sm text-center">{row.qty}</td>
                <td className="py-3 text-sm text-right">{Number(row.price).toFixed(2)}</td>
                <td className="py-3 text-sm text-right font-semibold">{(Number(row.qty) * Number(row.price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{Number(invoice.subtotal || 0).toFixed(2)} KWD</span></div>
            {Number(invoice.discount) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-500">-{Number(invoice.discount).toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tax ({invoice.taxRate || 0}%)</span><span>{Number(invoice.tax || 0).toFixed(2)}</span></div>
            <div className="border-t-2 border-gray-900 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>{Number(invoice.total || 0).toFixed(2)} KWD</span></div>
          </div>
        </div>

        {invoice.notes && <div className="mt-8 p-4 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-600">{invoice.notes}</p></div>}

        {/* Non-print buttons */}
        <div className="mt-10 flex gap-4 print:hidden">
          <button onClick={handlePrint} className="btn-primary" style={{ background: '#111827' }}><Printer size={16} /> Print / Save as PDF</button>
          <button onClick={onClose} className="btn-ghost" style={{ color: '#111827', borderColor: '#d1d5db' }}>Close</button>
        </div>
      </div>
    </div>, document.body
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ErpInvoices() {
  const [items, setItems]     = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [printing, setPrinting] = useState(null);
  const [search, setSearch]   = useState('');

  const load = async () => {
    try { setLoading(true);
      const [invRes, clRes] = await Promise.all([api.get('/erp/invoices'), api.get('/erp/clients')]);
      setItems(invRes.data || []); setClients(clRes.data || []);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const getClient = (id) => clients.find(c => c.id === id);
  const getClientName = (id) => getClient(id)?.name || 'Unknown';

  const filtered = items.filter(i =>
    (i.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    getClientName(i.clientId).toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = items.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.total || 0), 0);
  const totalPending = items.filter(i => i.status === 'Unpaid' || i.status === 'Partial').reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Invoices</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Billing, payments and financial tracking</p>
        </div>
        <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Invoice</button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: items.length, icon: FileText, color: '#00d4ff' },
          { label: 'Revenue (Paid)', value: `${totalRevenue.toFixed(0)} KWD`, icon: CheckCircle, color: '#10b981' },
          { label: 'Pending', value: `${totalPending.toFixed(0)} KWD`, icon: DollarSign, color: '#f59e0b' },
          { label: 'Paid Count', value: items.filter(i => i.status === 'Paid').length, icon: CreditCard, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field !pl-11" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(99,179,237,0.2)' }}><p style={{ color: 'var(--text-muted)' }}>No invoices found.</p></div>
      ) : (
        <div className="glass-card overflow-hidden"><div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Client</th><th>Total</th><th>Status</th><th>Due</th><th style={{ width: 130 }}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(item => {
                const s = STATUS_MAP[item.status] || STATUS_MAP.Unpaid;
                return (
                  <tr key={item.id}>
                    <td><span className="font-mono font-semibold text-sm" style={{ color: '#10b981' }}>{item.invoiceNumber || '—'}</span></td>
                    <td style={{ color: 'var(--text-primary)' }}>{getClientName(item.clientId)}</td>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{Number(item.total || 0).toFixed(2)}</td>
                    <td><span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{item.status}</span></td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.dueDate || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setPrinting(item)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Print" style={{ color: 'var(--text-secondary)' }}><Printer size={15} /></button>
                        <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}><Edit2 size={15} /></button>
                        <button onClick={async () => { if (window.confirm('Delete?')) { await api.delete(`/erp/invoices/${item.id}`); toast.success('Deleted'); load(); }}} className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors" style={{ color: '#f43f5e' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div></div>
      )}

      {isModal && <InvoiceModal item={editing} clients={clients} onClose={() => setIsModal(false)} onSave={load} />}
      {printing && <PrintInvoice invoice={printing} client={getClient(printing.clientId)} onClose={() => setPrinting(null)} />}
    </div>
  );
}
