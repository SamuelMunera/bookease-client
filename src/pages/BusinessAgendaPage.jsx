import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ManualBookingModal from '../components/ManualBookingModal';
import { fmtMoney, currencyForCountry } from '../utils/currency';
import { nowInTimezone, todayInTimezone } from '../utils/time';

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

const STATUS_LABEL = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada', COMPLETED: 'Completada', NO_SHOW: 'No asistió' };
const STATUS_BADGE = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled', COMPLETED: 'badge-confirmed', NO_SHOW: 'badge-cancelled' };

// F-004: la hora "actual" debe evaluarse en la timezone del negocio, no en la
// del navegador (nowInTimezone vive en utils/time, compartida con la agenda
// del profesional).
function isPast(b, tz) {
  const now = nowInTimezone(tz);
  const bookingDate = b.date.slice(0, 10);
  if (bookingDate < now.date) return true;
  if (bookingDate === now.date) {
    const [h, m] = (b.startTime || '00:00').split(':').map(Number);
    return now.hour > h || (now.hour === h && now.minute >= m);
  }
  return false;
}

/* ── Quick date nav ──────────────────────────────────────── */
function DateNav({ value, onChange, timezone }) {
  // "Hoy" en la timezone del negocio, no la fecha UTC (que ya va en mañana
  // desde las ~19:00 locales en América).
  const today  = todayInTimezone(timezone);
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
function TimelineRow({ b, onConfirm, onCancel, onNoShow, onComplete, onRedeem, timezone, currency }) {
  const [confirm, setConfirm] = useState(null); // 'no-show' | 'complete' | 'cancel' | null
  const [redeemAsk, setRedeemAsk] = useState(false);
  const loyalty = b.clientLoyalty; // { stamps, target, active, rewardPending } | null
  const statusColor = {
    CONFIRMED: 'var(--success)',
    PENDING:   'var(--warning)',
    CANCELLED: 'var(--text-subtle)',
    COMPLETED: 'var(--text-muted)',
    NO_SHOW:   'var(--red, #ef4444)',
  }[b.status] ?? 'var(--text-subtle)';

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
          <div style={{ display:'flex', gap:'var(--sp-2)', alignItems:'center', flexWrap:'wrap' }}>
            {b.source && b.source !== 'ONLINE' && (
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:'var(--r-full)', background:'rgba(124,92,252,.1)', color:'var(--violet)', border:'1px solid rgba(124,92,252,.2)', fontWeight:600 }}>
                {{ MANUAL:'Manual', WHATSAPP:'WhatsApp', CALL:'Llamada', PRESENCIAL:'Presencial' }[b.source] ?? b.source}
              </span>
            )}
            <span className={`badge ${STATUS_BADGE[b.status]}`}>
              {STATUS_LABEL[b.status]}
            </span>
            {loyalty?.active && (
              <span
                title={`${loyalty.stamps} de ${loyalty.target} sellos`}
                style={{ fontSize:10, padding:'2px 8px', borderRadius:'var(--r-full)', background:'var(--gold-subtle)', color:'var(--gold-dark)', border:'1px solid var(--gold-border)', fontWeight:700, whiteSpace:'nowrap' }}
              >
                ★ {loyalty.stamps}/{loyalty.target} sellos
              </span>
            )}
          </div>
        </div>

        {/* Client info */}
        {(() => {
          const clientName = b.guestName ?? b.client?.name ?? 'Cliente';
          return (
            <div className="agenda-client-row">
              <div className="agenda-client-avatar">
                {clientName[0].toUpperCase()}
              </div>
              <div>
                <p className="agenda-client-name">{clientName}</p>
                {b.client?.email && <p className="agenda-client-email">{b.client.email}</p>}
                {b.client?.phone && <p className="agenda-client-email">{b.client.phone}</p>}
              </div>
            </div>
          );
        })()}

        {/* Deuda pendiente del cliente (multas por cancelación / no-show) */}
        {b.clientDebt?.pendingTotal > 0 && (
          <div style={{
            marginTop: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--r-md)', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: 'var(--text-xs)', fontWeight: 600, color: '#ef4444',
          }}>
            ⚠ Deuda pendiente: {fmtMoney(b.clientDebt.pendingTotal, currency)}
            {b.clientDebt.pendingCount > 1 ? ` (${b.clientDebt.pendingCount} multas)` : ''}
          </div>
        )}

        {/* Recompensa de fidelidad lista para canjear en mostrador */}
        {loyalty?.rewardPending && (
          <div style={{
            marginTop: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--r-md)', background: 'var(--gold-subtle)',
            border: '1px solid var(--gold-border)',
            display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap',
          }}>
            <span style={{ flex: 1, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-dark)' }}>
              🎁 Recompensa lista: {loyalty.rewardPending.label}
            </span>
            {redeemAsk ? (
              <>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gold-dark)' }}>¿Canjear ahora?</span>
                <button
                  className="btn btn-sm"
                  style={{ padding: '3px 12px', fontWeight: 700, background: 'var(--gold)', color: '#000', border: 'none' }}
                  onClick={() => { setRedeemAsk(false); onRedeem(loyalty.rewardPending.id); }}
                >
                  Sí
                </button>
                <button className="btn btn-secondary btn-sm" style={{ padding: '3px 10px' }} onClick={() => setRedeemAsk(false)}>No</button>
              </>
            ) : (
              <button
                className="btn btn-sm"
                style={{ padding: '4px 12px', fontWeight: 700, background: 'var(--gold)', color: '#000', border: 'none' }}
                onClick={() => setRedeemAsk(true)}
              >
                Canjear
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        {!['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(b.status) && (
          <div className="agenda-row-actions" style={{ flexWrap: 'wrap' }}>
            {b.status === 'PENDING' && (
              <button className="btn btn-success btn-sm" onClick={() => onConfirm(b.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Confirmar
              </button>
            )}
            {isPast(b, timezone) && confirm === null && (
              <>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--gold-subtle)', color: 'var(--gold)', border: '1px solid var(--gold-border)', fontWeight: 700 }}
                  onClick={() => setConfirm('complete')}
                >
                  ✓ Completar
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 700 }}
                  onClick={() => setConfirm('no-show')}
                >
                  ✕ No asistió
                </button>
              </>
            )}
            {confirm !== null && (() => {
              const danger = confirm === 'no-show' || confirm === 'cancel';
              const prompt = confirm === 'no-show'
                ? '¿Marcar como no asistió?'
                : confirm === 'cancel'
                  ? '¿Cancelar esta reserva?'
                  : '¿Marcar como completada?';
              const onYes = confirm === 'no-show'
                ? () => onNoShow(b.id)
                : confirm === 'cancel'
                  ? () => onCancel(b.id)
                  : () => onComplete(b.id);
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap',
                  padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--r-md)',
                  background: danger ? 'rgba(239,68,68,0.08)' : 'var(--gold-subtle)',
                  border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'var(--gold-border)'}`,
                }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: danger ? '#ef4444' : 'var(--gold)' }}>
                    {prompt}
                  </span>
                  <button
                    className="btn btn-sm"
                    style={{ padding: '3px 12px', fontWeight: 700, background: danger ? '#ef4444' : 'var(--gold)', color: '#000', border: 'none' }}
                    onClick={() => { setConfirm(null); onYes(); }}
                  >
                    Sí
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '3px 10px' }} onClick={() => setConfirm(null)}>
                    No
                  </button>
                </div>
              );
            })()}
            {/* C-37: Cancelar solo para citas futuras (cancelar una cita pasada
                no tiene sentido; para pasadas quedan Completar/No asistió).
                C-31: confirmación inline (sin window.confirm nativo). */}
            {!isPast(b, timezone) && confirm === null && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirm('cancel')}>
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
export default function BusinessAgendaPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  // "Hoy" en timezone del negocio (fallback Bogotá; al montar aún no se conoce
  // la del negocio). Con la fecha UTC la agenda abría en mañana tras las 19:00.
  const [date,       setDate]       = useState(() => todayInTimezone());
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  // C-30: error de carga de la agenda (en vez de mostrar el empty-state al fallar).
  const [loadError,  setLoadError]  = useState(null);
  // C-31: error de acción (confirmar/cancelar/no-show/completar) sin alert nativo.
  const [actionError, setActionError] = useState(null);

  const [showManual, setShowManual] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  // Filtro de agenda por profesional ('all' = todas las reservas juntas)
  const [profFilter, setProfFilter] = useState('all');
  useEffect(() => {
    setProfFilter('all');
    if (businessId) api.getBusinessProfessionals(businessId).then(setProfessionals).catch(() => {});
  }, [businessId]);

  // F-002: usar el endpoint autenticado /businesses/me (getMyBusiness) en vez
  // del listado público getBusinesses(), que filtra status:'ACTIVE' y hacía
  // desaparecer el negocio (y su agenda) cuando la suscripción vencía
  // (status INACTIVE). getMyBusiness resuelve el negocio por ownerId del token
  // sin filtrar por status. El modelo backend es un negocio por dueño
  // (findFirst por ownerId en todos los endpoints /me), por lo que lo
  // envolvemos en un array para conservar la estructura existente.
  useEffect(() => {
    api.getMyBusiness()
      .then(biz => {
        const mine = biz ? [biz] : [];
        setBusinesses(mine);
        if (mine.length === 1) setBusinessId(mine[0].id);
      })
      .catch(() => setBusinesses([]));
  }, [user.id]);

  function load() {
    if (!businessId) return;
    setLoading(true);
    setLoadError(null); // C-30: limpiar error al iniciar cada carga
    api.getBusinessBookings(businessId, { date })
      .then(setBookings)
      .catch(() => setLoadError('No se pudieron cargar las reservas. Comprueba tu conexión e inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [businessId, date]);

  // C-31: nota — la confirmación de cancelar se migró a un patrón inline (sin
  // window.confirm). Los errores de acción se muestran con actionError en vez
  // de alert() nativo.
  async function handleConfirm(id) {
    setActionError(null);
    try { await api.confirmBooking(id); load(); }
    catch (e) { setActionError(e.message || 'No se pudo confirmar la reserva.'); }
  }
  async function handleCancel(id) {
    setActionError(null);
    try { await api.cancelBookingAsOwner(id); load(); }
    catch (e) { setActionError(e.message || 'No se pudo cancelar la reserva.'); }
  }
  async function handleNoShow(id) {
    setActionError(null);
    try { await api.markNoShow(id); load(); }
    catch (e) { setActionError(e.message || 'No se pudo marcar como no asistió.'); }
  }
  async function handleComplete(id) {
    setActionError(null);
    try { await api.markComplete(id); load(); }
    catch (e) { setActionError(e.message || 'No se pudo marcar como completada.'); }
  }
  async function handleRedeem(rewardId) {
    setActionError(null);
    try { await api.redeemLoyaltyReward(rewardId); load(); }
    catch (e) {
      setActionError(e.status === 409 ? 'La recompensa ya fue redimida.' : (e.message || 'No se pudo redimir la recompensa.'));
    }
  }

  // Filtro real por profesional: 'all' deja todas; si no, solo las de ese pro.
  const visibleBookings = profFilter === 'all'
    ? bookings
    : bookings.filter(b => b.professional?.id === profFilter);

  const pending   = visibleBookings.filter(b => b.status === 'PENDING');
  const confirmed = visibleBookings.filter(b => b.status === 'CONFIRMED');
  const cancelled = visibleBookings.filter(b => b.status === 'CANCELLED');
  const noShows   = visibleBookings.filter(b => b.status === 'NO_SHOW');

  const sorted = [...visibleBookings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // F-004: timezone del negocio seleccionado para evaluar isPast() con la hora
  // local del negocio, no la del navegador.
  const selectedTimezone = businesses.find(b => b.id === businessId)?.timezone;

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
            style={{ width:'100%', maxWidth:240 }}
            value={businessId}
            onChange={e => setBusinessId(e.target.value)}
          >
            <option value="">Selecciona negocio</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <DateNav value={date} onChange={setDate} timezone={selectedTimezone} />
      </div>

      {/* ── Filtro por profesional ── */}
      {businessId && professionals.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', flexWrap:'wrap', marginBottom:'var(--sp-6)' }}>
          <span style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-subtle)', textTransform:'uppercase', letterSpacing:'.05em', marginRight:'var(--sp-1)' }}>
            Profesional
          </span>
          <button
            className="agenda-prof-chip"
            onClick={() => setProfFilter('all')}
            style={{
              padding:'6px 14px', borderRadius:'var(--r-full)', cursor:'pointer',
              fontSize:'var(--text-sm)', fontWeight:600, transition:'all .15s',
              border:`1px solid ${profFilter === 'all' ? 'var(--gold)' : 'var(--border)'}`,
              background: profFilter === 'all' ? 'var(--gold)' : 'var(--surface-3)',
              color: profFilter === 'all' ? '#0A0808' : 'var(--text-muted)',
            }}
          >
            Todos
          </button>
          {professionals.map(p => {
            const active = profFilter === p.id;
            return (
              <button
                key={p.id}
                className="agenda-prof-chip"
                onClick={() => setProfFilter(p.id)}
                style={{
                  padding:'6px 14px', borderRadius:'var(--r-full)', cursor:'pointer',
                  fontSize:'var(--text-sm)', fontWeight:600, transition:'all .15s',
                  border:`1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                  background: active ? 'var(--gold)' : 'var(--surface-3)',
                  color: active ? '#0A0808' : 'var(--text-muted)',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Action error (C-31): feedback no nativo en lugar de alert() ── */}
      {actionError && (
        <div className="error-msg" style={{ marginBottom:'var(--sp-4)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'var(--sp-3)' }}>
          <span>{actionError}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setActionError(null)}>
            Cerrar
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      {!loading && !loadError && visibleBookings.length > 0 && (
        <div className="agenda-stats-row">
          <StatCard
            num={visibleBookings.length}
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
          {noShows.length > 0 && (
            <StatCard
              num={noShows.length}
              label="No asistieron"
              color="#ef4444"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
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

      {/* ── Load error (C-30): bloque de error con reintento en lugar del
            empty-state cuando la carga falla. ── */}
      {!loading && loadError && (
        <div className="error-msg" style={{ marginTop:'var(--sp-6)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'var(--sp-3)', flexWrap:'wrap' }}>
          <span>{loadError}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => load()}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !loadError && visibleBookings.length === 0 && (() => {
        const biz = businesses.find(b => b.id === businessId);
        const noServices = !(biz?.services?.length > 0);
        const noPros     = !(professionals.length > 0);
        // Hay reservas en el día pero ninguna del profesional filtrado.
        const filteredOut = bookings.length > 0 && profFilter !== 'all';
        const filteredName = professionals.find(p => p.id === profFilter)?.name;
        return (
          <div className="empty-state" style={{ marginTop:'var(--sp-6)' }}>
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>
              {filteredOut ? `Sin reservas para ${filteredName || 'este profesional'}` : 'Sin reservas para esta fecha'}
            </p>
            {filteredOut ? (
              <p style={{ fontSize:'var(--text-sm)', lineHeight:1.5 }}>
                Este profesional no tiene reservas en esta fecha. Pulsa <strong>Todos</strong> para ver la agenda completa.
              </p>
            ) : noServices ? (
              <p style={{ fontSize:'var(--text-sm)', lineHeight:1.5 }}>
                Agrega al menos un servicio desde el Panel de negocio para poder recibir reservas.
              </p>
            ) : noPros ? (
              <p style={{ fontSize:'var(--text-sm)', lineHeight:1.5 }}>
                Aún no hay profesionales. Comparte el código de vinculación desde el Panel para que se unan.
              </p>
            ) : (
              <p style={{ fontSize:'var(--text-sm)', lineHeight:1.5 }}>
                Las reservas confirmadas aparecerán aquí. Puedes crear una cita manual con el botón de arriba.
              </p>
            )}
          </div>
        );
      })()}

      {/* ── Timeline ── */}
      {!loading && !loadError && sorted.length > 0 && (
        <div className="agenda-timeline">
          {sorted.map(b => (
            <TimelineRow
              key={b.id}
              b={b}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onNoShow={handleNoShow}
              onComplete={handleComplete}
              onRedeem={handleRedeem}
              timezone={selectedTimezone}
              currency={currencyForCountry(businesses.find(x => x.id === businessId)?.country)}
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
