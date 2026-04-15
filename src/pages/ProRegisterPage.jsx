import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STEPS = ['Cuenta', 'Perfil', 'Negocio'];

const SPECIALTIES = [
  'Barbería', 'Peluquería', 'Colorimetría', 'Estética facial',
  'Estética corporal', 'Masajes', 'Manicura & Pedicura', 'Maquillaje',
  'Depilación', 'Nutrición', 'Fisioterapia', 'Otra',
];

export default function ProRegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialty: '', bio: '', experience: '', businessId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    api.getBusinesses({ limit: 100 })
      .then(data => setBusinesses(Array.isArray(data) ? data : data.businesses ?? []))
      .catch(() => {});
  }, []);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function validateStep(s) {
    const e = {};
    if (s === 0) {
      if (!form.name.trim())     e.name     = 'El nombre es obligatorio';
      if (!form.email.trim())    e.email    = 'El email es obligatorio';
      if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    }
    if (s === 1) {
      if (!form.specialty) e.specialty = 'Elige tu especialidad';
    }
    if (s === 2) {
      if (!form.businessId) e.businessId = 'Selecciona el negocio al que perteneces';
    }
    return e;
  }

  function next() {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  }

  function back() { setStep(s => s - 1); }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validateStep(2);
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setApiError('');
    setLoading(true);
    try {
      const data = await api.registerProfessional(form);
      login(data);
      navigate('/pro/dashboard');
    } catch (err) {
      setApiError(err.message);
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
            Únete como <em>profesional</em>
          </p>
          <p className="auth-brand-sub">
            Gestiona tu agenda, recibe reservas y haz crecer tu cartera de clientes.
          </p>

          {/* Step indicators */}
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {STEPS.map((label, i) => {
              const done    = i < step;
              const current = i === step;
              const color   = done ? 'var(--gold)' : current ? 'var(--violet)' : 'var(--text-muted)';
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${color}`,
                    background: done ? 'var(--gold)' : current ? 'rgba(124,92,252,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? '#0D0D1E' : color, fontWeight: 700, fontSize: 'var(--text-xs)',
                    transition: 'all .25s',
                  }}>
                    {done
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : i + 1}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: current ? 'var(--text)' : done ? 'var(--gold)' : 'var(--text-muted)',
                    fontWeight: current ? 600 : 400,
                    transition: 'color .25s',
                  }}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 13, height: 20,
                      width: 2, background: done ? 'var(--gold)' : 'var(--border)',
                      marginTop: 28, display: 'none', // decorative only
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-4)', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Al registrarte, formarás parte de un negocio existente. Si quieres abrir tu propio local,
              <Link to="/register" style={{ color: 'var(--gold)', marginLeft: 4 }}>regístrate como dueño de negocio.</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--violet-subtle)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 'var(--r-full)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--violet)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Paso {step + 1} de {STEPS.length} — {STEPS[step]}
            </span>
          </div>

          <h1 className="auth-form-title">Registro profesional</h1>
          <p className="auth-form-sub">
            {step === 0 && 'Crea tus credenciales de acceso'}
            {step === 1 && 'Cuéntanos sobre tu perfil profesional'}
            {step === 2 && 'Asocia tu cuenta a un negocio'}
          </p>

          <form className="auth-form-fields" onSubmit={step < 2 ? (e) => { e.preventDefault(); next(); } : handleSubmit}>

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-name">Nombre completo</label>
                  <input id="pro-name" className={`input${errors.name ? ' input-error' : ''}`} type="text"
                    placeholder="María García" value={form.name}
                    onChange={e => set('name', e.target.value)} required autoComplete="name" />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-email">Email</label>
                  <input id="pro-email" className={`input${errors.email ? ' input-error' : ''}`} type="email"
                    placeholder="tu@email.com" value={form.email}
                    onChange={e => set('email', e.target.value)} required autoComplete="email" />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-password">Contraseña</label>
                  <input id="pro-password" className={`input${errors.password ? ' input-error' : ''}`} type="password"
                    placeholder="Mínimo 6 caracteres" value={form.password}
                    onChange={e => set('password', e.target.value)} required autoComplete="new-password" />
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-phone">Teléfono <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                  <input id="pro-phone" className="input" type="tel"
                    placeholder="+34 600 000 000" value={form.phone}
                    onChange={e => set('phone', e.target.value)} autoComplete="tel" />
                </div>
              </>
            )}

            {/* ── Step 1: Profile ── */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Especialidad</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-2)' }}>
                    {SPECIALTIES.map(sp => (
                      <button
                        key={sp} type="button"
                        onClick={() => set('specialty', sp)}
                        style={{
                          padding: 'var(--sp-2) var(--sp-3)',
                          borderRadius: 'var(--r-md)',
                          border: `1px solid ${form.specialty === sp ? 'var(--violet)' : 'var(--border)'}`,
                          background: form.specialty === sp ? 'var(--violet-subtle)' : 'transparent',
                          color: form.specialty === sp ? 'var(--violet)' : 'var(--text-muted)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: form.specialty === sp ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all .15s',
                          textAlign: 'left',
                        }}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                  {errors.specialty && <p className="field-error" style={{ marginTop: 'var(--sp-2)' }}>{errors.specialty}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-experience">Años de experiencia <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                  <input id="pro-experience" className="input" type="text"
                    placeholder="ej. 5 años, Más de 10 años…" value={form.experience}
                    onChange={e => set('experience', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-bio">Bio / Presentación <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                  <textarea id="pro-bio" className="input" rows={3}
                    placeholder="Cuéntale a tus futuros clientes quién eres y cómo trabajas…"
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </>
            )}

            {/* ── Step 2: Business ── */}
            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Negocio al que perteneces</label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                    Elige el negocio donde trabajas. Si no aparece en la lista, pide al dueño que lo registre primero.
                  </p>

                  {businesses.length === 0 ? (
                    <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      No hay negocios registrados aún.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                      {businesses.map(b => (
                        <button
                          key={b.id} type="button"
                          onClick={() => set('businessId', b.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                            padding: 'var(--sp-3) var(--sp-4)',
                            borderRadius: 'var(--r-md)',
                            border: `1px solid ${form.businessId === b.id ? 'var(--violet)' : 'var(--border)'}`,
                            background: form.businessId === b.id ? 'var(--violet-subtle)' : 'var(--surface-raised)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                          }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
                            background: form.businessId === b.id ? 'var(--violet)' : 'var(--surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: form.businessId === b.id ? '#fff' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: 'var(--text-sm)',
                          }}>
                            {b.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: form.businessId === b.id ? 'var(--violet)' : 'var(--text)', marginBottom: 2 }}>{b.name}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{b.city || b.category || '—'}</p>
                          </div>
                          {form.businessId === b.id && (
                            <div style={{ marginLeft: 'auto', color: 'var(--violet)' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.businessId && <p className="field-error" style={{ marginTop: 'var(--sp-2)' }}>{errors.businessId}</p>}
                </div>

                {apiError && (
                  <p className="error-msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {apiError}
                  </p>
                )}
              </>
            )}

            {/* ── Navigation ── */}
            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
              {step > 0 && (
                <button type="button" className="btn btn-ghost btn-lg" onClick={back} style={{ flex: '0 0 auto' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Atrás
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading}
                style={{ flex: 1, background: 'var(--violet)' }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Registrando...
                  </>
                ) : step < 2 ? (
                  <>
                    Siguiente
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                ) : (
                  <>
                    Crear mi cuenta
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="auth-foot">
            ¿Ya tienes cuenta?{' '}
            <Link to="/pro/login" style={{ color: 'var(--violet)' }}>Iniciar sesión</Link>
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
