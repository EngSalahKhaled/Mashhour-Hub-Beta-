import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const COLLECTION = 'blog_posts';

// ─── Modal ────────────────────────────────────────────────────────────────────
function BlogModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { 
    title_en: '', title_ar: '', slug: '', 
    excerpt_en: '', excerpt_ar: '', 
    content_en: '', content_ar: '', 
    thumbnail: '', category: 'general', status: 'draft' 
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const setQuill = (k) => (val) => setForm((p) => ({ ...p, [k]: val }));

  const handleSave = async () => {
    if (!form.title_en.trim() || !form.slug.trim()) return toast.error('English Title and Slug are required');
    setSaving(true);
    try {
      item?.id
        ? await updateDocument(COLLECTION, item.id, form)
        : await addDocument(COLLECTION, form);
      toast.success(item?.id ? 'Blog post updated ✓' : 'Blog post created ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="cms-blog-modal"
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
                Blog CMS
              </p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {item?.id ? 'Edit Blog Post' : 'Add New Blog Post'}
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
              className="flex flex-col overflow-y-auto w-full max-w-4xl mx-auto"
              style={{ borderRight: '1px solid rgba(99,179,237,0.08)' }}
            >
              <div className="p-8 space-y-6 flex-1 text-[var(--text-primary)]">
                
                {/* Meta Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
                    <select className="input-field" value={form.status} onChange={set('status')}>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="published">Published (Live)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <input className="input-field" value={form.category} onChange={set('category')} placeholder="e.g. Marketing" />
                  </div>
                </div>

                {/* Slug & Image */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>URL Slug <span className="text-rose-500">*</span></label>
                    <input className="input-field" value={form.slug} onChange={set('slug')} placeholder="e.g. how-to-grow-online" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Thumbnail URL</label>
                    <input className="input-field" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." />
                  </div>
                </div>

                {/* English Content */}
                <div className="p-5 rounded-xl border border-[rgba(99,179,237,0.1)] bg-[rgba(255,255,255,0.01)] space-y-4">
                  <h3 className="font-bold text-lg text-cyan-400">🇬🇧 English Content</h3>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Title</label>
                    <input className="input-field" value={form.title_en} onChange={set('title_en')} placeholder="English Title" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Excerpt</label>
                    <textarea className="input-field resize-none" rows={2} value={form.excerpt_en} onChange={set('excerpt_en')} placeholder="Short description..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Content</label>
                    <div className="bg-white text-black rounded-lg overflow-hidden">
                      <ReactQuill theme="snow" value={form.content_en} onChange={setQuill('content_en')} modules={modules} />
                    </div>
                  </div>
                </div>

                {/* Arabic Content */}
                <div className="p-5 rounded-xl border border-[rgba(99,179,237,0.1)] bg-[rgba(255,255,255,0.01)] space-y-4" dir="rtl">
                  <h3 className="font-bold text-lg text-emerald-400">🇸🇦 المحتوى العربي</h3>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>العنوان</label>
                    <input className="input-field" value={form.title_ar} onChange={set('title_ar')} placeholder="العنوان بالعربي" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>مقتطف</label>
                    <textarea className="input-field resize-none" rows={2} value={form.excerpt_ar} onChange={set('excerpt_ar')} placeholder="وصف قصير..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>المحتوى الكامل</label>
                    <div className="bg-white text-black rounded-lg overflow-hidden" dir="ltr">
                      <ReactQuill theme="snow" value={form.content_ar} onChange={setQuill('content_ar')} modules={modules} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Save Footer */}
              <div
                className="flex items-center justify-end gap-4 px-8 py-5 flex-shrink-0 sticky bottom-0"
                style={{ borderTop: '1px solid rgba(99,179,237,0.08)', background: 'rgba(13,21,40,0.95)' }}
              >
                <button onClick={onClose} className="btn-ghost !px-6 !py-3">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary !px-8 !py-3 !text-base">
                  {saving
                    ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
                    : item?.id ? '✓ Save Changes' : '+ Publish Post'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CmsBlog() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModal, setIsModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getCollection(COLLECTION);
      setItems(data);
    } catch (err) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (item) => {
    setEditing(item);
    setIsModal(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setIsModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDocument(COLLECTION, id);
      toast.success('Post deleted');
      load();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Blog Posts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your bilingual blog articles</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-cyan-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(99,179,237,0.2)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No posts found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              className="card p-0 flex flex-col overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="h-40 w-full relative"
                style={{
                  background: item.thumbnail ? `url(${item.thumbnail}) center/cover` : 'linear-gradient(135deg, #0f172a, #1e293b)',
                }}
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.title_en || 'Untitled'}
                </h3>
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {item.excerpt_en || 'No excerpt.'}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    /{item.slug}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors" style={{ color: '#f43f5e' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModal && (
        <BlogModal
          item={editing}
          onClose={() => setIsModal(false)}
          onSave={load}
        />
      )}
    </div>
  );
}
