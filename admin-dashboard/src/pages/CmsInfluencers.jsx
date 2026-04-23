import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, User, Globe, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const COLLECTION_API = '/influencers';

function InfluencerModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    name: '', 
    pageName: '',
    category: 'tech', 
    field: '',
    longBio: '',
    whatsappNumber: '965',
    verificationTier: 'green',
    logoUrl: '',
    coverUrl: '',
    tags: [],
    socialLinks: { instagram: '', tiktok: '', linkedin: '' }
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const tiers = [
    { id: 'gold', label: 'Gold (Large/Elite)' },
    { id: 'blue', label: 'Blue (Verified)' },
    { id: 'green', label: 'Green (Trusted)' }
  ];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" style={{ background: 'var(--surf)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Creator Profile' : 'Add New Creator'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Full Name</label>
                        <input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Salah Khaled" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Page ID / Username</label>
                        <input className="input-field" value={form.pageName} onChange={(e) => setForm({...form, pageName: e.target.value})} placeholder="e.g. salahkhaled" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Main Category</label>
                        <select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                            <option value="tech">Technology</option>
                            <option value="fashion">Fashion & Beauty</option>
                            <option value="gaming">Gaming</option>
                            <option value="business">Business</option>
                            <option value="travel">Travel</option>
                            <option value="food">Food</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Verification Tier</label>
                        <select className="input-field" value={form.verificationTier} onChange={(e) => setForm({...form, verificationTier: e.target.value})}>
                            {tiers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Professional Bio (Long)</label>
                    <textarea className="input-field min-h-[120px]" value={form.longBio} onChange={(e) => setForm({...form, longBio: e.target.value})} placeholder="Write a detailed biography..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">WhatsApp (for Booking)</label>
                        <input className="input-field" value={form.whatsappNumber} onChange={(e) => setForm({...form, whatsappNumber: e.target.value})} placeholder="e.g. 96512345678" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Field Title</label>
                        <input className="input-field" value={form.field} onChange={(e) => setForm({...form, field: e.target.value})} placeholder="e.g. AI Expert & Developer" />
                    </div>
                </div>

                {/* Media */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Avatar URL</label>
                        <input className="input-field" value={form.logoUrl} onChange={(e) => setForm({...form, logoUrl: e.target.value})} placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase mb-2 text-muted">Cover URL</label>
                        <input className="input-field" value={form.coverUrl} onChange={(e) => setForm({...form, coverUrl: e.target.value})} placeholder="https://..." />
                    </div>
                </div>

                {/* Socials */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase text-muted">Social Media Links</label>
                    <div className="grid grid-cols-3 gap-3">
                        <input className="input-field text-xs" value={form.socialLinks.instagram} onChange={(e) => setForm({...form, socialLinks: {...form.socialLinks, instagram: e.target.value}})} placeholder="Instagram URL" />
                        <input className="input-field text-xs" value={form.socialLinks.tiktok} onChange={(e) => setForm({...form, socialLinks: {...form.socialLinks, tiktok: e.target.value}})} placeholder="TikTok URL" />
                        <input className="input-field text-xs" value={form.socialLinks.linkedin} onChange={(e) => setForm({...form, socialLinks: {...form.socialLinks, linkedin: e.target.value}})} placeholder="LinkedIn URL" />
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-muted">Tags (Press Enter)</label>
                    <input className="input-field" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="e.g. AI, Crypto, Lifestyle" />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {form.tags.map(t => (
                            <span key={t} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold flex items-center gap-2">
                                {t} <X size={10} className="cursor-pointer" onClick={() => setForm({...form, tags: form.tags.filter(tag => tag !== t)})} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5 flex-shrink-0">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button onClick={async () => {
                    if(!form.name || !form.pageName) return toast.error('Name and Page ID required');
                    setSaving(true);
                    try {
                        item?.id ? await api.put(`${COLLECTION_API}/${item.id}`, form) : await api.post(COLLECTION_API, form);
                        toast.success('Creator profile saved ✓'); onSave(); onClose();
                    } catch(e) { toast.error('Failed to save'); } finally { setSaving(false); }
                }} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Creator'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsInfluencers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);

  const load = async () => {
    try { 
      setLoading(true); 
      const res = await api.get(`${COLLECTION_API}/admin/all`); 
      setItems(res.data || []); 
    }
    catch(e) { toast.error('Failed to load influencers'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Influencer Directory</h1>
          <p className="text-sm text-muted">Manage the public network of creators and their profile pages</p>
        </div>
        <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add New Creator
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card group overflow-hidden border-white/5 hover:border-cyan-500/30 transition-all p-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                    {item.logoUrl ? <img src={item.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-cyan-500">{item.name[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate flex items-center gap-2">
                        {item.name}
                        {item.verificationTier === 'gold' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        {item.verificationTier === 'blue' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                        {item.verificationTier === 'green' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </h4>
                    <p className="text-xs text-cyan-400 font-semibold">{item.field || item.category}</p>
                    <p className="text-[10px] text-muted truncate mt-1">ID: {item.pageName}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                    <button onClick={async () => { if(confirm('Delete creator?')) { await api.delete(`${COLLECTION_API}/${item.id}`); load(); } }} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
            </div>
          ))}
        </div>
      )}

      {isModal && <InfluencerModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
