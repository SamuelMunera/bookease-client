import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CLIENT_STEPS = [
  {
    n: 1,
    title: 'Encuentra tu lugar',
    desc: 'Explora barberías, spas y salones. Filtra por categoría o ciudad hasta dar con el que buscas.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    n: 2,
    title: 'Elige profesional y servicio',
    desc: 'Selecciona al especialista de tu preferencia y el servicio que necesitas, con precio y duración visible.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    n: 3,
    title: 'Elige fecha y hora',
    desc: 'Consulta la disponibilidad en tiempo real y reserva el horario que mejor se adapte a ti.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    n: 4,
    title: 'Disfruta tu cita',
    desc: 'Recibirás una confirmación por correo. Puedes cancelar gratuitamente hasta 24 h antes.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const BIZ_STEPS = [
  {
    n: 1,
    title: 'Registra tu negocio',
    desc: 'Crea tu cuenta como propietario, agrega el nombre, descripción, dirección y categoría de tu negocio.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
      </svg>
    ),
  },
  {
    n: 2,
    title: 'Añade servicios y horarios',
    desc: 'Configura tus profesionales, los servicios que ofrecen con precio y duración, y su disponibilidad semanal.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    n: 3,
    title: 'Gestiona tu agenda',
    desc: 'Visualiza, confirma o cancela reservas desde el panel de agenda. Recibe notificaciones por correo automáticamente.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <polyline points="9 16 11 18 15 14"/>
      </svg>
    ),
  },
];

function StepCard({ step, accent }) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--sp-6)',
      display: 'flex',
      gap: 'var(--sp-4)',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-lg)', flexShrink: 0,
        background: `${accent}18`, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {step.icon}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: accent, letterSpacing: '0.08em' }}>
            PASO {step.n}
          </span>
        </div>
        <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: 'var(--sp-1)' }}>
          {step.title}
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero ── */}
      <div style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--sp-16) var(--sp-6) var(--sp-12)',
        textAlign: 'center',
      }}>
        <p className="section-label" style={{ justifyContent: 'center' }}>Guía rápida</p>
        <h1 className="page-title" style={{ marginBottom: 'var(--sp-3)' }}>¿Cómo funciona?</h1>
        <p className="page-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
          Bookease conecta clientes con los mejores profesionales en segundos.
          Reserva sin llamadas, sin esperas.
        </p>
      </div>

      <div className="page" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>

        {/* ══ PARA CLIENTES ══════════════════════════════════ */}
        <section style={{ marginBottom: 'var(--sp-14)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-lg)',
              background: 'rgba(212,168,83,0.12)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Para clientes
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text)', margin: 0 }}>
                Reserva en 4 pasos
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {CLIENT_STEPS.map(s => (
              <StepCard key={s.n} step={s} accent="var(--gold)" />
            ))}
          </div>

          <div style={{ marginTop: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-3)' }}>
            {!user && (
              <Link to="/register" className="btn btn-primary">
                Crear cuenta gratis
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            )}
            <Link to="/businesses" className="btn btn-secondary">
              Explorar negocios
            </Link>
          </div>
        </section>

        {/* ── divider ── */}
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 'var(--sp-14)' }} />

        {/* ══ PARA NEGOCIOS ══════════════════════════════════ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-lg)',
              background: 'rgba(124,92,252,0.12)', color: 'var(--violet)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Para negocios
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text)', margin: 0 }}>
                Empieza a recibir reservas
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {BIZ_STEPS.map(s => (
              <StepCard key={s.n} step={s} accent="var(--violet)" />
            ))}
          </div>

          <div style={{ marginTop: 'var(--sp-6)' }}>
            {!user && (
              <Link to="/register" className="btn btn-primary">
                Registrar mi negocio
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            )}
            {user?.role === 'BUSINESS_OWNER' && (
              <Link to="/agenda" className="btn btn-primary">
                Ir a mi agenda
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
