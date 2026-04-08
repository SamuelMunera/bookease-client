import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

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

  async function handleConfirm(id) { await api.confirmBooking(id); load(); }
  async function handleCancel(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await api.cancelBooking(id); load();
  }

  const pending = bookings.filter((b) => b.status === 'PENDING');
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="page">
      <h1 className="page-title">Agenda del negocio</h1>
      <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>{date ? fmt(date) : ''}</p>

      <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        {businesses.length > 1 && (
          <select className="input" style={{ width: 220 }} value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            <option value="">Selecciona negocio</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <input className="input" type="date" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando agenda...</p>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          <p>Sin reservas para esta fecha.</p>
        </div>
      )}

      {/* Stats row */}
      {!loading && bookings.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
          {[
            { label: 'Total', count: bookings.length, color: 'var(--slate)' },
            { label: 'Pendientes', count: pending.length, color: 'var(--warning)' },
            { label: 'Confirmadas', count: confirmed.length, color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: s.color }}>{s.count}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {bookings.map((b) => (
          <div key={b.id} className="card" style={{ display: 'flex', gap: 'var(--sp-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
              <div className="agenda-dot" />
              <div className="agenda-time">{b.startTime}</div>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 2 }}>{b.service.name}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 2 }}>
                {b.professional.name} · {b.startTime}–{b.endTime}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)' }}>
                {b.client.name} · {b.client.email}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-2)' }}>
              <span className={`badge badge-${b.status.toLowerCase()}`}>
                {b.status === 'CONFIRMED' ? 'Confirmada' : b.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
              </span>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                {b.status === 'PENDING' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleConfirm(b.id)}>Confirmar</button>
                )}
                {b.status !== 'CANCELLED' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancelar</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
