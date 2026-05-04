import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { COUNTRIES, COUNTRY_CONFIG, US_TIMEZONES, getTimezone } from '../utils/countryConfig';

export default function RegisterBusinessPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', category: '', description: '',
    city: '', address: '', phone: '',
    country: 'CO', timezone: '', state: '', zipCode: '',
  });
  const [error,         setError]        = useState('');
  const [loading,       setLoading]      = useState(false);
  const [dupWarning,    setDupWarning]   = useState(false);
  const dupTimer = useRef(null);

  const cfg = COUNTRY_CONFIG[form.country] || COUNTRY_CONFIG.CO;

  useEffect(() => {
    // If user already has a business, send them to dashboard directly
    api.getMyBusiness().then(b => {
      if (b) navigate('/dashboard', { replace: true });
    }).catch(() => {});
    api.getCategories().then(cats => {
      setCategories(cats);
      if (cats.length && !form.category) setForm(p => ({ ...p, category: cats[0].slug }));
    }).catch(() => {});
  }, []);

  const set = f => e => {
    const val = e.target.value;
    setForm(p => ({ ...p, [f]: val }));
    if (['name', 'phone', 'address'].includes(f)) {
      clearTimeout(dupTimer.current);
      dupTimer.current = setTimeout(() => {
        const snapshot = { name: form.name, phone: form.phone, address: form.address, [f]: val };
        if (snapshot.name.trim().length < 3) return;
        api.checkBusinessDuplicate({ name: snapshot.name, phone: snapshot.phone, address: snapshot.address })
          .then(r => setDupWarning(r.isDuplicate))
          .catch(() => {});
      }, 800);
    }
  };

  function setCountry(code) {
    setForm(p => ({ ...p, country: code, timezone: '', state: '', zipCode: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError('El nombre del negocio es obligatorio.');
    if (!form.address.trim() || form.address.trim().length < 5)
      return setError('Ingresa una dirección completa (mínimo 5 caracteres).');
    if (!form.city.trim()) return setError('La ciudad es obligatoria.');
    if (form.country === 'US') {
      if (!form.state) return setError('Selecciona el estado (EE. UU.).');
      if (!form.zipCode || !/^\d{5}(-\d{4})?$/.test(form.zipCode.trim()))
        return setError('El ZIP code debe tener 5 dígitos (ej: 33101).');
      if (!form.timezone) return setError('Selecciona tu zona horaria.');
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
        country:     form.country,
        timezone:    getTimezone(form.country, form.timezone),
        state:       form.state.trim() || undefined,
        zipCode:     form.zipCode.trim() || undefined,
      });
      navigate('/pricing');
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
                {categories.map(c => (
                  <div
                    key={c.slug}
                    onClick={() => setForm(p => ({ ...p, category: c.slug }))}
                    style={{
                      flex: 1, padding: 'var(--sp-3) var(--sp-2)',
                      border: `1.5px solid ${form.category === c.slug ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer',
                      background: form.category === c.slug ? 'var(--gold-subtle)' : 'var(--surface-2)',
                      textAlign: 'center',
                      color: form.category === c.slug ? 'var(--gold)' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: form.category === c.slug ? 700 : 500 }}>{c.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Country */}
            <div className="form-group">
              <label className="form-label">País *</label>
              <div style={{ display:'flex', gap:'var(--sp-2)' }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} type="button" onClick={() => setCountry(c.code)}
                    style={{ flex:1, padding:'var(--sp-3)', borderRadius:'var(--r-lg)', cursor:'pointer', border:`1.5px solid ${form.country===c.code?'var(--gold)':'var(--border)'}`, background:form.country===c.code?'var(--gold-subtle)':'var(--surface-2)', color:form.country===c.code?'var(--gold)':'var(--text-muted)', fontWeight:form.country===c.code?700:500, fontSize:'var(--text-sm)', transition:'all .12s' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone for US */}
            {form.country === 'US' && (
              <div className="form-group">
                <label className="form-label">Timezone *</label>
                <select className="input" value={form.timezone} onChange={set('timezone')} required>
                  <option value="">Select your timezone…</option>
                  {US_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>
            )}

            {/* Address */}
            <div className="form-group">
              <label className="form-label">{cfg.addressLabel} *</label>
              <input className="input" placeholder={cfg.addressPlaceholder} value={form.address} onChange={set('address')} required />
            </div>

            {/* City + State (US) + ZIP (US) */}
            <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
              <div className="form-group" style={{ flex:'1 1 120px' }}>
                <label className="form-label">{cfg.cityLabel} *</label>
                <input className="input" placeholder={cfg.cityPlaceholder} value={form.city} onChange={set('city')} required />
              </div>
              {cfg.hasState && (
                <div className="form-group" style={{ flex:'0 0 80px' }}>
                  <label className="form-label">{cfg.stateLabel}</label>
                  <input className="input" placeholder={cfg.statePlaceholder} value={form.state} onChange={set('state')} maxLength={2} style={{ textTransform:'uppercase' }} />
                </div>
              )}
              {cfg.hasZip && (
                <div className="form-group" style={{ flex:'0 0 110px' }}>
                  <label className="form-label">{cfg.zipLabel}</label>
                  <input className="input" placeholder={cfg.zipPlaceholder} value={form.zipCode} onChange={set('zipCode')} maxLength={10} />
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="input" placeholder={cfg.phonePlaceholder} value={form.phone} onChange={set('phone')} />
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

            {dupWarning && !error && (
              <div style={{
                background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: 'var(--r-lg)', padding: 'var(--sp-3) var(--sp-4)',
                fontSize: 'var(--text-xs)', color: '#92400e', display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>Parece que ya existe un negocio similar. Revisa si ya lo registraste o ajusta el nombre, teléfono o dirección.</span>
              </div>
            )}

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
