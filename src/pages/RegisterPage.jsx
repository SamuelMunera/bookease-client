import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data);
      navigate(data.user.role === 'BUSINESS_OWNER' ? '/agenda' : '/');
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

          <div style={{ marginTop: 'var(--sp-10)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {[
              { label: 'Cliente', desc: 'Reserva citas y gestiona tus visitas', icon: '👤' },
              { label: 'Negocio', desc: 'Recibe y gestiona reservas de tu local', icon: '🏪' },
            ].map((opt) => (
              <div key={opt.label} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-lg)', background: 'rgba(215,26,33,.18)', border: '1px solid rgba(215,26,33,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {opt.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#fff', fontSize: 'var(--text-sm)', marginBottom: 2 }}>{opt.label}</p>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
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

            <div className="form-group">
              <label className="form-label" htmlFor="role">Tipo de cuenta</label>
              <select id="role" className="input" value={form.role} onChange={set('role')}>
                <option value="CLIENT">Soy cliente — quiero reservar</option>
                <option value="BUSINESS_OWNER">Soy negocio — quiero recibir reservas</option>
              </select>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn btn-primary btn-lg btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: 'var(--sp-2)' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
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
