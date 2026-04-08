import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa', SALON: 'Salón de belleza' };

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
    Promise.all([api.getBusiness(id), api.getBusinessProfessionals(id), api.getBusinessServices(id)])
      .then(([biz, profs, svcs]) => { setBusiness(biz); setProfessionals(profs); setServices(svcs); });
  }, [id]);

  function handleBook() {
    if (!user) return navigate('/login');
    if (!selectedProf || !selectedService) { setError('Selecciona un profesional y un servicio para continuar.'); return; }
    navigate(`/book?businessId=${id}&professionalId=${selectedProf}&serviceId=${selectedService}`);
  }

  if (!business) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 'var(--sp-16)', color: 'var(--text-muted)' }}>Cargando...</div>
  );

  return (
    <>
      {/* Header */}
      <div style={{ background: 'var(--slate)', color: '#fff', padding: 'var(--sp-10) var(--sp-6)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="category-tag" style={{ color: 'var(--gold-light)', marginBottom: 'var(--sp-2)' }}>
            {CAT_LABEL[business.category] || business.category}
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-2)' }}>
            {business.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-sm)' }}>
            {business.address}, {business.city}
            {business.phone ? ` · ${business.phone}` : ''}
          </p>
          {business.description && (
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 'var(--sp-3)', maxWidth: 600, fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              {business.description}
            </p>
          )}
        </div>
      </div>

      <div className="page">
        <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
          {/* Professionals */}
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)' }}>Profesionales</h2>
            {professionals.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Sin profesionales registrados.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {professionals.map((p) => (
                <label key={p.id} style={{ cursor: 'pointer' }}>
                  <div className={`card${selectedProf === p.id ? '' : ' card-hover'}`}
                    style={{ border: selectedProf === p.id ? '2px solid var(--gold)' : undefined, transition: 'all var(--ease)' }}
                    onClick={() => setSelectedProf(p.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-dark)', fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', flexShrink: 0 }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: p.bio ? 2 : 0 }}>{p.name}</p>
                        {p.bio && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.bio}</p>}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)' }}>Servicios</h2>
            {services.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Sin servicios registrados.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {services.map((sv) => (
                <div key={sv.id} className={`card${selectedService === sv.id ? '' : ' card-hover'}`}
                  style={{ border: selectedService === sv.id ? '2px solid var(--gold)' : undefined, cursor: 'pointer', transition: 'all var(--ease)' }}
                  onClick={() => setSelectedService(sv.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{sv.name}</p>
                      {sv.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>{sv.description}</p>}
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{sv.duration} min</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: 'var(--gold-dark)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'var(--sp-3)' }}>
                      ${Number(sv.price).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="error-msg" style={{ marginBottom: 'var(--sp-4)' }}>{error}</p>}

        <button className="btn btn-primary btn-lg" onClick={handleBook}
          style={{ minWidth: 240 }}>
          Ver disponibilidad
        </button>
      </div>
    </>
  );
}
