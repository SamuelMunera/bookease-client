import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ── Avatar palette ── */
const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#D4A853,#A8833F)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#7C5CFC,#5B3FD9)', color: '#fff'    },
  { bg: 'linear-gradient(135deg,#00D4C8,#008F8B)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#22C55E,#15803D)', color: '#fff'    },
  { bg: 'linear-gradient(135deg,#F59E0B,#B45309)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#EC4899,#9D174D)', color: '#fff'    },
];
function avatarPalette(name) {
  return AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length];
}

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
  </svg>
);

function NotFound() {
  return (
    <div className="page" style={{ textAlign:'center', paddingTop:'var(--sp-16)', paddingBottom:'var(--sp-16)' }}>
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" style={{ marginBottom:'var(--sp-4)' }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-xl)', marginBottom:'var(--sp-2)' }}>
          Profesional no encontrado
        </h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'var(--sp-6)' }}>
          Este perfil no existe o fue removido.
        </p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
}

export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prof,    setProf]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProfessional(id)
      .then(data => { setProf(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 'var(--sp-16)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-subtle)' }}>Cargando perfil…</p>
      </div>
    );
  }

  if (notFound || !prof) return <NotFound />;

  const pal       = avatarPalette(prof.name);
  const firstName = prof.name.split(' ')[0];
  const bizId     = prof.business?.id;
  const bizName   = prof.business?.name;

  function handleBook() {
    if (!user) return navigate('/login');
    navigate(bizId ? `/businesses/${bizId}?professionalId=${prof.id}` : '/');
  }

  return (
    <>
      {/* ══ Hero ═══════════════════════════════════════════════ */}
      <div className="prof-profile-hero">
        <div className="biz-hero-inner">

          <Link to={bizId ? `/businesses/${bizId}` : '/'} className="biz-hero-back">
            <IconArrowLeft />
            {bizName ? `Volver a ${bizName}` : 'Inicio'}
          </Link>

          <div className="prof-profile-header">
            <div className="prof-profile-avatar" style={{ background: prof.avatarUrl ? 'transparent' : pal.bg, overflow: 'hidden', padding: 0 }}>
              {prof.avatarUrl
                ? <img src={prof.avatarUrl} alt={prof.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <span style={{ color: pal.color, fontFamily:'var(--font-heading)', fontWeight:700, fontSize:42 }}>{prof.name[0].toUpperCase()}</span>
              }
            </div>

            <div className="prof-profile-identity">
              <div className="prof-profile-avail">
                <span className="prof-card2-avail-dot" />
                Disponible hoy
              </div>
              <h1 className="prof-profile-name">{prof.name}</h1>
              {bizName && (
                <p className="prof-profile-role" style={{ color: 'var(--text-muted)' }}>
                  {bizName}
                </p>
              )}
            </div>
          </div>

          <div className="prof-profile-hero-cta">
            <button
              className="btn btn-primary"
              style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:48 }}
              onClick={handleBook}
            >
              Reservar cita
              <IconArrowRight />
            </button>
            {bizId && (
              <Link to={`/businesses/${bizId}`} className="btn btn-ghost" style={{ height:48 }}>
                <IconBuilding />
                Ver negocio
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ════════════════════════════════════════════ */}
      <div className="page prof-profile-page">

        {/* ── About ── */}
        {prof.bio && (
          <section className="prof-profile-section">
            <h2 className="prof-profile-section-title">Sobre {firstName}</h2>
            <p className="prof-profile-about">{prof.bio}</p>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <div className="prof-profile-bottom-cta">
          <p className="prof-profile-bottom-cta-text">
            ¿Listo para tu próxima cita con <strong>{firstName}</strong>?
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-10)', height:52 }}
            onClick={handleBook}
          >
            Reservar ahora
            <IconArrowRight />
          </button>
        </div>

      </div>
    </>
  );
}
