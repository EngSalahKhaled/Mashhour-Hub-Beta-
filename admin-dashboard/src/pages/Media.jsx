import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Copy, Loader2, Image, Link2, X, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollection, addDocument, deleteDocument } from '../services/firebase';
import ConfirmModal from '../components/ConfirmModal';

const COLLECTION = 'media_library';
const MAX_BASE64 = 750000; // ~750KB

export default function MediaPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode]       = useState('url'); // 'url' or 'file'
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [search, setSearch]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    try { setLoading(true); const data = await getCollection(COLLECTION); setItems(data); }
    catch { toast.error('Failed to load media'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return toast.error('Enter a URL');
    setUploading(true);
    try {
      await addDocument(COLLECTION, {
        name: nameInput || urlInput.split('/').pop() || 'media',
        url: urlInput, base64: null,
        type: urlInput.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? 'image' : 'file',
        size: 0,
      });
      toast.success('Media added ✓');
      setUrlInput(''); setNameInput('');
      load();
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_BASE64) return toast.error('File too large (max 750KB for Firestore). Use URL mode or upgrade to Firebase Storage.');
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        await addDocument(COLLECTION, {
          name: file.name, url: null,
          base64: reader.result,
          type: file.type.startsWith('image') ? 'image' : 'file',
          size: file.size,
        });
        toast.success('File uploaded ✓');
        load();
      };
      reader.readAsDataURL(file);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await deleteDocument(COLLECTION, deleteTarget); 
      toast.success('Deleted ✓'); 
      load(); 
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const copyUrl = (item) => {
    const link = item.url || item.base64;
    navigator.clipboard.writeText(link);
    toast.success('URL copied to clipboard ✓');
  };

  const filtered = items.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Media Library</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload and manage images and files</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: 'var(--text-muted)' }}>{items.length} files</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-6" style={{ border: '1px solid rgba(0,212,255,0.12)' }}>
        <div className="flex gap-3 mb-5">
          <button onClick={() => setMode('url')} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: mode === 'url' ? 'rgba(0,212,255,0.12)' : 'transparent', border: `1px solid ${mode === 'url' ? 'rgba(0,212,255,0.3)' : 'rgba(99,179,237,0.1)'}`, color: mode === 'url' ? '#00d4ff' : 'var(--text-muted)', cursor: 'pointer' }}>
            <Link2 size={14} className="inline mr-2" />URL Link
          </button>
          <button onClick={() => setMode('file')} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: mode === 'file' ? 'rgba(0,212,255,0.12)' : 'transparent', border: `1px solid ${mode === 'file' ? 'rgba(0,212,255,0.3)' : 'rgba(99,179,237,0.1)'}`, color: mode === 'file' ? '#00d4ff' : 'var(--text-muted)', cursor: 'pointer' }}>
            <Upload size={14} className="inline mr-2" />Upload File
          </button>
        </div>

        {mode === 'url' ? (
          <div className="flex flex-col md:flex-row gap-3">
            <input className="input-field flex-1" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="File name (optional)" />
            <input className="input-field flex-[2]" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/image.png" />
            <button onClick={handleUrlUpload} disabled={uploading} className="btn-primary whitespace-nowrap">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={16} /> Add</>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-cyan-500/40"
            style={{ borderColor: 'rgba(99,179,237,0.2)' }}
            onClick={() => fileRef.current?.click()}>
            <Upload size={32} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Click to upload (max 750KB)</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PNG, JPG, GIF, WEBP, PDF</p>
            <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field !pl-11" placeholder="Search media..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(99,179,237,0.2)' }}>
          <Image size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No media yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => {
            const src = item.url || item.base64;
            const isImage = item.type === 'image' || (src && src.match(/\.(png|jpg|jpeg|gif|webp|svg)/i));
            return (
              <motion.div key={item.id} layoutId={item.id}
                className="glass-card overflow-hidden group relative"
                style={{ border: '1px solid rgba(99,179,237,0.08)' }}>
                <div className="aspect-square relative overflow-hidden"
                  style={{ background: isImage && src ? `url(${src}) center/cover` : 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  {!isImage && <div className="absolute inset-0 flex items-center justify-center"><FileIcon size={36} style={{ color: 'var(--text-muted)' }} /></div>}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(item)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Copy URL"><Copy size={16} color="#fff" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition-colors" title="Delete"><Trash2 size={16} color="#f43f5e" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'External URL'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Media"
        message="Are you sure you want to permanently delete this file? This action cannot be undone."
        confirmText="Delete File"
      />
    </div>
  );
}

function FileIcon({ size, style }) {
  return <Image size={size} style={style} />;
}
