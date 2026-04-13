import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_PROFESSIONALS } from '../data/mockBusinesses';

/* ── Avatar palette (same logic as BusinessDetailPage) ── */
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

function Stars({ rating = 5 }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return <span className="stars">{'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}</span>;
}

/* ── Icons ── */
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
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════
   NOT FOUND
   ══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const prof = MOCK_PROFESSIONALS.find(p => p.id === id);
  if (!prof) return <NotFound />;

  const pal = avatarPalette(prof.name);
  const firstName = prof.name.split(' ')[0];

  function handleBook() {
    if (!user) return navigate('/login');
    navigate(prof.businessId
      ? `/businesses/${prof.businessId}?professionalId=${prof.id}`
      : '/');
  }

  return (
    <>
      {/* ══ Hero ═══════════════════════════════════════════════ */}
      <div className="prof-profile-hero">
        <div className="biz-hero-inner">

          {/* Back */}
          <Link
            to={prof.businessId ? `/businesses/${prof.businessId}` : '/'}
            className="biz-hero-back"
          >
            <IconArrowLeft />
            {prof.businessId ? 'Volver al negocio' : 'Inicio'}
          </Link>

          {/* Header row */}
          <div className="prof-profile-header">
            {/* Avatar */}
            <div className="prof-profile-avatar" style={{ background: pal.bg }}>
              <span style={{ color: pal.color, fontFamily:'var(--font-heading)', fontWeight:700, fontSize:42 }}>
                {prof.name[0].toUpperCase()}
              </span>
            </div>

            {/* Identity */}
            <div className="prof-profile-identity">
              <div className="prof-profile-avail">
                <span className="prof-card2-avail-dot" />
                Disponible hoy
              </div>
              <h1 className="prof-profile-name">{prof.name}</h1>
              <p className="prof-profile-role">{prof.role}</p>
              <div className="prof-profile-meta">
                <Stars rating={prof.rating} />
                <span className="prof-profile-meta-num">{prof.rating}</span>
                <span className="prof-profile-meta-sep">·</span>
                <span>{prof.reviewCount} reseñas</span>
                <span className="prof-profile-meta-sep">·</span>
                <IconBriefcase />
                <span>{prof.experience}</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="prof-profile-hero-cta">
            <button className="btn btn-primary" style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:48 }} onClick={handleBook}>
              Reservar cita
              <IconArrowRight />
            </button>
            {prof.businessId && (
              <Link to={`/businesses/${prof.businessId}`} className="btn btn-ghost" style={{ height:48 }}>
                <IconBuilding />
                Ver negocio
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ════════════════════════════════════════════ */}
      <div className="page prof-profile-page">

        {/* ── Stats row ── */}
        <div className="prof-profile-stats">
          <div className="prof-profile-stat">
            <IconUsers />
            <span className="prof-profile-stat-num">{prof.reviewCount}+</span>
            <span className="prof-profile-stat-label">Clientes</span>
          </div>
          <div className="prof-profile-stat-sep" />
          <div className="prof-profile-stat">
            <IconBriefcase />
            <span className="prof-profile-stat-num">{prof.experience}</span>
            <span className="prof-profile-stat-label">Experiencia</span>
          </div>
          <div className="prof-profile-stat-sep" />
          <div className="prof-profile-stat">
            <IconStar />
            <span className="prof-profile-stat-num">{prof.rating}</span>
            <span className="prof-profile-stat-label">Calificación</span>
          </div>
        </div>

        {/* ── About ── */}
        <section className="prof-profile-section">
          <h2 className="prof-profile-section-title">Sobre {firstName}</h2>
          <p className="prof-profile-about">{prof.about}</p>
        </section>

        {/* ── Specialties ── */}
        <section className="prof-profile-section">
          <h2 className="prof-profile-section-title">Especialidades</h2>
          <div className="prof-profile-tags">
            {prof.specialties.map(s => (
              <span key={s} className="prof-profile-tag">{s}</span>
            ))}
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="prof-profile-section">
          <h2 className="prof-profile-section-title">Trabajos destacados</h2>
          <div className="prof-profile-gallery">
            {prof.gallery.map(item => (
              <div key={item.id} className="prof-gallery-item">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(item.seed)}/400/300`}
                  alt={item.label}
                  loading="lazy"
                />
                <div className="prof-gallery-overlay">
                  <span className="prof-gallery-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="prof-profile-bottom-cta">
          <p className="prof-profile-bottom-cta-text">
            ¿Listo para tu próxima cita con <strong>{firstName}</strong>?
          </p>
          <button className="btn btn-primary" style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-10)', height:52 }} onClick={handleBook}>
            Reservar ahora
            <IconArrowRight />
          </button>
        </div>

      </div>
    </>
  );
}
