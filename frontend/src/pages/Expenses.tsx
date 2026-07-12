import React, { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { apiGetExpenses, apiAddExpense } from '../api';

interface Expense { id: number; category: string; description: string; amount: number; date: string; status: string; }

export default function Expenses() {
  const [expenses,   setExpenses]   = useState<Expense[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ category: 'Travel', description: '', amount: '', date: '' });
  const [errors,     setErrors]     = useState<Record<string,string>>({});
  const [toast,      setToast]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGetExpenses().then(data => { setExpenses(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Valid amount is required.';
    if (!form.date) e.date = 'Date is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const newExp = await apiAddExpense({ ...form, amount: Number(form.amount) });
      setExpenses([newExp, ...expenses]);
      setShowModal(false);
      setForm({ category: 'Travel', description: '', amount: '', date: '' });
      setErrors({});
      showToast('Expense claim submitted!');
    } catch (err: unknown) {
      setErrors({ description: err instanceof Error ? err.message : 'Failed to submit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const badgeClass = (s: string) => s === 'Approved' ? 'badge success' : s === 'Rejected' ? 'badge danger' : 'badge warning';
  const totalPending  = expenses.filter(e => e.status === 'Pending').reduce((a,b) => a + b.amount, 0);
  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((a,b) => a + b.amount, 0);

  return (
    <>
      <div className="page-header">
        <div><h1>Expense Claims</h1><p>Submit and track your expense reimbursements.</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><PlusCircle size={18} /> New Expense</button>
      </div>

      {toast && (
        <div className="alert" style={{ background:'rgba(16,185,129,0.1)', color:'var(--success)', border:'1px solid rgba(16,185,129,0.2)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
        <div className="card stat-card"><div className="stat-icon warning"><DollarSign size={28} /></div><div className="stat-details"><span className="stat-value">₹{totalPending.toLocaleString()}</span><span className="stat-label">Pending Reimbursement</span></div></div>
        <div className="card stat-card"><div className="stat-icon success"><DollarSign size={28} /></div><div className="stat-details"><span className="stat-value">₹{totalApproved.toLocaleString()}</span><span className="stat-label">Approved Total</span></div></div>
        <div className="card stat-card"><div className="stat-icon primary"><Upload size={28} /></div><div className="stat-details"><span className="stat-value">{expenses.filter(e => e.status === 'Pending').length}</span><span className="stat-label">Under Review</span></div></div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>My Expense Claims</h2>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-tertiary)' }}>Loading…</p> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Category</th><th>Description</th><th>Date</th><th>Amount (₹)</th><th>Status</th></tr></thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td><span className="badge primary">{exp.category}</span></td>
                    <td>{exp.description}</td>
                    <td>{exp.date}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(exp.amount).toLocaleString()}</td>
                    <td><span className={badgeClass(exp.status)}>{exp.status}</span></td>
                  </tr>
                ))}
                {!loading && expenses.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-tertiary)' }}>No expense claims yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Submit Expense Claim</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Travel</option><option>Meals</option><option>Software</option><option>Office Supplies</option><option>Training</option><option>Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Description</label>
                <input type="text" className="form-input" placeholder="Brief description" value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: '' }); }} />
                {errors.description && <span className="field-error"><AlertCircle size={12} style={{display:'inline',marginRight:4}}/>{errors.description}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0" value={form.amount} onChange={e => { setForm({ ...form, amount: e.target.value }); setErrors({ ...errors, amount: '' }); }} />
                  {errors.amount && <span className="field-error">{errors.amount}</span>}
                </div>
                <div className="input-group">
                  <label>Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: '' }); }} />
                  {errors.date && <span className="field-error">{errors.date}</span>}
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Claim'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
