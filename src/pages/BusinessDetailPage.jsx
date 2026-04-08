import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [error, setError] = useState('');

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
      return;
    }
    navigate(`/book?businessId=${id}&professionalId=${selectedProf}&serviceId=${selectedService}`);
  }

  if (!business) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 'var(--sp-16)' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r-xl)', marginBottom: 'var(--sp-4)' }} />
        <div className="skeleton" style={{ height: 20, width: '60%', margin: '0 auto var(--sp-3)', borderRadius: 'var(--r-sm)' }} />
        <div className="skeleton" style={{ height: 14, width: '40%', margin: '0 auto', borderRadius: 'var(--r-sm)' }} />
      </div>
    );
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <>
      {/* ── Business hero ── */}
      <div className="biz-hero">
        <div className="biz-hero-inner">
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'rgba(255,255,255,.45)', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--sp-5)', textDecoration: 'none', transition: 'color var(--ease)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
          >
            <BackArrow /> Volver al inicio
          </Link>

          <p className="biz-hero-cat">{CAT_LABEL[business.category] || business.category}</p>
          <h1 className="biz-hero-name">{business.name}</h1>

          <p className="biz-hero-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {business.address}, {business.city}
            {business.phone && (
              <>
                <span style={{ color: 'rgba(255,255,255,.2)', margin: '0 var(--sp-2)' }}>·</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {business.phone}
              </>
            )}
          </p>

          {business.description && (
            <p className="biz-hero-desc">{business.description}</p>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="page">
        <div className="grid-2" style={{ marginBottom: 'var(--sp-8)', gap: 'var(--sp-8)' }}>
          {/* Professionals column */}
          <div>
            <p className="section-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 'var(--sp-2)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Profesionales
            </p>

            {professionals.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)' }}>Sin profesionales registrados.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {professionals.map((p) => (
                  <div
                    key={p.id}
                    className={`pro-card${selectedProf === p.id ? ' selected' : ''}`}
                    onClick={() => setSelectedProf(p.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProf(p.id)}
                    aria-pressed={selectedProf === p.id}
                  >
                    <div className="pro-avatar">{p.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: p.bio ? 2 : 0 }}>{p.name}</p>
                      {p.bio && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.bio}</p>}
                    </div>
                    {selectedProf === p.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--crimson)" stroke="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fillRule="evenodd" clipRule="evenodd"/>
                      </svg>
                    )}
                    {selectedProf !== p.id && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--border-strong)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services column */}
          <div>
            <p className="section-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 'var(--sp-2)' }}>
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Servicios
            </p>

            {services.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)' }}>Sin servicios registrados.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {services.map((sv) => (
                  <div
                    key={sv.id}
                    className={`service-card${selectedService === sv.id ? ' selected' : ''}`}
                    onClick={() => setSelectedService(sv.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedService(sv.id)}
                    aria-pressed={selectedService === sv.id}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 2 }}>{sv.name}</p>
                        {sv.description && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)', lineHeight: 1.5 }}>{sv.description}</p>
                        )}
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {sv.duration} min
                        </p>
                      </div>
                      <span className="service-price">${Number(sv.price).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA zone */}
        <div className="divider" />

        {error && <p className="error-msg" style={{ marginBottom: 'var(--sp-4)' }}>{error}</p>}

        {selectedServiceData && (
          <div style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginBottom: 2, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Selección actual</p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                {selectedServiceData.name} · {selectedServiceData.duration} min
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--crimson)' }}>
              ${Number(selectedServiceData.price).toLocaleString('es-CO')}
            </span>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          onClick={handleBook}
          style={{ minWidth: 240 }}
        >
          Ver disponibilidad
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </>
  );
}
