import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };

/* ── Avatar colours based on initial letter ───────────────── */
const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#D71A21,#8B0D13)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#1A1714,#4A4440)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#C8B89A,#a0896e)', color: '#1A1714' },
  { bg: 'linear-gradient(135deg,#166534,#14532d)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#92600A,#6b4507)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)', color: '#fff' },
];
function avatarPalette(name) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

/* ── Skeleton shimmer block ───────────────────────────────── */
function Skel({ w, h, r = 'var(--r-sm)' }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

/* ── Star row ─────────────────────────────────────────────── */
function Stars({ rating = 4.8 }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return <span className="stars">{'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}</span>;
}

/* ══════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════ */
function BizHero({ business }) {
  return (
    <div className="biz-hero biz-hero--detail">
      {/* decorative grid bg is handled in CSS */}

      <div className="biz-hero-inner">
        {/* Breadcrumb */}
        <Link to="/" className="biz-hero-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Inicio
        </Link>

        {/* Category chip */}
        <p className="biz-hero-cat">
          <span className="biz-hero-cat-dot" />
          {CAT_LABEL[business.category] || business.category}
        </p>

        {/* Name */}
        <h1 className="biz-hero-name">
          {business.name.split(' ').slice(0, -1).join(' ')}{' '}
          <em>{business.name.split(' ').slice(-1)[0]}</em>
        </h1>

        {/* Address + phone */}
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

        {/* Description */}
        {business.description && (
          <p className="biz-hero-desc">{business.description}</p>
        )}

        {/* Hero stats */}
        <div className="biz-hero-stats">
          <div className="biz-hero-stat">
            <span className="biz-hero-stat-num">4.9</span>
            <span className="biz-hero-stat-label">
              <Stars rating={4.9} /> Calificación
            </span>
          </div>
          <div className="biz-hero-stat-sep" />
          <div className="biz-hero-stat">
            <span className="biz-hero-stat-num">200+</span>
            <span className="biz-hero-stat-label">Reservas</span>
          </div>
          <div className="biz-hero-stat-sep" />
          <div className="biz-hero-stat">
            <span className="biz-hero-stat-num">~15min</span>
            <span className="biz-hero-stat-label">Resp. media</span>
          </div>
        </div>
      </div>
    </div>
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(p.id)}
      aria-pressed={selected}
    >
      {/* Selection indicator strip */}
      <div className="prof-card2-strip" />

      {/* Avatar */}
      <div className="prof-card2-avatar" style={{ background: pal.bg }}>
        <span style={{ color: pal.color, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22 }}>
          {p.name[0].toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="prof-card2-name">{p.name}</p>
        {p.bio && <p className="prof-card2-bio">{p.bio}</p>}
        <div className="prof-card2-avail">
          <span className="prof-card2-avail-dot" />
          Disponible hoy
        </div>
      </div>

      {/* Checkmark */}
      <div className={`prof-card2-check${selected ? ' visible' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICE CARD
   ══════════════════════════════════════════════════════════ */
function ServiceCard({ sv, selected, onSelect }) {
  return (
    <div
      className={`svc-card2${selected ? ' selected' : ''}`}
      onClick={() => onSelect(sv.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(sv.id)}
      aria-pressed={selected}
    >
      <div className="svc-card2-strip" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="svc-card2-name">{sv.name}</p>
        {sv.description && (
          <p className="svc-card2-desc">{sv.description}</p>
        )}
        <div className="svc-card2-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {sv.duration} min
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 'var(--sp-3)' }}>
        <p className="svc-card2-price">${Number(sv.price).toLocaleString('es-CO')}</p>
        <div className={`svc-card2-check${selected ? ' visible' : ''}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STICKY BOOKING CTA
   ══════════════════════════════════════════════════════════ */
function BookingBar({ service, error, onBook, ready }) {
  return (
    <div className={`booking-bar${ready ? ' booking-bar--ready' : ''}`}>
      <div className="booking-bar-inner">
        {/* Left: selection summary */}
        <div className="booking-bar-info">
          {service ? (
            <>
              <p className="booking-bar-service">{service.name}</p>
              <p className="booking-bar-meta">
                {service.duration} min
                {error && <> · <span style={{ color: 'var(--crimson-light)' }}>{error}</span></>}
              </p>
            </>
          ) : (
            <p className="booking-bar-hint">
              {error || 'Selecciona profesional y servicio'}
            </p>
          )}
        </div>

        {/* Right: price + button */}
        <div className="booking-bar-right">
          {service && (
            <p className="booking-bar-price">${Number(service.price).toLocaleString('es-CO')}</p>
          )}
          <button
            className="btn btn-primary booking-bar-btn"
            onClick={onBook}
          >
            Ver horarios
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
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

  const [business, setBusiness]       = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices]       = useState([]);
  const [selectedProf, setSelectedProf]   = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [error, setError]             = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.getBusiness(id),
      api.getBusinessProfessionals(id),
      api.getBusinessServices(id),
    ]).then(([biz, profs, svcs]) => {
      setBusiness(biz);
      setProfessionals(profs);
      setServices(svcs);
    });
  }, [id]);

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

  /* ── Loading state ── */
  if (!business) {
    return (
      <>
        <div className="biz-hero" style={{ paddingBottom: 'var(--sp-10)' }}>
          <div className="biz-hero-inner">
            <Skel w={80} h={12} r="var(--r-full)" />
            <div style={{ marginTop: 'var(--sp-4)' }}><Skel w="55%" h={36} /></div>
            <div style={{ marginTop: 'var(--sp-2)' }}><Skel w="40%" h={14} /></div>
            <div style={{ marginTop: 'var(--sp-4)' }}><Skel w="70%" h={12} /></div>
          </div>
        </div>
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-8)', marginBottom: 'var(--sp-8)' }}>
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

  return (
    <>
      {/* ══ Hero ══════════════════════════════════════════════ */}
      <BizHero business={business} />

      {/* ══ Content ═══════════════════════════════════════════ */}
      <div className="page detail-page" ref={contentRef}>

        {/* ── Section label ── */}
        <div className="detail-section-label">
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
                    ? `${professionals.length} especialista${professionals.length !== 1 ? 's' : ''} disponible${professionals.length !== 1 ? 's' : ''}`
                    : 'Sin profesionales'}
                </p>
              </div>
              {selectedProf && (
                <div className="detail-col-tick">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>

            {professionals.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)' }}>Sin profesionales registrados.</p>
              </div>
            ) : (
              <div className="detail-cards-list">
                {professionals.map((p) => (
                  <ProfCard
                    key={p.id}
                    p={p}
                    selected={selectedProf === p.id}
                    onSelect={(id) => { setSelectedProf(id); setError(''); }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── RIGHT: Services ── */}
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
                    ? `${services.length} servicio${services.length !== 1 ? 's' : ''} disponible${services.length !== 1 ? 's' : ''}`
                    : 'Sin servicios'}
                </p>
              </div>
              {selectedService && (
                <div className="detail-col-tick">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>

            {services.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)' }}>Sin servicios registrados.</p>
              </div>
            ) : (
              <div className="detail-cards-list">
                {services.map((sv) => (
                  <ServiceCard
                    key={sv.id}
                    sv={sv}
                    selected={selectedService === sv.id}
                    onSelect={(id) => { setSelectedService(id); setError(''); }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Desktop inline CTA (visible when something is selected) ── */}
        {(selectedProf || selectedService) && (
          <div className="detail-inline-cta">
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', flex:1, flexWrap:'wrap' }}>
              {selectedProf && (
                <div className="detail-selection-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {professionals.find(p => p.id === selectedProf)?.name}
                </div>
              )}
              {selectedService && (
                <div className="detail-selection-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {selectedServiceData?.name} · {selectedServiceData?.duration} min
                  <span style={{ fontWeight:700, color:'var(--crimson)' }}>
                    · ${Number(selectedServiceData?.price || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              )}
            </div>

            {error && <p className="error-msg" style={{ marginBottom:0, flex:'100%', order:-1 }}>{error}</p>}

            <button
              className="btn btn-primary"
              onClick={handleBook}
              style={{ flexShrink:0, minWidth:180 }}
            >
              Ver disponibilidad
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── "nothing selected" CTA ── */}
        {!selectedProf && !selectedService && (
          <div className="detail-cta-prompt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Selecciona un profesional y un servicio para reservar</span>
            {error && <span style={{ color:'var(--crimson)', marginLeft:'var(--sp-2)' }}>— {error}</span>}
          </div>
        )}
      </div>

      {/* ══ Sticky mobile bar ═════════════════════════════════ */}
      <BookingBar
        service={selectedServiceData}
        error={error}
        onBook={handleBook}
        ready={!!(selectedProf && selectedService)}
      />
    </>
  );
}
