import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.getMyBookings().then(setBookings).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCancel(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await api.cancelBooking(id);
    load();
  }

  function fmt(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const active = bookings.filter((b) => b.status !== 'CANCELLED');
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className="page">
      <h1 className="page-title">Mis reservas</h1>
      <p className="page-subtitle">Gestiona tus próximas citas</p>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando...</p>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-3)' }}>Aún no tienes reservas</p>
          <Link to="/"><button className="btn btn-primary">Explorar negocios</button></Link>
        </div>
      )}

      {active.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)' }}>
          {active.map((b) => (
            <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', minWidth: 52, padding: 'var(--sp-2)', background: 'var(--gold-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--gold-border)' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold-dark)', lineHeight: 1 }}>{b.startTime}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-dark)', opacity: 0.7 }}>{b.endTime}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 2 }}>{b.service.name}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 2 }}>con {b.professional.name}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', textTransform: 'capitalize' }}>{fmt(b.date)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-2)' }}>
                <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancelar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelled.length > 0 && (
        <>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>Canceladas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', opacity: 0.6 }}>
            {cancelled.map((b) => (
              <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3) var(--sp-4)' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{b.service.name} · {b.professional.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', textTransform: 'capitalize' }}>{fmt(b.date)} {b.startTime}</p>
                </div>
                <span className="badge badge-cancelled">Cancelada</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
