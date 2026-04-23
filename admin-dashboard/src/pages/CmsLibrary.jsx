import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, ExternalLink, Search, FileText, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'library_items';

function LibraryModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title: '', 
    url: '', 
    thumb: '',
    category: 'Strategy', 
    type: 'PDF', 
    language: 'ar',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) return toast.error('Title and URL are required');
    setSaving(true);
    try {
      item?.id
        ? await api.put(`/library/${item.id}`, form)
        : await api.post('/library', form);
      toast.success('Library item saved ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-xl overflow-hidden shadow-2xl" style={{ background: 'var(--surf)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Resource' : 'Add New Resource'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Category</label>
                        <input className="input-field" value={form.category} onChange={set('category')} placeholder="e.g. Strategy" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Language</label>
                        <select className="input-field" value={form.language} onChange={set('language')}>
                            <option value="ar">Arabic</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Title</label>
                    <input className="input-field" value={form.title} onChange={set('title')} placeholder="Resource title..." />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Google Drive URL</label>
                    <input className="input-field" value={form.url} onChange={set('url')} placeholder="https://drive.google.com/..." />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Thumbnail URL (Optional)</label>
                    <input className="input-field" value={form.thumb} onChange={set('thumb')} placeholder="https://..." />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Resource'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/library');
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resource Library</h1>
          <p className="text-sm text-muted">Manage the 300+ operational guides and assets</p>
        </div>
        <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Resource
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input 
            className="input-field pl-10" 
            placeholder="Search resources by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
      ) : (
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-wider font-bold text-muted border-b border-white/5">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Lang</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.slice(0, 50).map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <FileText size={16} className="text-muted" />
                        {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-muted">{item.category}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 rounded bg-white/5 text-[10px]">{item.language.toUpperCase()}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <a href={item.url} target="_blank" className="p-2 hover:text-white text-muted"><ExternalLink size={14} /></a>
                        <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-2 hover:text-cyan-400 text-muted"><Edit2 size={14} /></button>
                        <button onClick={async () => { if(confirm('Delete?')) { await api.delete(`/library/${item.id}`); load(); } }} className="p-2 hover:text-rose-500 text-muted"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length > 50 && (
            <div className="p-4 text-center text-xs text-muted border-t border-white/5">Showing first 50 results. Use search to narrow down.</div>
          )}
        </div>
      )}

      {isModal && <LibraryModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
