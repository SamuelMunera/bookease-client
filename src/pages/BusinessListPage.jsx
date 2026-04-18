import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ─── constants ─────────────────────────────────────────── */
const CAT_IMG_CLASS = { BARBERSHOP: 'biz-card-img-barbershop', SPA: 'biz-card-img-spa', SALON: 'biz-card-img-salon' };

/* ─── category showcase data ────────────────────────────── */
const CAT_TILES = [
  { value:'BARBERSHOP', name:'Barberías', count:'120+ locales', imgClass:'biz-card-img-barbershop',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  { value:'SPA',        name:'Spas',      count:'84+ centros',  imgClass:'biz-card-img-spa',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 22C6 22 2 17 2 12S6 2 12 2"/><path d="M12 22c3-4 3-8 3-10S13 6 12 2"/><path d="M12 2c3 4 3 8 3 10s-2 6-3 10"/><path d="M2 12h20"/></svg> },
  { value:'SALON',      name:'Salones',   count:'96+ estudios', imgClass:'biz-card-img-salon',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9.5 2a.5.5 0 0 1 1 0v1a.5.5 0 0 1-1 0V2z"/><path d="M14 2.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0V2.5z"/><path d="M4 11.5V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v3.5"/><path d="M2 12h20v2a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8v-2z"/></svg> },
];

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
      <div className={`feat-card-img ${CAT_IMG_CLASS[b.category] || 'biz-card-img-barbershop'}`}>
        <span className="biz-card-img-letter">{b.name[0]}</span>
        <span className="biz-card-img-label">{(categories.find(c => c.slug === b.category)?.name) || b.category}</span>
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
          <div className="biz-card-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title:'Reserva en segundos', sub:'Sin llamadas ni esperas' },
  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title:'Tiempo real', sub:'Disponibilidad siempre actualizada' },
  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:'Cancelación fácil', sub:'Sin fricción ni penalizaciones' },
  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title:'Elige tu profesional', sub:'El especialista que prefieras' },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function BusinessListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses]   = useState([]);
  // category only filters "Explorar todos los negocios"; trending/newest are always unfiltered
  const [category, setCategory]       = useState('');
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
    { num: `${(c4/10).toFixed(1)}★`,   label: 'Valoración' },
  ];

  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);

  // Fetch all businesses for city (no category filter — category is applied locally to the grid only)
  useEffect(() => {
    setLoading(true);
    setApiError(false);
    const params = {};
    if (city) params.city = city;
    api.getBusinesses(params)
      .then((data) => setBusinesses(data || []))
      .catch(() => { setBusinesses([]); setApiError(true); })
      .finally(() => setLoading(false));
  }, [city]);

  function scrollToGrid() {
    document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSearch(e) {
    e.preventDefault();
    setCity(cityInput.trim());
    scrollToGrid();
  }

  const handleCardClick = useCallback((b) => {
    navigate(`/businesses/${b.id}`);
  }, [navigate]);

  // trending / newest: always use the full (unfiltered-by-category) businesses list
  const trending = businesses.filter(b => b.isTrending);
  const newest   = businesses.filter(b => b.isNew);
  // category filter applies only to the explore-all grid
  const gridBusinesses = category ? businesses.filter(b => b.category === category) : businesses;

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

        <div className="hero-inner" style={{ position:'relative', zIndex:1 }}>
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

          {/* Search v2 */}
          <form className="search-bar-v2 animate-up animate-up-3" onSubmit={handleSearch}>
            <div className="search-bar-v2-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input type="text" placeholder="Busca por ciudad..." value={cityInput} onChange={e => setCityInput(e.target.value)} />
            <button type="submit" className="search-bar-v2-btn">Buscar</button>
          </form>

          {/* Secondary CTA */}
          {!user && (
            <div className="hero-actions animate-up animate-up-4">
              <Link to="/register">
                <button className="btn btn-secondary btn-sm">
                  Crear cuenta gratis
                </button>
              </Link>
              <a href="#businesses" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'color var(--ease)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}>
                Explorar negocios
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </a>
            </div>
          )}

          {/* Animated stats */}
          <div className="hero-stats animate-in animate-in-1">
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
            {CAT_TILES.map(cat => (
              <div key={cat.value} className="cat-tile" onClick={() => { setCategory(cat.value === category ? '' : cat.value); scrollToGrid(); }}>
                <div className={`cat-tile-bg ${cat.imgClass}`} />
                <div className="cat-tile-overlay" />
                <div className="cat-tile-body">
                  <div className="cat-tile-icon">{cat.icon}</div>
                  <div className="cat-tile-name">{cat.name}</div>
                  <div className="cat-tile-count">{cat.count}</div>
                </div>
                <div className="cat-tile-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
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
            <p style={{fontSize:'var(--text-base)',fontWeight:600,color:'var(--text)',marginBottom:'var(--sp-2)'}}>Sin resultados</p>
            <p>Prueba con otra categoría o ciudad.</p>
            {(city || category) && <button className="btn btn-secondary" style={{marginTop:'var(--sp-4)'}} onClick={() => { setCity(''); setCityInput(''); setCategory(''); }}>Limpiar filtros</button>}
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
                    <div className={`biz-card-img ${CAT_IMG_CLASS[b.category] || 'biz-card-img-barbershop'}`}>
                      <span className="biz-card-img-letter">{b.name[0]}</span>
                      <span className="biz-card-img-label">{(categories.find(c => c.slug === b.category)?.name) || b.category}</span>
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
                        <div className="biz-card-arrow">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
    </>
  );
}
