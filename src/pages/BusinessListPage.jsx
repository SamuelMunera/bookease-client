import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ─── constants ─────────────────────────────────────────── */
const CAT_IMG_CLASS = { BARBERSHOP: 'biz-card-img-barbershop', SPA: 'biz-card-img-spa', SALON: 'biz-card-img-salon' };

// Build list of 30-min time slots 7:00 → 21:30
const TIME_OPTIONS = [];
for (let h = 7; h <= 21; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
}

const WEEK_DAYS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getCalDays(year, month) {
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = first === 0 ? 6 : first - 1; // Mon-based grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function ClockIcon({ h = 10, m = 10, size = 15 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 1;
  const toRad = deg => (deg - 90) * Math.PI / 180;
  const hrDeg = ((h % 12) / 12) * 360 + (m / 60) * 30;
  const mnDeg = (m / 60) * 360;
  const hrLen = r * 0.52, mnLen = r * 0.72;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="1.2" />
      {/* Hour marks at 12, 3, 6, 9 */}
      {[0, 90, 180, 270].map(deg => {
        const a = toRad(deg); const inner = r * 0.82;
        return <line key={deg}
          x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
          x2={cx + r * Math.cos(a)}     y2={cy + r * Math.sin(a)}
          stroke="currentColor" strokeWidth="1.1" />;
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy}
        x2={cx + hrLen * Math.cos(toRad(hrDeg))}
        y2={cy + hrLen * Math.sin(toRad(hrDeg))}
        stroke="currentColor" strokeWidth="1.6" />
      {/* Minute hand */}
      <line x1={cx} y1={cy}
        x2={cx + mnLen * Math.cos(toRad(mnDeg))}
        y2={cy + mnLen * Math.sin(toRad(mnDeg))}
        stroke="currentColor" strokeWidth="1.1" />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="0.9" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ─── category showcase data ────────────────────────────── */
// Maps known slugs to their CSS background class; falls back to generic gradient
const CAT_IMG_MAP = {
  BARBERSHOP: 'biz-card-img-barbershop',
  SPA:        'biz-card-img-spa',
  SALON:      'biz-card-img-salon',
};
function getCatImgClass(slug) {
  return CAT_IMG_MAP[slug] || 'biz-card-img-generic';
}

/* ─── hooks ─────────────────────────────────────────────── */
function useAnimatedCounter(target, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let raf;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ─── sub-components ────────────────────────────────────── */
function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="stars">
      {'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}
    </span>
  );
}

function FeaturedCard({ b, badge, onClick }) {
  return (
    <div className="feat-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      <div className={`feat-card-img ${b.logoUrl ? '' : (CAT_IMG_CLASS[b.category] || 'biz-card-img-barbershop')}`}
        style={b.logoUrl ? { background: 'var(--surface-2)', overflow: 'hidden', padding: 0 } : {}}>
        {b.logoUrl
          ? <img src={b.logoUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <>
              <span className="biz-card-img-letter">{b.name[0]}</span>
              <span className="biz-card-img-label">{(categories.find(c => c.slug === b.category)?.name) || b.category}</span>
            </>
        }
        {badge}
        {/* hover reveal */}
        <div className="card-reveal">
          <p className="card-reveal-title">{b.name}</p>
          <div className="card-reveal-tags">
            {b.tags?.map(t => <span key={t} className="card-reveal-tag">{t}</span>)}
          </div>
          <span className="card-reveal-cta">
            Reservar ahora
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
      <div className="feat-card-body">
        <h3 className="feat-card-name">{b.name}</h3>
        <p className="feat-card-addr">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {b.city}
        </p>
        <div className="feat-card-foot">
          <div className="rating-row">
            <Stars rating={b.rating} />
            <span className="rating-num">{b.rating}</span>
            <span className="rating-count">({b.reviewCount})</span>
          </div>
          <div className="biz-card-cta">
            Reservar
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalSection({ title, eyebrow, items, badge, onCardClick, seeAllLabel = 'Ver todos' }) {
  const trackRef = useRef(null);
  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <div className="section-block">
      <div className="section-inner">
        <div className="section-head">
          <div>
            {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
            <h2 className="section-title" dangerouslySetInnerHTML={{ __html: title }} />
          </div>
          <a href="#businesses" className="section-link">
            {seeAllLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="scroll-outer">
        <div className="scroll-track" ref={trackRef}>
          {items.map((b) => (
            <FeaturedCard key={b.id} b={b} badge={badge(b)} onClick={() => onCardClick(b)} />
          ))}
        </div>
      </div>
      <div className="scroll-nav">
        <button className="scroll-arrow" onClick={() => scroll(-1)} aria-label="Anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <button className="scroll-arrow" onClick={() => scroll(1)} aria-label="Siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── particles config ──────────────────────────────────── */
const PARTICLES = [
  { w:6,  h:6,  top:'20%', left:'8%',  delay:'0s',   dur:'7s',   driftDur:'5s'  },
  { w:4,  h:4,  top:'55%', left:'15%', delay:'1.2s', dur:'9s',   driftDur:'7s'  },
  { w:8,  h:8,  top:'35%', left:'88%', delay:'0.5s', dur:'8s',   driftDur:'6s'  },
  { w:5,  h:5,  top:'70%', left:'80%', delay:'2s',   dur:'11s',  driftDur:'8s'  },
  { w:3,  h:3,  top:'15%', left:'72%', delay:'3s',   dur:'6s',   driftDur:'4s'  },
  { w:7,  h:7,  top:'80%', left:'45%', delay:'1.8s', dur:'10s',  driftDur:'9s'  },
  { w:4,  h:4,  top:'45%', left:'55%', delay:'0.8s', dur:'8.5s', driftDur:'6.5s'},
  { w:6,  h:6,  top:'25%', left:'33%', delay:'4s',   dur:'12s',  driftDur:'10s' },
];

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Reserva en segundos',
    sub: 'Sin llamadas ni esperas',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Disponibilidad en tiempo real',
    sub: 'Siempre actualizada, sin sorpresas',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: 'Cancelación sin fricción',
    sub: 'Flexible y sin penalizaciones',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        <path d="M16 3.5c1.5.8 2.5 2.3 2.5 4s-1 3.2-2.5 4"/>
      </svg>
    ),
    title: 'Elige tu profesional',
    sub: 'El especialista que prefieras',
  },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function BusinessListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses]   = useState([]);
  const [category, setCategory]       = useState('');
  const [heroCategory, setHeroCategory] = useState('');
  const [heroTime, setHeroTime]       = useState('');
  const [ampm, setAmpm]               = useState('AM');
  const [heroDate, setHeroDate]       = useState('');
  const [searchTime, setSearchTime]   = useState('');
  const [catOpen, setCatOpen]         = useState(false);
  const [dateOpen, setDateOpen]       = useState(false);
  const [timeOpen, setTimeOpen]       = useState(false);
  const today = new Date();
  const [calView, setCalView]         = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [dropPos, setDropPos]         = useState({});
  const catRef                        = useRef(null);
  const dateRef                       = useRef(null);
  const timeRef                       = useRef(null);

  function closeAll() { setCatOpen(false); setDateOpen(false); }

  function openAt(key, ref, setter, closeSelf) {
    closeAll();
    if (closeSelf) return; // toggle off
    const rect = ref.current?.getBoundingClientRect();
    setDropPos(p => ({ ...p, [key]: rect ? { top: rect.bottom + 8, left: rect.left } : { top: 200, left: 100 } }));
    setter(true);
  }
  const [categories, setCategories]   = useState([]);
  const [city, setCity]               = useState('');
  const [cityInput, setCityInput]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState(false);

  // animated counters
  const c1 = useAnimatedCounter(2500);
  const c2 = useAnimatedCounter(28);
  const c3 = useAnimatedCounter(100);
  const c4 = useAnimatedCounter(49);

  const HERO_STATS = [
    { num: `${c1.toLocaleString()}+`, label: 'Negocios' },
    { num: c2,                         label: 'Ciudades' },
    { num: `${c3}K+`,                  label: 'Reservas' },
  ];

  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);

  // Live category filter — applies immediately on selection like Fresha
  useEffect(() => { setCategory(heroCategory); }, [heroCategory]);

  useEffect(() => {
    setLoading(true);
    setApiError(false);
    const params = {};
    if (city)       params.city     = city;
    if (category)   params.category = category;
    if (searchTime) params.time     = searchTime;
    api.getBusinesses(params)
      .then((data) => setBusinesses(data || []))
      .catch(() => { setBusinesses([]); setApiError(true); })
      .finally(() => setLoading(false));
  }, [city, category, searchTime]);

  // Normalize text: remove diacritics + trim (frontend normalization before API call)
  function normalizeCity(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  function handleSearch(e) {
    e.preventDefault();
    setCity(normalizeCity(cityInput));
    setCategory(heroCategory);
    // Convert AM/PM to 24h for backend
    let time24 = heroTime;
    if (heroTime) {
      const [h, m] = heroTime.split(':').map(Number);
      let h24 = h;
      if (ampm === 'PM' && h !== 12) h24 = h + 12;
      if (ampm === 'AM' && h === 12) h24 = 0;
      time24 = `${String(h24).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    }
    setSearchTime(time24);
    scrollToGrid();
  }

  function scrollToGrid() {
    document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' });
  }

  const handleCardClick = useCallback((b) => {
    navigate(`/businesses/${b.id}`);
  }, [navigate]);

  // trending / newest: always use the full (unfiltered-by-category) businesses list
  const trending = businesses.filter(b => b.isTrending);
  const newest   = businesses.filter(b => b.isNew);
  // Filtering is now server-side (category + time passed to API)
  const gridBusinesses = businesses;

  return (
    <>
      {/* ── Promo bar ── */}
      <div className="promo-bar">
        <span className="promo-bar-dot" />
        Nuevo en Bookease: confirmación instantánea disponible en negocios selectos
        <span className="promo-bar-dot" />
      </div>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="hero" style={{ paddingBottom: 'var(--sp-12)' }}>
        {/* Particles */}
        <div className="hero-particles">
          {PARTICLES.map((p, i) => (
            <div key={i} className="hero-p" style={{
              width: p.w, height: p.h,
              top: p.top, left: p.left,
              background: i % 3 === 0 ? 'var(--gold)' : i % 3 === 1 ? 'var(--violet)' : 'var(--teal)',
              opacity: 0.5,
              animationDuration: `${p.dur}, ${p.driftDur}`,
              animationDelay: `${p.delay}, ${p.delay}`,
            }}/>
          ))}
          {/* Glow orbs */}
          <div className="hero-orb" style={{ width: 600, height: 600, left: '50%', top: '0%' }} />
          <div className="hero-orb" style={{ width: 350, height: 350, left: '80%', top: '60%', animationDelay: '3s', background: 'radial-gradient(ellipse, rgba(124,92,252,0.1) 0%, transparent 70%)' }} />
        </div>

        <div className="hero-inner" style={{ position:'relative', zIndex:1, isolation:'isolate' }}>
          <span className="hero-eyebrow animate-up animate-up-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            La plataforma de reservas más premium
          </span>

          <h1 className="hero-title animate-up animate-up-2">
            Tu próxima cita,<br />
            <em>a un clic de distancia</em>
          </h1>

          <p className="hero-subtitle animate-up animate-up-3">
            Barberías, spas y salones de primer nivel.<br />
            Reserva con los mejores profesionales en segundos.
          </p>

          {/* ── Hero search — pill estilo Airbnb ── */}
          <form className="animate-up animate-up-3" onSubmit={handleSearch} style={{
            width: '100%', maxWidth: 820, margin: '0 auto',
            display: 'flex', alignItems: 'center',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 9999,
            boxShadow: '0 4px 32px rgba(0,0,0,0.22)',
            /* overflow:hidden removed — clips absolute dropdowns */
            position: 'relative',
          }}>

            {/* Sección 1: Categoría con dropdown */}
            <div ref={catRef} style={{ flex: '1 1 0', minWidth: 0, position: 'relative' }}>
              <button type="button" onClick={() => openAt('cat', catRef, setCatOpen, catOpen)} style={{
                width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
                padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Categoría</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: heroCategory ? 'var(--text)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span style={{ flex: 1 }}>{heroCategory ? (categories.find(c => c.slug === heroCategory)?.name ?? 'Categoría') : 'Categoría'}</span>
                  {heroCategory
                    ? <button type="button" onClick={e => { e.stopPropagation(); setHeroCategory(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0, lineHeight: 1, fontSize: 15, flexShrink: 0 }}>×</button>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: .5, transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><path d="M6 9l6 6 6-6"/></svg>
                  }
                </span>
              </button>

              {/* category dropdown rendered via portal below */}
            </div>

            <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

            {/* Sección 2: Ciudad */}
            <div style={{
              flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'flex-start', gap: 1, padding: '12px 20px',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Ubicación</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  placeholder="Ciudad o barrio"
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  style={{
                    flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
                    fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: cityInput ? 'var(--text)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            </div>

            <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

            {/* Sección 3: Fecha — custom calendar */}
            <div ref={dateRef} style={{ flex: '1 1 0', minWidth: 0, position: 'relative' }}>
              <button type="button" onClick={() => openAt('date', dateRef, setDateOpen, dateOpen)} style={{
                width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
                padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Fecha</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: heroDate ? 'var(--text)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                  <CalendarIcon size={13} />
                  {heroDate ? new Date(heroDate + 'T00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Cualquier fecha'}
                  {heroDate && <button type="button" onClick={e => { e.stopPropagation(); setHeroDate(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>}
                </span>
              </button>

              {/* calendar rendered via portal at end of component */}
            </div>

            <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

            {/* Sección 4: Hora — texto libre con validación HH:MM */}
            <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, padding: '12px 20px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Horario</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                <ClockIcon h={heroTime ? parseInt(heroTime.split(':')[0]) : 10} m={heroTime ? parseInt(heroTime.split(':')[1]) : 10} />
                <input
                  type="text"
                  placeholder="ej. 10:30"
                  value={heroTime}
                  maxLength={5}
                  onChange={e => {
                    let v = e.target.value.replace(/[^0-9:]/g, '');
                    if (v.length === 2 && !v.includes(':')) v += ':';
                    setHeroTime(v);
                  }}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (!v) return;
                    const match = v.match(/^(\d{1,2}):(\d{2})$/);
                    if (!match) { setHeroTime(''); return; }
                    const h = parseInt(match[1]), m = parseInt(match[2]);
                    if (h > 23 || m > 59) { setHeroTime(''); return; }
                    setHeroTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
                  }}
                  style={{
                    flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
                    fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: heroTime ? 'var(--text)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                {heroTime && (
                  <button type="button" onClick={() => setHeroTime('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                )}
                {/* AM / PM toggle */}
                <div style={{ display: 'flex', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                  {['AM','PM'].map(p => (
                    <button key={p} type="button" onClick={() => setAmpm(p)} style={{
                      padding: '2px 7px', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                      background: ampm === p ? 'var(--gold)' : 'transparent',
                      color: ampm === p ? '#0A0808' : 'var(--text-muted)',
                      transition: 'all .15s',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón buscar */}
            <button type="submit" style={{
              flexShrink: 0, margin: 6,
              background: 'var(--text)', color: 'var(--bg)',
              border: 'none', borderRadius: 9999,
              padding: '12px 22px', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'opacity .15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Buscar
            </button>
          </form>

          {/* Search hint */}
          <p style={{ textAlign: 'center', marginTop: 'var(--sp-3)', fontSize: 11, color: 'var(--text-subtle)', letterSpacing: '.02em' }}>
            {[heroCategory && categories.find(c => c.slug === heroCategory)?.name, cityInput, heroTime].filter(Boolean).join(' · ') || 'Barberías · Spas · Salones en tu ciudad'}
          </p>

          {/* Animated stats */}
          <div className="hero-stats animate-in animate-in-1" style={{ marginTop: 'var(--sp-8)' }}>
            {HERO_STATS.map((s, i) => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'var(--sp-6)' }}>
                {i > 0 && <div className="hero-stat-sep" />}
                <div className="hero-stat counter-reveal">
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features strip ── */}
      <div className="features-strip">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <div><p className="feature-text-title">{f.title}</p><p className="feature-text-sub">{f.sub}</p></div>
          </div>
        ))}
      </div>

      {/* ══ MÁS POPULARES ═════════════════════════════════════ */}
      {trending.length > 0 && (
        <HorizontalSection
          title="Más <em>populares</em> esta semana"
          eyebrow="Trending ahora"
          items={trending}
          badge={(b) => b.isTrending ? (
            <div className="biz-badge biz-badge-trending">
              {b.bookingsThisWeek} reservas
            </div>
          ) : null}
          onCardClick={handleCardClick}
        />
      )}

      {/* ══ CATEGORÍAS ════════════════════════════════════════ */}
      <div className="dark-section">
        <div className="section-inner">
          <div className="section-head" style={{ marginBottom:'var(--sp-6)' }}>
            <div>
              <p className="section-eyebrow">Explorar por categoría</p>
              <h2 className="section-title">¿Qué buscas <em>hoy</em>?</h2>
            </div>
          </div>
          <div className="cat-grid">
            {categories.map(cat => (
              <div key={cat.slug} className="cat-tile"
                onClick={() => { setCategory(cat.slug === category ? '' : cat.slug); setHeroCategory(cat.slug === category ? '' : cat.slug); scrollToGrid(); }}>
                <div className={`cat-tile-bg ${getCatImgClass(cat.slug)}`} />
                <div className="cat-tile-overlay" />
                <div className="cat-tile-body">
                  {cat.icon && (
                    <div className="cat-tile-icon" style={{ fontSize: 18 }}>{cat.icon}</div>
                  )}
                  <div className="cat-tile-name">{cat.name}</div>
                </div>
                <div className="cat-tile-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PROFESIONALES A DOMICILIO ═════════════════════════ */}
      {/* ── CTA Domicilios ── */}
      <div className="section-block">
        <div className="section-inner">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'var(--sp-4)', padding:'var(--sp-6) var(--sp-6)', background:'var(--gold-subtle)', border:'1px solid var(--gold-border)', borderRadius:'var(--r-2xl)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
              <div style={{ width:48, height:48, borderRadius:'var(--r-xl)', background:'rgba(212,168,83,.2)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', flexShrink:0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p style={{ margin:0, fontWeight:700, fontSize:'var(--text-base)', color:'var(--text)' }}>¿Prefieres que vengan a ti?</p>
                <p style={{ margin:'2px 0 0', fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>Explora profesionales que ofrecen servicio a domicilio.</p>
              </div>
            </div>
            <Link to="/home-service" className="btn btn-primary" style={{ background:'var(--gold)', color:'#0A0808', flexShrink:0 }}>
              Ver servicio a domicilio
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ RECIÉN LLEGADOS ═══════════════════════════════════ */}
      {newest.length > 0 && (
        <HorizontalSection
          title="Recién <em>llegados</em>"
          eyebrow="Nuevos en Bookease"
          items={newest}
          badge={(b) => b.isNew ? (
            <div className="biz-badge biz-badge-new">Nuevo</div>
          ) : null}
          onCardClick={handleCardClick}
          seeAllLabel="Ver todos"
        />
      )}

      {/* ══ GRID COMPLETO ═════════════════════════════════════ */}
      <div className="section-sep"><div className="section-sep-line"/><span className="section-sep-label">Explorar todos los negocios</span><div className="section-sep-line"/></div>

      {/* Filters */}
      <div className="filters-bar" id="businesses">
        <span className="filters-title">Categoría</span>
        <div className="chip-group">
          <button className={`chip${category === '' ? ' active' : ''}`} onClick={() => setCategory('')}>Todos</button>
          {categories.map(c => (
            <button key={c.slug} className={`chip${category === c.slug ? ' active' : ''}`} onClick={() => setCategory(c.slug)}>{c.name}</button>
          ))}
        </div>
        {city && (
          <button className="chip" style={{ display:'flex', alignItems:'center', gap:6 }} onClick={() => { setCity(''); setCityInput(''); }}>
            {city}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <div className="page">
        {/* API error banner */}
        {apiError && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-5)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-lg)', marginBottom: 'var(--sp-5)', fontSize: 'var(--text-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: 'var(--text-muted)' }}>No se pudo conectar con el servidor. Verifica que la API esté activa.</span>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid-auto">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="biz-card" style={{pointerEvents:'none'}}>
                <div className="biz-card-img skeleton" style={{background:'var(--surface-3)'}} />
                <div className="biz-card-body" style={{gap:'var(--sp-3)'}}>
                  <div className="skeleton" style={{height:13,width:'55%',borderRadius:'var(--r-sm)'}}/>
                  <div className="skeleton" style={{height:18,width:'80%',borderRadius:'var(--r-sm)'}}/>
                  <div className="skeleton" style={{height:12,width:'45%',borderRadius:'var(--r-sm)'}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && gridBusinesses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <p style={{fontSize:'var(--text-base)',fontWeight:600,color:'var(--text)',marginBottom:'var(--sp-2)'}}>
              Sin resultados
            </p>
            <p>Prueba con otra categoría o ciudad.</p>
            {(city || category) && (
              <button className="btn btn-secondary" style={{marginTop:'var(--sp-4)'}} onClick={() => { setCity(''); setCityInput(''); setCategory(''); }}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && gridBusinesses.length > 0 && (
          <>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginBottom: 'var(--sp-5)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {gridBusinesses.length} {gridBusinesses.length === 1 ? 'negocio' : 'negocios'} encontrados
            </p>
            <div className="grid-auto">
              {gridBusinesses.map(b => (
                <Link key={b.id} to={`/businesses/${b.id}`}
                  style={{textDecoration:'none',display:'flex'}}>
                  <div className="biz-card" style={{width:'100%',position:'relative'}}>
                    {/* trending / new badge on grid card */}
                    {b.isTrending && (
                      <div className="biz-badge biz-badge-trending" style={{position:'absolute',top:'var(--sp-3)',right:'var(--sp-3)',zIndex:5}}>
                        {b.bookingsThisWeek} reservas
                      </div>
                    )}
                    {b.isNew && !b.isTrending && (
                      <div className="biz-badge biz-badge-new" style={{position:'absolute',top:'var(--sp-3)',right:'var(--sp-3)',zIndex:5}}>
                        Nuevo
                      </div>
                    )}
                    <div className={`biz-card-img ${b.logoUrl ? '' : (CAT_IMG_CLASS[b.category] || 'biz-card-img-barbershop')}`}
                      style={b.logoUrl ? { background: 'var(--surface-2)', overflow: 'hidden', padding: 0 } : {}}>
                      {b.logoUrl
                        ? <img src={b.logoUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <>
                            <span className="biz-card-img-letter">{b.name[0]}</span>
                            <span className="biz-card-img-label">{(categories.find(c => c.slug === b.category)?.name) || b.category}</span>
                          </>
                      }
                    </div>
                    <div className="biz-card-body">
                      <h3 className="biz-card-name">{b.name}</h3>
                      <p className="biz-card-address">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',marginRight:4,verticalAlign:'middle'}}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {b.address}, {b.city}
                      </p>
                      {b.rating && (
                        <div className="rating-row" style={{marginBottom:'var(--sp-2)'}}>
                          <Stars rating={b.rating}/>
                          <span className="rating-num">{b.rating}</span>
                          <span className="rating-count">({b.reviewCount})</span>
                        </div>
                      )}
                      <div className="biz-card-footer">
                        <p className="biz-card-meta">
                          {b.services?.length > 0 ? `${b.services.length} servicio${b.services.length!==1?'s':''}` : ''}
                          {b.professionals?.length > 0 ? ` · ${b.professionals.length} profesional${b.professionals.length!==1?'es':''}` : ''}
                        </p>
                        <div className="biz-card-cta">
                          Reservar
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Overlay: closes any open dropdown on outside click ── */}
      {(catOpen || dateOpen) && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99997 }} onClick={closeAll} />,
        document.body
      )}

      {/* ── Portals: dropdowns rendered at body level ── */}

      {catOpen && dropPos.cat && createPortal(
        <div style={{
          position: 'fixed', top: dropPos.cat.top, left: dropPos.cat.left, zIndex: 99999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.32)',
          width: 185, overflow: 'hidden',
        }}>
          {categories.map((cat, i) => (
            <button key={cat.slug} type="button"
              onClick={() => { setHeroCategory(cat.slug); setCatOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', background: heroCategory === cat.slug ? 'rgba(212,168,83,0.1)' : 'none',
                border: 'none', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', textAlign: 'left',
                color: heroCategory === cat.slug ? 'var(--gold)' : 'var(--text)',
                fontWeight: heroCategory === cat.slug ? 600 : 400, fontSize: 13,
              }}
              onMouseEnter={e => { if (heroCategory !== cat.slug) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (heroCategory !== cat.slug) e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ flex: 1 }}>{cat.name}</span>
              {heroCategory === cat.slug && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>,
        document.body
      )}

      {dateOpen && dropPos.date && createPortal(
        <div style={{
          position: 'fixed', top: dropPos.date.top, left: dropPos.date.left, zIndex: 99999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, boxShadow: '0 8px 28px rgba(0,0,0,0.32)',
          width: 270, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button type="button" onClick={() => setCalView(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{MONTHS_ES[calView.month]} {calView.year}</span>
            <button type="button" onClick={() => setCalView(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {WEEK_DAYS.map(d => <span key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', padding: '2px 0' }}>{d}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {getCalDays(calView.year, calView.month).map((day, i) => {
              if (!day) return <span key={i} />;
              const iso = `${calView.year}-${String(calView.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const todayISO = new Date().toISOString().split('T')[0];
              const isPast = iso < todayISO;
              const isSel  = iso === heroDate;
              return (
                <button key={i} type="button" disabled={isPast}
                  onClick={() => { setHeroDate(iso); setDateOpen(false); }}
                  style={{
                    padding: '5px 0', border: 'none', borderRadius: 8,
                    cursor: isPast ? 'default' : 'pointer',
                    background: isSel ? 'var(--gold)' : 'none',
                    color: isSel ? '#0A0808' : isPast ? 'var(--text-subtle)' : 'var(--text)',
                    fontWeight: isSel ? 700 : 400, fontSize: 12, textAlign: 'center', opacity: isPast ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!isPast && !isSel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'none'; }}
                >{day}</button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {timeOpen && dropPos.time && createPortal(
        <div style={{
          position: 'fixed', top: dropPos.time.top, left: dropPos.time.left, zIndex: 99999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 8px 28px rgba(0,0,0,0.32)',
          width: 140, maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'thin',
        }}>
          {TIME_OPTIONS.map(t => (
            <button key={t} type="button"
              onClick={() => { setHeroTime(t); setTimeOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', background: heroTime === t ? 'rgba(212,168,83,0.1)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: heroTime === t ? 'var(--gold)' : 'var(--text)',
                fontWeight: heroTime === t ? 700 : 400, fontSize: 13,
              }}
              onMouseEnter={e => { if (heroTime !== t) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (heroTime !== t) e.currentTarget.style.background = 'none'; }}
            >
              <ClockIcon h={parseInt(t.split(':')[0])} m={parseInt(t.split(':')[1])} size={12} />
              {t}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
