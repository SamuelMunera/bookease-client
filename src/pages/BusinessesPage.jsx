import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const CAT_IMG_CLASS = { BARBERSHOP: 'biz-card-img-barbershop', SPA: 'biz-card-img-spa', SALON: 'biz-card-img-salon' };

function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return <span className="stars">{'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}</span>;
}

export default function BusinessesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState(false);
  const [userLocation, setUserLocation]       = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError]     = useState('');

  const category  = searchParams.get('category')  || '';
  const city      = searchParams.get('city')       || '';
  const [cityInput, setCityInput] = useState(city);

  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    setApiError(false);
    const params = {};
    if (userLocation) { params.lat = userLocation.lat; params.lng = userLocation.lng; }
    else if (city) params.city = city;
    api.getBusinesses(params)
      .then(data => setBusinesses(data || []))
      .catch(() => { setBusinesses([]); setApiError(true); })
      .finally(() => setLoading(false));
  }, [city, userLocation]);

  function setCategory(val) {
    const p = new URLSearchParams(searchParams);
    if (val) p.set('category', val); else p.delete('category');
    setSearchParams(p);
  }

  async function handleSearch(e) {
    e.preventDefault();
    const q = cityInput.trim();
    if (!q) { setUserLocation(null); setLocationError(''); const p = new URLSearchParams(searchParams); p.delete('city'); setSearchParams(p); return; }
    setLocationLoading(true); setLocationError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { 'User-Agent': 'Bookease/1.0' } });
      const data = await res.json();
      if (data.length > 0) {
        setUserLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name?.split(',')[0] || q });
        const p = new URLSearchParams(searchParams); p.delete('city'); setSearchParams(p);
      } else {
        const p = new URLSearchParams(searchParams); p.set('city', q); setSearchParams(p);
        setUserLocation(null);
      }
    } catch {
      const p = new URLSearchParams(searchParams); p.set('city', q); setSearchParams(p);
      setUserLocation(null);
    } finally { setLocationLoading(false); }
  }

  function requestGeolocation() {
    if (!navigator.geolocation) { setLocationError('Tu navegador no soporta geolocalización'); return; }
    setLocationLoading(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'User-Agent': 'Bookease/1.0' } });
          const d = await res.json();
          label = d.address?.city || d.address?.town || d.address?.village || d.address?.suburb || d.display_name?.split(',')[0] || label;
        } catch {}
        setUserLocation({ lat, lng, label }); setCityInput('');
        const p = new URLSearchParams(searchParams); p.delete('city'); setSearchParams(p);
        setLocationLoading(false);
      },
      () => { setLocationLoading(false); setLocationError('No se pudo obtener tu ubicación.'); },
      { timeout: 10000 }
    );
  }

  function clearFilters() {
    setCityInput(''); setUserLocation(null); setLocationError(''); setSearchParams({});
  }

  const filtered = category ? businesses.filter(b => b.category === category) : businesses;

  return (
    <div className="page" style={{ paddingTop: 'var(--sp-10)' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <p className="section-label">Explorar</p>
        <h1 className="page-title">Negocios</h1>
        <p className="page-subtitle">Barberías, spas y salones de primer nivel en tu ciudad.</p>
      </div>

      {/* ── Search + filters ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>

        {/* City search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--sp-2)', maxWidth: 400 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2"
              style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="input"
              placeholder="Buscar por ciudad…"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <button
            type="button"
            title={userLocation ? 'Limpiar ubicación' : 'Usar mi ubicación'}
            onClick={userLocation ? () => { setUserLocation(null); setLocationError(''); } : requestGeolocation}
            disabled={locationLoading}
            style={{
              display:'flex', alignItems:'center', gap:5, padding:'8px 12px',
              borderRadius:'var(--r-md)', border:`1px solid ${userLocation ? 'var(--teal)' : 'var(--border)'}`,
              background: userLocation ? 'rgba(0,212,200,0.1)' : 'transparent',
              color: userLocation ? 'var(--teal)' : 'var(--text-muted)',
              fontSize:'var(--text-xs)', fontWeight:600, cursor: locationLoading ? 'wait' : 'pointer', whiteSpace:'nowrap',
            }}
          >
            {locationLoading
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            }
            <span className="loc-btn-label">{userLocation ? userLocation.label : 'Mi ubicación'}</span>
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={locationLoading}>Buscar</button>
          {(city || category || userLocation) && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Limpiar</button>
          )}
        </form>

        {/* Category chips */}
        <div className="filters-bar" style={{ paddingTop: 0, borderTop: 'none' }}>
          <span className="filters-title">Categoría</span>
          <div className="chip-group">
            <button className={`chip${category === '' ? ' active' : ''}`} onClick={() => setCategory('')}>Todos</button>
            {categories.map(c => (
              <button
                key={c.slug}
                className={`chip${category === c.slug ? ' active' : ''}`}
                onClick={() => setCategory(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>
          {userLocation && (
            <button className="chip active" style={{ display:'flex', alignItems:'center', gap:6, borderColor:'var(--teal)', color:'var(--teal)', background:'rgba(0,212,200,0.08)' }}
              onClick={() => { setUserLocation(null); setCityInput(''); }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Cerca de {userLocation.label}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          {city && !userLocation && (
            <span className="chip" style={{ display:'flex', alignItems:'center', gap:6, cursor:'default' }}>
              {city}
              <button style={{ background:'none', border:'none', cursor:'pointer', padding:0, lineHeight:1, color:'inherit' }}
                onClick={() => { setCityInput(''); const p = new URLSearchParams(searchParams); p.delete('city'); setSearchParams(p); }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
          {locationError && <p style={{ fontSize:'var(--text-xs)', color:'var(--error)', marginTop:'var(--sp-1)' }}>{locationError}</p>}
        </div>
      </div>

      {/* ── Error ── */}
      {apiError && !loading && (
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', padding:'var(--sp-3) var(--sp-5)', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--r-lg)', marginBottom:'var(--sp-5)', fontSize:'var(--text-sm)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" style={{ flexShrink:0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ color:'var(--text-muted)' }}>No se pudo conectar con el servidor.</span>
        </div>
      )}

      {/* ── Count ── */}
      {!loading && filtered.length > 0 && (
        <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', marginBottom:'var(--sp-5)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>
          {filtered.length} {filtered.length === 1 ? 'negocio' : 'negocios'} encontrados
        </p>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div className="grid-auto">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="biz-card" style={{ pointerEvents:'none' }}>
              <div className="biz-card-img skeleton" style={{ background:'var(--surface-3)' }} />
              <div className="biz-card-body" style={{ gap:'var(--sp-3)' }}>
                <div className="skeleton" style={{ height:13, width:'55%', borderRadius:'var(--r-sm)' }}/>
                <div className="skeleton" style={{ height:18, width:'80%', borderRadius:'var(--r-sm)' }}/>
                <div className="skeleton" style={{ height:12, width:'45%', borderRadius:'var(--r-sm)' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>Sin resultados</p>
          <p>Prueba con otra categoría o ciudad.</p>
          {(city || category) && (
            <button className="btn btn-secondary" style={{ marginTop:'var(--sp-4)' }} onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid-auto">
          {filtered.map(b => (
            <Link key={b.id} to={`/businesses/${b.id}`} style={{ textDecoration:'none', display:'flex' }}>
              <div className="biz-card" style={{ width:'100%', position:'relative' }}>
                {b.isTrending && (
                  <div className="biz-badge biz-badge-trending" style={{ position:'absolute', top:'var(--sp-3)', right:'var(--sp-3)', zIndex:5 }}>
                    {b.bookingsThisWeek} reservas
                  </div>
                )}
                {b.isNew && !b.isTrending && (
                  <div className="biz-badge biz-badge-new" style={{ position:'absolute', top:'var(--sp-3)', right:'var(--sp-3)', zIndex:5 }}>
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
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline', marginRight:4, verticalAlign:'middle' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {b.address}, {b.city}
                    {b.distance != null && (
                      <span style={{ marginLeft:6, padding:'1px 7px', borderRadius:'var(--r-full)', background:'rgba(0,212,200,0.1)', border:'1px solid rgba(0,212,200,0.25)', color:'var(--teal)', fontSize:'var(--text-xs)', fontWeight:600, verticalAlign:'middle' }}>
                        {b.distance < 1 ? `${Math.round(b.distance * 1000)} m` : `${b.distance} km`}
                      </span>
                    )}
                  </p>
                  {b.rating && (
                    <div className="rating-row" style={{ marginBottom:'var(--sp-2)' }}>
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
      )}
    </div>
  );
}
