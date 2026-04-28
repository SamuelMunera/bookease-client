import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const DAYS_ES   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function formatLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.slice(0, 10) + 'T00:00:00');
  return `${DAYS_ES[d.getDay()]}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

/* ── Mini calendar ───────────────────────────────────────── */
function MiniCalendar({ value, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = useState(() => {
    const d = new Date(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  function prevMonth() {
    setView(v => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function nextMonth() {
    setView(v => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // Build calendar grid
  const firstDay = new Date(view.year, view.month, 1);
  // Mon=0 offset
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function selectDay(day) {
    if (!day) return;
    const d = new Date(view.year, view.month, day);
    d.setHours(0, 0, 0, 0);
    if (d < today) return;
    const str = `${view.year}-${String(view.month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(str);
  }

  const monthLabel = new Date(view.year, view.month, 1)
    .toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <div className="mini-cal">
      {/* Nav */}
      <div className="mini-cal-nav">
        <button className="mini-cal-arrow" onClick={prevMonth} aria-label="Mes anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span className="mini-cal-month">{monthLabel}</span>
        <button className="mini-cal-arrow" onClick={nextMonth} aria-label="Mes siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mini-cal-grid">
        {WEEKDAYS.map(d => (
          <div key={d} className="mini-cal-wday">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const date = new Date(view.year, view.month, day);
          date.setHours(0,0,0,0);
          const isPast    = date < today;
          const isToday   = date.getTime() === today.getTime();
          const isSel     = selected && date.getTime() === selected.getTime();
          return (
            <button
              key={day}
              className={`mini-cal-day${isPast ? ' past' : ''}${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => selectDay(day)}
              disabled={isPast}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────── */
function Steps({ step }) {
  const steps = ['Negocio', 'Servicio', 'Horario', 'Confirmar'];
  return (
    <div className="booking-steps">
      {steps.map((s, i) => {
        const done   = i + 1 < step;
        const active = i + 1 === step;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div className={`booking-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
              <span className="booking-step-num">
                {done
                  ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <div className="booking-step-line" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Success screen ──────────────────────────────────────── */
function SuccessScreen({ date, time, onViewBookings, onExplore }) {
  return (
    <div className="booking-success">
      {/* Confetti ring */}
      <div className="booking-success-ring">
        <div className="booking-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <h2 className="booking-success-title">¡Reserva confirmada!</h2>
      <p className="booking-success-sub">
        Tu cita está agendada para el<br />
        <strong>{formatLabel(date)}</strong> a las <strong>{time}</strong>
      </p>
      <p className="booking-success-note">
        Recibirás un correo de confirmación en breve.
      </p>

      <div className="booking-success-actions">
        <button className="btn btn-primary" onClick={onViewBookings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Ver mis reservas
        </button>
        <button className="btn btn-secondary" onClick={onExplore}>
          Explorar más
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const professionalId = params.get('professionalId');
  const serviceId      = params.get('serviceId');

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const [date,       setDate]       = useState(today);
  const [slots,      setSlots]      = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [slotTaken,  setSlotTaken]  = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSelected(null);
    setError('');
    setSlotTaken(false);
    setLoading(true);
    api.getSlots({ professionalId, serviceId, date })
      .then(d  => {
        let slots = d.slots || [];
        const now2 = new Date();
        const localToday = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}-${String(now2.getDate()).padStart(2,'0')}`;
        if (date === localToday) {
          const now = new Date();
          const nowMins = now.getHours() * 60 + now.getMinutes();
          slots = slots.filter(s => {
            const [h, m] = s.startTime.split(':').map(Number);
            return h * 60 + m > nowMins;
          });
        }
        setSlots(slots);
      })
      .catch(e => setError(e.message))
      .finally(()  => setLoading(false));
  }, [date, professionalId, serviceId, refreshKey]);

  function refreshSlots() {
    setRefreshKey(k => k + 1);
  }

  async function handleConfirm() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    setSlotTaken(false);
    try {
      await api.createBooking({ professionalId, serviceId, date, startTime: selected.startTime });
      setSuccess(true);
    } catch (e) {
      if (e.code === 'SLOT_CONFLICT') {
        setSlotTaken(true);
        setSelected(null);
        refreshSlots();
      } else {
        setError(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="page-sm">
        <SuccessScreen
          date={date}
          time={selected?.startTime}
          onViewBookings={() => navigate('/my-bookings')}
          onExplore={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="page-sm booking-page-v2">
      {/* ── Page header ── */}
      <div className="booking-page-header">
        <p className="section-label">Paso 3 de 4</p>
        <h1 className="page-title">Elige tu horario</h1>
        <p className="page-subtitle">Selecciona fecha y hora para tu cita</p>
      </div>

      {/* ── Steps ── */}
      <Steps step={3} />

      {/* ── Body grid: calendar + slots ── */}
      <div className="booking-body">

        {/* LEFT: Calendar */}
        <div className="booking-col">
          <div className="booking-section-card">
            <div className="booking-section-head">
              <div className="booking-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="booking-section-title">Fecha</p>
                {date && (
                  <p className="booking-section-val" style={{ textTransform:'capitalize' }}>
                    {formatLabel(date)}
                  </p>
                )}
              </div>
            </div>
            <MiniCalendar value={date} onChange={setDate} />
          </div>
        </div>

        {/* RIGHT: Slots */}
        <div className="booking-col">
          <div className="booking-section-card booking-section-card--slots">
            <div className="booking-section-head">
              <div className="booking-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p className="booking-section-title">Horario disponible</p>
                {!loading && slots.length > 0 && (
                  <p className="booking-section-val">{slots.length} turno{slots.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            {/* Slot loading skeleton */}
            {loading && (
              <div className="slot-grid">
                {[...Array(8)].map((_, n) => (
                  <div key={n} className="skeleton" style={{ height:42, borderRadius:'var(--r-lg)' }} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && slots.length === 0 && !error && (
              <div className="booking-slots-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.25">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Sin horarios para esta fecha.</p>
                <span>Elige otro día en el calendario.</span>
              </div>
            )}

            {/* Slots grid */}
            {!loading && slots.length > 0 && (
              <div className="slot-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    className={`slot-btn2${selected?.startTime === slot.startTime ? ' active' : ''}`}
                    onClick={() => setSelected(slot)}
                  >
                    <span className="slot-btn2-time">{slot.startTime}</span>
                    {slot.endTime && (
                      <span className="slot-btn2-end">–{slot.endTime}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selected && (
            <div className="slot-selected-card">
              <div className="slot-selected-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <p className="slot-selected-label">Cita seleccionada</p>
                <p className="slot-selected-val">
                  {formatLabel(date)} · {selected.startTime}
                  {selected.endTime && ` – ${selected.endTime}`}
                </p>
              </div>
              <button
                className="slot-selected-clear"
                onClick={() => setSelected(null)}
                aria-label="Deseleccionar"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Slot conflict banner ── */}
      {slotTaken && (
        <div className="slot-conflict-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontWeight:600 }}>Este horario acaba de ser tomado</p>
            <p style={{ margin:'2px 0 0', fontSize:'var(--text-xs)', opacity:.85 }}>Por favor elige otro turno en los horarios actualizados.</p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="error-msg" style={{ marginBottom:'var(--sp-4)' }}>{error}</p>
      )}

      {/* ── Confirm CTA ── */}
      <div className="booking-cta">
        <p className="booking-cta-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Cancelación gratuita hasta 24 h antes
        </p>
        <button
          className="btn btn-primary btn-lg"
          disabled={!selected || submitting}
          onClick={handleConfirm}
          style={{ minWidth:220 }}
        >
          {submitting ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation:'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Confirmando…
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
      </div>
    </div>
  );
}
