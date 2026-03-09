import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(`${form.firstName} ${form.lastName}`, form.email, form.password);
      navigate('/predict');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start predicting your placement chances today</p>
        {error && <div className="alert alert-error">❌ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" type="text" placeholder="Rahul"
                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required autoComplete="given-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" type="text" placeholder="Sharma"
                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required autoComplete="family-name" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} autoComplete="new-password" />
          </div>
          <button className="btn btn-primary btn-full" style={{ padding: '15px' }} disabled={loading}>
            {loading ? <><span className="btn-spin" /> Creating...</> : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
