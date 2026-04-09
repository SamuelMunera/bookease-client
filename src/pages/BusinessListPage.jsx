import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'BARBERSHOP', label: 'Barberías' },
  { value: 'SPA', label: 'Spa' },
  { value: 'SALON', label: 'Salones' },
];

const CAT_LABEL     = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };
const CAT_IMG_CLASS = { BARBERSHOP: 'biz-card-img-barbershop', SPA: 'biz-card-img-spa', SALON: 'biz-card-img-salon' };

/* ── Mock data — visible mientras no haya DB conectada ── */
const MOCK_BUSINESSES = [
  {
    id: 'mock-1',
    name: 'The Noble Blade',
    category: 'BARBERSHOP',
    address: 'Calle 93 #11-45',
    city: 'Bogotá',
    phone: '+57 310 000 0001',
    description: 'Barbería de lujo especializada en cortes clásicos y afeitado con navaja.',
    services:      [1, 2, 3, 4],
    professionals: [1, 2],
  },
  {
    id: 'mock-2',
    name: 'Serenity Spa & Wellness',
    category: 'SPA',
    address: 'Av. El Dorado #68-95, Piso 3',
    city: 'Bogotá',
    phone: '+57 310 000 0002',
    description: 'Experiencias de bienestar premium: masajes terapéuticos, faciales y ritual de aguas.',
    services:      [1, 2, 3, 4, 5],
    professionals: [1, 2, 3],
  },
  {
    id: 'mock-3',
    name: 'Atelier Studio',
    category: 'SALON',
    address: 'Carrera 15 #82-10',
    city: 'Bogotá',
    phone: '+57 310 000 0003',
    description: 'Salón de alta peluquería con especialistas en color, keratina y tratamientos capilares.',
    services:      [1, 2, 3],
    professionals: [1, 2],
  },
  {
    id: 'mock-4',
    name: 'Barber Society',
    category: 'BARBERSHOP',
    address: 'Carrera 7 #116-50',
    city: 'Bogotá',
    phone: '+57 310 000 0004',
    description: 'El club donde el estilo se define. Ambiente exclusivo, maestros barberos.',
    services:      [1, 2, 3, 4, 5, 6],
    professionals: [1, 2, 3],
  },
  {
    id: 'mock-5',
    name: 'Zen Garden Spa',
    category: 'SPA',
    address: 'Calle 100 #19-61',
    city: 'Medellín',
    phone: '+57 310 000 0005',
    description: 'Retiro urbano de bienestar con inspiración oriental. Masajes, aromaterapia y meditación.',
    services:      [1, 2, 3, 4],
    professionals: [1, 2],
  },
  {
    id: 'mock-6',
    name: 'Lumière Beauty Lounge',
    category: 'SALON',
    address: 'Calle 10 #43-11',
    city: 'Medellín',
    phone: '+57 310 000 0006',
    description: 'Belleza con tecnología europea. Especialistas en mechas, balayage y cuidado del cabello.',
    services:      [1, 2, 3, 4],
    professionals: [1, 2, 3, 4],
  },
];

const FEATURES = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    title: 'Reserva en segundos',
    sub: 'Sin llamadas ni esperas',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Horarios en tiempo real',
    sub: 'Disponibilidad siempre actualizada',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Cancelación fácil',
    sub: 'Gestiona tus citas sin fricción',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    title: 'Elige tu profesional',
    sub: 'El especialista que prefieras',
  },
];

const HERO_STATS = [
  { num: '2,500+', label: 'Negocios' },
  { num: '28', label: 'Ciudades' },
  { num: '100K+', label: 'Reservas' },
  { num: '4.9★', label: 'Valoración' },
];

export default function BusinessListPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses]   = useState([]);
  const [category, setCategory]       = useState('');
  const [city, setCity]               = useState('');
  const [cityInput, setCityInput]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [isMockMode, setIsMockMode]   = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (city)     params.city     = city;
    api.getBusinesses(params)
      .then((data) => {
        if (data && data.length > 0) {
          setBusinesses(data);
          setIsMockMode(false);
        } else {
          setBusinesses(applyMockFilters(params));
          setIsMockMode(true);
        }
      })
      .catch(() => {
        setBusinesses(applyMockFilters(params));
        setIsMockMode(true);
      })
      .finally(() => setLoading(false));
  }, [category, city]);

  function applyMockFilters({ category: cat, city: c } = {}) {
    return MOCK_BUSINESSES.filter((b) => {
      if (cat && b.category !== cat) return false;
      if (c   && !b.city.toLowerCase().includes(c.toLowerCase())) return false;
      return true;
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    setCity(cityInput.trim());
  }

  return (
    <>
      {/* ── Promo bar ── */}
      <div className="promo-bar">
        <span className="promo-bar-dot" />
        Nuevo en Bookease: confirmación instantánea en negocios seleccionados
        <span className="promo-bar-dot" />
      </div>

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-inner">

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
            Barberías, spas y salones de belleza de primer nivel.<br />
            Reserva con los mejores profesionales, en segundos.
          </p>

          {/* Search bar */}
          <form
            className="search-bar animate-up animate-up-3"
            style={{ maxWidth: 480 }}
            onSubmit={handleSearch}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Busca por ciudad..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit" style={{ flexShrink: 0 }}>
              Buscar
            </button>
          </form>

          {/* Hero CTAs */}
          <div className="hero-actions animate-up animate-up-4">
            {!user && (
              <Link to="/register">
                <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>
                  Crear cuenta gratis
                </button>
              </Link>
            )}
            <a
              href="#businesses"
              style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'color var(--ease)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
            >
              Explorar negocios
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </a>
          </div>

          {/* Hero stats */}
          <div className="hero-stats animate-in animate-in-1">
            {HERO_STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
                {i > 0 && <div className="hero-stat-sep" />}
                <div className="hero-stat">
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
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <div>
              <p className="feature-text-title">{f.title}</p>
              <p className="feature-text-sub">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters bar ── */}
      <div className="filters-bar" id="businesses">
        <span className="filters-title">Categoría</span>
        <div className="chip-group">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`chip${category === c.value ? ' active' : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {city && (
          <button
            className="chip"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setCity(''); setCityInput(''); }}
          >
            {city}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Business grid ── */}
      <div className="page">

        {/* Skeleton */}
        {loading && (
          <div className="grid-auto">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="biz-card" style={{ pointerEvents: 'none' }}>
                <div className="biz-card-img skeleton" style={{ background: 'var(--surface-3)' }} />
                <div className="biz-card-body" style={{ gap: 'var(--sp-3)' }}>
                  <div className="skeleton" style={{ height: 13, width: '55%', borderRadius: 'var(--r-sm)' }} />
                  <div className="skeleton" style={{ height: 18, width: '80%', borderRadius: 'var(--r-sm)' }} />
                  <div className="skeleton" style={{ height: 12, width: '45%', borderRadius: 'var(--r-sm)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && businesses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--sp-2)' }}>
              Sin resultados
            </p>
            <p>Prueba con otra categoría o ciudad.</p>
            {city && (
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'var(--sp-4)' }}
                onClick={() => { setCity(''); setCityInput(''); }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && businesses.length > 0 && (
          <>
            {/* Mock mode banner */}
            {isMockMode && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: 'var(--sp-3) var(--sp-4)',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--r-lg)',
                marginBottom: 'var(--sp-5)',
                fontSize: 'var(--text-sm)',
                color: 'var(--warning)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>
                  <strong>Modo preview</strong> — mostrando datos de ejemplo. Conecta la base de datos para ver negocios reales.
                </span>
              </div>
            )}

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginBottom: 'var(--sp-5)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {businesses.length} {businesses.length === 1 ? 'negocio' : 'negocios'} {isMockMode ? 'de ejemplo' : 'encontrados'}
            </p>
            <div className="grid-auto">
              {businesses.map((b) => (
                <Link key={b.id} to={isMockMode ? '#' : `/businesses/${b.id}`} style={{ textDecoration: 'none', display: 'flex' }}
                  onClick={isMockMode ? (e) => e.preventDefault() : undefined}>
                  <div className="biz-card" style={{ width: '100%' }}>
                    <div className={`biz-card-img ${CAT_IMG_CLASS[b.category] || 'biz-card-img-barbershop'}`}>
                      <span className="biz-card-img-letter">{b.name[0]}</span>
                      <span className="biz-card-img-label">{CAT_LABEL[b.category] || b.category}</span>
                    </div>
                    <div className="biz-card-body">
                      <h3 className="biz-card-name">{b.name}</h3>
                      <p className="biz-card-address">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {b.address}, {b.city}
                      </p>
                      <div className="biz-card-footer">
                        <p className="biz-card-meta">
                          {b.services?.length > 0
                            ? `${b.services.length} servicio${b.services.length !== 1 ? 's' : ''}`
                            : ''}
                          {b.professionals?.length > 0
                            ? ` · ${b.professionals.length} profesional${b.professionals.length !== 1 ? 'es' : ''}`
                            : ''}
                        </p>
                        <div className="biz-card-arrow">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </>
  );
}
