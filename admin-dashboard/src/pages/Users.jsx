import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import ConfirmModal from '../components/ConfirmModal';

// Helper to get auth token
const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return await user.getIdToken();
};

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Modal ────────────────────────────────────────────────────────────────────
function UserModal({ onClose, onSave }) {
  const [form, setForm] = useState({ 
    email: '', password: '', displayName: '', role: 'moderator' 
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) =>
    setForm((p) => ({ ...p, [k]: typeof v === 'string' ? v : v.target?.value ?? v }));

  const handleSave = async () => {
    if (!form.email || !form.password) return toast.error('Email and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast.success('Admin user created successfully ✓');
      onSave();
      onClose();
    } catch (err) {
      toast.error('Creation failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="users-modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(4,17,33,0.8)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="card w-full max-w-md p-0 overflow-hidden flex flex-col" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(99,179,237,0.1)' }}>
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)]">
            <h3 className="text-xl font-bold">Add New Admin</h3>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4 flex-1">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Role</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                <option value="moderator">Moderator (Limited Access)</option>
                <option value="admin">Admin (Full Access)</option>
                <option value="superadmin">Super Admin (System Owner)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
              <input className="input-field" value={form.displayName} onChange={set('displayName')} placeholder="e.g. John Doe" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address <span className="text-rose-500">*</span></label>
              <input type="email" className="input-field" value={form.email} onChange={set('email')} placeholder="admin@mashhor-hub.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Password <span className="text-rose-500">*</span></label>
              <input type="password" className="input-field" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
            </div>
          </div>

          <div className="p-6 border-t border-[rgba(255,255,255,0.05)] flex justify-end gap-3 bg-[rgba(0,0,0,0.2)]">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Create User'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('[USERS LOAD ERROR]', err);
      toast.error(err.message || 'Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (uid) => {
    setDeleteTarget(uid);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/users/${deleteTarget}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast.success('User deleted successfully ✓');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Users & Roles</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage administrative access to the platform</p>
        </div>
        <button onClick={() => setIsModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Admin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-cyan-500" />
        </div>
      ) : (
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(99,179,237,0.1)] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] text-sm font-semibold text-[var(--text-secondary)]">
            <div className="col-span-4">User Details</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Created At</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {users.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)]">No users found.</div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white truncate">{u.displayName || 'No Name'}</div>
                      <div className="text-sm text-[var(--text-secondary)] truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Shield size={14} className={u.role === 'superadmin' ? 'text-amber-400' : u.role === 'admin' ? 'text-emerald-400' : 'text-cyan-400'} />
                    <span className="capitalize">{u.role}</span>
                  </div>
                  <div className="col-span-3 text-sm text-[var(--text-secondary)]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {isModal && <UserModal onClose={() => setIsModal(false)} onSave={load} />}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Admin Account"
        message="Are you sure you want to completely delete this admin user? They will lose all access to the dashboard immediately."
        confirmText="Delete Account"
      />
    </div>
  );
}
