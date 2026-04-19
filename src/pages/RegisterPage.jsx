import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ACCOUNT_TYPES = [
  {
    value: 'CLIENT',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    title: 'Cliente',
    desc: 'Reserva citas y gestiona tus visitas',
  },
  {
    value: 'BUSINESS_OWNER',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    title: 'Negocio',
    desc: 'Recibe y gestiona reservas de tu local',
  },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data);
      navigate(data.user.role === 'BUSINESS_OWNER' ? '/register-business' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="auth-wrap">
      {/* Brand panel */}
      <div className="auth-panel-brand">
        <div className="auth-panel-brand-inner">
          <div className="auth-brand-logo">
            Book<span>ease</span>
          </div>

          <p className="auth-brand-tagline">
            Tu tiempo es <em>lo más valioso</em>
          </p>

          <p className="auth-brand-sub">
            Crea tu cuenta y empieza a reservar en los mejores negocios de estética y bienestar.
          </p>

          <div style={{ marginTop: 'var(--sp-10)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {ACCOUNT_TYPES.map((opt) => (
              <div key={opt.value} style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--r-lg)',
                  background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--gold)',
                }}>
                  {opt.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 3 }}>{opt.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="auth-brand-quote">
            "Más de 2.500 profesionales esperan para atenderte."
          </blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <h1 className="auth-form-title">Crear cuenta</h1>
          <p className="auth-form-sub">Únete a Bookease en segundos</p>

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre completo</label>
              <input
                id="name"
                className="input"
                placeholder="Tu nombre"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={set('email')}
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
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="new-password"
              />
            </div>

            {form.role === 'CLIENT' && (
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tipo de cuenta</label>
              <div className="role-cards">
                {ACCOUNT_TYPES.map((opt) => (
                  <div
                    key={opt.value}
                    className={`role-card${form.role === opt.value ? ' selected' : ''}`}
                    onClick={() => setForm({ ...form, role: opt.value })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setForm({ ...form, role: opt.value })}
                  >
                    <div style={{ color: form.role === opt.value ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 6 }}>
                      {opt.icon}
                    </div>
                    <p className="role-card-title">{opt.title}</p>
                    <p className="role-card-desc">{opt.desc}</p>
                  </div>
                ))}
              </div>
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="auth-foot">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
