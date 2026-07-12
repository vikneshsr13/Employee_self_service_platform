import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, FileText, ChevronRight, CheckCircle, PlusCircle, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGetDashboardStats, apiApplyLeave, apiGetLeaves } from '../api';

interface Stats { employee: Record<string,unknown>; pto_balance: number; pending_leaves: number; pending_expenses: number; latest_net_salary: number; }
interface Leave { id: number; type: string; start_date: string; end_date: string; status: string; }

export default function Dashboard() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [leaves,     setLeaves]     = useState<Leave[]>([]);
  const [clockedIn,  setClockedIn]  = useState(false);
  const [clockTime,  setClockTime]  = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [leaveForm,  setLeaveForm]  = useState({ type: 'Vacation', start_date: '', end_date: '', reason: '' });
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});
  const [toast,      setToast]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiGetDashboardStats().then(setStats).catch(console.error);
    apiGetLeaves().then(setLeaves).catch(console.error);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleClockToggle = () => {
    if (!clockedIn) {
      const now = new Date().toLocaleTimeString();
      setClockTime(now);
      setClockedIn(true);
      showToast(`Clocked in at ${now}`);
    } else {
      setClockedIn(false);
      setClockTime(null);
      showToast('Clocked out successfully!');
    }
  };

  const validateLeave = () => {
    const e: Record<string,string> = {};
    if (!leaveForm.start_date) e.start_date = 'Required.';
    if (!leaveForm.end_date)   e.end_date   = 'Required.';
    if (leaveForm.end_date < leaveForm.start_date) e.end_date = 'Must be after start.';
    if (!leaveForm.reason.trim()) e.reason = 'Required.';
    return e;
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLeave();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      const newLeave = await apiApplyLeave(leaveForm);
      setLeaves([newLeave, ...leaves]);
      setShowModal(false);
      setLeaveForm({ type: 'Vacation', start_date: '', end_date: '', reason: '' });
      setFormErrors({});
      showToast('Leave request submitted!');
    } catch (err: unknown) {
      setFormErrors({ reason: err instanceof Error ? err.message : 'Failed to submit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const user = stats?.employee as Record<string,string> | undefined;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Good morning, {firstName}! 👋</h1>
          <p>Here's your overview for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
        </div>
        <button className={`btn ${clockedIn ? 'btn-outline' : 'btn-primary'}`}
          onClick={handleClockToggle}
          style={clockedIn ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}>
          <Clock size={18} />
          {clockedIn ? `Clocked In · ${clockTime}` : 'Clock In'}
        </button>
      </div>

      {toast && (
        <div className="alert" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Profile summary card */}
      {user && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', border: 'none' }}>
          <div className="flex items-center gap-4">
            <div className="avatar" style={{ width: 60, height: 60, fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)' }}>
              {(user.name as string).split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h2 style={{ color: 'white', marginBottom: 2 }}>{user.name as string}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>{user.role as string} · {user.department as string}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.8rem' }}>Hire date: {user.hire_date as string} · {user.email as string}</p>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/leaves')}>
          <div className="stat-icon primary"><Calendar size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats?.pto_balance ?? '—'}</span>
            <span className="stat-label">PTO Balance (Days)</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success"><Clock size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats?.pending_leaves ?? 0}</span>
            <span className="stat-label">Pending Leave Requests</span>
          </div>
        </div>
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          <div className="stat-icon warning"><DollarSign size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">₹{stats?.pending_expenses?.toLocaleString() ?? 0}</span>
            <span className="stat-label">Pending Expenses</span>
          </div>
        </div>
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/salary')}>
          <div className="stat-icon info"><FileText size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">₹{stats?.latest_net_salary?.toLocaleString() ?? 0}</span>
            <span className="stat-label">Last Net Salary</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '2', minWidth: '380px' }}>
          <div className="flex justify-between items-center mb-6">
            <h2>Recent Leave Applications</h2>
            <button className="btn btn-outline" onClick={() => setShowModal(true)}>
              <PlusCircle size={16} /> Request Time Off
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Type</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody>
                {leaves.slice(0, 4).map(l => (
                  <tr key={l.id}>
                    <td>{l.type}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td><span className={l.status === 'Approved' ? 'badge success' : l.status === 'Rejected' ? 'badge danger' : 'badge warning'}>{l.status}</span></td>
                  </tr>
                ))}
                {leaves.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No leave records yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate('/leaves')}>
            View All History <ChevronRight size={16} />
          </button>
        </div>

        <div className="card" style={{ flex: '1', minWidth: '280px' }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { label: 'Apply for Leave',     icon: <Calendar size={18} />,  action: () => setShowModal(true) },
              { label: 'Submit Expense Claim',icon: <DollarSign size={18} />, action: () => navigate('/expenses') },
              { label: 'Download Payslip',    icon: <FileText size={18} />,  action: () => navigate('/salary') },
            ].map(item => (
              <button key={item.label} className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }} onClick={item.action}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Request Time Off</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleLeaveSubmit}>
              <div className="input-group">
                <label>Leave Type</label>
                <select className="form-select" value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}>
                  <option>Vacation</option><option>Sick Leave</option><option>Casual Leave</option><option>Unpaid Leave</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" className="form-input" value={leaveForm.start_date} onChange={e => { setLeaveForm({ ...leaveForm, start_date: e.target.value }); setFormErrors({ ...formErrors, start_date: '' }); }} />
                  {formErrors.start_date && <span className="field-error">{formErrors.start_date}</span>}
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input type="date" className="form-input" value={leaveForm.end_date} onChange={e => { setLeaveForm({ ...leaveForm, end_date: e.target.value }); setFormErrors({ ...formErrors, end_date: '' }); }} />
                  {formErrors.end_date && <span className="field-error">{formErrors.end_date}</span>}
                </div>
              </div>
              <div className="input-group">
                <label>Reason</label>
                <textarea className="form-input" rows={3} value={leaveForm.reason} onChange={e => { setLeaveForm({ ...leaveForm, reason: e.target.value }); setFormErrors({ ...formErrors, reason: '' }); }} />
                {formErrors.reason && <span className="field-error"><AlertCircle size={12} style={{display:'inline',marginRight:4}}/>{formErrors.reason}</span>}
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
