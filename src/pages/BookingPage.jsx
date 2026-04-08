import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const professionalId = params.get('professionalId');
  const serviceId = params.get('serviceId');

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSelected(null);
    setError('');
    setLoading(true);
    api.getSlots({ professionalId, serviceId, date })
      .then((d) => setSlots(d.slots || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, professionalId, serviceId]);

  async function handleConfirm() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      await api.createBooking({ professionalId, serviceId, date, startTime: selected.startTime });
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return (
    <div className="page-sm">
      <div style={{ textAlign: 'center', padding: 'var(--sp-16) var(--sp-4)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-5)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)' }}>¡Reserva confirmada!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
          Recibirás un email de confirmación en breve.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>Ver mis reservas</button>
      </div>
    </div>
  );

  return (
    <div className="page-sm" style={{ maxWidth: 560 }}>
      <h1 className="page-title">Elige tu horario</h1>
      <p className="page-subtitle">Selecciona la fecha y el horario que prefieres</p>

      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="date">Fecha</label>
          <input id="date" className="input" type="date" min={today} value={date}
            onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-3)', color: 'var(--text)' }}>
          Horarios disponibles
        </p>

        {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Buscando disponibilidad...</p>}

        {!loading && slots.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: 'var(--sp-4) 0' }}>
            Sin horarios disponibles para esta fecha. Prueba con otra.
          </p>
        )}

        <div className="slot-grid">
          {slots.map((slot) => (
            <button key={slot.startTime}
              className={`slot-btn${selected?.startTime === slot.startTime ? ' active' : ''}`}
              onClick={() => setSelected(slot)}>
              {slot.startTime}
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'var(--gold-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--gold-border)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-dark)', fontWeight: 500 }}>
              Seleccionado: <strong>{selected.startTime} – {selected.endTime}</strong>
            </p>
          </div>
        )}
      </div>

      {error && <p className="error-msg" style={{ marginTop: 'var(--sp-3)' }}>{error}</p>}

      <button className="btn btn-primary btn-lg btn-full" style={{ marginTop: 'var(--sp-4)' }}
        disabled={!selected || submitting} onClick={handleConfirm}>
        {submitting ? 'Confirmando...' : 'Confirmar reserva'}
      </button>
    </div>
  );
}
