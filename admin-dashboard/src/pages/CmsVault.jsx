import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, ShieldCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'vault';

function VaultModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title: '', 
    cat: 'Strategy', 
    tool: 'ChatGPT', 
    desc: '',
    benefit: '',
    text: '',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const categories = ['Ads', 'Text', 'Strategy', 'Image', 'Video', 'Automation', 'Tech', 'Design'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.95)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-3xl overflow-hidden shadow-2xl" style={{ background: 'var(--surf)', border: '1px solid rgba(196,255,71,0.2)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-lime-400" size={24} />
                    <h2 className="text-xl font-bold">{item?.id ? 'Edit Premium Vault Prompt' : 'Add New Vault Prompt'}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Language</label>
                        <select className="input-field" value={form.language} onChange={set('language')}>
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Category</label>
                        <select className="input-field" value={form.cat} onChange={set('cat')}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Target Tool</label>
                        <input className="input-field" value={form.tool} onChange={set('tool')} placeholder="e.g. Midjourney" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Title</label>
                        <input className="input-field" value={form.title} onChange={set('title')} placeholder="The prompt name..." />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Short Description</label>
                    <textarea className="input-field" rows={2} value={form.desc} onChange={set('desc')} placeholder="What this prompt achieves..." />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">Core Benefit</label>
                    <input className="input-field" value={form.benefit} onChange={set('benefit')} placeholder="e.g. Saves 4 hours of copywriting..." />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-muted tracking-widest">The Prompt (Markdown Supported)</label>
                    <textarea className="input-field font-mono text-sm" rows={10} value={form.text} onChange={set('text')} placeholder="Enter the full instruction set..." />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={async () => {
                   if (!form.title.trim() || !form.text.trim()) return toast.error('Title and Text are required');
                   setSaving(true);
                   try {
                     item?.id ? await api.put(`/vault/${item.id}`, form) : await api.post('/vault', form);
                     toast.success('Vault synced ✓'); onSave(); onClose();
                   } catch(e) { toast.error('Error saving'); } finally { setSaving(false); }
                }} disabled={saving} className="btn-primary !bg-lime-500 !text-black">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : '✓ Sync to Vault'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsVault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await api.get('/vault'); 
      setItems(res.data || []); 
    }
    catch(e) { toast.error('Failed to load Vault'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.cat.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-lime-500/10 text-lime-400"><ShieldCheck size={28} /></div>
            <div>
                <h1 className="text-2xl font-bold">Premium Prompt Vault</h1>
                <p className="text-sm text-muted">Manage the exclusive instruction sets for VIP members</p>
            </div>
        </div>
        <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2 !bg-lime-500 !text-black">
            <Plus size={18} /> Add Vault Prompt
        </button>
      </div>

      <div className="card p-8 flex flex-col md:flex-row gap-6 items-center bg-white/5 border-lime-500/10">
        <div className="relative flex-1 w-full">
            <input className="input-field pl-12" placeholder="Search the premium vault..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"><Copy size={18} /></div>
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-lime-500"></div> {items.length} Assets Live</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-lime-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="card p-6 border-white/5 hover:border-lime-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-2 bg-white/5 rounded-lg hover:text-lime-400"><Edit2 size={16} /></button>
                 <button onClick={async () => { if(confirm('Delete?')) { await api.delete(`/vault/${item.id}`); load(); } }} className="p-2 bg-white/5 rounded-lg hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-lime-500/10 text-lime-400 rounded">{item.cat}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 text-muted rounded">{item.tool}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-400 rounded ml-auto">{item.language.toUpperCase()}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted mb-4 line-clamp-2">{item.desc}</p>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-lime-400/70">
                <ShieldCheck size={14} /> {item.benefit || 'Premium execution quality'}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModal && <VaultModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
