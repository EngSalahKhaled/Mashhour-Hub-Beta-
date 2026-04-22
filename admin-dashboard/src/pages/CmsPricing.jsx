import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firebase';

const COLLECTION = 'pricing_packages';

function PricingModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title: '', 
    price: '', 
    badge: 'Essential', 
    features: [''], 
    buttonText: 'Get Started',
    isHighlighted: false,
    language: 'en',
    order: 0
  });
  const [saving, setSaving] = useState(false);

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const updateFeature = (index, value) => {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  };
  const removeFeature = (index) => setForm({ ...form, features: form.features.filter((_, i) => i !== index) });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(4,17,33,0.9)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" style={{ background: 'var(--surf)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">{item?.id ? 'Edit Package' : 'Add Pricing Package'}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Language</label>
                        <select className="input-field" value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Badge / Tagline</label>
                        <input className="input-field" value={form.badge} onChange={(e) => setForm({...form, badge: e.target.value})} placeholder="e.g. Essential" />
                    </div>
                </div>

                <div>
                    <label className="label">Package Title</label>
                    <input className="input-field text-lg font-bold text-cyan-400" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Starter Management" />
                </div>

                <div>
                    <label className="label">Price Display</label>
                    <input className="input-field" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="e.g. 150 KWD" />
                </div>

                <div>
                    <label className="label flex justify-between items-center">
                        <span>Features</span>
                        <button onClick={addFeature} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded">Add Feature</button>
                    </label>
                    <div className="space-y-2">
                        {form.features.map((f, i) => (
                            <div key={i} className="flex gap-2">
                                <input className="input-field text-xs" value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder="Enter feature text..." />
                                <button onClick={() => removeFeature(i)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={form.isHighlighted} onChange={(e) => setForm({...form, isHighlighted: e.target.checked})} />
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${form.isHighlighted ? 'bg-cyan-500' : 'bg-white/10'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.isHighlighted ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm font-semibold">Highlight (Most Requested)</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-white/5">
                <button onClick={onClose} className="btn-ghost" disabled={saving}>Cancel</button>
                <button onClick={async () => {
                    if(!form.title || !form.price) return toast.error('Title and Price required');
                    setSaving(true);
                    try {
                        item?.id ? await updateDocument(COLLECTION, item.id, form) : await addDocument(COLLECTION, form);
                        toast.success('Pricing synced ✓'); onSave(); onClose();
                    } catch(e) { toast.error('Failed to sync'); } finally { setSaving(false); }
                }} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Package'}
                </button>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}

export default function CmsPricing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [lang, setLang] = useState('en');

  const load = async () => {
    try { setLoading(true); const data = await getCollection(COLLECTION); setItems(data); }
    catch(e) { toast.error('Error loading pricing'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => i.language === lang).sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pricing & Packages</h1>
          <p className="text-sm text-muted">Manage service tiers, pricing, and features across the platform</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl">
                <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-muted'}`}>English</button>
                <button onClick={() => setLang('ar')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${lang === 'ar' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-muted'}`}>العربية</button>
            </div>
            <button onClick={() => { setEditing(null); setIsModal(true); }} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Package
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className={`card p-6 flex flex-col relative transition-all duration-300 ${item.isHighlighted ? 'border-cyan-500/40 shadow-xl shadow-cyan-500/5 ring-1 ring-cyan-500/20' : 'border-white/5'}`}>
                {item.isHighlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Recommended</span>}
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.badge}</span>
                        <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => { setEditing(item); setIsModal(true); }} className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors"><Edit2 size={16} /></button>
                        <button onClick={async () => { if(confirm('Delete package?')) { await deleteDocument(COLLECTION, item.id); load(); } }} className="p-2 hover:bg-rose-500/10 rounded-lg text-muted hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-bold text-cyan-400">{item.price}</span>
                    <span className="text-xs text-muted ml-2">/ month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                    {item.features?.map((f, i) => (
                        <li key={i} className="flex gap-3 text-sm text-silver items-start">
                            <CheckCircle2 size={16} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                <button className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${item.isHighlighted ? 'bg-cyan-500 text-black' : 'bg-white/5 text-silver'}`}>
                    {item.buttonText || 'Get Started'}
                </button>
            </div>
          ))}
        </div>
      )}

      {isModal && <PricingModal item={editing} onClose={() => setIsModal(false)} onSave={load} />}
    </div>
  );
}
