import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ProLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      if (data.user.role === 'CLIENT') {
        setError('Esta área es solo para profesionales y negocios. Usa el acceso de clientes.');
        return;
      }
      login(data);
      const dest = { BUSINESS_OWNER: '/dashboard', PROFESSIONAL: '/pro/dashboard' };
      navigate(dest[data.user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      {/* Brand panel */}
      <div className="auth-panel-brand" style={{ background: 'linear-gradient(160deg, #0D0D1E 0%, #1a1235 100%)' }}>
        <div className="auth-panel-brand-inner">
          <div className="auth-brand-logo">Book<span>ease</span></div>
          <p className="auth-brand-tagline" style={{ marginTop: 'var(--sp-4)' }}>
            Panel <em>profesional</em>
          </p>
          <p className="auth-brand-sub">
            Accede a tu agenda, gestiona citas y controla tu actividad diaria.
          </p>

          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {[
              { color: 'var(--violet)', title: 'Profesionales', desc: 'Accede a tu agenda personal y gestiona tus citas.' },
              { color: 'var(--gold)',   title: 'Dueños de negocio', desc: 'Administra tu local, servicios y equipo.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-lg)', flexShrink: 0,
                  background: `${item.color}18`, border: `1px solid ${item.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 3 }}>{item.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--violet-subtle)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 'var(--r-full)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--violet)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Área profesional</span>
          </div>
          <h1 className="auth-form-title">Acceso profesional</h1>
          <p className="auth-form-sub">Para profesionales y dueños de negocio</p>

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="pro-email">Email</label>
              <input
                id="pro-email"
                className="input"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pro-password">Contraseña</label>
              <input
                id="pro-password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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

            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: 'var(--sp-2)', background: 'var(--violet)' }}>
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

          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 4 }}>
            <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="auth-foot">
            ¿Nuevo profesional?{' '}
            <Link to="/pro/register" style={{ color: 'var(--violet)' }}>Únete al equipo</Link>
          </p>
          <p className="auth-foot" style={{ marginTop: 'var(--sp-2)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
            ¿Eres cliente?{' '}
            <Link to="/login">Acceso de clientes</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
