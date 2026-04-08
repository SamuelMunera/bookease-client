import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const BRAND_FEATURES = [
  'Reserva en barberías, spas y salones top',
  'Disponibilidad en tiempo real, siempre actualizada',
  'Elige tu profesional favorito',
  'Cancela o modifica sin complicaciones',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      navigate(data.user.role === 'BUSINESS_OWNER' ? '/agenda' : '/');
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

          <ul style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', listStyle: 'none' }}>
            {BRAND_FEATURES.map((feat) => (
              <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'rgba(215,26,33,.25)', border: '1px solid rgba(215,26,33,.4)', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--crimson-light)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {feat}
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
              <label className="form-label" htmlFor="password">Contraseña</label>
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

            {error && <p className="error-msg">{error}</p>}

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
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="auth-foot">
            ¿No tienes cuenta?{' '}
            <Link to="/register">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
