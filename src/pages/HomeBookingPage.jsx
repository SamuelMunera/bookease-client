import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#D4A853,#A8833F)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#7C5CFC,#5B3FD9)', color: '#fff'    },
  { bg: 'linear-gradient(135deg,#00D4C8,#008F8B)', color: '#0A0808' },
  { bg: 'linear-gradient(135deg,#22C55E,#15803D)', color: '#fff'    },
];
function avatarPalette(name) {
  return AVATAR_PALETTES[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTES.length];
}

export default function HomeBookingPage() {
  const { professionalId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prof, setProf] = useState(null);
  const [homeServices, setHomeServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.getProfessional(professionalId),
      api.getProfessionalHomeServices(professionalId),
    ])
      .then(([profData, svcData]) => {
        setProf(profData);
        setHomeServices(svcData);
        if (svcData.length > 0) setSelectedService(svcData[0]);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [professionalId, user, navigate]);

  useEffect(() => {
    if (!selectedService || !selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.getHomeSlots({ professionalId, homeServiceId: selectedService.id, date: selectedDate })
      .then(d => setSlots(d.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate, professionalId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selectedService) return setError('Selecciona un servicio');
    if (!selectedSlot) return setError('Selecciona un horario');
    if (!clientAddress.trim()) return setError('Ingresa tu dirección');
    if (!clientCity.trim()) return setError('Ingresa tu ciudad');

    setSubmitting(true);
    try {
      const booking = await api.createHomeBooking({
        professionalId,
        homeServiceId: selectedService.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        clientAddress: clientAddress.trim(),
        clientCity: clientCity.trim(),
      });
      setSuccess(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 'var(--sp-16)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-subtle)' }}>Cargando…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page" style={{ maxWidth: 520, paddingTop: 'var(--sp-12)' }}>
        <div style={{
          background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)',
          borderRadius: 'var(--r-2xl)', padding: 'var(--sp-8)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🏠</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)', color: 'var(--text)' }}>
            ¡Reserva confirmada!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-4)', fontSize: 'var(--text-sm)' }}>
            {prof?.name} llegará a tu domicilio el {formatDate(selectedDate)} a las {success.startTime}.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
            Dirección: {success.clientAddress}
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/bookings" className="btn btn-primary">Mis reservas</Link>
            <Link to={`/professionals/${professionalId}`} className="btn btn-ghost">Volver al perfil</Link>
          </div>
        </div>
      </div>
    );
  }

  const pal = avatarPalette(prof?.name);

  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(today(), i));

  return (
    <div className="page" style={{ maxWidth: 640, paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-12)' }}>
      {/* Back */}
      <Link to={`/professionals/${professionalId}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
        color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)',
        textDecoration: 'none',
      }}>
        <IconArrowLeft />
        Volver al perfil
      </Link>

      {/* Pro card */}
      {prof && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
            background: prof.avatarUrl ? 'transparent' : pal.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {prof.avatarUrl
              ? <img src={prof.avatarUrl} alt={prof.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: pal.color, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22 }}>
                  {prof.name[0].toUpperCase()}
                </span>
            }
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)' }}>{prof.name}</p>
            <span className="home-service-badge" style={{ marginTop: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Servicio a domicilio
            </span>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-6)', color: 'var(--text)' }}>
        Reservar a domicilio
      </h1>

      {homeServices.length === 0 ? (
        <div className="empty-state">
          <p>Este profesional no tiene servicios a domicilio disponibles.</p>
          <Link to={`/professionals/${professionalId}`} className="btn btn-ghost" style={{ marginTop: 'var(--sp-4)' }}>
            Volver al perfil
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

          {/* Step 1: Service */}
          <section>
            <h2 className="booking-step-title">1. Elige el servicio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {homeServices.map(svc => (
                <label key={svc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                  background: selectedService?.id === svc.id ? 'rgba(212,168,83,.10)' : 'var(--surface)',
                  border: `1px solid ${selectedService?.id === svc.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-4)', cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                }}>
                  <input
                    type="radio" name="service" value={svc.id}
                    checked={selectedService?.id === svc.id}
                    onChange={() => setSelectedService(svc)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{svc.name}</p>
                    {svc.description && (
                      <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{svc.description}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--accent)' }}>
                      ${Number(svc.price).toLocaleString('es-CO')}
                      {svc.surcharge && Number(svc.surcharge) > 0 && (
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                          {' '}+${Number(svc.surcharge).toLocaleString('es-CO')} domicilio
                        </span>
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{svc.duration} min</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Step 2: Date */}
          <section>
            <h2 className="booking-step-title">2. Elige la fecha</h2>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', overflowX: 'auto', paddingBottom: 'var(--sp-1)' }}>
              {dateOptions.map(d => {
                const [y, m, day] = d.split('-').map(Number);
                const dateObj = new Date(y, m - 1, day);
                return (
                  <button
                    key={d} type="button"
                    onClick={() => setSelectedDate(d)}
                    style={{
                      flexShrink: 0, padding: 'var(--sp-2) var(--sp-3)',
                      borderRadius: 'var(--r-lg)',
                      border: `1px solid ${selectedDate === d ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedDate === d ? 'rgba(212,168,83,.12)' : 'var(--surface)',
                      color: selectedDate === d ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer', textAlign: 'center', minWidth: 60,
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'inherit', opacity: .7 }}>
                      {DAYS[dateObj.getDay()].slice(0, 3)}
                    </p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-base)', color: 'inherit' }}>
                      {dateObj.getDate()}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Slot */}
          <section>
            <h2 className="booking-step-title">3. Elige el horario</h2>
            {loadingSlots ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando horarios…</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                {slots.map(slot => (
                  <button
                    key={slot.startTime} type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: 'var(--sp-2) var(--sp-3)',
                      borderRadius: 'var(--r-lg)',
                      border: `1px solid ${selectedSlot?.startTime === slot.startTime ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedSlot?.startTime === slot.startTime ? 'rgba(212,168,83,.12)' : 'var(--surface)',
                      color: selectedSlot?.startTime === slot.startTime ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500,
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Step 4: Address */}
          <section>
            <h2 className="booking-step-title">4. Ingresa tu dirección</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-1)', display: 'block' }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={e => setClientCity(e.target.value)}
                  placeholder="Ej: Medellín"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', padding: 'var(--sp-3)',
                    color: 'var(--text)', fontSize: 'var(--text-sm)', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-1)', display: 'block' }}>
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  placeholder="Ej: Calle 10 #43-50, Apt 301"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', padding: 'var(--sp-3)',
                    color: 'var(--text)', fontSize: 'var(--text-sm)', outline: 'none',
                  }}
                />
              </div>
            </div>
          </section>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ height: 52, fontSize: 'var(--text-base)', width: '100%' }}
          >
            {submitting ? 'Confirmando…' : 'Confirmar reserva a domicilio'}
          </button>
        </form>
      )}
    </div>
  );
}
