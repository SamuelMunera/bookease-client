import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fmtFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };

export default function BusinessAgendaPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getBusinesses().then((all) => {
      const mine = all.filter((b) => b.ownerId === user.id);
      setBusinesses(mine);
      if (mine.length === 1) setBusinessId(mine[0].id);
    });
  }, [user.id]);

  function load() {
    if (!businessId) return;
    setLoading(true);
    api.getBusinessBookings(businessId, { date }).then(setBookings).finally(() => setLoading(false));
  }
  useEffect(load, [businessId, date]);

  async function handleConfirm(id) {
    await api.confirmBooking(id);
    load();
  }

  async function handleCancel(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await api.cancelBooking(id);
    load();
  }

  const pending   = bookings.filter((b) => b.status === 'PENDING');
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');

  const stats = [
    { label: 'Total', count: bookings.length, colorClass: 'stat-card-accent', textColor: 'var(--charcoal)' },
    { label: 'Pendientes', count: pending.length, colorClass: 'stat-card-warning', textColor: 'var(--warning)' },
    { label: 'Confirmadas', count: confirmed.length, colorClass: 'stat-card-success', textColor: 'var(--success)' },
  ];

  return (
    <div className="page">
      {/* Page header */}
      <div style={{ paddingTop: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <p className="section-label">Panel de negocio</p>
        <h1 className="page-title">Agenda</h1>
        <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>
          {date ? fmtFull(date) : 'Selecciona una fecha'}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        {businesses.length > 1 && (
          <select
            className="input"
            style={{ width: 240 }}
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
          >
            <option value="">Selecciona negocio</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type="date"
            style={{ width: 200, paddingLeft: 36 }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      </div>

      {/* Stats */}
      {!loading && bookings.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
          {stats.map((s) => (
            <div key={s.label} className={`stat-card ${s.colorClass}`}>
              <p className="stat-num" style={{ color: s.textColor }}>{s.count}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="agenda-row">
              <div className="skeleton" style={{ width: 80, height: 30, borderRadius: 'var(--r-md)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <div className="skeleton" style={{ height: 16, width: '50%', borderRadius: 'var(--r-sm)' }} />
                <div className="skeleton" style={{ height: 13, width: '65%', borderRadius: 'var(--r-sm)' }} />
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
            Sin reservas para esta fecha
          </p>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            Las reservas que recibas aparecerán aquí.
          </p>
        </div>
      )}

      {/* Bookings list */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {bookings
            .slice()
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((b) => (
              <div key={b.id} className="agenda-row">
                {/* Time column */}
                <div className="agenda-time-col">
                  <div className="agenda-dot" style={{ background: b.status === 'CONFIRMED' ? 'var(--success)' : b.status === 'PENDING' ? 'var(--warning)' : 'var(--text-subtle)' }} />
                  <span className="agenda-time">{b.startTime}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: 2 }}>
                    {b.service.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {b.professional.name}
                    <span style={{ color: 'var(--border-strong)' }}>·</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {b.startTime}–{b.endTime}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Cliente: {b.client.name}
                    <span style={{ color: 'var(--border)' }}>·</span>
                    {b.client.email}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-2)', flexShrink: 0 }}>
                  <span className={`badge ${STATUS_BADGE[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    {b.status === 'PENDING' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleConfirm(b.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Confirmar
                      </button>
                    )}
                    {b.status !== 'CANCELLED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
