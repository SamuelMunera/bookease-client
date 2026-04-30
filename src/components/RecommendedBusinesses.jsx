import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

/* ── Category config ──────────────────────────────────────── */
const CAT_META = {
  BARBERSHOP: {
    label: 'Barbería',
    gradient: 'linear-gradient(135deg, #1a1625 0%, #2d1f4e 60%, #1a1625 100%)',
    accentColor: '#a47de8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
  },
  SPA: {
    label: 'Spa & Wellness',
    gradient: 'linear-gradient(135deg, #0d2137 0%, #0f4c5c 60%, #0d2137 100%)',
    accentColor: '#00d4c8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22c-4.97 0-9-3.13-9-7 0-1.8.7-3.44 1.86-4.72C6.1 8.85 9.5 7 12 7s5.9 1.85 7.14 3.28C20.3 11.56 21 13.2 21 15c0 3.87-4.03 7-9 7z"/>
        <path d="M12 7V2M9 4l3-2 3 2"/>
      </svg>
    ),
  },
  SALON: {
    label: 'Salón de belleza',
    gradient: 'linear-gradient(135deg, #2a1020 0%, #4a1030 60%, #2a1020 100%)',
    accentColor: '#ec4899',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
};

/* ── Mock data (fallback) ─────────────────────────────────── */
const MOCK = [
  {
    id: 'mock-1',
    name: 'Scissor & Co.',
    category: 'BARBERSHOP',
    city: 'Bogotá',
    area: 'Chapinero',
    rating: 4.9,
    reviewCount: 214,
    tags: ['Altamente valorado', 'Expertos en fades'],
  },
  {
    id: 'mock-2',
    name: 'Serene Spa Collective',
    category: 'SPA',
    city: 'Bogotá',
    area: 'Zona Rosa',
    rating: 4.8,
    reviewCount: 97,
    tags: ['Ambiente premium', 'Masajes express'],
  },
  {
    id: 'mock-3',
    name: 'Studio Maison',
    category: 'SALON',
    city: 'Medellín',
    area: 'El Poblado',
    rating: 4.7,
    reviewCount: 183,
    tags: ['Coloración experta', 'Cita rápida'],
  },
  {
    id: 'mock-4',
    name: 'The Craft Barber',
    category: 'BARBERSHOP',
    city: 'Cali',
    area: 'Granada',
    rating: 4.8,
    reviewCount: 156,
    tags: ['Sin espera', 'Barbas y fades'],
  },
];

/* ── Inline SVG icons ─────────────────────────────────────── */
function IconPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z"/>
      <circle cx="12" cy="8" r="2"/>
    </svg>
  );
}

function IconStar({ filled }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 13.2 8.8 19 12l-5.8 3.2L12 21l-1.2-5.8L5 12l5.8-3.2L12 3z"/>
      <path d="M5 5 5.6 7.4 8 8l-2.4.6L5 11l-.6-2.4L2 8l2.4-.6L5 5z"/>
      <path d="M19 14l.6 2.4L22 17l-2.4.6L19 20l-.6-2.4L16 17l2.4-.6L19 14z"/>
    </svg>
  );
}

/* ── Single card ──────────────────────────────────────────── */
function RecCard({ business }) {
  const meta = CAT_META[business.category] || CAT_META.BARBERSHOP;

  return (
    <Link
      to={`/businesses/${business.id}`}
      className="rec-card"
      aria-label={`Ver ${business.name}`}
    >
      {/* Image / gradient area */}
      <div className="rec-card-img" style={{ background: meta.gradient }}>
        {business.logoUrl ? (
          <img src={business.logoUrl} alt={business.name} loading="lazy" className="rec-card-photo" />
        ) : (
          <div className="rec-card-placeholder" style={{ color: meta.accentColor }}>
            {meta.icon}
            <span className="rec-card-initial">{business.name[0]}</span>
          </div>
        )}
        {/* Rating badge */}
        {business.rating && (
          <div className="rec-card-rating-badge">
            <span style={{ color: '#D4A853' }}>
              <IconStar filled />
            </span>
            <span>{typeof business.rating === 'number' ? business.rating.toFixed(1) : business.rating}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="rec-card-body">
        {/* Category pill */}
        <span className="rec-card-cat" style={{ color: meta.accentColor, borderColor: `${meta.accentColor}30`, background: `${meta.accentColor}10` }}>
          {meta.label}
        </span>

        {/* Name */}
        <p className="rec-card-name">{business.name}</p>

        {/* Location */}
        <p className="rec-card-loc">
          <span className="rec-card-loc-icon">
            <IconPin />
          </span>
          {business.area ? `${business.area}, ${business.city}` : business.city}
        </p>

        {/* Tags */}
        {business.tags?.length > 0 && (
          <div className="rec-card-tags">
            {business.tags.slice(0, 2).map((t) => (
              <span key={t} className="rec-card-tag">{t}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rec-card-cta">
          <span>Ver negocio</span>
          <IconArrow />
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function RecommendedBusinesses({ currentBusinessId, category, city }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.getBusinesses(category ? { category } : {})
      .then((data) => {
        if (cancelled) return;
        const filtered = (data || [])
          .filter((b) => b.id !== currentBusinessId)
          .slice(0, 4);

        if (filtered.length >= 2) {
          setRecs(filtered);
        } else {
          // Enrich mock data with real-looking IDs only if no live data
          setRecs(MOCK.map((m) => ({ ...m, isMock: true })));
        }
      })
      .catch(() => {
        if (!cancelled) setRecs(MOCK.map((m) => ({ ...m, isMock: true })));
      });
    return () => { cancelled = true; };
  }, [currentBusinessId, category]);

  if (!recs.length) return null;

  return (
    <section className="recs-section" aria-labelledby="recs-heading">

      {/* Header */}
      <div className="recs-header">
        <div className="recs-header-left">
          <span className="recs-sparkle" aria-hidden="true">
            <IconSparkle />
          </span>
          <h2 className="recs-title" id="recs-heading">
            Lugares similares que podrían gustarte
          </h2>
        </div>
        <Link to="/businesses" className="recs-see-all">
          Explorar más
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Cards track */}
      <div className="recs-track" role="list">
        {recs.map((b) => (
          <div key={b.id} role="listitem">
            <RecCard business={b} />
          </div>
        ))}
      </div>

    </section>
  );
}
