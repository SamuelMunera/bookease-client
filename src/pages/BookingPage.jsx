import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS_ES[d.getDay()]}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

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

  if (success) {
    return (
      <div className="page-sm">
        <div style={{ textAlign: 'center', padding: 'var(--sp-16) var(--sp-4)' }}>
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)', color: 'var(--text)' }}>
            ¡Reserva confirmada!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-2)', lineHeight: 1.7 }}>
            Tu cita está agendada para el<br />
            <strong style={{ color: 'var(--text)' }}>{formatDateLabel(date)}</strong> a las <strong style={{ color: 'var(--text)' }}>{selected?.startTime}</strong>
          </p>
          <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-8)' }}>
            Recibirás un email de confirmación en breve.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              Ver mis reservas
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Explorar más
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-sm" style={{ maxWidth: 560 }}>
      {/* Page header */}
      <div style={{ paddingTop: 'var(--sp-8)', marginBottom: 'var(--sp-6)' }}>
        <p className="section-label">Selección de horario</p>
        <h1 className="page-title">Elige tu horario</h1>
        <p className="page-subtitle">Selecciona la fecha y el horario que prefieras</p>
      </div>

      {/* Date picker */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-lg)', background: 'var(--crimson-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--crimson)', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Fecha de la cita</p>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="date">Selecciona una fecha</label>
          <input
            id="date"
            className="input"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {date && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)', textTransform: 'capitalize' }}>
              {formatDateLabel(date)}
            </p>
          )}
        </div>
      </div>

      {/* Slots */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-lg)', background: 'var(--crimson-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--crimson)', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Horarios disponibles</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6,8].map((n) => (
              <div key={n} className="skeleton" style={{ height: 42, width: 84, borderRadius: 'var(--r-lg)' }} />
            ))}
          </div>
        )}

        {!loading && slots.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--sp-6) 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto var(--sp-3)' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Sin horarios disponibles para esta fecha.
            </p>
            <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--text-xs)', marginTop: 'var(--sp-1)' }}>
              Prueba con otra fecha.
            </p>
          </div>
        )}

        {!loading && slots.length > 0 && (
          <div className="slot-grid">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                className={`slot-btn${selected?.startTime === slot.startTime ? ' active' : ''}`}
                onClick={() => setSelected(slot)}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="slot-summary">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--crimson-dark)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p style={{ fontWeight: 700, color: 'var(--crimson-dark)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Horario seleccionado
              </p>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--crimson-dark)', fontWeight: 600 }}>
              {formatDateLabel(date)} · {selected.startTime} – {selected.endTime}
            </p>
          </div>
        )}
      </div>

      {error && <p className="error-msg" style={{ marginBottom: 'var(--sp-3)' }}>{error}</p>}

      <button
        className="btn btn-primary btn-lg btn-full"
        disabled={!selected || submitting}
        onClick={handleConfirm}
      >
        {submitting ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Confirmando...
          </>
        ) : (
          <>
            Confirmar reserva
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 'var(--sp-3)' }}>
        Puedes cancelar tu reserva hasta 24 horas antes
      </p>
    </div>
  );
}
