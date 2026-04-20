import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STEPS = ['Cuenta', 'Perfil', 'Código'];

const SPECIALTIES = [
  'Barbería', 'Peluquería', 'Colorimetría', 'Estética facial',
  'Estética corporal', 'Masajes', 'Manicura & Pedicura', 'Maquillaje',
  'Depilación', 'Nutrición', 'Fisioterapia', 'Otra',
];

const HAS_GOOGLE = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function ProRegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialty: '', bio: '', experience: '', joinCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [googleToken, setGoogleToken] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setApiError('');
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());
        setGoogleToken(tokenResponse.access_token);
        setForm(f => ({ ...f, name: userInfo.name || '', email: userInfo.email || '' }));
        setStep(1);
      } catch {
        setApiError('Error al conectar con Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setApiError('Error al conectar con Google'),
  });

  function validateStep(s) {
    const e = {};
    if (s === 0) {
      if (!form.name.trim())  e.name  = 'El nombre es obligatorio';
      if (!form.email.trim()) e.email = 'El email es obligatorio';
      if (!googleToken && form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    }
    if (s === 1) {
      if (!form.specialty) e.specialty = 'Elige tu especialidad';
    }
    if (s === 2) {
      if (!form.joinCode.trim()) e.joinCode = 'Ingresa el código del negocio';
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
      const { name, email, password, phone, specialty, bio, experience, joinCode } = form;
      if (googleToken) {
        const data = await api.googleAuth(googleToken, 'PROFESSIONAL');
        login(data);
        await api.updateProProfile({ specialty, bio, experience });
      } else {
        const data = await api.registerProfessional({ name, email, password, phone, specialty, bio, experience });
        login(data);
      }
      try {
        await api.submitJoinRequest(joinCode);
      } catch {
        // registro OK, la solicitud puede reintentarse desde el dashboard
      }
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
      <div className="auth-panel-brand">
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
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-4)', background: 'var(--surface-3)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              El dueño del negocio debe aprobarte antes de que quedes vinculado. Si quieres abrir tu propio local,
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
            {step === 2 && 'Ingresa el código del negocio donde trabajas'}
          </p>

          <form className="auth-form-fields" onSubmit={step < 2 ? (e) => { e.preventDefault(); next(); } : handleSubmit}>

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <>
                {HAS_GOOGLE && (
                  <>
                    <button
                      type="button"
                      onClick={() => googleLogin()}
                      disabled={loading}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 10, height: 44, borderRadius: 'var(--r-lg)',
                        border: '1px solid var(--border)', background: 'var(--surface-2)',
                        color: 'var(--text)', fontSize: 'var(--text-sm)', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1, transition: 'background var(--ease)',
                      }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--surface-3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                    >
                      {loading
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        : <IconGoogle />
                      }
                      {loading ? 'Conectando...' : 'Continuar con Google'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', margin: 'var(--sp-2) 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>o con email</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  </>
                )}

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
                    placeholder="Mínimo 8 caracteres" value={form.password}
                    onChange={e => set('password', e.target.value)} required minLength={8} autoComplete="new-password" />
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-phone">Teléfono <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                  <input id="pro-phone" className="input" type="tel"
                    placeholder="+34 600 000 000" value={form.phone}
                    onChange={e => set('phone', e.target.value)} autoComplete="tel" />
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

            {/* ── Step 1: Profile ── */}
            {step === 1 && (
              <>
                {googleToken && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
                    padding: 'var(--sp-2) var(--sp-3)', marginBottom: 'var(--sp-2)',
                    background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.25)',
                    borderRadius: 'var(--r-md)', fontSize: 'var(--text-xs)', color: '#34A853',
                  }}>
                    <IconGoogle />
                    Cuenta vinculada con Google · {form.email}
                  </div>
                )}
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

            {/* ── Step 2: Join Code ── */}
            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="pro-joincode">Código del negocio</label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                    Pídele al dueño del negocio su código de vinculación de 6 caracteres.
                  </p>
                  <input
                    id="pro-joincode"
                    className={`input${errors.joinCode ? ' input-error' : ''}`}
                    type="text"
                    placeholder="Ej. AB3X9K"
                    value={form.joinCode}
                    onChange={e => set('joinCode', e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center' }}
                  />
                  {errors.joinCode && <p className="field-error">{errors.joinCode}</p>}

                  <div style={{
                    marginTop: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)',
                    borderRadius: 'var(--r-md)', background: 'var(--violet-subtle)',
                    border: '1px solid rgba(124,92,252,0.2)',
                    fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6,
                  }}>
                    Tu solicitud quedará pendiente hasta que el dueño del negocio la apruebe.
                    Podrás ver el estado desde tu dashboard.
                  </div>
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
