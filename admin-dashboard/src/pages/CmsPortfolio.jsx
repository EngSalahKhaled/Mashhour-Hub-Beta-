import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION = 'portfolio_items';

function PortfolioModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title: '', 
    category: 'Visual Systems', 
    group: 'brand', 
    image: '',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  const groups = [
    { id: 'brand', label: 'Brand Identity' },
    { id: 'campaign', label: 'Marketing Campaigns' },
    { id: 'photography', label: 'Photography' },
    { id: 'integrated', label: 'Integrated Projects' }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-lg overflow-hidden shadow-2xl" style={{ background: 'var(--surf)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Portfolio Item' : 'Add New Work'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Group</label>
                        <select className="input-field" value={form.group} onChange={(e) => setForm({...form, group: e.target.value})}>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Language</label>
                        <select className="input-field" value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Title (Alt Text)</label>
                    <input className="input-field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Premium Brand Identity" />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Sub-Category</label>
                    <input className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="e.g. Visual Systems" />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Image URL / Path</label>
                    <div className="flex gap-2">
                        <input className="input-field" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="../assets/images/..." />
                        {form.image && <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10"><img src={form.image} className="w-full h-full object-cover" /></div>}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={async () => {
                    if(!form.title || !form.image) return toast.error('Title and Image required');
                    setSaving(true);
                    try {
                        item?.id ? await api.put(`/portfolio/${item.id}`, form) : await api.post('/portfolio', form);
                        toast.success('Portfolio updated ✓'); onSave(); onClose();
                    } catch(e) { toast.error('Failed'); } finally { setSaving(false); }
                }} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Work'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsPortfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await api.get('/portfolio/admin/all'); 
      setItems(res.data || []); 
    }
    catch(e) { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.group === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Work Portfolio</h1>
          <p className="text-sm text-muted">Manage the gallery of professional projects and visuals</p>
        </div>
        <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add New Work
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['all', 'brand', 'campaign', 'photography', 'integrated'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-cyan-500 text-black' : 'bg-white/5 text-muted hover:bg-white/10'}`}>
                  {f}
              </button>
          ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="card group overflow-hidden border-white/5 hover:border-cyan-500/30 transition-all aspect-square relative">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase mb-1">{item.category}</p>
                    <h4 className="text-xs font-bold leading-tight line-clamp-2">{item.title}</h4>
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => { setEditing(item); setIsModal(true); }} className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] backdrop-blur-sm">Edit</button>
                        <button onClick={async () => { if(confirm('Delete?')) { await api.delete(`/portfolio/${item.id}`); load(); } }} className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded text-[10px] backdrop-blur-sm">Delete</button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {isModal && <PortfolioModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
