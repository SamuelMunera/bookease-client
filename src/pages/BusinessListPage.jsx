import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'BARBERSHOP', label: 'Barberías' },
  { value: 'SPA', label: 'Spa' },
  { value: 'SALON', label: 'Salones' },
];

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (city) params.city = city;
    api.getBusinesses(params).then(setBusinesses).finally(() => setLoading(false));
  }, [category, city]);

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--slate-dark)', color: '#fff', padding: 'var(--sp-12) var(--sp-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--gold-light)', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
          Reservas al instante
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, marginBottom: 'var(--sp-4)', lineHeight: 1.15 }}>
          Tu próxima cita,<br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>a un clic de distancia</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto', fontSize: 'var(--text-base)' }}>
          Barberías, spas y salones de belleza. Elige, reserva y listo.
        </p>
      </div>

      <div className="page">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="chip-group">
            {CATEGORIES.map((c) => (
              <button key={c.value} className={`chip${category === c.value ? ' active' : ''}`}
                onClick={() => setCategory(c.value)}>{c.label}</button>
            ))}
          </div>
          <input className="input" style={{ width: 180 }} placeholder="Buscar ciudad..."
            value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando negocios...</p>}

        <div className="grid-auto">
          {businesses.map((b) => (
            <Link key={b.id} to={`/businesses/${b.id}`} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ height: '100%' }}>
                {/* Color bar */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, var(--gold), var(--gold-light))', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-4)', marginTop: 'calc(-1 * var(--sp-5))', marginLeft: 'calc(-1 * var(--sp-5))', marginRight: 'calc(-1 * var(--sp-5))', borderTopLeftRadius: 'var(--r-lg)', borderTopRightRadius: 'var(--r-lg)' }} />
                <p className="category-tag" style={{ marginBottom: 'var(--sp-2)' }}>{CAT_LABEL[b.category] || b.category}</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', marginBottom: 'var(--sp-2)' }}>{b.name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                  {b.address}, {b.city}
                </p>
                {b.services?.length > 0 && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>
                    {b.services.length} servicio{b.services.length !== 1 ? 's' : ''}
                    {b.professionals?.length > 0 ? ` · ${b.professionals.length} profesional${b.professionals.length !== 1 ? 'es' : ''}` : ''}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {!loading && businesses.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-2)' }}>Sin resultados</p>
            <p>Prueba con otra categoría o ciudad.</p>
          </div>
        )}
      </div>
    </>
  );
}
