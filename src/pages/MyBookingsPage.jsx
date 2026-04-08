import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function DateBadge({ dateStr }) {
  const d = new Date(dateStr + 'T00:00:00');
  return (
    <div className="booking-time-badge">
      <p className="booking-time-badge p:first-child" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
        {d.getDate()}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,.45)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {MONTHS_ES[d.getMonth()]}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
        {DAYS_ES[d.getDay()]}
      </p>
    </div>
  );
}

function fmt(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const active = bookings.filter((b) => b.status !== 'CANCELLED');
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className="page">
      {/* Page header */}
      <div style={{ paddingTop: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
        <p className="section-label">Mi cuenta</p>
        <h1 className="page-title">Mis reservas</h1>
        <p className="page-subtitle">Gestiona tus próximas citas</p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="booking-card">
              <div className="skeleton" style={{ width: 64, height: 80, borderRadius: 'var(--r-lg)', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <div className="skeleton" style={{ height: 16, width: '55%', borderRadius: 'var(--r-sm)' }} />
                <div className="skeleton" style={{ height: 13, width: '40%', borderRadius: 'var(--r-sm)' }} />
                <div className="skeleton" style={{ height: 12, width: '35%', borderRadius: 'var(--r-sm)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--sp-2)' }}>
            Aún no tienes reservas
          </p>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-5)' }}>
            Encuentra el negocio perfecto y agenda tu primera cita.
          </p>
          <Link to="/">
            <button className="btn btn-primary">
              Explorar negocios
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </Link>
        </div>
      )}

      {/* Active bookings */}
      {active.length > 0 && (
        <>
          <p className="section-label" style={{ marginBottom: 'var(--sp-4)' }}>
            Próximas · {active.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)' }}>
            {active.map((b) => (
              <div key={b.id} className="booking-card">
                <DateBadge dateStr={b.date} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: 2 }}>
                    {b.service.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    con {b.professional.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', textTransform: 'capitalize' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {fmt(b.date)} · {b.startTime}–{b.endTime}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-2)', flexShrink: 0 }}>
                  <span className={`badge ${STATUS_BADGE[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cancelled bookings */}
      {cancelled.length > 0 && (
        <>
          <div className="divider" style={{ marginBottom: 'var(--sp-5)' }} />
          <p className="section-label" style={{ marginBottom: 'var(--sp-3)' }}>
            Canceladas · {cancelled.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', opacity: 0.55 }}>
            {cancelled.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3) var(--sp-4)', gap: 'var(--sp-4)', flexWrap: 'wrap' }}
              >
                <div>
                  <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                    {b.service.name} · {b.professional.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', textTransform: 'capitalize', marginTop: 2 }}>
                    {fmt(b.date)} {b.startTime}
                  </p>
                </div>
                <span className="badge badge-cancelled">{STATUS_LABEL.CANCELLED}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
