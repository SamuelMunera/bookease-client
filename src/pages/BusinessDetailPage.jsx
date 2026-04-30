import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import RecommendedBusinesses from '../components/RecommendedBusinesses';

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#D4A853,#A8833F)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#7C5CFC,#5B3FD9)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#00D4C8,#008F8B)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#22C55E,#15803D)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#F59E0B,#B45309)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#EC4899,#9D174D)', color: '#fff' },
];
function avatarPalette(name) {
  return AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length];
}

function Skel({ w, h, r = 'var(--r-sm)' }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

function Stars({ rating = 4.8 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return <span className="stars">{'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}</span>;
}

function formatBookingCount(n) {
  if (n < 100) return String(n);
  return `${Math.floor(n / 100) * 100}+`;
}

/* ══════════════════════════════════════════════════════════
   HERO — with cover photo support
   ══════════════════════════════════════════════════════════ */
function BizHero({ business, stats }) {
  const avgRating   = stats?.avgRating ?? null;
  const reviewCount = stats?.reviewCount ?? 0;
  const bookingCount = stats?.bookingCount ?? 0;
  const pal = avatarPalette(business.name);

  return (
    <div
      className="biz-hero biz-hero--detail"
      style={business.coverUrl ? {
        background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%), url(${business.coverUrl}) center/cover no-repeat`,
      } : undefined}
    >
      <div className="biz-hero-inner">
        <div className="biz-hero-text">
          <div className="biz-hero-breadcrumb">
            <Link to="/" className="biz-hero-back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Inicio
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="biz-hero-breadcrumb-sep"><path d="M9 18l6-6-6-6"/></svg>
            <span className="biz-hero-cat">
              <span className="biz-hero-cat-dot" />
              {CAT_LABEL[business.category] || business.category}
            </span>
          </div>

          <h1 className="biz-hero-name">
            {business.name.split(' ').slice(0, -1).join(' ')}{' '}
            <em>{business.name.split(' ').slice(-1)[0]}</em>
          </h1>

          <div className="biz-hero-address">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline', verticalAlign:'middle', marginRight:4 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {business.address}, {business.city}
            </span>
            {business.phone && (
              <>
                <span className="biz-hero-sep">·</span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline', verticalAlign:'middle', marginRight:4 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {business.phone}
                </span>
              </>
            )}
          </div>

          {business.description && (
            <p className="biz-hero-desc">{business.description}</p>
          )}

          <div className="biz-hero-stats">
            {avgRating !== null ? (
              <div className="biz-hero-stat">
                <span className="biz-hero-stat-num">{avgRating.toFixed(1)}</span>
                <span className="biz-hero-stat-label">
                  <Stars rating={avgRating} />&nbsp;{reviewCount} reseña{reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="biz-hero-stat">
                <span className="biz-hero-stat-num">—</span>
                <span className="biz-hero-stat-label">Sin reseñas</span>
              </div>
            )}
            <div className="biz-hero-stat-sep" />
            <div className="biz-hero-stat">
              <span className="biz-hero-stat-num">{formatBookingCount(bookingCount)}</span>
              <span className="biz-hero-stat-label">Reservas</span>
            </div>
          </div>
        </div>

        <div className="biz-hero-logo" style={{
          background: business.logoUrl ? 'transparent' : pal.bg,
          color: pal.color,
        }}>
          {business.logoUrl
            ? <img src={business.logoUrl} alt={business.name} />
            : business.name[0].toUpperCase()
          }
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GALLERY LIGHTBOX
   ══════════════════════════════════════════════════════════ */
function GallerySection({ photos }) {
  const [lightbox, setLightbox] = useState(null);

  if (!photos.length) return null;

  return (
    <section className="biz-gallery-section">
      <div className="detail-section-label" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="detail-section-label-line" />
        <span>Galería</span>
        <div className="detail-section-label-line" />
      </div>

      <div className="biz-gallery-grid">
        {photos.slice(0, 8).map((p, i) => (
          <button
            key={p.id}
            className={`biz-gallery-item${i === 0 ? ' biz-gallery-item--featured' : ''}`}
            onClick={() => setLightbox(i)}
            aria-label={p.caption || `Foto ${i + 1}`}
          >
            <img src={p.url} alt={p.caption || ''} loading="lazy" />
            {i === 7 && photos.length > 8 && (
              <div className="biz-gallery-more">+{photos.length - 8}</div>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="biz-lightbox" onClick={() => setLightbox(null)}>
          <button className="biz-lightbox-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button
            className="biz-lightbox-nav biz-lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
            disabled={lightbox === 0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="biz-lightbox-img" onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightbox].url} alt={photos[lightbox].caption || ''} />
            {photos[lightbox].caption && (
              <p className="biz-lightbox-caption">{photos[lightbox].caption}</p>
            )}
          </div>
          <button
            className="biz-lightbox-nav biz-lightbox-next"
            onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.min(photos.length - 1, l + 1)); }}
            disabled={lightbox === photos.length - 1}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   BUSINESS HOURS
   ══════════════════════════════════════════════════════════ */
function HoursSection({ hours }) {
  if (!hours.length) return null;

  const today = new Date().getDay();
  const sorted = [...hours].sort((a, b) => {
    const da = (a.dayOfWeek - today + 7) % 7;
    const db = (b.dayOfWeek - today + 7) % 7;
    return da - db;
  });

  function fmt(t) {
    const [h, m] = t.split(':');
    const hh = parseInt(h);
    const ampm = hh >= 12 ? 'pm' : 'am';
    const h12 = hh % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  const todayHours = hours.find(h => h.dayOfWeek === today);
  const isOpenNow = (() => {
    if (!todayHours?.isOpen) return false;
    const now = new Date();
    const [oh, om] = todayHours.openTime.split(':').map(Number);
    const [ch, cm] = todayHours.closeTime.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
  })();

  return (
    <section className="biz-hours-section">
      <div className="biz-hours-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="biz-hours-title">Horarios</span>
        <span className={`biz-hours-badge${isOpenNow ? ' open' : ' closed'}`}>
          {isOpenNow ? 'Abierto ahora' : 'Cerrado'}
        </span>
      </div>

      <div className="biz-hours-list">
        {sorted.map((h) => {
          const isToday = h.dayOfWeek === today;
          return (
            <div key={h.dayOfWeek} className={`biz-hours-row${isToday ? ' today' : ''}`}>
              <span className="biz-hours-day">{DAY_NAMES[h.dayOfWeek]}</span>
              {h.isOpen
                ? <span className="biz-hours-time">{fmt(h.openTime)} – {fmt(h.closeTime)}</span>
                : <span className="biz-hours-closed">Cerrado</span>
              }
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   MAP SECTION
   ══════════════════════════════════════════════════════════ */
function MapSection({ business }) {
  const { lat, lng, address, city, country } = business;
  const hasCoords = lat && lng;

  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008},${lat - 0.005},${lng + 0.008},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const mapsLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`;

  return (
    <section className="biz-map-section">
      <div className="biz-map-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="biz-map-title">Ubicación</span>
      </div>
      <p className="biz-map-address">{address}, {city}{country !== 'CO' ? `, ${country}` : ''}</p>

      {mapSrc ? (
        <div className="biz-map-frame">
          <iframe
            title="Mapa de ubicación"
            src={mapSrc}
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="biz-map-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Sin coordenadas configuradas</p>
        </div>
      )}

      <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="biz-map-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Ver en Google Maps
      </a>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFESSIONAL CARD
   ══════════════════════════════════════════════════════════ */
function ProfCard({ p, selected, onSelect }) {
  const pal = avatarPalette(p.name);
  return (
    <div
      className={`prof-card2${selected ? ' selected' : ''}`}
      onClick={() => onSelect(p.id)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(p.id)}
      aria-pressed={selected}
    >
      <div className="prof-card2-strip" />
      <div className="prof-card2-avatar" style={{ background: p.avatarUrl ? 'transparent' : pal.bg, overflow: 'hidden', padding: 0 }}>
        {p.avatarUrl
          ? <img src={p.avatarUrl} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <span style={{ color: pal.color, fontFamily:'var(--font-heading)', fontWeight:700, fontSize:22 }}>{p.name[0].toUpperCase()}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', flexWrap:'wrap' }}>
          <p className="prof-card2-name" style={{ margin:0 }}>{p.name}</p>
          <Link to={`/professionals/${p.id}`} className="prof-card2-profile-link" onClick={(e) => e.stopPropagation()} tabIndex={0}>
            Ver perfil
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        {p.bio && <p className="prof-card2-bio">{p.bio}</p>}
        <div className="prof-card2-avail">
          <span className="prof-card2-avail-dot" />
          Disponible hoy
        </div>
      </div>
      <div className={`prof-card2-check${selected ? ' visible' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICE CARD
   ══════════════════════════════════════════════════════════ */
const SVC_ICON = {
  BARBERSHOP: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  SPA: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c-4.97 0-9-3.13-9-7 0-1.8.7-3.44 1.86-4.72C6.1 8.85 9.5 7 12 7s5.9 1.85 7.14 3.28C20.3 11.56 21 13.2 21 15c0 3.87-4.03 7-9 7z"/><path d="M12 7V2M9 4l3-2 3 2"/></svg>,
  SALON: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

function ServiceCard({ sv, selected, onSelect, category }) {
  return (
    <div
      className={`svc-card3${selected ? ' selected' : ''}`}
      onClick={() => onSelect(sv.id)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(sv.id)}
      aria-pressed={selected}
    >
      <div className="svc-card3-strip" />
      <div className="svc-card3-top">
        <div className="svc-card3-icon">{SVC_ICON[category] ?? SVC_ICON.BARBERSHOP}</div>
        <span className="svc-card3-duration">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {sv.duration} min
        </span>
      </div>
      <p className="svc-card3-name">{sv.name}</p>
      {sv.description && <p className="svc-card3-desc">{sv.description}</p>}
      <div className="svc-card3-footer">
        <p className="svc-card3-price">${Number(sv.price).toLocaleString('es-CO')}</p>
        <div className={`svc-card3-cta${selected ? ' selected' : ''}`}>
          {selected ? (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Seleccionado</>
          ) : (
            <>Elegir<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CATEGORIZED SERVICES
   ══════════════════════════════════════════════════════════ */
function CategorizedServices({ services, categories, selectedService, onSelect, category: bizCategory }) {
  const [activeTab, setActiveTab] = useState('all');

  const uncategorized = services.filter(s => !s.categoryId);
  const hasCats = categories.length > 0;

  const tabs = hasCats
    ? [{ id: 'all', name: 'Todos' }, ...categories, ...(uncategorized.length ? [{ id: 'uncategorized', name: 'Otros' }] : [])]
    : [];

  function getVisible() {
    if (!hasCats || activeTab === 'all') return services;
    if (activeTab === 'uncategorized') return uncategorized;
    return services.filter(s => s.categoryId === activeTab);
  }

  const visible = getVisible();

  return (
    <div>
      {hasCats && (
        <div className="svc-cat-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`svc-cat-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)' }}>Sin servicios en esta categoría.</p>
        </div>
      ) : (
        <div className="svc-cards-grid">
          {visible.map((sv) => (
            <ServiceCard
              key={sv.id}
              sv={sv}
              selected={selectedService === sv.id}
              onSelect={onSelect}
              category={bizCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REVIEWS
   ══════════════════════════════════════════════════════════ */
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:'var(--sp-1)', cursor:'pointer' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange(n)} style={{ fontSize:28, color: n <= value ? '#D4A853' : 'var(--border)', lineHeight:1, userSelect:'none' }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'var(--sp-4) var(--sp-5)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-2)' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#D4A853,#A8833F)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontWeight:700, fontSize:14, color:'#0A0808', flexShrink:0 }}>
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
      {review.comment && <p style={{ margin:0, fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.6 }}>{review.comment}</p>}
    </div>
  );
}

function ReviewsSection({ reviews, canReview, user, reviewForm, setReviewForm, reviewError, reviewSuccess, submitting, onSubmit }) {
  return (
    <section style={{ marginTop:'var(--sp-12)' }}>
      <div className="detail-section-label" style={{ marginBottom:'var(--sp-6)' }}>
        <div className="detail-section-label-line" />
        <span>Reseñas</span>
        <div className="detail-section-label-line" />
      </div>

      {user?.role === 'CLIENT' && canReview && !reviewSuccess && (
        <form onSubmit={onSubmit} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'var(--sp-5)', marginBottom:'var(--sp-6)' }}>
          <p style={{ margin:'0 0 var(--sp-3)', fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>Deja tu reseña</p>
          <StarPicker value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
          <textarea
            value={reviewForm.comment}
            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="Cuéntanos sobre tu experiencia (opcional)"
            rows={3}
            style={{ width:'100%', marginTop:'var(--sp-3)', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'var(--sp-3)', color:'var(--text)', fontSize:'var(--text-sm)', resize:'vertical', outline:'none', boxSizing:'border-box' }}
          />
          {reviewError && <p style={{ color:'var(--error)', fontSize:'var(--text-sm)', margin:'var(--sp-2) 0 0' }}>{reviewError}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop:'var(--sp-3)', height:40, fontSize:'var(--text-sm)' }}>
            {submitting ? 'Enviando…' : 'Publicar reseña'}
          </button>
        </form>
      )}

      {reviewSuccess && (
        <div style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:'var(--r-xl)', padding:'var(--sp-4)', marginBottom:'var(--sp-6)', color:'var(--text)', fontSize:'var(--text-sm)' }}>
          Tu reseña fue publicada. ¡Gracias!
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="empty-state" style={{ padding:'var(--sp-8) 0' }}>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>
            {user?.role === 'CLIENT' ? 'Sin reseñas aún. ¡Sé el primero!' : 'Sin reseñas aún.'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   STICKY BOOKING BAR
   ══════════════════════════════════════════════════════════ */
function BookingBar({ service, error, onBook, ready }) {
  return (
    <div className={`booking-bar${ready ? ' booking-bar--ready' : ''}`}>
      <div className="booking-bar-inner">
        <div className="booking-bar-info">
          {service ? (
            <>
              <p className="booking-bar-service">{service.name}</p>
              <p className="booking-bar-meta">
                {service.duration} min
                {error && <> · <span style={{ color:'var(--error)' }}>{error}</span></>}
              </p>
            </>
          ) : (
            <p className="booking-bar-hint">{error || 'Selecciona profesional y servicio'}</p>
          )}
        </div>
        <div className="booking-bar-right">
          {service && <p className="booking-bar-price">${Number(service.price).toLocaleString('es-CO')}</p>}
          <button className="btn btn-primary booking-bar-btn" onClick={onBook}>
            Ver horarios
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
export default function BusinessDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness]             = useState(null);
  const [professionals, setProfessionals]   = useState([]);
  const [allServices, setAllServices]       = useState([]);
  const [services, setServices]             = useState([]);
  const [gallery, setGallery]               = useState([]);
  const [categories, setCategories]         = useState([]);
  const [hours, setHours]                   = useState([]);
  const [selectedProf, setSelectedProf]     = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [error, setError]                   = useState('');
  const [loadError, setLoadError]           = useState('');
  const [stats, setStats]                   = useState(null);
  const [reviews, setReviews]               = useState([]);
  const [canReview, setCanReview]           = useState(false);
  const [reviewForm, setReviewForm]         = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError]       = useState('');
  const [reviewSuccess, setReviewSuccess]   = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.getBusiness(id),
      api.getBusinessProfessionals(id),
      api.getBusinessServices(id),
      api.getBusinessStats(id),
      api.getBusinessReviews(id),
      api.getBusinessGallery(id).catch(() => []),
      api.getBusinessServiceCategories(id).catch(() => []),
      api.getBusinessHours(id).catch(() => []),
    ]).then(([biz, profs, svcs, bizStats, bizReviews, gal, cats, hrs]) => {
      if (!biz) { setLoadError('Negocio no encontrado.'); return; }
      setBusiness(biz);
      setProfessionals(profs || []);
      setAllServices(svcs || []);
      setServices(svcs || []);
      setStats(bizStats);
      setReviews(bizReviews || []);
      setGallery(gal || []);
      setCategories(cats || []);
      setHours(hrs || []);
    }).catch((err) => setLoadError(err.message || 'No se pudo cargar el negocio.'));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      api.canReviewBusiness(id).then(r => setCanReview(r.canReview)).catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    if (!selectedProf) { setServices(allServices); setSelectedService(''); return; }
    api.getProfessionalServices(selectedProf)
      .then(proServices => {
        setServices(proServices?.length ? proServices : allServices);
        setSelectedService('');
      })
      .catch(() => setServices(allServices));
  }, [selectedProf]); // eslint-disable-line

  function handleBook() {
    if (!user) return navigate('/login');
    if (!selectedProf || !selectedService) {
      setError('Selecciona un profesional y un servicio para continuar.');
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(`/book?businessId=${id}&professionalId=${selectedProf}&serviceId=${selectedService}`);
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);

  if (loadError) {
    return (
      <div className="page" style={{ paddingTop:'var(--sp-16)', textAlign:'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>{loadError}</p>
          <Link to="/"><button className="btn btn-secondary" style={{ marginTop:'var(--sp-4)' }}>Volver al inicio</button></Link>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <>
        <div className="biz-hero" style={{ paddingBottom:'var(--sp-10)' }}>
          <div className="biz-hero-inner">
            <Skel w={80} h={12} r="var(--r-full)" />
            <div style={{ marginTop:'var(--sp-4)' }}><Skel w="55%" h={36} /></div>
            <div style={{ marginTop:'var(--sp-2)' }}><Skel w="40%" h={14} /></div>
            <div style={{ marginTop:'var(--sp-4)' }}><Skel w="70%" h={12} /></div>
          </div>
        </div>
        <div className="page">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-8)', marginBottom:'var(--sp-8)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {[1,2,3].map(n => <Skel key={n} w="100%" h={80} r="var(--r-xl)" />)}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {[1,2,3].map(n => <Skel key={n} w="100%" h={80} r="var(--r-xl)" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  const accentVars = business.accentColor
    ? { '--gold': business.accentColor, '--gold-dark': business.accentColor, '--gold-light': business.accentColor }
    : undefined;

  return (
    <div style={accentVars}>
      <BizHero business={business} stats={stats} />

      <div className="page detail-page" ref={contentRef}>

        {/* ── Gallery ── */}
        <GallerySection photos={gallery} />

        {/* ── Section label ── */}
        <div className="detail-section-label" style={{ marginTop: gallery.length ? 'var(--sp-10)' : 0 }}>
          <div className="detail-section-label-line" />
          <span>Tu elección</span>
          <div className="detail-section-label-line" />
        </div>

        {/* ── 2-column grid ── */}
        <div className="detail-grid">

          {/* ── LEFT: Professionals ── */}
          <section>
            <div className="detail-col-header">
              <div className="detail-col-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <p className="detail-col-title">Profesional</p>
                <p className="detail-col-sub">
                  {professionals.length > 0
                    ? `${professionals.length} especialista${professionals.length !== 1 ? 's' : ''}`
                    : 'Sin profesionales'}
                </p>
              </div>
              {selectedProf && (
                <div className="detail-col-tick">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            {professionals.length === 0 ? (
              <div className="empty-state" style={{ padding:'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize:'var(--text-sm)' }}>Sin profesionales registrados.</p>
              </div>
            ) : (
              <div className="detail-cards-list">
                {professionals.map((p) => (
                  <ProfCard key={p.id} p={p} selected={selectedProf === p.id} onSelect={(id) => { setSelectedProf(id); setError(''); }} />
                ))}
              </div>
            )}
          </section>

          {/* ── RIGHT: Services (categorized) ── */}
          <section>
            <div className="detail-col-header">
              <div className="detail-col-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <div>
                <p className="detail-col-title">Servicio</p>
                <p className="detail-col-sub">
                  {services.length > 0
                    ? `${services.length} servicio${services.length !== 1 ? 's' : ''}`
                    : 'Sin servicios'}
                </p>
              </div>
              {selectedService && (
                <div className="detail-col-tick">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            {services.length === 0 ? (
              <div className="empty-state" style={{ padding:'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize:'var(--text-sm)' }}>Sin servicios registrados.</p>
              </div>
            ) : (
              <CategorizedServices
                services={services}
                categories={categories}
                selectedService={selectedService}
                onSelect={(id) => { setSelectedService(id); setError(''); }}
                category={business.category}
              />
            )}
          </section>
        </div>

        {/* ── Inline CTA ── */}
        {(selectedProf || selectedService) && (
          <div className="detail-inline-cta">
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', flex:1, flexWrap:'wrap' }}>
              {selectedProf && (
                <div className="detail-selection-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {professionals.find(p => p.id === selectedProf)?.name}
                </div>
              )}
              {selectedService && (
                <div className="detail-selection-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {selectedServiceData?.name} · {selectedServiceData?.duration} min
                  <span style={{ fontWeight:700, color:'var(--gold)' }}>
                    · ${Number(selectedServiceData?.price || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              )}
            </div>
            {error && <p className="error-msg" style={{ marginBottom:0, flex:'100%', order:-1 }}>{error}</p>}
            <button className="btn btn-primary" onClick={handleBook} style={{ flexShrink:0, minWidth:180 }}>
              Ver disponibilidad
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {!selectedProf && !selectedService && (
          <div className="detail-cta-prompt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Selecciona un profesional y un servicio para reservar</span>
            {error && <span style={{ color:'var(--error)', marginLeft:'var(--sp-2)' }}>— {error}</span>}
          </div>
        )}

        {/* ── Info strip: Hours + Map ── */}
        {(hours.length > 0 || business.lat || business.address) && (
          <div className="biz-info-strip">
            <HoursSection hours={hours} />
            <MapSection business={business} />
          </div>
        )}

        {/* ── Recommended nearby ── */}
        <RecommendedBusinesses
          currentBusinessId={id}
          category={business.category}
          city={business.city}
        />

        {/* ── Reviews ── */}
        <ReviewsSection
          reviews={reviews}
          canReview={canReview}
          user={user}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          reviewError={reviewError}
          reviewSuccess={reviewSuccess}
          submitting={submittingReview}
          onSubmit={async (e) => {
            e.preventDefault();
            setReviewError('');
            setSubmittingReview(true);
            try {
              const newReview = await api.createBusinessReview(id, reviewForm);
              setReviews(prev => [newReview, ...prev]);
              setReviewSuccess(true);
              setCanReview(false);
              const newStats = await api.getBusinessStats(id);
              setStats(newStats);
            } catch (err) {
              setReviewError(err.message);
            } finally {
              setSubmittingReview(false);
            }
          }}
        />
      </div>

      <BookingBar
        service={selectedServiceData}
        error={error}
        onBook={handleBook}
        ready={!!(selectedProf && selectedService)}
      />
    </div>
  );
}
