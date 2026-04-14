import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const CATEGORIES = [
  {
    value: 'BARBERSHOP', label: 'Barbería',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M6 3v12M6 9c3.5 0 6-1.5 6-3s-2.5-3-6-3"/><path d="M6 21v-3"/><path d="M18 3v18"/><path d="M15 8l6-5"/><path d="M15 16l6 5"/></svg>,
  },
  {
    value: 'SPA', label: 'Spa & Wellness',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    value: 'SALON', label: 'Salón de belleza',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
];

export default function RegisterBusinessPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: 'BARBERSHOP', description: '',
    city: '', address: '', phone: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      return setError('Nombre, ciudad y dirección son obligatorios.');
    }
    setError('');
    setLoading(true);
    try {
      await api.createBusiness({
        name:        form.name.trim(),
        category:    form.category,
        description: form.description.trim() || undefined,
        city:        form.city.trim(),
        address:     form.address.trim(),
        phone:       form.phone.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}>

      {/* ── Brand panel ── */}
      <div className="auth-panel-brand" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-panel-brand-inner">
          <div className="auth-brand-logo">Book<span>ease</span></div>
          <p className="auth-brand-tagline" style={{ marginTop: 'var(--sp-4)' }}>Tu negocio, <em>digitalizado</em></p>
          <p className="auth-brand-sub">
            Configura tu negocio en menos de 2 minutos y empieza a recibir reservas hoy mismo.
          </p>

          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {[
              { title: 'Gestión centralizada', desc: 'Controla servicios, horarios y profesionales desde un panel.' },
              { title: 'Reservas 24/7', desc: 'Tus clientes pueden reservar en cualquier momento.' },
              { title: 'Notificaciones automáticas', desc: 'Confirmaciones y recordatorios por email sin esfuerzo.' },
            ].map(i => (
              <div key={i.title} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 3 }}>{i.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{i.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Steps indicator */}
          <div style={{ marginTop: 'var(--sp-10)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>Cuenta creada</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#000' }}>2</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 600 }}>Configura tu negocio</span>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
            Paso 2 de 2
          </p>
          <h1 className="auth-form-title">Configura tu negocio</h1>
          <p className="auth-form-sub">Puedes actualizar estos datos en cualquier momento</p>

          <form className="auth-form-fields" onSubmit={handleSubmit} style={{ gap: 'var(--sp-4)' }}>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Nombre del negocio *</label>
              <input className="input" placeholder="Ej: Barbería El Corte Moderno" value={form.name} onChange={set('name')} required />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                {CATEGORIES.map(c => (
                  <div
                    key={c.value}
                    onClick={() => setForm(p => ({ ...p, category: c.value }))}
                    style={{
                      flex: 1, padding: 'var(--sp-3) var(--sp-2)',
                      border: `1.5px solid ${form.category === c.value ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer',
                      background: form.category === c.value ? 'var(--gold-subtle)' : 'var(--surface-2)',
                      textAlign: 'center',
                      color: form.category === c.value ? 'var(--gold)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{c.icon}</div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: form.category === c.value ? 700 : 500 }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* City + Address */}
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <div className="form-group" style={{ flex: '0 0 130px' }}>
                <label className="form-label">Ciudad *</label>
                <input className="input" placeholder="Bogotá" value={form.city} onChange={set('city')} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Dirección *</label>
                <input className="input" placeholder="Calle 123 # 45-67" value={form.address} onChange={set('address')} required />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="input" placeholder="+57 300 000 0000" value={form.phone} onChange={set('phone')} />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="input"
                placeholder="Describe tu negocio brevemente…"
                value={form.description}
                onChange={set('description')}
                rows={3}
                style={{ resize: 'vertical', lineHeight: 1.6 }}
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

            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: 'var(--sp-1)' }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Creando negocio…
                </>
              ) : (
                <>
                  Crear negocio y continuar
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 'var(--sp-1)' }}>
              ¿Ya tienes un negocio configurado?{' '}
              <Link to="/dashboard" style={{ color: 'var(--gold)' }}>Ir al dashboard</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
