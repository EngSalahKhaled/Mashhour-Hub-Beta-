import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Bold, Italic, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firebase';

const COLLECTION = 'case-studies';

// ─── Simple Rich Text Editor ──────────────────────────────────────────────────
function SimpleEditor({ value, onChange }) {
  const exec = (cmd) => { document.execCommand(cmd, false, null); };

  return (
    <div style={{ border: '1px solid rgba(99,179,237,0.15)', borderRadius: 10, overflow: 'hidden' }}>
      <div
        className="flex items-center gap-1 p-2"
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}
      >
        {[
          { icon: <Bold size={14} />,   cmd: 'bold',                title: 'Bold'   },
          { icon: <Italic size={14} />, cmd: 'italic',              title: 'Italic' },
          { icon: <List size={14} />,   cmd: 'insertUnorderedList', title: 'List'   },
        ].map(({ icon, cmd, title }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            title={title}
            style={{
              width: 30, height: 30,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(99,179,237,0.1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icon}
          </button>
        ))}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: 140, padding: '12px 16px',
          color: 'var(--text-primary)', fontSize: 14,
          outline: 'none', background: 'rgba(255,255,255,0.02)', lineHeight: 1.7,
        }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function CaseModal({ item, onClose, onSave }) {
  const [form,   setForm]   = useState(item || { title: '', client: '', industry: '', imageUrl: '', summary: '', bodyHtml: '', results: '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      item?.id
        ? await updateDocument(COLLECTION, item.id, form)
        : await addDocument(COLLECTION, form);
      toast.success(item?.id ? 'Case study updated ✓' : 'Case study created ✓');
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
        key="cms-case-modal"
        className="fixed inset-0 z-[9999] flex"
        style={{ background: 'rgba(4,17,33,0.97)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="flex flex-col w-full h-full overflow-hidden">

          {/* TOP BAR */}
          <div
            className="flex items-center justify-between px-8 py-4 flex-shrink-0"
            style={{ background: 'rgba(13,21,40,0.95)', borderBottom: '1px solid rgba(99,179,237,0.1)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5de6b1' }}>
                Case Studies CMS
              </p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? 'Edit Case Study' : 'Add New Case Study'}
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

          {/* BODY */}
          <div className="flex flex-1 overflow-hidden">
            {/* FORM */}
            <div
              className="flex flex-col overflow-y-auto"
              style={{ width: '60%', borderRight: '1px solid rgba(99,179,237,0.08)' }}
            >
              <div className="p-8 space-y-6 flex-1">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Title <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input className="input-field" value={form.title} onChange={set('title')} placeholder="Project title" style={{ fontSize: 15 }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Client</label>
                    <input className="input-field" value={form.client} onChange={set('client')} placeholder="Client name" style={{ fontSize: 15 }} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Industry</label>
                    <input className="input-field" value={form.industry} onChange={set('industry')} placeholder="e.g. E-Commerce" style={{ fontSize: 15 }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Results Metric</label>
                    <input className="input-field" value={form.results} onChange={set('results')} placeholder="e.g. +300% ROI" style={{ fontSize: 15 }} />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Cover Image URL</label>
                  <input className="input-field" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" style={{ fontSize: 15 }} />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="mt-3 rounded-xl object-cover" style={{ height: 130, maxWidth: '100%' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Summary</label>
                  <textarea
                    className="input-field resize-none" rows={4}
                    value={form.summary} onChange={set('summary')}
                    placeholder="Short summary…" style={{ fontSize: 15 }}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Case Study Body</label>
                  <SimpleEditor value={form.bodyHtml} onChange={set('bodyHtml')} />
                </div>
              </div>

              {/* Save Footer */}
              <div
                className="flex items-center justify-end gap-4 px-8 py-5 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.7)' }}
              >
                <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary !px-8 !py-3 !text-base">
                  {saving
                    ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
                    : item?.id ? '✓ Save Changes' : '+ Add Case Study'
                  }
                </button>
              </div>
            </div>

            {/* PREVIEW */}
            <div
              className="flex flex-col overflow-y-auto"
              style={{ width: '40%', background: 'rgba(4,17,33,0.6)' }}
            >
              <div className="px-8 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>🎨 Live Preview</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>How this case study card will look</p>
              </div>
              <div className="p-8 flex-1">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg,#071a33 0%,#041121 100%)',
                    border: '1px solid rgba(126,184,255,0.18)',
                    fontFamily: 'Inter, Cairo, sans-serif',
                    boxShadow: '0 28px 72px rgba(0,0,0,0.35)',
                  }}
                >
                  {form.imageUrl && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                      <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(4,17,33,0.8) 0%,transparent 50%)' }} />
                    </div>
                  )}
                  <div className="p-6">
                    {form.industry && (
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#5de6b1' }}>
                        {form.industry}
                      </p>
                    )}
                    {form.title && (
                      <h3 className="font-bold mb-2" style={{ color: '#f6f2e8', fontSize: 20, lineHeight: 1.3 }}>
                        {form.title}
                      </h3>
                    )}
                    {form.client && (
                      <p className="text-sm font-semibold mb-2" style={{ color: '#f4cd55' }}>Client: {form.client}</p>
                    )}
                    {form.results && (
                      <p className="text-2xl font-bold" style={{ color: '#36daf5' }}>{form.results}</p>
                    )}
                    {form.summary && (
                      <p className="text-sm mt-2" style={{ color: '#b9c7dc', lineHeight: 1.7 }}>{form.summary}</p>
                    )}
                  </div>
                </div>
                {!form.title && !form.imageUrl && (
                  <div
                    className="mt-4 rounded-2xl flex flex-col items-center justify-center py-20 text-center"
                    style={{ border: '2px dashed rgba(99,179,237,0.15)', background: 'rgba(255,255,255,0.01)' }}
                  >
                    <span className="text-4xl mb-3">🖼️</span>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Fill the form to see preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  , document.body);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CmsCasesPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await getCollection(COLLECTION)); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this case study?')) return;
    try {
      await deleteDocument(COLLECTION, id);
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Case Studies CMS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {items.length} case stud{items.length !== 1 ? 'ies' : 'y'} in Firestore
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModal('new')}>
          <Plus size={16} /> Add Case Study
        </button>
      </div>

      <div className="glass-card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            No case studies yet. Click "Add Case Study" to get started.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Industry</th>
                <th>Results</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                    </div>
                  </td>
                  <td>{item.client || '—'}</td>
                  <td><span className="chip-contacted">{item.industry || '—'}</span></td>
                  <td><span className="chip-closed">{item.results || '—'}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => setModal(item)}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button className="btn-danger !px-3 !py-1.5" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <CaseModal
            item={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
