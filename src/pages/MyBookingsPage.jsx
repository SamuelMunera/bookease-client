import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };

const DAYS_ES   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Prisma serializes @db.Date as "2026-04-14T00:00:00.000Z"; slice to "YYYY-MM-DD"
function toDateOnly(s) { return s ? s.slice(0, 10) : ''; }

function fmtLong(dateStr) {
  return new Date(toDateOnly(dateStr) + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
function isUpcoming(dateStr) {
  const d = new Date(toDateOnly(dateStr) + 'T00:00:00');
  const t = new Date(); t.setHours(0,0,0,0);
  return d >= t;
}

function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

/* ── Calendar date badge ─────────────────────────────────── */
function DateBadge({ dateStr, status }) {
  const d = new Date(toDateOnly(dateStr) + 'T00:00:00');
  const isCancelled = status === 'CANCELLED';
  return (
    <div className={`my-date-badge${isCancelled ? ' cancelled' : ''}`}>
      <span className="my-date-badge-day">{d.getDate()}</span>
      <span className="my-date-badge-month">{MONTHS_ES[d.getMonth()]}</span>
      <span className="my-date-badge-weekday">{DAYS_ES[d.getDay()]}</span>
    </div>
  );
}

/* ── Status icon ─────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'CONFIRMED') return (
    <div className="status-icon status-icon--confirmed">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  );
  if (status === 'PENDING') return (
    <div className="status-icon status-icon--pending">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
  );
  return (
    <div className="status-icon status-icon--cancelled">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  );
}

/* ── Reschedule panel ────────────────────────────────────── */
function ReschedulePanel({ booking, onDone, onClose }) {
  const [date,      setDate]      = useState('');
  const [slots,     setSlots]     = useState([]);
  const [slotLoad,  setSlotLoad]  = useState(false);
  const [startTime, setStartTime] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!date) { setSlots([]); setStartTime(''); return; }
    setSlotLoad(true);
    setStartTime('');
    setError('');
    api.getSlots({ professionalId: booking.professional.id, serviceId: booking.service.id, date })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotLoad(false));
  }, [date]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date || !startTime) return;
    setSaving(true);
    setError('');
    try {
      await api.rescheduleBooking(booking.id, { date, startTime });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      marginTop: 'var(--sp-3)',
      padding: 'var(--sp-4)',
      background: 'var(--surface-3)',
      borderRadius: 'var(--r-lg)',
      border: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--sp-3)' }}>
        Aplazar cita
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {/* Date */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Nueva fecha
          </label>
          <input
            type="date"
            className="input"
            value={date}
            min={todayISO()}
            onChange={e => setDate(e.target.value)}
            required
            style={{ maxWidth: 200 }}
          />
        </div>

        {/* Slots */}
        {date && (
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Horario disponible
            </label>
            {slotLoad ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)' }}>Cargando horarios…</p>
            ) : slots.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)' }}>Sin disponibilidad ese día.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                {slots.map(s => (
                  <button
                    key={s.startTime}
                    type="button"
                    onClick={() => setStartTime(s.startTime)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--r-md)',
                      border: `1px solid ${startTime === s.startTime ? 'var(--accent)' : 'var(--border)'}`,
                      background: startTime === s.startTime ? 'var(--accent)' : 'var(--surface-2)',
                      color: startTime === s.startTime ? '#fff' : 'var(--text)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                      fontWeight: startTime === s.startTime ? 600 : 400,
                    }}
                  >
                    {s.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!date || !startTime || saving}
          >
            {saving ? 'Guardando…' : 'Confirmar cambio'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Booking card ────────────────────────────────────────── */
function BookingCard({ b, onCancel, onRescheduled }) {
  const upcoming = isUpcoming(b.date);
  const [showReschedule, setShowReschedule] = useState(false);

  return (
    <div className={`my-booking-card${b.status === 'CANCELLED' ? ' cancelled' : ''}${!upcoming && b.status !== 'CANCELLED' ? ' past' : ''}`}
         style={{ flexDirection: 'column', alignItems: 'stretch' }}>

      {/* Main row */}
      <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
        {/* Left: date badge */}
        <DateBadge dateStr={b.date} status={b.status} />

        {/* Center: info */}
        <div className="my-booking-info">
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', marginBottom:4 }}>
            <p className="my-booking-service">{b.service.name}</p>
            <StatusIcon status={b.status} />
          </div>

          <p className="my-booking-pro">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {b.professional.name}
          </p>

          <p className="my-booking-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ textTransform:'capitalize' }}>{fmtLong(b.date)}</span>
            {' · '}{b.startTime}{b.endTime ? `–${b.endTime}` : ''}
          </p>
        </div>

        {/* Right: badge + actions */}
        <div className="my-booking-actions">
          <span className={`badge ${STATUS_BADGE[b.status]}`}>
            {STATUS_LABEL[b.status]}
          </span>
          {b.status !== 'CANCELLED' && upcoming && (
            <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowReschedule(v => !v)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Aplazar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onCancel(b.id)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule panel */}
      {showReschedule && (
        <ReschedulePanel
          booking={b}
          onDone={() => { setShowReschedule(false); onRescheduled(); }}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="my-bookings-empty">
      <div className="my-bookings-empty-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <p className="my-bookings-empty-title">Sin reservas aún</p>
      <p className="my-bookings-empty-sub">
        Encuentra tu barbería, spa o salón favorito y agenda en segundos.
      </p>
      <Link to="/">
        <button className="btn btn-primary" style={{ marginTop:'var(--sp-2)' }}>
          Explorar negocios
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');

  function load() {
    setLoading(true);
    api.getMyBookings().then(setBookings).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCancel(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await api.cancelBooking(id);
    load();
  }

  const upcoming   = bookings.filter(b => b.status !== 'CANCELLED' && isUpcoming(b.date));
  const past       = bookings.filter(b => b.status !== 'CANCELLED' && !isUpcoming(b.date));
  const cancelled  = bookings.filter(b => b.status === 'CANCELLED');

  const tabs = [
    { key: 'upcoming',  label: 'Próximas',   count: upcoming.length },
    { key: 'past',      label: 'Pasadas',     count: past.length },
    { key: 'cancelled', label: 'Canceladas',  count: cancelled.length },
  ];

  const visible = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="my-bookings-header">
        <div>
          <p className="section-label">Mi cuenta</p>
          <h1 className="page-title">Mis reservas</h1>
          <p className="page-subtitle">Gestiona tus citas y próximas visitas</p>
        </div>
        {!loading && upcoming.length > 0 && (
          <div className="my-bookings-next-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {upcoming.length} próxima{upcoming.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)', marginTop:'var(--sp-6)' }}>
          {[1,2,3].map(n => (
            <div key={n} className="my-booking-card" style={{ pointerEvents:'none' }}>
              <div className="skeleton" style={{ width:64, height:80, borderRadius:'var(--r-xl)', flexShrink:0 }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                <div className="skeleton" style={{ height:16, width:'50%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:12, width:'35%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:12, width:'60%', borderRadius:'var(--r-sm)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && bookings.length === 0 && <EmptyState />}

      {/* ── Tabs + list ── */}
      {!loading && bookings.length > 0 && (
        <>
          {/* Tab bar */}
          <div className="my-bookings-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`my-bookings-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`my-bookings-tab-badge${tab === t.key ? ' active' : ''}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Booking list */}
          {visible.length === 0 ? (
            <div className="my-bookings-tab-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>Sin reservas en esta categoría</p>
            </div>
          ) : (
            <div className="my-bookings-list">
              {visible.map(b => (
                <BookingCard
                  key={b.id}
                  b={b}
                  onCancel={handleCancel}
                  onRescheduled={load}
                />
              ))}
            </div>
          )}

          {/* CTA if no upcoming */}
          {tab === 'upcoming' && upcoming.length === 0 && bookings.length > 0 && (
            <div style={{ marginTop:'var(--sp-6)', textAlign:'center' }}>
              <Link to="/">
                <button className="btn btn-primary">
                  Reservar de nuevo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
