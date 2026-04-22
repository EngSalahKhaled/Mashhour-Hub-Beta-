import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firebase';

const COLLECTION = 'tools';

function ToolModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    name: '', 
    description: '', 
    url: '', 
    category: 'AI & Strategy', 
    category_ar: 'الذكاء الاصطناعي والاستراتيجية',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const categories = [
    { en: 'AI & Strategy', ar: 'الذكاء الاصطناعي والاستراتيجية' },
    { en: 'Design & Creative', ar: 'التصميم والإبداع' },
    { en: 'Automation', ar: 'الأتمتة' },
    { en: 'SEO & Marketing', ar: 'السيو والتسويق' },
    { en: 'Video Production', ar: 'إنتاج الفيديو' },
    { en: 'Analytics & Data', ar: 'التحليلات والبيانات' },
    { en: 'Productivity', ar: 'الإنتاجية' },
    { en: 'Development', ar: 'التطوير والبرمجة' }
  ];

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return toast.error('Name and URL are required');
    setSaving(true);
    try {
      // Auto-set matching category_ar
      const catPair = categories.find(c => c.en === form.category);
      const dataToSave = { ...form, category_ar: catPair ? catPair.ar : form.category_ar };

      item?.id
        ? await updateDocument(COLLECTION, item.id, dataToSave)
        : await addDocument(COLLECTION, dataToSave);
      
      toast.success(item?.id ? 'Tool updated ✓' : 'Tool added ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--surf)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Tool' : 'Add New Tool'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Language</label>
                        <select className="input-field" value={form.language} onChange={set('language')}>
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Category</label>
                        <select className="input-field" value={form.category} onChange={set('category')}>
                            {categories.map(c => <option key={c.en} value={c.en}>{c.en}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Tool Name</label>
                    <input className="input-field" value={form.name} onChange={set('name')} placeholder="e.g. Midjourney" />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">URL</label>
                    <input className="input-field" value={form.url} onChange={set('url')} placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Description</label>
                    <textarea className="input-field" rows={3} value={form.description} onChange={set('description')} placeholder="What does this tool do?" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : item?.id ? 'Save Changes' : 'Add Tool'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsTools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [filterLang, setFilterLang] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getCollection(COLLECTION);
      setItems(data);
    } catch (err) {
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = filterLang === 'all' ? items : items.filter(i => i.language === filterLang);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tech Stack & Tools</h1>
          <p className="text-sm text-muted">Manage the interactive tools directory</p>
        </div>
        <div className="flex gap-3">
            <select 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none"
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
            >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
            </select>
            <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Tool
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-lime-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="card p-5 group hover:border-lime-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded text-muted">{item.category}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-1.5 hover:text-lime-400"><Edit2 size={14} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteDocument(COLLECTION, item.id); load(); } }} className="p-1.5 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                {item.name} 
                <a href={item.url} target="_blank" className="text-muted hover:text-white transition-colors"><ExternalLink size={14} /></a>
              </h3>
              <p className="text-xs text-muted line-clamp-2">{item.description}</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-muted uppercase font-bold">{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModal && <ToolModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
