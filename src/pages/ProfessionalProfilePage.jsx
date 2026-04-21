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
const IconHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

function formatBookingCount(n) {
  if (n < 100) return String(n);
  return `${Math.floor(n / 100) * 100}+`;
}

function StarPickerPro({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:'var(--sp-1)', cursor:'pointer' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange(n)}
          style={{ fontSize:28, color: n <= value ? '#D4A853' : 'var(--border)', lineHeight:1, userSelect:'none' }}>★</span>
      ))}
    </div>
  );
}

function ReviewCardPro({ review }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:'var(--r-xl)', padding:'var(--sp-4) var(--sp-5)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-2)' }}>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'linear-gradient(135deg,#D4A853,#A8833F)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'var(--font-heading)', fontWeight:700, fontSize:14, color:'#0A0808', flexShrink:0,
        }}>
          {review.author?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>{review.author?.name}</p>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
            <span style={{ color:'#D4A853', fontSize:13 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
            <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
              {new Date(review.createdAt).toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric' })}
            </span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p style={{ margin:0, fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.6 }}>{review.comment}</p>
      )}
    </div>
  );
}

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
  const [stats,    setStats]   = useState(null);
  const [reviews,  setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProfessional(id),
      api.getProfessionalStats(id),
      api.getProfessionalReviews(id),
    ])
      .then(([data, profStats, profReviews]) => {
        setProf(data);
        setStats(profStats);
        setReviews(profReviews || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      api.canReviewProfessional(id).then(r => setCanReview(r.canReview)).catch(() => {});
    }
  }, [id, user]);

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

  function handleBookHome() {
    if (!user) return navigate('/login');
    navigate(`/professionals/${prof.id}/book-home`);
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <div className="prof-profile-avail">
                  <span className="prof-card2-avail-dot" />
                  Disponible hoy
                </div>
                {prof.offersHomeService && (
                  <span className="home-service-badge">
                    <IconHome />
                    A domicilio
                  </span>
                )}
              </div>
              <h1 className="prof-profile-name">{prof.name}</h1>
              {bizName && (
                <p className="prof-profile-role" style={{ color: 'var(--text-muted)' }}>
                  {bizName}
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="biz-hero-stats" style={{ marginTop:'var(--sp-5)' }}>
              {stats.avgRating !== null ? (
                <div className="biz-hero-stat">
                  <span className="biz-hero-stat-num">{stats.avgRating.toFixed(1)}</span>
                  <span className="biz-hero-stat-label">
                    <span style={{ color:'#D4A853' }}>{'★'.repeat(Math.round(stats.avgRating))}{'☆'.repeat(5-Math.round(stats.avgRating))}</span>
                    {' '}{stats.reviewCount} reseña{stats.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="biz-hero-stat">
                  <span className="biz-hero-stat-num" style={{ fontSize:'var(--text-base)', color:'var(--text-muted)' }}>Sin reseñas</span>
                  <span className="biz-hero-stat-label">Calificación</span>
                </div>
              )}
              <div className="biz-hero-stat-sep" />
              <div className="biz-hero-stat">
                <span className="biz-hero-stat-num">{formatBookingCount(stats.bookingCount)}</span>
                <span className="biz-hero-stat-label">Reservas</span>
              </div>
            </div>
          )}

          <div className="prof-profile-hero-cta">
            {bizId && (
              <button
                className="btn btn-primary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:48 }}
                onClick={handleBook}
              >
                Reservar cita
                <IconArrowRight />
              </button>
            )}
            {prof.offersHomeService && (
              <button
                className="btn btn-secondary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:48 }}
                onClick={handleBookHome}
              >
                <IconHome />
                Reservar a domicilio
              </button>
            )}
            {!bizId && !prof.offersHomeService && (
              <button
                className="btn btn-primary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:48 }}
                onClick={handleBook}
              >
                Reservar cita
                <IconArrowRight />
              </button>
            )}
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

        {/* ── Galería ── */}
        {prof.photos?.length > 0 && (
          <section className="prof-profile-section">
            <h2 className="prof-profile-section-title">Galería de trabajo</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--sp-3)',
            }}>
              {prof.photos.map(photo => (
                <div key={photo.id} style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                  onClick={() => window.open(photo.url, '_blank')}
                >
                  <img
                    src={photo.url}
                    alt="trabajo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .2s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews ── */}
        <section className="prof-profile-section">
          <h2 className="prof-profile-section-title">Reseñas</h2>

          {user?.role === 'CLIENT' && canReview && !reviewSuccess && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setReviewError('');
              setSubmittingReview(true);
              try {
                const newReview = await api.createProfessionalReview(id, reviewForm);
                setReviews(prev => [newReview, ...prev]);
                setReviewSuccess(true);
                setCanReview(false);
                const newStats = await api.getProfessionalStats(id);
                setStats(newStats);
              } catch (err) {
                setReviewError(err.message);
              } finally {
                setSubmittingReview(false);
              }
            }} style={{
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:'var(--r-xl)', padding:'var(--sp-5)', marginBottom:'var(--sp-5)',
            }}>
              <p style={{ margin:'0 0 var(--sp-3)', fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>
                Deja tu reseña
              </p>
              <StarPickerPro value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Cuéntanos sobre tu experiencia (opcional)"
                rows={3}
                style={{
                  width:'100%', marginTop:'var(--sp-3)',
                  background:'var(--bg)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-md)', padding:'var(--sp-3)',
                  color:'var(--text)', fontSize:'var(--text-sm)', resize:'vertical',
                  outline:'none', boxSizing:'border-box',
                }}
              />
              {reviewError && <p style={{ color:'var(--error)', fontSize:'var(--text-sm)', margin:'var(--sp-2) 0 0' }}>{reviewError}</p>}
              <button type="submit" className="btn btn-primary" disabled={submittingReview}
                style={{ marginTop:'var(--sp-3)', height:40, fontSize:'var(--text-sm)' }}>
                {submittingReview ? 'Enviando…' : 'Publicar reseña'}
              </button>
            </form>
          )}

          {reviewSuccess && (
            <div style={{
              background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)',
              borderRadius:'var(--r-xl)', padding:'var(--sp-4)', marginBottom:'var(--sp-5)',
              color:'var(--text)', fontSize:'var(--text-sm)',
            }}>
              Tu reseña fue publicada. ¡Gracias!
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>Sin reseñas aún.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {reviews.map(r => <ReviewCardPro key={r.id} review={r} />)}
            </div>
          )}
        </section>

        {/* ── Bottom CTA ── */}
        <div className="prof-profile-bottom-cta">
          <p className="prof-profile-bottom-cta-text">
            ¿Listo para tu próxima cita con <strong>{firstName}</strong>?
          </p>
          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap', justifyContent:'center' }}>
            {bizId && (
              <button
                className="btn btn-primary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-10)', height:52 }}
                onClick={handleBook}
              >
                Reservar en negocio
                <IconArrowRight />
              </button>
            )}
            {prof.offersHomeService && (
              <button
                className="btn btn-secondary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-8)', height:52 }}
                onClick={handleBookHome}
              >
                <IconHome />
                Reservar a domicilio
              </button>
            )}
            {!bizId && !prof.offersHomeService && (
              <button
                className="btn btn-primary"
                style={{ fontSize:'var(--text-base)', padding:'0 var(--sp-10)', height:52 }}
                onClick={handleBook}
              >
                Reservar ahora
                <IconArrowRight />
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
