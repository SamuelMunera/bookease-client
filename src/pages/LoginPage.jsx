import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import GoogleAuthButton from '../components/GoogleAuthButton';

const BRAND_FEATURES = [
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, text: 'Barberías, spas y salones top' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, text: 'Disponibilidad en tiempo real' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, text: 'Elige tu profesional favorito' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, text: 'Cancela o modifica sin complicaciones' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data);
      const from = location.state?.from;
      const roleDest = { BUSINESS_OWNER: '/dashboard', PROFESSIONAL: '/pro/dashboard', CLIENT: '/' };
      navigate(from || roleDest[data.user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      {/* Brand panel */}
      <div className="auth-panel-brand">
        <div className="auth-panel-brand-inner">
          <div className="auth-brand-logo">
            Book<span>ease</span>
          </div>

          <p className="auth-brand-tagline">
            El lugar donde el estilo <em>se planifica</em>
          </p>

          <p className="auth-brand-sub">
            Conectamos clientes con los mejores profesionales del cuidado personal.
          </p>

          <ul style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', listStyle: 'none' }}>
            {BRAND_FEATURES.map((feat) => (
              <li key={feat.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                  color: 'var(--gold)', flexShrink: 0
                }}>
                  {feat.icon}
                </span>
                {feat.text}
              </li>
            ))}
          </ul>

          <blockquote className="auth-brand-quote">
            "El tiempo es el único lujo que no podemos comprar — pero sí podemos optimizarlo."
          </blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <h1 className="auth-form-title">Bienvenido de nuevo</h1>
          <p className="auth-form-sub">Inicia sesión para gestionar tus reservas</p>

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" htmlFor="password">Contraseña</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary btn-lg btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: 'var(--sp-2)' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', margin: 'var(--sp-5) 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>o</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <GoogleAuthButton role="CLIENT" onError={setError} />

          <p className="auth-foot">
            ¿No tienes cuenta?{' '}
            <Link to="/register">Regístrate gratis</Link>
          </p>
          <p className="auth-foot" style={{ marginTop: 'var(--sp-2)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
            ¿Eres profesional o dueño de negocio?{' '}
            <Link to="/pro/login" style={{ color: 'var(--violet)' }}>Acceso profesional</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
