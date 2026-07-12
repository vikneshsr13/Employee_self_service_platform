import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, AlertCircle } from 'lucide-react';
import { apiLogin } from '../api';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.includes('@') || !email.includes('.')) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validate();
    if (valErr) { setError(valErr); return; }

    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(email.trim().toLowerCase(), password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      localStorage.setItem('role',  data.user.is_hr ? 'hr' : 'employee');
      navigate(data.user.is_hr ? '/hr' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
          <h2 style={{ marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ margin: 0 }}>Sign in to Nexus ESS Portal</p>
        </div>

        {error && (
          <div className="alert error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="icon" />
              <input type="email" placeholder="you@nexus.com" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }} />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="icon" />
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Demo accounts:</strong><br />
          HR: <code>hr@nexus.com</code> / <code>hr@12345</code><br />
          Employee: <code>john@nexus.com</code> / <code>emp@12345</code>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
