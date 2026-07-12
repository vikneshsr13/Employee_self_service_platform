import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Building, AlertCircle } from 'lucide-react';
import { apiRegister } from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'Engineering' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (form.name.trim().length < 2) return 'Enter your full name (at least 2 characters).';
    if (!form.email.includes('@') || !form.email.includes('.')) return 'Enter a valid email address.';
    if (form.password.length < 6)  return 'Password must be at least 6 characters.';
    return '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validate();
    if (valErr) { setError(valErr); return; }

    setLoading(true);
    setError('');
    try {
      const data = await apiRegister(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      localStorage.setItem('role',  data.user.is_hr ? 'hr' : 'employee');
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ width: 52, height: 52, margin: '0 auto 1rem' }}>
            <Briefcase size={28} />
          </div>
          <h2 style={{ marginBottom: 4 }}>Create Account</h2>
          <p style={{ margin: 0 }}>Join Nexus ESS Portal</p>
        </div>

        {error && (
          <div className="alert error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="icon" />
              <input type="text" placeholder="John Doe" value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setError(''); }} />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="icon" />
              <input type="email" placeholder="you@nexus.com" value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }} />
            </div>
          </div>

          <div className="input-group">
            <label>Department</label>
            <div className="input-with-icon">
              <Building size={18} className="icon" />
              <select style={{ paddingLeft: '2.75rem' }} className="form-select" value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}>
                <option>Engineering</option>
                <option>Design</option>
                <option>Analytics</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Sales</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="icon" />
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
