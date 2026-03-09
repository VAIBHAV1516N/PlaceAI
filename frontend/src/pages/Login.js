import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/predict');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your PlaceAI account</p>
        {error && <div className="alert alert-error">❌ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-full" style={{ padding: '15px' }} disabled={loading}>
            {loading ? <><span className="btn-spin" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>
        <div className="auth-footer">No account? <Link to="/register">Register free</Link></div>
        <div className="demo-hint">
          <strong>Demo Accounts:</strong><br />
          Student: student@example.com / password123<br />
          Admin: admin@example.com / admin123
        </div>
      </div>
    </div>
  );
}
