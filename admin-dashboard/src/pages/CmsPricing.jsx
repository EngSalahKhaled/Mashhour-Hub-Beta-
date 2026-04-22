import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

/**
 * CmsPricing Component
 * Manages the pricing plans for the website with full CRUD functionality.
 * Supports dynamic features list and multi-language plans.
 */
export default function CmsPricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/pricing');
      
      const normalizedData = (response.data || []).map(item => ({
        ...item,
        _id: item._id || item.id 
      }));
      
      setPlans(normalizedData);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load pricing plans. Please try again.');
      toast.error(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      const previousPlans = [...plans];
      setPlans(plans.filter(p => p._id !== id));
      
      await api.delete(`/pricing/${id}`);
      toast.success('Plan deleted successfully');
    } catch (err) {
      console.error('Error deleting plan:', err);
      toast.error('Failed to delete plan');
      fetchPlans(); 
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setCurrentPlan({ ...plan });
    } else {
      setCurrentPlan({
        title: '',
        price: '',
        badge: '',
        isHighlighted: false,
        features: [''],
        buttonText: 'Get Started',
        language: lang,
        order: plans.length
      });
    }
    setIsModalOpen(true);
  };

  const filteredPlans = plans
    .filter(p => p.language === lang)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pricing Plans</h1>
          <p className="text-muted mt-1">Configure service packages and pricing tiers displayed on the website.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-1 rounded-xl flex">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${lang === 'en' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-muted hover:text-white'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ar')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${lang === 'ar' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-muted hover:text-white'}`}
            >
              العربية
            </button>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={48} className="animate-spin text-cyan-400 opacity-20" />
          <p className="text-muted animate-pulse">Synchronizing with server...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center space-y-4 max-w-2xl mx-auto border-rose-500/20">
          <AlertCircle size={48} className="text-rose-500 mx-auto opacity-50" />
          <h3 className="text-xl font-bold">Oops! Something went wrong</h3>
          <p className="text-muted">{error}</p>
          <button onClick={fetchPlans} className="btn-ghost">Try Again</button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-6 border-dashed border-2">
          <div className="w-20 h-20 bg-cyan-500/5 rounded-full flex items-center justify-center mx-auto">
            <Plus size={32} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">No plans found for this language</h3>
            <p className="text-muted mt-2 max-w-md mx-auto">
              Start by creating your first pricing tier to show your customers what you offer.
            </p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary px-8">
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan) => (
              <motion.div
                key={plan._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-card p-6 flex flex-col relative group overflow-hidden ${plan.isHighlighted ? 'ring-2 ring-cyan-500/50 shadow-2xl shadow-cyan-500/10' : ''}`}
              >
                {plan.isHighlighted && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-cyan-500 text-black text-[10px] font-black px-8 py-1 rotate-45 translate-x-6 translate-y-2 uppercase tracking-tighter">
                      Popular
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    {plan.badge && (
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-cyan-400"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(plan._id)}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-muted hover:text-rose-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8 text-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Included Features:</p>
                  <ul className="space-y-3">
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-silver">
                        <CheckCircle2 size={16} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${plan.isHighlighted ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-silver hover:bg-white/10'}`}>
                  {plan.buttonText || 'Select Plan'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isModalOpen && (
        <PricingFormModal 
          plan={currentPlan} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={fetchPlans}
        />
      )}
    </div>
  );
}

function PricingFormModal({ plan, onClose, onSaved }) {
  const [formData, setFormData] = useState({ ...plan });
  const [isSaving, setIsSaving] = useState(false);

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index) => {
    if (formData.features.length <= 1) return toast.error("Plan must have at least one feature");
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return toast.error("Title and Price are required");
    
    const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
    if (cleanedFeatures.length === 0) return toast.error("Please add at least one feature");

    setIsSaving(true);
    try {
      const payload = { ...formData, features: cleanedFeatures };
      const planId = payload._id || payload.id;

      if (planId) {
        await api.put(`/pricing/${planId}`, payload);
        toast.success('Package updated ✓');
      } else {
        await api.post('/pricing', payload);
        toast.success('New package created ✓');
      }
      
      onSaved();
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save package');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-cyan-500/5"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-bold">{formData._id ? 'Edit Package' : 'Create New Package'}</h2>
            <p className="text-xs text-muted mt-0.5">Define tier details and market positioning</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Target Language</label>
              <select 
                className="input-field" 
                value={formData.language} 
                onChange={e => setFormData({...formData, language: e.target.value})}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Badge (Optional)</label>
              <input 
                className="input-field" 
                placeholder="e.g. Best Value, Recommended"
                value={formData.badge}
                onChange={e => setFormData({...formData, badge: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Package Title</label>
              <input 
                className="input-field font-bold text-cyan-400" 
                placeholder="e.g. Pro Growth Plan"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Price Label</label>
              <input 
                className="input-field" 
                placeholder="e.g. 500 KWD / month"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">Plan Features</label>
              <button 
                type="button" 
                onClick={addFeature}
                className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded hover:bg-cyan-500/20 transition-colors"
              >
                + ADD FEATURE
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <div className="flex-1 relative">
                    <input 
                      className="input-field pl-10 text-sm" 
                      placeholder="e.g. 24/7 Priority Support"
                      value={feature}
                      onChange={e => updateFeature(idx, e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      <CheckCircle2 size={14} />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-3 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest">CTA Button Text</label>
              <input 
                className="input-field" 
                placeholder="e.g. Get Started"
                value={formData.buttonText}
                onChange={e => setFormData({...formData, buttonText: e.target.value})}
              />
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.isHighlighted}
                  onChange={e => setFormData({...formData, isHighlighted: e.target.checked})}
                />
                <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isHighlighted ? 'bg-cyan-500 glow-cyan' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.isHighlighted ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <span className={`text-sm font-bold transition-colors ${formData.isHighlighted ? 'text-cyan-400' : 'text-muted'}`}>Highlight this plan</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isSaving}>Cancel</button>
          <button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSaving} 
            className="btn-primary min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{formData._id ? 'Update Plan' : 'Create Plan'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
