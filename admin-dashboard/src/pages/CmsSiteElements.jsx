import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Loader2, Type, Image as ImageIcon, FileText, Globe, ScanSearch, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const BRAND = {
  bg: '#041121',
  bgAlt: '#071a33',
  text: '#f6f2e8',
  muted: '#b9c7dc',
  gold: '#f4cd55',
  cyan: '#36daf5',
};

function ElementModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { elementId: '', type: 'text', content: '', description: '', selector: '' });
  const [saving, setSaving] = useState(false);

  const isEdit = !!item;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.elementId || !form.content) {
      toast.error('Element ID and Content are required');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/site-elements/${item.id}`, {
          type: form.type,
          content: form.content,
          description: form.description,
          selector: form.selector
        });
        toast.success('Element updated');
      } else {
        await api.post('/site-elements', form);
        toast.success('Element created');
      }
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save element');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-2xl overflow-hidden rounded-2xl flex flex-col max-h-[90vh]"
        style={{ background: BRAND.bgAlt, border: `1px solid rgba(54, 218, 245, 0.2)` }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: BRAND.text }}>
              {isEdit ? 'Edit Element' : 'Create New Element'}
            </h2>
            <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
              {isEdit ? `Editing ${form.elementId}` : 'Define a new dynamic content element'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} color={BRAND.muted} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="element-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.muted }}>
                Element ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="elementId"
                value={form.elementId}
                onChange={handleChange}
                disabled={isEdit}
                placeholder="e.g. hero-title, about-image"
                className="input-field w-full disabled:opacity-50"
                required
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Unique identifier used to fetch this content. Cannot be changed once created. Use lowercase and hyphens.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.muted }}>
                Content Type <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="text">Single-line Text</option>
                <option value="textarea">Multi-line Text (Textarea)</option>
                <option value="image">Image URL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.muted }}>
                Content <span className="text-red-400">*</span>
              </label>
              {form.type === 'textarea' ? (
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Enter content..."
                  rows={5}
                  className="input-field w-full resize-y"
                  required
                />
              ) : (
                <input
                  type={form.type === 'image' ? 'url' : 'text'}
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder={form.type === 'image' ? 'https://example.com/image.jpg' : 'Enter text content...'}
                  className="input-field w-full"
                  required
                />
              )}
              {form.type === 'image' && form.content && (
                <div className="mt-4 p-2 rounded-lg bg-black/20 border border-white/10 inline-block">
                  <img 
                    src={form.content} 
                    alt="Preview" 
                    className="max-h-40 rounded object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.muted }}>
                Internal Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Main headline on the homepage"
                className="input-field w-full"
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Helps you remember where this element is used.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.muted }}>
                HTML Class or ID (Optional)
              </label>
              <input
                type="text"
                name="selector"
                value={form.selector || ''}
                onChange={handleChange}
                placeholder="e.g. .hero-title or #main-image"
                className="input-field w-full"
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                The actual class or ID in your HTML code to help you search for it later.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 bg-black/20" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5">
            Cancel
          </button>
          <button 
            type="submit" 
            form="element-form" 
            disabled={saving} 
            className="btn-primary px-8 py-2.5 flex items-center gap-2"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Element'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CmsSiteElements() {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null); // null = closed, {} = new, {id:...} = edit

  // Live Scanner States
  const [scanUrl, setScanUrl] = useState('https://mashhour-hub-beta.vercel.app/');
  const [scannedElement, setScannedElement] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedEditableContent, setScannedEditableContent] = useState('');
  const [scannedSaving, setScannedSaving] = useState(false);

  const fetchElements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-elements');
      setElements(res.data || []);
    } catch (err) {
      toast.error('Failed to load elements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  const handleScan = async () => {
    if (!search.startsWith('.') && !search.startsWith('#')) {
      toast.error('Search query must be a valid Class (starts with .) or ID (starts with #) to scan the live website.');
      return;
    }
    setScanning(true);
    setScannedElement(null);
    try {
      const res = await api.get(`/site-elements/fetch-html?url=${encodeURIComponent(scanUrl)}`);
      // api.js wraps non-JSON responses in { message: "html string..." }
      const htmlContent = res.message || res.data || (typeof res === 'string' ? res : '');
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Auto-format selector if the user typed spaces (e.g. ".my-class is-visible" -> ".my-class.is-visible")
      let validSelector = search.trim();
      if (validSelector.startsWith('.') && validSelector.includes(' ')) {
         validSelector = '.' + validSelector.split(' ').filter(Boolean).map(c => c.replace(/^\./, '')).join('.');
      }

      let el = null;
      try {
        el = doc.querySelector(validSelector);
      } catch (err) {
        toast.error(`Invalid CSS selector format: ${validSelector}`);
        setScanning(false);
        return;
      }
      
      if (!el) {
        toast.error(`Element not found in raw HTML. (Note: Animation classes like "is-visible" are added by JS and won't be found)`);
      } else {
        setScannedElement({
          outerHTML: el.outerHTML,
          tagName: el.tagName.toLowerCase(),
          textContent: el.textContent.trim(),
          src: el.src || null,
          href: el.href || null,
          classList: Array.from(el.classList).join(' ')
        });
        setScannedEditableContent(el.tagName.toLowerCase() === 'img' ? (el.src || '') : el.textContent.trim());
        toast.success(`Found element <${el.tagName.toLowerCase()}>`);
      }
    } catch (err) {
      toast.error('Failed to scan website: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleQuickSaveScanned = async () => {
    if (!scannedElement) return;
    setScannedSaving(true);
    
    // Clean up elementId
    let elementId = search.replace(/[.#]/g, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (elementId.length > 40) elementId = elementId.substring(0, 40); // safety length

    const type = scannedElement.tagName === 'img' ? 'image' : (scannedEditableContent.length > 50 ? 'textarea' : 'text');
    
    const payload = {
      elementId,
      type,
      content: scannedEditableContent,
      description: `Scanned from ${scanUrl} (Auto)`,
      selector: search
    };

    try {
      const existing = elements.find(e => e.selector === search || e.elementId === elementId);
      if (existing) {
        await api.patch(`/site-elements/${existing.id}`, payload);
        toast.success('Element updated! Refresh the website to see changes.');
      } else {
        await api.post('/site-elements', payload);
        toast.success('New element created! Refresh the website to see changes.');
      }
      fetchElements();
      
      // Update visual render locally
      setScannedElement(prev => ({
        ...prev,
        textContent: type !== 'image' ? scannedEditableContent : prev.textContent,
        src: type === 'image' ? scannedEditableContent : prev.src,
        outerHTML: prev.outerHTML.replace(
           type === 'image' ? (prev.src || '') : prev.textContent,
           scannedEditableContent
        )
      }));
    } catch (err) {
      toast.error('Failed to save element: ' + err.message);
    } finally {
      setScannedSaving(false);
    }
  };

  const handleDelete = async (id, elementId) => {
    if (!window.confirm(`Are you sure you want to delete the element "${elementId}"? This might break the frontend if it's still being used.`)) {
      return;
    }
    try {
      await api.delete(`/site-elements/${id}`);
      toast.success('Element deleted');
      setElements(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const filteredElements = elements.filter(el => 
    el.elementId.toLowerCase().includes(search.toLowerCase()) || 
    (el.description && el.description.toLowerCase().includes(search.toLowerCase())) ||
    (el.selector && el.selector.toLowerCase().includes(search.toLowerCase()))
  );

  const getIconForType = (type) => {
    switch(type) {
      case 'image': return <ImageIcon size={18} color={BRAND.cyan} />;
      case 'textarea': return <FileText size={18} color={BRAND.gold} />;
      default: return <Type size={18} color={BRAND.muted} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: BRAND.text }}>
            <Globe size={24} color={BRAND.cyan} />
            Dynamic Content Editor
          </h1>
          <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
            Manage individual text and image elements across the website.
          </p>
        </div>
        <button 
          onClick={() => setModalItem({ elementId: '', type: 'text', content: '', description: '', selector: '' })}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Element
        </button>
      </div>

      <div className="glass-card p-6" style={{ background: 'rgba(7, 26, 51, 0.5)' }}>
        
        {/* Search & Scanner Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={18} color={BRAND.muted} />
            <input 
              type="text" 
              placeholder="Search existing elements, or enter a Class/ID (e.g. .hero-title) to scan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
            />
          </div>
          
          {(search.startsWith('.') || search.startsWith('#')) && (
            <div className="flex items-center gap-2">
              <input 
                type="url" 
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                className="input-field text-sm w-48"
                placeholder="https://..."
              />
              <button 
                onClick={handleScan}
                disabled={scanning}
                className="btn-primary !px-4 !py-3 flex items-center gap-2 whitespace-nowrap"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
                Scan Live Site
              </button>
            </div>
          )}
        </div>

        {/* Live Scanner Result Box */}
        <AnimatePresence>
          {scannedElement && (search.startsWith('.') || search.startsWith('#')) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-5 rounded-xl" style={{ background: 'rgba(54, 218, 245, 0.05)', border: `1px solid rgba(54, 218, 245, 0.2)` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: BRAND.cyan }}>
                    <Code size={18} /> Live Scanner Result for <span className="font-mono text-white bg-black/30 px-2 py-0.5 rounded">{search}</span>
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleQuickSaveScanned}
                      disabled={scannedSaving}
                      className="btn-primary !py-1.5 !px-3 !text-xs bg-green-600 hover:bg-green-500 border-none"
                    >
                      {scannedSaving ? <Loader2 size={14} className="animate-spin mr-1 inline" /> : <Plus size={14} className="mr-1 inline" />} 
                      Save & Update Live Site
                    </button>
                    <button onClick={() => setScannedElement(null)} className="p-1.5 hover:bg-white/10 rounded-lg">
                      <X size={16} color={BRAND.muted} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visual Render */}
                  <div className="bg-black/40 rounded-lg p-4 border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: BRAND.muted }}>Visual Render</p>
                    <div 
                      className="text-white break-words"
                      dangerouslySetInnerHTML={{ __html: scannedElement.outerHTML }} 
                      style={{ 
                        zoom: 0.8, // Scale down to fit
                        all: 'revert', // Try to reset some styles so it renders decently
                        color: 'inherit'
                      }} 
                    />
                  </div>
                  
                  {/* Quick Edit Input */}
                  <div className="bg-black/60 rounded-lg p-4 border flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: BRAND.gold }}>Quick Edit Content</p>
                    
                    {scannedElement.tagName === 'img' ? (
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs text-gray-400">Image Source URL:</label>
                        <input 
                          type="url"
                          value={scannedEditableContent}
                          onChange={(e) => setScannedEditableContent(e.target.value)}
                          className="input-field w-full text-sm font-mono"
                          placeholder="https://..."
                        />
                        {scannedEditableContent && (
                           <img src={scannedEditableContent} alt="preview" className="h-20 w-auto object-contain mt-2 rounded border border-gray-700 bg-black/50" />
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={scannedEditableContent}
                        onChange={(e) => setScannedEditableContent(e.target.value)}
                        className="input-field w-full text-sm flex-1 font-mono resize-none min-h-[120px]"
                        placeholder="Enter new text content here..."
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : filteredElements.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: BRAND.muted }}>No elements found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredElements.map((el) => (
                <motion.div
                  key={el.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-xl flex flex-col h-full group"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-black/30">
                        {getIconForType(el.type)}
                      </div>
                      <h3 className="font-mono text-sm font-semibold truncate" style={{ color: BRAND.text }}>
                        {el.elementId}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModalItem(el)} className="p-1.5 rounded hover:bg-white/10 text-cyan-400">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(el.id, el.elementId)} className="p-1.5 rounded hover:bg-white/10 text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {el.description && (
                    <p className="text-xs mb-1 truncate" style={{ color: BRAND.muted }}>
                      {el.description}
                    </p>
                  )}
                  {el.selector && (
                    <p className="text-xs mb-3 font-mono" style={{ color: BRAND.gold }}>
                      {el.selector}
                    </p>
                  )}

                  <div className="mt-auto bg-black/40 rounded-lg p-3 text-xs overflow-hidden" style={{ minHeight: '60px' }}>
                    {el.type === 'image' ? (
                      <div className="flex items-center gap-2 text-cyan-400 truncate">
                        <ImageIcon size={12} /> <span className="truncate">{el.content}</span>
                      </div>
                    ) : (
                      <div className="line-clamp-3 text-gray-300 break-words">
                        {el.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalItem && (
          <ElementModal 
            item={modalItem.id ? modalItem : null} 
            onClose={() => setModalItem(null)} 
            onSave={() => {
              setModalItem(null);
              fetchElements();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
