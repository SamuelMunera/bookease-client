import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function toDateOnly(s) { return s ? s.slice(0, 10) : ''; }
function isUpcoming(dateStr) {
  const d = new Date(toDateOnly(dateStr) + 'T00:00:00');
  const t = new Date(); t.setHours(0,0,0,0);
  return d >= t;
}
function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}
function fmtLong(dateStr) {
  return new Date(toDateOnly(dateStr) + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ num, label, color, icon }) {
  return (
    <div className="agenda-stat-card" style={{ borderTopColor: color }}>
      <div className="agenda-stat-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <p className="agenda-stat-num" style={{ color }}>{num}</p>
      <p className="agenda-stat-label">{label}</p>
    </div>
  );
}

/* ── Reschedule panel (unchanged) ────────────────────────── */
function ReschedulePanel({ booking, onDone, onClose }) {
  const [date,      setDate]      = useState('');
  const [slots,     setSlots]     = useState([]);
  const [slotLoad,  setSlotLoad]  = useState(false);
  const [startTime, setStartTime] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!date) { setSlots([]); setStartTime(''); return; }
    setSlotLoad(true); setStartTime(''); setError('');
    api.getSlots({ professionalId: booking.professional.id, serviceId: booking.service.id, date })
      .then(data => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotLoad(false));
  }, [date]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date || !startTime) return;
    setSaving(true); setError('');
    try { await api.rescheduleBooking(booking.id, { date, startTime }); onDone(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const fmtSel = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' }) : null;

  return (
    <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', overflow:'hidden' }}>
      <div style={{ padding:'var(--sp-3) var(--sp-4)', borderBottom:'1px solid var(--border)', background:'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
          <div style={{ width:26, height:26, borderRadius:'var(--r-md)', background:'var(--gold-subtle)', color:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </div>
          <span style={{ fontSize:'var(--text-sm)', fontWeight:700, color:'var(--text)' }}>Aplazar cita</span>
          <span style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', background:'var(--surface-4)', padding:'2px 8px', borderRadius:'var(--r-full)' }}>{booking.service.name}</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-subtle)', display:'flex', padding:4, borderRadius:'var(--r-sm)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style={{ padding:'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', padding:'var(--sp-3) var(--sp-4)', marginBottom:'var(--sp-4)', background:'var(--surface-3)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Actual</p>
            <p style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text-muted)', textTransform:'capitalize' }}>{fmtSel(toDateOnly(booking.date))}</p>
            <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)' }}>{booking.startTime}–{booking.endTime}</p>
          </div>
          <svg width="18" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <div style={{ flex:1, textAlign:'right' }}>
            <p style={{ fontSize:'var(--text-xs)', color: date ? 'var(--gold)' : 'var(--text-subtle)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Nueva</p>
            {date && startTime ? (
              <><p style={{ fontSize:'var(--text-sm)', fontWeight:700, color:'var(--gold)', textTransform:'capitalize' }}>{fmtSel(date)}</p><p style={{ fontSize:'var(--text-xs)', color:'var(--gold)' }}>{startTime}</p></>
            ) : <p style={{ fontSize:'var(--text-sm)', color:'var(--text-dim)' }}>Pendiente</p>}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
          <div>
            <label style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>1 · Nueva fecha</label>
            <input type="date" className="input" value={date} min={todayISO()} onChange={e => setDate(e.target.value)} required style={{ maxWidth:200 }} />
          </div>
          {date && (
            <div>
              <label style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>2 · Horario</label>
              {slotLoad ? (
                <div style={{ display:'flex', gap:'var(--sp-2)', flexWrap:'wrap' }}>
                  {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton" style={{ width:66, height:34, borderRadius:'var(--r-md)' }} />)}
                </div>
              ) : slots.length === 0 ? (
                <div style={{ padding:'var(--sp-3) var(--sp-4)', background:'var(--surface-3)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)' }}>
                  <p style={{ fontSize:'var(--text-sm)', color:'var(--text-subtle)' }}>Sin disponibilidad ese día. Prueba con otra fecha.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--sp-2)' }}>
                  {slots.map(s => {
                    const active = startTime === s.startTime;
                    return (
                      <button key={s.startTime} type="button" onClick={() => setStartTime(s.startTime)} style={{ minWidth:66, padding:'7px 14px', borderRadius:'var(--r-md)', border:`1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`, background: active ? 'var(--gold-subtle)' : 'var(--surface-3)', color: active ? 'var(--gold)' : 'var(--text-muted)', fontSize:'var(--text-sm)', fontWeight: active ? 700 : 500, cursor:'pointer', transition:'border-color .12s, background .12s, color .12s', letterSpacing:'0.02em' }}>
                        {s.startTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {error && <p style={{ fontSize:'var(--text-sm)', color:'var(--error)' }}>{error}</p>}
          <div style={{ display:'flex', gap:'var(--sp-2)' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!date || !startTime || saving}>
              {saving ? 'Guardando…' : 'Confirmar cambio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Timeline booking row ────────────────────────────────── */
function AgendaBookingRow({ b, onCancel, onRescheduled }) {
  const upcoming   = isUpcoming(b.date);
  const isHome     = b.type === 'HOME_SERVICE';
  const serviceName = b.service?.name ?? b.homeService?.name ?? '—';
  const [showReschedule, setShowReschedule] = useState(false);

  const statusColor = {
    CONFIRMED: 'var(--success)',
    PENDING:   'var(--warning)',
    CANCELLED: 'var(--text-subtle)',
  }[b.status] ?? 'var(--text-subtle)';

  const d = new Date(toDateOnly(b.date) + 'T00:00:00');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
      <div className={`agenda-timeline-row${b.status === 'CANCELLED' ? ' cancelled' : ''}`}>
        {/* Date column */}
        <div className="agenda-time-col">
          <div className="agenda-time-dot" style={{ background: statusColor, boxShadow: b.status !== 'CANCELLED' ? `0 0 8px ${statusColor}` : 'none' }} />
          <span className="agenda-time-label">{String(d.getDate()).padStart(2,'0')}</span>
          <span className="agenda-time-end">{MONTHS_ES[d.getMonth()]}</span>
        </div>

        <div className="agenda-vline" style={{ borderLeftColor: b.status === 'CANCELLED' ? 'var(--border)' : statusColor + '40' }} />

        {/* Card body */}
        <div className="agenda-row-card">
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'var(--sp-3)', flexWrap:'wrap', marginBottom:'var(--sp-3)' }}>
            <div>
              <p className="agenda-row-service" style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
                {serviceName}
                {isHome && (
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:'var(--r-full)', background:'rgba(212,168,83,.12)', border:'1px solid rgba(212,168,83,.25)', color:'var(--gold)' }}>
                    A domicilio
                  </span>
                )}
              </p>
              <div className="agenda-row-meta">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {b.professional?.name}
                <span className="agenda-meta-sep">·</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ textTransform:'capitalize' }}>{fmtLong(b.date)}</span>
                {' · '}{b.startTime}{b.endTime ? `–${b.endTime}` : ''}
              </div>
            </div>
            <span className={`badge ${STATUS_BADGE[b.status] ?? 'badge-pending'}`}>
              {STATUS_LABEL[b.status] ?? b.status}
            </span>
          </div>

          {/* Business or address info */}
          {isHome && b.clientAddress ? (
            <div className="agenda-client-row">
              <div className="agenda-client-avatar" style={{ background:'rgba(212,168,83,.15)', color:'var(--gold)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p className="agenda-client-name">Servicio a domicilio</p>
                <p className="agenda-client-email">{b.clientAddress}</p>
              </div>
            </div>
          ) : b.business?.name ? (
            <div className="agenda-client-row">
              <div className="agenda-client-avatar">{b.business.name[0].toUpperCase()}</div>
              <div>
                <p className="agenda-client-name">{b.business.name}</p>
                <p className="agenda-client-email">{[b.business.address, b.business.city].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          {b.status !== 'CANCELLED' && upcoming && (
            <div className="agenda-row-actions">
              {!isHome && (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowReschedule(v => !v)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                  Aplazar
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => onCancel(b.id, isHome)}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

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

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');

  const isPro = user?.role === 'PROFESSIONAL';

  function load() {
    setLoading(true);
    const req = isPro ? api.getProBookings() : api.getMyBookings();
    req.then(data => setBookings(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCancel(id, isHome) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await (isHome ? api.cancelHomeBooking(id) : api.cancelBooking(id));
    load();
  }

  const upcoming  = bookings.filter(b => b.status !== 'CANCELLED' && isUpcoming(b.date));
  const past      = bookings.filter(b => b.status !== 'CANCELLED' && !isUpcoming(b.date));
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');

  const tabs = [
    { key: 'upcoming',  label: 'Próximas',  count: upcoming.length,  color: 'var(--violet)' },
    { key: 'past',      label: 'Pasadas',   count: past.length,      color: 'var(--gold)' },
    { key: 'cancelled', label: 'Canceladas',count: cancelled.length, color: 'var(--text-subtle)' },
  ];

  const visible = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <div className="page agenda-page" style={{ maxWidth: 900 }}>

      {/* ── Header ── */}
      <div className="agenda-header">
        <div>
          <p className="section-label">Mi cuenta</p>
          <h1 className="page-title">Mis reservas</h1>
          <p className="page-subtitle">Gestiona tus citas y próximas visitas</p>
        </div>
        {!loading && upcoming.length > 0 && (
          <div className="agenda-today-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {upcoming.length} próxima{upcoming.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', marginTop:'var(--sp-4)' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ display:'flex', gap:'var(--sp-4)', alignItems:'flex-start' }}>
              <div className="skeleton" style={{ width:60, height:64, borderRadius:'var(--r-lg)', flexShrink:0 }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                <div className="skeleton" style={{ height:16, width:'50%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:12, width:'70%', borderRadius:'var(--r-sm)' }} />
                <div className="skeleton" style={{ height:60, width:'100%', borderRadius:'var(--r-lg)', marginTop:'var(--sp-1)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && bookings.length === 0 && (
        <div className="empty-state" style={{ marginTop:'var(--sp-6)' }}>
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>Sin reservas aún</p>
          <p style={{ fontSize:'var(--text-sm)' }}>Encuentra tu barbería, spa o salón favorito y agenda en segundos.</p>
          <Link to="/"><button className="btn btn-primary" style={{ marginTop:'var(--sp-4)' }}>Explorar negocios</button></Link>
        </div>
      )}

      {/* ── Stats + tabs + list ── */}
      {!loading && bookings.length > 0 && (
        <>
          {/* Stats */}
          <div className="agenda-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
            <StatCard num={bookings.length} label="Total" color="var(--text-muted)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
            <StatCard num={upcoming.length} label="Próximas" color="var(--violet)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <StatCard num={past.length} label="Pasadas" color="var(--gold)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            />
            {cancelled.length > 0 && (
              <StatCard num={cancelled.length} label="Canceladas" color="var(--text-subtle)"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              />
            )}
          </div>

          {/* Filter tabs */}
          <div className="agenda-controls" style={{ marginBottom:'var(--sp-5)' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                  padding: '6px 14px', borderRadius: 'var(--r-full)', cursor: 'pointer',
                  fontSize: 'var(--text-sm)', fontWeight: tab === t.key ? 700 : 500,
                  border: `1.5px solid ${tab === t.key ? t.color : 'var(--border)'}`,
                  background: tab === t.key ? `${t.color}18` : 'transparent',
                  color: tab === t.key ? t.color : 'var(--text-muted)',
                  transition: 'all .15s',
                }}
              >
                {t.label}
                {t.count > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 'var(--r-full)', background: tab === t.key ? t.color : 'var(--surface-3)', color: tab === t.key ? '#0A0808' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {visible.length === 0 ? (
            <div className="empty-state" style={{ padding:'var(--sp-8) 0' }}>
              <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>Sin reservas en esta categoría.</p>
            </div>
          ) : (
            <div className="agenda-timeline">
              {visible.map(b => (
                <AgendaBookingRow key={b.id} b={b} onCancel={handleCancel} onRescheduled={load} />
              ))}
            </div>
          )}

          {tab === 'upcoming' && upcoming.length === 0 && (
            <div style={{ marginTop:'var(--sp-6)', textAlign:'center' }}>
              <Link to="/"><button className="btn btn-primary">Reservar de nuevo</button></Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
