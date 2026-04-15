import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_META = {
  PENDING:   { label: 'Pendiente',   color: 'var(--gold)',    bg: 'rgba(255,184,0,0.1)' },
  CONFIRMED: { label: 'Confirmada',  color: 'var(--green)',   bg: 'rgba(34,197,94,0.1)' },
  CANCELLED: { label: 'Cancelada',   color: 'var(--red)',     bg: 'rgba(239,68,68,0.1)' },
  COMPLETED: { label: 'Completada',  color: 'var(--text-muted)', bg: 'rgba(100,100,120,0.1)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 'var(--r-full)',
      fontSize: 'var(--text-xs)', fontWeight: 600,
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function BookingRow({ booking }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
      padding: 'var(--sp-3) var(--sp-4)',
      borderRadius: 'var(--r-md)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
    }}>
      {/* Date+time pill */}
      <div style={{
        flexShrink: 0, textAlign: 'center',
        padding: 'var(--sp-2) var(--sp-3)',
        borderRadius: 'var(--r-md)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        minWidth: 64,
      }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1 }}>{formatDate(booking.date)}</p>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginTop: 3 }}>{booking.startTime}</p>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {booking.service?.name ?? '—'}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
          {booking.client?.name ?? 'Cliente'}
        </p>
      </div>

      {/* Duration */}
      {booking.service?.duration && (
        <span style={{ flexShrink: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {booking.service.duration} min
        </span>
      )}

      <StatusBadge status={booking.status} />
    </div>
  );
}

const DAYS_LABEL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DEFAULT_SCHEDULE = [0,1,2,3,4,5,6].map(d => ({
  dayOfWeek: d, startTime: '09:00', endTime: '18:00', isActive: false,
}));

export default function ProfessionalDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Services
  const [bizServices, setBizServices]   = useState([]);
  const [myServiceIds, setMyServiceIds] = useState(new Set());
  const [savingServices, setSavingServices] = useState(false);
  const [serviceMsg, setServiceMsg]     = useState('');

  // Schedule
  const [schedule, setSchedule]         = useState(DEFAULT_SCHEDULE);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMsg, setScheduleMsg]   = useState('');

  useEffect(() => {
    api.getProMe()
      .then(data => {
        setProfile(data);
        // load business services once we know businessId
        if (data?.businessId) {
          api.getBusinessServices(data.businessId)
            .then(s => setBizServices(Array.isArray(s) ? s : []))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    api.getProBookings()
      .then(data => setBookings(Array.isArray(data) ? data : data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));

    api.getProServices()
      .then(s => setMyServiceIds(new Set((Array.isArray(s) ? s : []).map(x => x.id))))
      .catch(() => {});

    api.getProSchedule()
      .then(rows => {
        if (!rows?.length) return;
        setSchedule(DEFAULT_SCHEDULE.map(def => {
          const saved = rows.find(r => r.dayOfWeek === def.dayOfWeek);
          return saved
            ? { dayOfWeek: saved.dayOfWeek, startTime: saved.startTime, endTime: saved.endTime, isActive: saved.isActive }
            : def;
        }));
      })
      .catch(() => {});
  }, []);

  async function saveServices() {
    setSavingServices(true); setServiceMsg('');
    try {
      await api.setProServices([...myServiceIds]);
      setServiceMsg('Guardado');
    } catch { setServiceMsg('Error al guardar'); }
    finally { setSavingServices(false); setTimeout(() => setServiceMsg(''), 2500); }
  }

  async function saveSchedule() {
    setSavingSchedule(true); setScheduleMsg('');
    try {
      await api.setProSchedule(schedule);
      setScheduleMsg('Guardado');
    } catch { setScheduleMsg('Error al guardar'); }
    finally { setSavingSchedule(false); setTimeout(() => setScheduleMsg(''), 2500); }
  }

  function toggleService(id) {
    setMyServiceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateDay(dayOfWeek, field, value) {
    setSchedule(s => s.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter(b =>
    b.status !== 'CANCELLED' && b.date >= todayStr
  );
  const todayBookings = bookings.filter(b =>
    b.status !== 'CANCELLED' && b.date?.startsWith(todayStr)
  );
  const confirmedTotal = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingTotal   = bookings.filter(b => b.status === 'PENDING').length;

  const pro = profile ?? {};

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)' }}>

      {/* ── Welcome header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1235 0%, #0D0D1E 100%)',
        border: '1px solid rgba(124,92,252,0.2)',
        borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-6)',
        marginBottom: 'var(--sp-6)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--violet) 0%, #9b59f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 28, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(124,92,252,0.3)',
          }}>
            {user?.name?.[0]?.toUpperCase() ?? 'P'}
          </div>

          <div style={{ flex: 1 }}>
            {loadingProfile ? (
              <>
                <div style={{ height: 22, width: 200, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 14, width: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 6 }} />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Hola, {pro.name ?? user?.name ?? 'Profesional'}
                  </h1>
                  {pro.specialty && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--r-full)',
                      background: 'var(--violet-subtle)', border: '1px solid rgba(124,92,252,0.3)',
                      color: 'var(--violet)', fontSize: 'var(--text-xs)', fontWeight: 600,
                    }}>
                      {pro.specialty}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 6 }}>
                  {pro.business?.name
                    ? <>Trabajas en <strong style={{ color: 'var(--text)' }}>{pro.business.name}</strong></>
                    : 'Panel profesional'}
                </p>
              </>
            )}
          </div>

          <Link to="/pro/profile" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: 'var(--sp-2) var(--sp-4)',
            borderRadius: 'var(--r-md)',
            border: '1px solid rgba(124,92,252,0.4)',
            color: 'var(--violet)', fontSize: 'var(--text-sm)', fontWeight: 500,
            textDecoration: 'none', background: 'var(--violet-subtle)',
            transition: 'opacity .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Mi perfil
          </Link>
        </div>

        {/* Bio */}
        {!loadingProfile && pro.bio && (
          <p style={{
            marginTop: 'var(--sp-4)',
            padding: 'var(--sp-3) var(--sp-4)',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 'var(--r-md)',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
            lineHeight: 1.6, fontStyle: 'italic',
          }}>
            "{pro.bio}"
          </p>
        )}
      </div>

      {/* ── Stats row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-6)',
      }}>
        {[
          { label: 'Citas hoy',      value: todayBookings.length,   color: 'var(--violet)', icon: '📅' },
          { label: 'Próximas',       value: upcomingBookings.length, color: 'var(--gold)',   icon: '⏭' },
          { label: 'Confirmadas',    value: confirmedTotal,          color: 'var(--green)',  icon: '✓' },
          { label: 'Pendientes',     value: pendingTotal,            color: 'var(--gold)',   icon: '⏳' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: 'var(--sp-4)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>{stat.label}</p>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: stat.color }}>
              {loadingBookings ? '—' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--sp-6)', alignItems: 'start' }}>

        {/* ── Upcoming bookings ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)' }}>Próximas citas</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {upcomingBookings.length} {upcomingBookings.length === 1 ? 'cita' : 'citas'}
            </span>
          </div>

          {loadingBookings ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 68, borderRadius: 'var(--r-md)', background: 'var(--surface-raised)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div style={{
              padding: 'var(--sp-8)',
              borderRadius: 'var(--r-lg)',
              border: '1px dashed var(--border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--sp-3)' }}>📭</div>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--sp-2)' }}>Sin citas próximas</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Cuando tengas reservas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {upcomingBookings.slice(0, 10).map(b => (
                <BookingRow key={b.id} booking={b} />
              ))}
              {upcomingBookings.length > 10 && (
                <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  y {upcomingBookings.length - 10} más…
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar: profile card + quick links ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

          {/* Profile card */}
          <div style={{
            padding: 'var(--sp-4)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--sp-4)' }}>Datos profesionales</h3>
            {loadingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[120, 80, 100].map(w => (
                  <div key={w} style={{ height: 12, width: w, background: 'var(--surface)', borderRadius: 6 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {[
                  { label: 'Especialidad', value: pro.specialty },
                  { label: 'Experiencia',  value: pro.experience },
                  { label: 'Negocio',      value: pro.business?.name },
                  { label: 'Teléfono',     value: pro.phone },
                ].filter(f => f.value).map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{
            padding: 'var(--sp-4)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--sp-3)' }}>Accesos rápidos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {[
                {
                  to: '/my-bookings',
                  label: 'Ver todas mis reservas',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                },
                {
                  to: '/',
                  label: 'Explorar negocios',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
                },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                    padding: 'var(--sp-2) var(--sp-3)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    transition: 'background .15s, color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {l.icon}
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Mis Servicios ── */}
      <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Mis servicios</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
              Selecciona los servicios que puedes realizar. Solo aparecerán al reservar contigo.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            {serviceMsg && <span style={{ fontSize: 'var(--text-xs)', color: serviceMsg === 'Guardado' ? 'var(--green)' : 'var(--red)' }}>{serviceMsg}</span>}
            <button className="btn btn-primary" onClick={saveServices} disabled={savingServices} style={{ background: 'var(--violet)', padding: '6px 16px' }}>
              {savingServices ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        {bizServices.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>El negocio no tiene servicios registrados aún.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {bizServices.map(s => {
              const on = myServiceIds.has(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleService(s.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--r-md)',
                  border: `1px solid ${on ? 'var(--violet)' : 'var(--border)'}`,
                  background: on ? 'var(--violet-subtle)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${on ? 'var(--violet)' : 'var(--border)'}`,
                    background: on ? 'var(--violet)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: on ? 'var(--violet)' : 'var(--text)', marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.duration} min · ${Number(s.price).toLocaleString('es-CO')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Mi Disponibilidad ── */}
      <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Mi disponibilidad</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
              Activa los días que atiendes y configura tu horario.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            {scheduleMsg && <span style={{ fontSize: 'var(--text-xs)', color: scheduleMsg === 'Guardado' ? 'var(--green)' : 'var(--red)' }}>{scheduleMsg}</span>}
            <button className="btn btn-primary" onClick={saveSchedule} disabled={savingSchedule} style={{ background: 'var(--violet)', padding: '6px 16px' }}>
              {savingSchedule ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {schedule.map(day => (
            <div key={day.dayOfWeek} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--r-md)',
              border: `1px solid ${day.isActive ? 'var(--violet)' : 'var(--border)'}`,
              background: day.isActive ? 'var(--violet-subtle)' : 'var(--surface)',
              transition: 'all .15s',
              flexWrap: 'wrap',
            }}>
              {/* Toggle */}
              <button type="button" onClick={() => updateDay(day.dayOfWeek, 'isActive', !day.isActive)} style={{
                width: 38, height: 22, borderRadius: 11, flexShrink: 0, border: 'none',
                background: day.isActive ? 'var(--violet)' : 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background .2s',
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: day.isActive ? 19 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', transition: 'left .2s',
                }} />
              </button>

              {/* Day name */}
              <span style={{ width: 90, fontSize: 'var(--text-sm)', fontWeight: day.isActive ? 600 : 400, color: day.isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                {DAYS_LABEL[day.dayOfWeek]}
              </span>

              {/* Time inputs */}
              {day.isActive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  <input type="time" value={day.startTime}
                    onChange={e => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 'var(--text-sm)' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>a</span>
                  <input type="time" value={day.endTime}
                    onChange={e => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No disponible</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
