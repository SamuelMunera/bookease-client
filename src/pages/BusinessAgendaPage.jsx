import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ManualBookingModal from '../components/ManualBookingModal';

const DAYS_ES   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function toDateOnly(s) { return s ? s.slice(0, 10) : ''; }

function fmtFull(dateStr) {
  const d = new Date(toDateOnly(dateStr) + 'T00:00:00');
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}
function isToday(dateStr) {
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(toDateOnly(dateStr) + 'T00:00:00');
  return d.getTime() === t.getTime();
}

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };

/* ── Quick date nav ──────────────────────────────────────── */
function DateNav({ value, onChange }) {
  const today  = new Date().toISOString().split('T')[0];
  function shift(days) {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + days);
    onChange(d.toISOString().split('T')[0]);
  }
  return (
    <div className="agenda-date-nav">
      <button className="agenda-nav-arrow" onClick={() => shift(-1)} aria-label="Día anterior">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <div className="agenda-date-input-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input
          type="date"
          className="agenda-date-input"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>

      <button className="agenda-nav-arrow" onClick={() => shift(1)} aria-label="Día siguiente">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {value !== today && (
        <button className="btn btn-secondary btn-sm" onClick={() => onChange(today)}>
          Hoy
        </button>
      )}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ num, label, color, icon }) {
  return (
    <div className="agenda-stat-card" style={{ borderTopColor: color }}>
      <div className="agenda-stat-icon" style={{ color, background: `${color}18` }}>
        {icon}
      </div>
      <p className="agenda-stat-num" style={{ color }}>{num}</p>
      <p className="agenda-stat-label">{label}</p>
    </div>
  );
}

/* ── Timeline row ────────────────────────────────────────── */
function TimelineRow({ b, onConfirm, onCancel }) {
  const statusColor = {
    CONFIRMED: 'var(--success)',
    PENDING:   'var(--warning)',
    CANCELLED: 'var(--text-subtle)',
  }[b.status];

  return (
    <div className={`agenda-timeline-row${b.status === 'CANCELLED' ? ' cancelled' : ''}`}>
      {/* Time column */}
      <div className="agenda-time-col">
        <div className="agenda-time-dot" style={{ background: statusColor, boxShadow: b.status !== 'CANCELLED' ? `0 0 8px ${statusColor}` : 'none' }} />
        <span className="agenda-time-label">{b.startTime}</span>
        {b.endTime && <span className="agenda-time-end">{b.endTime}</span>}
      </div>

      {/* Vertical line (continuity) */}
      <div className="agenda-vline" style={{ borderLeftColor: b.status === 'CANCELLED' ? 'var(--border)' : statusColor + '40' }} />

      {/* Card */}
      <div className="agenda-row-card">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'var(--sp-3)', flexWrap:'wrap', marginBottom:'var(--sp-3)' }}>
          <div>
            <p className="agenda-row-service">{b.service.name}</p>
            <div className="agenda-row-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {b.professional.name}
              <span className="agenda-meta-sep">·</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {b.startTime}{b.endTime ? `–${b.endTime}` : ''}
            </div>
          </div>
          <span className={`badge ${STATUS_BADGE[b.status]}`}>
            {STATUS_LABEL[b.status]}
          </span>
        </div>

        {/* Client info */}
        <div className="agenda-client-row">
          <div className="agenda-client-avatar">
            {b.client.name[0].toUpperCase()}
          </div>
          <div>
            <p className="agenda-client-name">{b.client.name}</p>
            <p className="agenda-client-email">{b.client.email}</p>
            {b.client.phone && <p className="agenda-client-email">{b.client.phone}</p>}
          </div>
        </div>

        {/* Actions */}
        {b.status !== 'CANCELLED' && (
          <div className="agenda-row-actions">
            {b.status === 'PENDING' && (
              <button className="btn btn-success btn-sm" onClick={() => onConfirm(b.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirmar
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => onCancel(b.id)}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
const EMPTY_SVC = { name: '', description: '', duration: '', price: '' };

export default function BusinessAgendaPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(false);

  const [showManual, setShowManual] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  useEffect(() => {
    if (businessId) api.getBusinessProfessionals(businessId).then(setProfessionals).catch(() => {});
  }, [businessId]);

  // service form
  const [showSvcForm, setShowSvcForm] = useState(false);
  const [svcForm,     setSvcForm]     = useState(EMPTY_SVC);
  const [svcError,    setSvcError]    = useState('');
  const [svcOk,       setSvcOk]       = useState('');
  const [svcSaving,   setSvcSaving]   = useState(false);

  useEffect(() => {
    api.getBusinesses().then(all => {
      const mine = all.filter(b => b.ownerId === user.id);
      setBusinesses(mine);
      if (mine.length === 1) setBusinessId(mine[0].id);
    });
  }, [user.id]);

  async function handleCreateService(e) {
    e.preventDefault();
    setSvcError(''); setSvcOk('');
    const dur = parseInt(svcForm.duration, 10);
    const pri = parseFloat(svcForm.price);
    if (!svcForm.name || !svcForm.duration || svcForm.price === '') {
      return setSvcError('Nombre, duración y precio son obligatorios.');
    }
    if (isNaN(dur) || dur <= 0) return setSvcError('Duración debe ser un número positivo.');
    if (isNaN(pri) || pri < 0)  return setSvcError('Precio debe ser >= 0.');
    setSvcSaving(true);
    try {
      const created = await api.createService(businessId, {
        name: svcForm.name.trim(),
        description: svcForm.description.trim() || undefined,
        duration: dur,
        price: pri,
      });
      setSvcOk(`Servicio "${created.name}" creado.`);
      setSvcForm(EMPTY_SVC);
    } catch (err) {
      setSvcError(err.message);
    } finally {
      setSvcSaving(false);
    }
  }

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
    await api.cancelBookingAsOwner(id);
    load();
  }

  const pending   = bookings.filter(b => b.status === 'PENDING');
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');

  const sorted = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="page agenda-page">

      {/* ── Page header ── */}
      <div className="agenda-header">
        <div>
          <p className="section-label">Panel de negocio</p>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle" style={{ textTransform:'capitalize' }}>
            {date ? fmtFull(date) : 'Selecciona una fecha'}
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', flexWrap:'wrap' }}>
          {isToday(date) && (
            <div className="agenda-today-pill">
              <span className="agenda-today-dot" />
              Hoy
            </div>
          )}
          {businessId && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowManual(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Añadir cita
            </button>
          )}
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="agenda-controls">
        {businesses.length > 1 && (
          <select
            className="input"
            style={{ width:240 }}
            value={businessId}
            onChange={e => setBusinessId(e.target.value)}
          >
            <option value="">Selecciona negocio</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <DateNav value={date} onChange={setDate} />
      </div>

      {/* ── Service creation ── */}
      {businessId && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setShowSvcForm(v => !v); setSvcError(''); setSvcOk(''); }}
          >
            {showSvcForm ? 'Cerrar' : '+ Agregar servicio'}
          </button>

          {showSvcForm && (
            <form onSubmit={handleCreateService} style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxWidth: 480 }}>
              <input
                className="input"
                placeholder="Nombre del servicio *"
                value={svcForm.name}
                onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Descripción (opcional)"
                value={svcForm.description}
                onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                <input
                  className="input"
                  placeholder="Duración (min) *"
                  type="number"
                  min="1"
                  value={svcForm.duration}
                  onChange={e => setSvcForm(f => ({ ...f, duration: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <input
                  className="input"
                  placeholder="Precio *"
                  type="number"
                  min="0"
                  step="100"
                  value={svcForm.price}
                  onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))}
                  style={{ flex: 1 }}
                />
              </div>
              {svcError && <p className="error-msg" style={{ marginBottom: 0 }}>{svcError}</p>}
              {svcOk    && <p style={{ color: 'var(--success)', fontSize: 'var(--text-sm)' }}>{svcOk}</p>}
              <button className="btn btn-primary btn-sm" type="submit" disabled={svcSaving} style={{ alignSelf: 'flex-start' }}>
                {svcSaving ? 'Guardando…' : 'Crear servicio'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      {!loading && bookings.length > 0 && (
        <div className="agenda-stats-row">
          <StatCard
            num={bookings.length}
            label="Total"
            color="var(--text-muted)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <StatCard
            num={pending.length}
            label="Pendientes"
            color="var(--warning)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard
            num={confirmed.length}
            label="Confirmadas"
            color="var(--success)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          {cancelled.length > 0 && (
            <StatCard
              num={cancelled.length}
              label="Canceladas"
              color="var(--text-subtle)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            />
          )}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', marginTop:'var(--sp-4)' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ display:'flex', gap:'var(--sp-4)', alignItems:'flex-start' }}>
              <div className="skeleton" style={{ width:60, height:60, borderRadius:'var(--r-lg)', flexShrink:0 }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                <div className="skeleton" style={{ height:16, width:'50%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:12, width:'70%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:60, width:'100%', borderRadius:'var(--r-lg)', marginTop:'var(--sp-1)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && bookings.length === 0 && (
        <div className="empty-state" style={{ marginTop:'var(--sp-6)' }}>
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>
            Sin reservas para esta fecha
          </p>
          <p style={{ fontSize:'var(--text-sm)' }}>Las reservas que recibas aparecerán aquí.</p>
        </div>
      )}

      {/* ── Timeline ── */}
      {!loading && sorted.length > 0 && (
        <div className="agenda-timeline">
          {sorted.map((b, idx) => (
            <TimelineRow
              key={b.id}
              b={b}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isLast={idx === sorted.length - 1}
            />
          ))}
        </div>
      )}

      {showManual && (
        <ManualBookingModal
          mode="business"
          businessId={businessId}
          professionals={professionals}
          onClose={() => setShowManual(false)}
          onCreated={() => {
            setShowManual(false);
            api.getBusinessBookings(businessId, { date }).then(d => setBookings(d || []));
          }}
        />
      )}
    </div>
  );
}
