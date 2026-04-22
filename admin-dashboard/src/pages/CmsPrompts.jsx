import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Layout, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firebase';

const COLLECTION = 'prompts';

function PromptModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title: '', 
    cat: 'Ads', 
    tool: 'ChatGPT', 
    feat: '', 
    text: '',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--surf)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Standard Prompt' : 'Add Standard Prompt'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Language</label>
                        <select className="input-field" value={form.language} onChange={set('language')}>
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Category</label>
                        <select className="input-field" value={form.cat} onChange={set('cat')}>
                            <option value="Ads">Ads</option>
                            <option value="Text">Text</option>
                            <option value="Strategy">Strategy</option>
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="Automation">Automation</option>
                            <option value="Design">Design</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Tool</label>
                        <input className="input-field" value={form.tool} onChange={set('tool')} placeholder="e.g. Midjourney" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Title</label>
                    <input className="input-field" value={form.title} onChange={set('title')} placeholder="How to use this prompt..." />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Prompt Text</label>
                    <textarea className="input-field font-mono text-sm" rows={8} value={form.text} onChange={set('text')} placeholder="Paste prompt here..." />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Prompt'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsPrompts() {
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
      toast.error('Failed to load prompts');
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
          <h1 className="text-2xl font-bold">Standard Prompt Library</h1>
          <p className="text-sm text-muted">Manage standard prompts used across the platform</p>
        </div>
        <div className="flex gap-3">
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
            </select>
            <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Prompt
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-lime-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="card p-6 flex flex-col hover:border-lime-500/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 text-[10px] font-bold">{item.cat}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-muted text-[10px] font-bold">{item.tool}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-1 hover:text-white"><Edit2 size={14} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteDocument(COLLECTION, item.id); load(); } }} className="p-1 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold mb-3 line-clamp-2">{item.title}</h3>
              
              {/* Terminal Style Prompt Box */}
              <div className="relative mt-auto overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500/40" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                    <span className="ml-2 text-[9px] font-mono text-muted uppercase tracking-tighter opacity-50">Standard Prompt</span>
                </div>
                <div className="p-3">
                    <p className="text-xs text-cyan-400/90 font-mono line-clamp-4 leading-relaxed">{item.text}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-widest">
                <span>{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModal && <PromptModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
