import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Receipt, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ErpExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'operating', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/erp/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses(data.expenses);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/erp/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Expense added successfully');
        setShowModal(false);
        setFormData({ title: '', category: 'operating', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
        fetchExpenses();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error adding expense');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/erp/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Deleted successfully');
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      toast.error('Error deleting');
    }
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="text-cyan-400" />
            المصروفات (Expenses)
          </h1>
          <p className="text-slate-400 mt-1">تتبع وإدارة مصروفات الشركة لحساب صافي الأرباح بدقة.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
        >
          <Plus size={18} />
          إضافة مصروف
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 font-medium">إجمالي المصروفات</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">${total.toFixed(2)}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400 font-medium">عدد العمليات</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{expenses.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No expenses found. Add your first expense above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50 text-sm font-medium text-slate-400">
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">البيان (العنوان)</th>
                  <th className="p-4 text-right">التصنيف</th>
                  <th className="p-4 text-right">المبلغ</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {expenses.map((expense) => (
                  <motion.tr key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-800/30 text-sm">
                    <td className="p-4 text-slate-300 text-right">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-slate-200 text-right">{expense.title}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-red-400 font-bold text-right">${parseFloat(expense.amount).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(expense.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">إضافة مصروف جديد</h2>
            <form onSubmit={handleAdd} className="space-y-4 text-right" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">البيان (ما هو المصروف؟)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">المبلغ ($)</label>
                <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">التصنيف</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white">
                  <option value="operating">تشغيل (Operating)</option>
                  <option value="salary">رواتب (Salaries)</option>
                  <option value="software">برمجيات واشتراكات (Software)</option>
                  <option value="marketing">تسويق وإعلانات (Marketing)</option>
                  <option value="other">أخرى (Other)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">التاريخ</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">حفظ المصروف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
