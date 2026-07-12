import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Calendar, DollarSign, UserPlus, X } from 'lucide-react';

interface Request {
  id: number;
  name: string;
  initials: string;
  type: 'Leave' | 'Expense';
  detail: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const INITIAL_REQUESTS: Request[] = [
  { id: 1, name: 'John Doe', initials: 'JD', type: 'Leave', detail: 'Sick Leave — Jul 15 (1 day)', date: '2026-07-10', status: 'Pending' },
  { id: 2, name: 'Alice Smith', initials: 'AS', type: 'Expense', detail: '₹3,500 — Travel (Jul 10)', date: '2026-07-10', status: 'Pending' },
  { id: 3, name: 'Bob Martin', initials: 'BM', type: 'Leave', detail: 'Vacation — Aug 1–5 (5 days)', date: '2026-07-09', status: 'Pending' },
];

const EMPLOYEES = [
  { id: 1, name: 'John Doe', role: 'Software Engineer', dept: 'Engineering', email: 'john@nexus.com', status: 'Active' },
  { id: 2, name: 'Alice Smith', role: 'Product Designer', dept: 'Design', email: 'alice@nexus.com', status: 'Active' },
  { id: 3, name: 'Bob Martin', role: 'Data Analyst', dept: 'Analytics', email: 'bob@nexus.com', status: 'Active' },
  { id: 4, name: 'Carol White', role: 'HR Specialist', dept: 'HR', email: 'carol@nexus.com', status: 'On Leave' },
];

export default function HRDashboard() {
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: '', dept: '' });
  const [empErrors, setEmpErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'requests'>('overview');

  const handleAction = (id: number, action: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  const validateEmp = () => {
    const e: Record<string, string> = {};
    if (!newEmp.name.trim()) e.name = 'Name is required.';
    if (!newEmp.email.includes('@')) e.email = 'Valid email required.';
    if (!newEmp.role.trim()) e.role = 'Role is required.';
    if (!newEmp.dept.trim()) e.dept = 'Department is required.';
    return e;
  };

  const handleAddEmp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEmp();
    if (Object.keys(errs).length > 0) { setEmpErrors(errs); return; }
    setShowAddModal(false);
    setNewEmp({ name: '', email: '', role: '', dept: '' });
    setEmpErrors({});
    setSuccessMsg('Employee added successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabStyle = (tab: string) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.875rem',
    background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
    transition: 'all 0.2s',
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>HR Admin Panel 📊</h1>
          <p>Manage employees, approvals and organizational data.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      {successMsg && (
        <div className="alert" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary"><Users size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">142</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning"><Calendar size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending Approvals</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success"><CheckCircle size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">98%</span>
            <span className="stat-label">Onboarding Complete</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon info"><DollarSign size={28} /></div>
          <div className="stat-details">
            <span className="stat-value">₹12.4L</span>
            <span className="stat-label">Monthly Payroll</span>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle('employees')} onClick={() => setActiveTab('employees')}>Employee Directory</button>
        <button style={tabStyle('requests')} onClick={() => setActiveTab('requests')}>
          Pending Requests {pendingCount > 0 && <span style={{ marginLeft: 6, background: 'var(--danger)', color: 'white', borderRadius: 9999, padding: '0 6px', fontSize: '0.7rem' }}>{pendingCount}</span>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Department Summary</h2>
          <div className="table-container">
            <table>
              <thead><tr><th>Department</th><th>Headcount</th><th>On Leave</th><th>Open Requests</th></tr></thead>
              <tbody>
                {[
                  { dept: 'Engineering', count: 58, onLeave: 3, open: 2 },
                  { dept: 'Design', count: 24, onLeave: 1, open: 1 },
                  { dept: 'Analytics', count: 18, onLeave: 0, open: 0 },
                  { dept: 'HR', count: 12, onLeave: 1, open: 0 },
                  { dept: 'Finance', count: 30, onLeave: 2, open: 1 },
                ].map(row => (
                  <tr key={row.dept}>
                    <td style={{ fontWeight: 500 }}>{row.dept}</td>
                    <td>{row.count}</td>
                    <td><span className="badge warning">{row.onLeave}</span></td>
                    <td><span className="badge primary">{row.open}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Employee Directory</h2>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {EMPLOYEES.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.role}</td>
                    <td>{emp.dept}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                    <td><span className={emp.status === 'Active' ? 'badge success' : 'badge warning'}>{emp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Pending Approvals</h2>
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>Detail</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: 'var(--secondary-color)' }}>{r.initials}</div>
                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                      </div>
                    </td>
                    <td><span className={r.type === 'Leave' ? 'badge primary' : 'badge warning'}>{r.type}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.detail}</td>
                    <td>{r.date}</td>
                    <td><span className={r.status === 'Approved' ? 'badge success' : r.status === 'Rejected' ? 'badge danger' : 'badge warning'}>{r.status}</span></td>
                    <td>
                      {r.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }} onClick={() => handleAction(r.id, 'Approved')}>
                            <CheckCircle size={14} style={{ marginRight: 4 }} />Approve
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAction(r.id, 'Rejected')}>
                            <XCircle size={14} style={{ marginRight: 4 }} />Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add New Employee</h2>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEmp}>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" className="form-input" placeholder="Jane Doe" value={newEmp.name} onChange={e => { setNewEmp({ ...newEmp, name: e.target.value }); setEmpErrors({ ...empErrors, name: '' }); }} />
                {empErrors.name && <span className="field-error">{empErrors.name}</span>}
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="form-input" placeholder="jane@nexus.com" value={newEmp.email} onChange={e => { setNewEmp({ ...newEmp, email: e.target.value }); setEmpErrors({ ...empErrors, email: '' }); }} />
                {empErrors.email && <span className="field-error">{empErrors.email}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Role</label>
                  <input type="text" className="form-input" placeholder="Software Engineer" value={newEmp.role} onChange={e => { setNewEmp({ ...newEmp, role: e.target.value }); setEmpErrors({ ...empErrors, role: '' }); }} />
                  {empErrors.role && <span className="field-error">{empErrors.role}</span>}
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select className="form-select" value={newEmp.dept} onChange={e => { setNewEmp({ ...newEmp, dept: e.target.value }); setEmpErrors({ ...empErrors, dept: '' }); }}>
                    <option value="">Select...</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Analytics</option>
                    <option>HR</option>
                    <option>Finance</option>
                  </select>
                  {empErrors.dept && <span className="field-error">{empErrors.dept}</span>}
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
