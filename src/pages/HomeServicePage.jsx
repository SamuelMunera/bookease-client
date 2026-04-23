import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const SPECIALTIES = [
  'Barbería','Peluquería','Colorimetría','Estética facial',
  'Estética corporal','Masajes','Manicura & Pedicura','Maquillaje',
  'Depilación','Nutrición','Fisioterapia','Otra',
];

const PRO_PALETTES = [
  { bg:'linear-gradient(135deg,#D4A853,#A8833F)', color:'#0A0808' },
  { bg:'linear-gradient(135deg,#7C5CFC,#5B3FD9)', color:'#fff'    },
  { bg:'linear-gradient(135deg,#00D4C8,#008F8B)', color:'#0A0808' },
  { bg:'linear-gradient(135deg,#22C55E,#15803D)', color:'#fff'    },
  { bg:'linear-gradient(135deg,#EC4899,#9D174D)', color:'#fff'    },
];
function proPalette(name) { return PRO_PALETTES[(name?.charCodeAt(0) ?? 0) % PRO_PALETTES.length]; }

function ProCard({ pro }) {
  const pal = proPalette(pro.name);
  return (
    <Link to={`/professionals/${pro.id}`} className="hs-pro-card" style={{ textDecoration:'none' }}>
      <div className="hs-pro-card-avatar" style={{ background: pro.avatarUrl ? 'transparent' : pal.bg }}>
        {pro.avatarUrl
          ? <img src={pro.avatarUrl} alt={pro.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <span style={{ color: pal.color, fontFamily:'var(--font-heading)', fontWeight:700, fontSize:32 }}>{pro.name[0].toUpperCase()}</span>
        }
      </div>
      <div className="hs-pro-card-body">
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', flexWrap:'wrap', marginBottom:'var(--sp-2)' }}>
          <span className="home-service-badge" style={{ fontSize:10, padding:'2px 8px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            A domicilio
          </span>
          {pro.hasBusinessToo && (
            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:'var(--r-full)', background:'rgba(124,92,252,.1)', color:'var(--violet)', border:'1px solid rgba(124,92,252,.2)', fontWeight:600 }}>
              + Negocio
            </span>
          )}
        </div>
        <p className="hs-pro-card-name">{pro.name}</p>
        {pro.specialty && <p className="hs-pro-card-spec">{pro.specialty}</p>}
        {pro.cities?.length > 0 && (
          <p className="hs-pro-card-cities">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {pro.cities.slice(0,3).join(' · ')}
          </p>
        )}
        {pro.homeServices?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--sp-1)', marginTop:'var(--sp-2)' }}>
            {pro.homeServices.slice(0,2).map(s => (
              <span key={s.id} style={{ fontSize:10, padding:'2px 8px', borderRadius:'var(--r-full)', background:'var(--surface-3)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>
                {s.name}
              </span>
            ))}
            {pro.homeServices.length > 2 && (
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:'var(--r-full)', background:'var(--surface-3)', color:'var(--text-subtle)' }}>
                +{pro.homeServices.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="hs-pro-card-foot">
          {pro.avgRating ? (
            <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'var(--text-xs)', fontWeight:700, color:'var(--text-muted)' }}>
              <span style={{ color:'#D4A853' }}>★</span> {pro.avgRating}
              <span style={{ color:'var(--text-subtle)', fontWeight:400 }}>({pro.reviewCount})</span>
            </span>
          ) : (
            <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>Nuevo</span>
          )}
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'var(--text-xs)', fontWeight:700, color:'var(--gold)' }}>
            Ver perfil
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeServicePage() {
  const navigate = useNavigate();
  const [allPros, setAllPros]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [city, setCity]         = useState('');
  const [cityInput, setCityInput] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);

  // Debounce city input → backend query
  useEffect(() => {
    const t = setTimeout(() => setCity(cityInput.trim()), 400);
    return () => clearTimeout(t);
  }, [cityInput]);

  useEffect(() => {
    setLoading(true);
    api.getHomeProfessionals(city ? { city } : {})
      .then(d => setAllPros(d || []))
      .catch(() => setAllPros([]))
      .finally(() => setLoading(false));
  }, [city]);

  const visible = allPros
    .filter(p => !specialty || p.specialty === specialty)
    .filter(p => !minRating || (p.avgRating && p.avgRating >= minRating));

  const clearFilters = () => { setCityInput(''); setCity(''); setSpecialty(''); setMinRating(0); };
  const hasFilters = cityInput || specialty || minRating > 0;

  return (
    <div className="page" style={{ maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:'var(--sp-8)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-3)' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--r-lg)', background:'var(--gold-subtle)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <p className="section-label">Bookease</p>
            <h1 className="page-title" style={{ margin:0 }}>Servicio <em>a domicilio</em></h1>
          </div>
        </div>
        <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', maxWidth:520 }}>
          Profesionales que se desplazan hasta donde estás. Sin salir de casa, sin esperas.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="hs-filters">
        {/* City */}
        <div className="hs-filter-group">
          <label className="hs-filter-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Ciudad
          </label>
          <input
            className="input hs-filter-input"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="Medellín, Bogotá…"
          />
        </div>

        {/* Specialty */}
        <div className="hs-filter-group">
          <label className="hs-filter-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Especialidad
          </label>
          <select
            className="input hs-filter-input"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          >
            <option value="">Todas</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Rating */}
        <div className="hs-filter-group">
          <label className="hs-filter-label">
            <span style={{ color:'#D4A853' }}>★</span>
            Calificación mínima
          </label>
          <select
            className="input hs-filter-input"
            value={minRating}
            onChange={e => setMinRating(Number(e.target.value))}
          >
            <option value={0}>Cualquiera</option>
            <option value={4}>4+ estrellas</option>
            <option value={4.5}>4.5+ estrellas</option>
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} style={{ alignSelf:'flex-end', padding:'8px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:'var(--text-xs)', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'var(--sp-5)' }}>
          {visible.length} profesional{visible.length !== 1 ? 'es' : ''} encontrado{visible.length !== 1 ? 's' : ''}
          {hasFilters && ' · '}
          {hasFilters && <button onClick={clearFilters} style={{ background:'none', border:'none', color:'var(--gold)', fontSize:'var(--text-xs)', fontWeight:700, cursor:'pointer', padding:0 }}>ver todos</button>}
        </p>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="hs-grid">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="hs-pro-card" style={{ cursor:'default' }}>
              <div className="skeleton" style={{ height:160, borderRadius:'var(--r-xl) var(--r-xl) 0 0' }} />
              <div style={{ padding:'var(--sp-4)', display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                <div className="skeleton" style={{ height:14, width:'60%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:12, width:'80%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:10, width:'40%', borderRadius:'var(--r-sm)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && visible.length > 0 && (
        <div className="hs-grid">
          {visible.map(p => <ProCard key={p.id} pro={p} />)}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && visible.length === 0 && (
        <div className="empty-state" style={{ marginTop:'var(--sp-8)' }}>
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>
            {hasFilters ? 'Sin resultados para estos filtros' : 'Aún no hay profesionales a domicilio'}
          </p>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginBottom:'var(--sp-4)' }}>
            {hasFilters ? 'Prueba con otra ciudad o quita los filtros.' : 'Pronto habrá profesionales disponibles en tu área.'}
          </p>
          {hasFilters && (
            <button className="btn btn-secondary" onClick={clearFilters}>Quitar filtros</button>
          )}
        </div>
      )}
    </div>
  );
}
