import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiGetLeaves, apiApplyLeave } from '../api';

interface Leave { id: number; type: string; start_date: string; end_date: string; reason: string; status: string; }

export default function Leaves() {
  const [leaves,     setLeaves]     = useState<Leave[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ type: 'Vacation', start_date: '', end_date: '', reason: '' });
  const [errors,     setErrors]     = useState<Record<string,string>>({});
  const [toast,      setToast]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGetLeaves().then(data => { setLeaves(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.start_date) e.start_date = 'Start date is required.';
    if (!form.end_date)   e.end_date   = 'End date is required.';
    if (form.end_date && form.start_date && form.end_date < form.start_date) e.end_date = 'End must be after start.';
    if (!form.reason.trim()) e.reason = 'Please provide a reason.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const newLeave = await apiApplyLeave(form);
      setLeaves([newLeave, ...leaves]);
      setShowModal(false);
      setForm({ type: 'Vacation', start_date: '', end_date: '', reason: '' });
      setErrors({});
      showToast('Leave request submitted successfully!');
    } catch (err: unknown) {
      setErrors({ reason: err instanceof Error ? err.message : 'Failed to submit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const badgeClass = (s: string) => s === 'Approved' ? 'badge success' : s === 'Rejected' ? 'badge danger' : 'badge warning';

  const getDays = (start: string, end: string) => {
    if (!start || !end) return '–';
    const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
    return `${d} day${d > 1 ? 's' : ''}`;
  };

  const approved = leaves.filter(l => l.status === 'Approved').reduce((a, l) => a + (Math.round((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / 86400000) + 1), 0);
  const pending  = leaves.filter(l => l.status === 'Pending').length;

  return (
    <>
      <div className="page-header">
        <div><h1>Time & Leave</h1><p>Manage your leave applications and track balances.</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><PlusCircle size={18} /> Apply for Leave</button>
      </div>

      {toast && (
        <div className="alert" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
        <div className="card stat-card"><div className="stat-icon primary"><Calendar size={28} /></div><div className="stat-details"><span className="stat-value">{18 - approved}</span><span className="stat-label">Days Remaining</span></div></div>
        <div className="card stat-card"><div className="stat-icon success"><Calendar size={28} /></div><div className="stat-details"><span className="stat-value">{approved}</span><span className="stat-label">Days Used</span></div></div>
        <div className="card stat-card"><div className="stat-icon warning"><Calendar size={28} /></div><div className="stat-details"><span className="stat-value">{pending}</span><span className="stat-label">Pending Requests</span></div></div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>My Leave Applications</h2>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading…</p> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Duration</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.type}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td>{getDays(l.start_date, l.end_date)}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>{l.reason}</td>
                    <td><span className={badgeClass(l.status)}>{l.status}</span></td>
                  </tr>
                ))}
                {!loading && leaves.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No leave records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Apply for Leave</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Leave Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option>Vacation</option><option>Sick Leave</option><option>Casual Leave</option><option>Maternity/Paternity Leave</option><option>Unpaid Leave</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" className="form-input" value={form.start_date} onChange={e => { setForm({ ...form, start_date: e.target.value }); setErrors({ ...errors, start_date: '' }); }} />
                  {errors.start_date && <span className="field-error">{errors.start_date}</span>}
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input type="date" className="form-input" value={form.end_date} onChange={e => { setForm({ ...form, end_date: e.target.value }); setErrors({ ...errors, end_date: '' }); }} />
                  {errors.end_date && <span className="field-error">{errors.end_date}</span>}
                </div>
              </div>
              <div className="input-group">
                <label>Reason</label>
                <textarea className="form-input" rows={3} value={form.reason} onChange={e => { setForm({ ...form, reason: e.target.value }); setErrors({ ...errors, reason: '' }); }} />
                {errors.reason && <span className="field-error"><AlertCircle size={12} style={{display:'inline',marginRight:4}}/>{errors.reason}</span>}
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
