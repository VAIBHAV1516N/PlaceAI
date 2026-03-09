import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const features = [
    { icon: '🤖', title: 'ML Predictions', desc: 'Random Forest, Logistic Regression & Decision Tree analyze your full profile.' },
    { icon: '📊', title: 'Probability Score', desc: 'Get exact placement probability with feature importance breakdown.' },
    { icon: '💡', title: 'Smart Insights', desc: 'Know exactly which skills to improve for better placement chances.' },
    { icon: '📁', title: 'History Track', desc: 'Monitor all predictions over time and watch your progress grow.' },
  ];

  return (
    <div>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-badge">🎓 AI-Powered · 3 ML Models · Real-time Results</div>
          <h1>Know Your<br /><span className="gradient-text">Placement Chances</span><br />Before You Apply</h1>
          <p className="hero-sub">Enter your academic profile and get instant AI-powered prediction of your placement probability with detailed improvement insights.</p>
          <div className="hero-btns">
            <Link to={user ? '/predict' : '/register'} className="btn btn-primary btn-lg">
              {user ? 'Make a Prediction →' : 'Get Started Free →'}
            </Link>
            {!user && <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="params-band">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 20, fontSize: '1.2rem' }}>Parameters We Analyze</h2>
          <div className="pill-row">
            {['📚 CGPA', '💼 Internships', '🗣 Communication', '⚙️ Technical Skills', '🧠 Aptitude Score', '🚀 Projects'].map(p => (
              <div key={p} className="pill">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
