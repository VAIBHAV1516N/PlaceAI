import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STUDENT_NAV = [
  { to: '/predict', icon: '🤖', label: 'Predict' },
  { to: '/history', icon: '📋', label: 'History' },
  { to: '/',        icon: '🏠', label: 'Home' },
];
const ADMIN_NAV = [
  { to: '/predict', icon: '🤖', label: 'Predict' },
  { to: '/history', icon: '📋', label: 'History' },
  { to: '/admin',   icon: '📊', label: 'Admin' },
  { to: '/',        icon: '🏠', label: 'Home' },
];
const GUEST_NAV = [
  { to: '/',         icon: '🏠', label: 'Home' },
  { to: '/login',    icon: '🔐', label: 'Login' },
  { to: '/register', icon: '📝', label: 'Register' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = !user ? GUEST_NAV : user.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;
  const isActive = (to) => location.pathname === to;

  const handleLogout = () => { logout(); navigate('/'); setDrawerOpen(false); };

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">Place<span>AI</span></Link>
          <div className="nav-links">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} className={`nav-link${isActive(item.to) ? ' active' : ''}`}>{item.label}</Link>
            ))}
            {user && (
              <>
                <span className="nav-user">👤 {user.name.split(' ')[0]}</span>
                <button className="nav-btn" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
          <div className={`hamburger${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(o => !o)}>
            <div className="ham-bar" /><div className="ham-bar" /><div className="ham-bar" />
          </div>
        </div>
      </nav>

      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        {navItems.map(item => (
          <Link key={item.to} to={item.to} className={`drawer-link${isActive(item.to) ? ' active' : ''}`}>
            <span style={{ width: 24, textAlign: 'center' }}>{item.icon}</span>{item.label}
          </Link>
        ))}
        {user && (
          <>
            <div className="drawer-sep" />
            <div className="drawer-link" onClick={handleLogout}><span style={{ width: 24, textAlign: 'center' }}>🚪</span>Logout</div>
          </>
        )}
      </div>

      <div className="bottom-nav">
        {navItems.map(item => (
          <div key={item.to} className={`bn-item${isActive(item.to) ? ' active' : ''}`} onClick={() => navigate(item.to)}>
            <div className="bn-icon">{item.icon}</div>
            <div className="bn-lbl">{item.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
