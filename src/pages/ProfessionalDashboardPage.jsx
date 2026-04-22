import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ── Agenda helpers ─────────────────────────────────────── */
const AGENDA_DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const AGENDA_MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmtAgendaFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${AGENDA_DAYS[d.getDay()]} ${d.getDate()} de ${AGENDA_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function isAgendaToday(dateStr) {
  const t = new Date(); t.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00').getTime() === t.getTime();
}

const AGENDA_STATUS_BADGE = { CONFIRMED:'badge-confirmed', PENDING:'badge-pending', CANCELLED:'badge-cancelled', COMPLETED:'badge-confirmed' };
const AGENDA_STATUS_LABEL = { CONFIRMED:'Confirmada', PENDING:'Pendiente', CANCELLED:'Cancelada', COMPLETED:'Completada' };

function AgendaDateNav({ value, onChange }) {
  const today = new Date().toISOString().split('T')[0];
  function shift(days) {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + days);
    onChange(d.toISOString().split('T')[0]);
  }
  return (
    <div className="agenda-date-nav">
      <button className="agenda-nav-arrow" onClick={() => shift(-1)} aria-label="Día anterior">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div className="agenda-date-input-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input type="date" className="agenda-date-input" value={value} onChange={e => onChange(e.target.value)} />
      </div>
      <button className="agenda-nav-arrow" onClick={() => shift(1)} aria-label="Día siguiente">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      {value !== today && (
        <button className="btn btn-secondary btn-sm" onClick={() => onChange(today)}>Hoy</button>
      )}
    </div>
  );
}

function AgendaStatCard({ num, label, color, icon }) {
  return (
    <div className="agenda-stat-card" style={{ borderTopColor: color }}>
      <div className="agenda-stat-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <p className="agenda-stat-num" style={{ color }}>{num}</p>
      <p className="agenda-stat-label">{label}</p>
    </div>
  );
}

function ProTimelineRow({ b }) {
  const statusColor = { CONFIRMED:'var(--success)', PENDING:'var(--warning)', CANCELLED:'var(--text-subtle)', COMPLETED:'var(--text-muted)' }[b.status] ?? 'var(--text-subtle)';
  return (
    <div className={`agenda-timeline-row${b.status === 'CANCELLED' ? ' cancelled' : ''}`}>
      <div className="agenda-time-col">
        <div className="agenda-time-dot" style={{ background: statusColor, boxShadow: b.status !== 'CANCELLED' ? `0 0 8px ${statusColor}` : 'none' }} />
        <span className="agenda-time-label">{b.startTime}</span>
        {b.endTime && <span className="agenda-time-end">{b.endTime}</span>}
      </div>
      <div className="agenda-vline" style={{ borderLeftColor: b.status === 'CANCELLED' ? 'var(--border)' : statusColor + '40' }} />
      <div className="agenda-row-card">
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'var(--sp-3)', flexWrap:'wrap', marginBottom:'var(--sp-3)' }}>
          <div>
            <p className="agenda-row-service">{b.service?.name ?? '—'}</p>
            <div className="agenda-row-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {b.startTime}{b.endTime ? `–${b.endTime}` : ''}
              {b.service?.duration && <><span className="agenda-meta-sep">·</span>{b.service.duration} min</>}
            </div>
          </div>
          <span className={`badge ${AGENDA_STATUS_BADGE[b.status] ?? 'badge-pending'}`}>
            {AGENDA_STATUS_LABEL[b.status] ?? b.status}
          </span>
        </div>
        <div className="agenda-client-row">
          <div className="agenda-client-avatar">{b.client?.name?.[0]?.toUpperCase() ?? '?'}</div>
          <div>
            <p className="agenda-client-name">{b.client?.name ?? 'Cliente'}</p>
            <p className="agenda-client-email">{b.client?.email ?? ''}</p>
            {b.client?.phone && <p className="agenda-client-email">{b.client.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinCodeForm({ joinCode, setJoinCode, onSend, loading, error }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
      <input
        type="text"
        value={joinCode}
        onChange={e => setJoinCode(e.target.value.toUpperCase())}
        maxLength={6}
        placeholder="Ej. AB3X9K"
        style={{
          flex: 1, minWidth: 140,
          padding: '8px 12px',
          borderRadius: 'var(--r-md)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          background: 'var(--surface)',
          color: 'var(--text)',
          letterSpacing: '0.15em',
          fontWeight: 700,
          fontSize: 'var(--text-sm)',
        }}
      />
      <button
        onClick={onSend}
        disabled={loading || !joinCode.trim()}
        className="btn btn-primary"
        style={{ background: 'var(--violet)', padding: '8px 20px', flexShrink: 0 }}
      >
        {loading ? 'Enviando…' : 'Enviar solicitud'}
      </button>
      {error && <p style={{ width: '100%', fontSize: 'var(--text-xs)', color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

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
          {booking.client?.name ?? 'Cliente'}{booking.client?.phone ? ` · ${booking.client.phone}` : ''}
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
  dayOfWeek: d, startTime: '09:00', endTime: '18:00', isActive: false, isOverride: false,
}));

function getWeekStart(offset = 0) {
  const d = new Date();
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff + offset * 7);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function fmtWeekRange(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const mon = new Date(y, m-1, d);
  const sun = new Date(y, m-1, d+6);
  const fmt = (dt) => dt.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export default function ProfessionalDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [proRevenue, setProRevenue] = useState(null);
  const [joinRequest, setJoinRequest] = useState(undefined); // undefined = loading
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');
  const [joinCodeLoading, setJoinCodeLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Services
  const [bizServices, setBizServices]   = useState([]);
  const [myServiceIds, setMyServiceIds] = useState(new Set());
  const [savingServices, setSavingServices] = useState(false);
  const [serviceMsg, setServiceMsg]     = useState('');

  // Duration configs per service
  const [durationConfigs, setDurationConfigs] = useState({}); // { serviceId: customDuration }
  const [savingDurations, setSavingDurations]  = useState(false);
  const [durationMsg, setDurationMsg]          = useState('');

  // Buffer time
  const [bufferTime, setBufferTime]       = useState(0);
  const [savingBuffer, setSavingBuffer]   = useState(false);
  const [bufferMsg, setBufferMsg]         = useState('');

  // Profile tab
  const [profileForm, setProfileForm]   = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]     = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  // Password change
  const [pwForm, setPwForm]             = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving]         = useState(false);
  const [pwMsg, setPwMsg]               = useState('');
  // Unlink business
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  // Gallery
  const [photos, setPhotos] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const galleryInputRef = useRef(null);

  // Home service tab
  const [homeConfig, setHomeConfig] = useState(null);
  const [homeConfigSaving, setHomeConfigSaving] = useState(false);
  const [homeConfigMsg, setHomeConfigMsg] = useState('');
  const [homeServices, setHomeServices] = useState([]);
  const [homeServicesLoaded, setHomeServicesLoaded] = useState(false);
  const [homeServiceForm, setHomeServiceForm] = useState(null); // null | {} | { id, ...existing }
  const [homeServiceSaving, setHomeServiceSaving] = useState(false);
  const [homeServiceMsg, setHomeServiceMsg] = useState('');
  const [homeSchedule, setHomeSchedule] = useState([0,1,2,3,4,5,6].map(d => ({
    dayOfWeek: d, startTime: '09:00', endTime: '18:00', isActive: false,
  })));
  const [homeScheduleSaving, setHomeScheduleSaving] = useState(false);
  const [homeScheduleMsg, setHomeScheduleMsg] = useState('');

  // Agenda tab
  const [agendaDate, setAgendaDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Schedule
  const [weekOffset, setWeekOffset]     = useState(0);
  const [weekStart, setWeekStartState]  = useState(() => getWeekStart(0));
  const [schedule, setSchedule]         = useState(DEFAULT_SCHEDULE);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMsg, setScheduleMsg]   = useState('');

  useEffect(() => {
    api.getProMe()
      .then(data => {
        setProfile(data);
        setBufferTime(data?.bufferTime ?? 0);
        setProfileForm({ name: data?.name || '', bio: data?.bio || '', phone: data?.phone || '', specialty: data?.specialty || '', experience: data?.experience || '' });
        api.getProPhotos().then(p => setPhotos(Array.isArray(p) ? p : [])).catch(() => {});
        if (data?.businessId) {
          api.getBusinessServices(data.businessId)
            .then(s => setBizServices(Array.isArray(s) ? s : []))
            .catch(() => {});
          api.getProRevenue()
            .then(r => setProRevenue(r))
            .catch(() => {});
        } else {
          api.getMyJoinRequest()
            .then(r => setJoinRequest(r))
            .catch(() => setJoinRequest(null));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    api.getProServiceConfigs()
      .then(cfgs => {
        const map = {};
        (Array.isArray(cfgs) ? cfgs : []).forEach(c => { map[c.serviceId] = c.customDuration ?? ''; });
        setDurationConfigs(map);
      })
      .catch(() => {});

    api.getProBookings()
      .then(data => setBookings(Array.isArray(data) ? data : data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));

    api.getProServices()
      .then(s => setMyServiceIds(new Set((Array.isArray(s) ? s : []).map(x => x.id))))
      .catch(() => {});

  }, []);

  // Reload schedule when week changes
  useEffect(() => {
    const ws = getWeekStart(weekOffset);
    setWeekStartState(ws);
    api.getWeekSchedule(ws)
      .then(rows => {
        if (Array.isArray(rows)) setSchedule(rows.map(r => ({ ...r })));
      })
      .catch(() => {});
  }, [weekOffset]);

  useEffect(() => {
    if (activeTab !== 'domicilio' || homeServicesLoaded) return;
    Promise.all([
      api.getHomeConfig().catch(() => null),
      api.getMyHomeServices().catch(() => []),
      api.getMyHomeSchedule().catch(() => []),
    ]).then(([cfg, svcs, sched]) => {
      if (cfg) setHomeConfig(cfg);
      setHomeServices(Array.isArray(svcs) ? svcs : []);
      if (Array.isArray(sched) && sched.length > 0) {
        setHomeSchedule(prev => prev.map(row => {
          const found = sched.find(s => s.dayOfWeek === row.dayOfWeek);
          return found ? { ...found } : row;
        }));
      }
      setHomeServicesLoaded(true);
    });
  }, [activeTab, homeServicesLoaded]);

  async function saveHomeConfig() {
    setHomeConfigSaving(true); setHomeConfigMsg('');
    try {
      const updated = await api.updateHomeConfig(homeConfig);
      setHomeConfig(updated);
      setHomeConfigMsg('Guardado');
    } catch { setHomeConfigMsg('Error al guardar'); }
    finally { setHomeConfigSaving(false); setTimeout(() => setHomeConfigMsg(''), 2500); }
  }

  async function saveHomeService(e) {
    e.preventDefault();
    setHomeServiceSaving(true); setHomeServiceMsg('');
    try {
      if (homeServiceForm.id) {
        const updated = await api.updateHomeService(homeServiceForm.id, homeServiceForm);
        setHomeServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await api.createHomeService(homeServiceForm);
        setHomeServices(prev => [...prev, created]);
      }
      setHomeServiceForm(null);
      setHomeServiceMsg('Guardado');
    } catch (err) { setHomeServiceMsg(err.message); }
    finally { setHomeServiceSaving(false); setTimeout(() => setHomeServiceMsg(''), 3000); }
  }

  async function deleteHomeService(id) {
    try {
      await api.deleteHomeService(id);
      setHomeServices(prev => prev.filter(s => s.id !== id));
    } catch {}
  }

  async function saveHomeSchedule() {
    setHomeScheduleSaving(true); setHomeScheduleMsg('');
    try {
      const updated = await api.setMyHomeSchedule(homeSchedule);
      if (Array.isArray(updated)) setHomeSchedule(prev => prev.map(row => {
        const found = updated.find(s => s.dayOfWeek === row.dayOfWeek);
        return found ? { ...found } : row;
      }));
      setHomeScheduleMsg('Guardado');
    } catch { setHomeScheduleMsg('Error al guardar'); }
    finally { setHomeScheduleSaving(false); setTimeout(() => setHomeScheduleMsg(''), 2500); }
  }

  async function sendJoinRequest() {
    if (!joinCode.trim()) return;
    setJoinCodeLoading(true); setJoinCodeError('');
    try {
      const result = await api.submitJoinRequest(joinCode);
      setJoinRequest(result);
      setJoinCode('');
    } catch (err) {
      setJoinCodeError(err.message);
    } finally {
      setJoinCodeLoading(false);
    }
  }

  async function saveServices() {
    setSavingServices(true); setServiceMsg('');
    try {
      await api.setProServices([...myServiceIds]);
      setServiceMsg('Guardado');
    } catch { setServiceMsg('Error al guardar'); }
    finally { setSavingServices(false); setTimeout(() => setServiceMsg(''), 2500); }
  }

  async function saveDurations() {
    setSavingDurations(true); setDurationMsg('');
    try {
      const configs = Object.entries(durationConfigs)
        .filter(([, v]) => myServiceIds.has /* only configured services */ || true)
        .map(([serviceId, customDuration]) => ({
          serviceId,
          customDuration: customDuration !== '' ? Number(customDuration) : null,
        }))
        .filter(c => c.customDuration === null || (c.customDuration > 0));
      await api.saveProServiceConfigs(configs);
      setDurationMsg('Guardado');
    } catch { setDurationMsg('Error al guardar'); }
    finally { setSavingDurations(false); setTimeout(() => setDurationMsg(''), 2500); }
  }

  async function saveBuffer() {
    setSavingBuffer(true); setBufferMsg('');
    try {
      await api.updateProBuffer(bufferTime);
      setBufferMsg('Guardado');
    } catch { setBufferMsg('Error al guardar'); }
    finally { setSavingBuffer(false); setTimeout(() => setBufferMsg(''), 2500); }
  }

  async function saveSchedule() {
    setSavingSchedule(true); setScheduleMsg('');
    try {
      await api.setWeekSchedule(weekStart, schedule);
      setScheduleMsg('Guardado');
      // mark all as override
      setSchedule(s => s.map(d => ({ ...d, isOverride: true })));
    } catch { setScheduleMsg('Error al guardar'); }
    finally { setSavingSchedule(false); setTimeout(() => setScheduleMsg(''), 2500); }
  }

  async function resetWeek() {
    try {
      await api.deleteWeekSchedule(weekStart);
      // reload recurring fallback
      const rows = await api.getWeekSchedule(weekStart);
      if (Array.isArray(rows)) setSchedule(rows.map(r => ({ ...r })));
      setScheduleMsg('Semana restablecida');
      setTimeout(() => setScheduleMsg(''), 2500);
    } catch { setScheduleMsg('Error al restablecer'); }
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

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const updated = await api.updateProProfile(profileForm);
      setProfile(prev => ({ ...prev, ...updated }));
      setProfileMsg('✓ Perfil actualizado');
    } catch (err) { setProfileMsg('Error: ' + err.message); }
    finally { setProfileSaving(false); setTimeout(() => setProfileMsg(''), 3000); }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await api.uploadProAvatar(file);
      if (res.error) throw new Error(res.error);
      setProfile(prev => ({ ...prev, avatarUrl: res.url }));
    } catch (err) { setProfileMsg('Error al subir avatar: ' + err.message); }
    finally { setAvatarUploading(false); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setPwMsg('Las contraseñas no coinciden');
    if (pwForm.newPassword.length < 8) return setPwMsg('La nueva contraseña debe tener al menos 8 caracteres');
    setPwSaving(true);
    setPwMsg('');
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('✓ Contraseña actualizada');
    } catch (err) { setPwMsg('Error: ' + err.message); }
    finally { setPwSaving(false); setTimeout(() => setPwMsg(''), 4000); }
  }

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoUploading(true);
    setPhotoMsg('');
    try {
      for (const file of files) {
        const res = await api.uploadProPhoto(file, '');
        if (res.error) throw new Error(res.error);
        setPhotos(prev => [res, ...prev]);
      }
      setPhotoMsg('✓ Fotos subidas');
    } catch (err) { setPhotoMsg('Error: ' + err.message); }
    finally { setPhotoUploading(false); e.target.value = ''; setTimeout(() => setPhotoMsg(''), 3000); }
  }

  async function handleDeletePhoto(id) {
    try {
      await api.deleteProPhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) { setPhotoMsg('Error al eliminar: ' + err.message); }
  }

  async function handleUnlink() {
    setUnlinkLoading(true);
    try {
      await api.unlinkFromBusiness();
      setProfile(prev => ({ ...prev, businessId: null, business: null }));
      setUnlinkConfirm(false);
    } catch (err) { setProfileMsg('Error: ' + err.message); }
    finally { setUnlinkLoading(false); }
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
      <div className="pro-welcome-header" style={{
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
            background: profile?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--violet) 0%, #9b59f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 28, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(124,92,252,0.3)',
            overflow: 'hidden',
          }}>
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.name?.[0]?.toUpperCase() ?? 'P')
            }
          </div>

          <div style={{ flex: 1 }}>
            {loadingProfile ? (
              <>
                <div className="pro-skeleton-line" style={{ height: 22, width: 200, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 8 }} />
                <div className="pro-skeleton-line" style={{ height: 14, width: 140, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
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

          <Link to={pro.id ? `/professionals/${pro.id}` : '#'} style={{
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
            background: 'var(--surface-3)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
            lineHeight: 1.6, fontStyle: 'italic',
          }}>
            "{pro.bio}"
          </p>
        )}
      </div>

      {/* ── Tab navigation ── */}
      <div style={{ display: 'flex', gap: 'var(--sp-1)', marginBottom: 'var(--sp-5)', borderBottom: '1px solid var(--border)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {[{ key: 'dashboard', label: 'Dashboard' }, { key: 'agenda', label: 'Agenda' }, { key: 'domicilio', label: 'A domicilio' }, { key: 'perfil', label: 'Perfil & Seguridad' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: 'var(--sp-2) var(--sp-3)', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: activeTab === t.key ? '2px solid var(--violet)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard tab ── */}
      {activeTab === 'dashboard' && (<>

      {/* ── Join request banner (only when not linked to a business) ── */}
      {!loadingProfile && !pro.businessId && (
        <div style={{
          marginBottom: 'var(--sp-6)',
          padding: 'var(--sp-5)',
          borderRadius: 'var(--r-xl)',
          border: `1px solid ${
            joinRequest?.status === 'APPROVED' ? 'rgba(34,197,94,0.4)' :
            joinRequest?.status === 'REJECTED' ? 'rgba(239,68,68,0.4)' :
            joinRequest?.status === 'PENDING'  ? 'rgba(255,184,0,0.4)' :
            'var(--border)'
          }`,
          background: joinRequest?.status === 'APPROVED' ? 'rgba(34,197,94,0.06)' :
                      joinRequest?.status === 'REJECTED' ? 'rgba(239,68,68,0.06)' :
                      joinRequest?.status === 'PENDING'  ? 'rgba(255,184,0,0.06)' :
                      'var(--surface-raised)',
        }}>
          {joinRequest?.status === 'PENDING' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                <span style={{ fontSize: 20 }}>⏳</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 'var(--text-sm)' }}>Solicitud pendiente</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Enviaste una solicitud a <strong>{joinRequest.business?.name}</strong>. Espera a que el dueño la apruebe.
                  </p>
                </div>
              </div>
            </>
          )}

          {joinRequest?.status === 'APPROVED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: 'var(--text-sm)' }}>Aprobado — recarga la página</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Fuiste aceptado en <strong>{joinRequest.business?.name}</strong>.
                </p>
              </div>
            </div>
          )}

          {joinRequest?.status === 'REJECTED' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                <span style={{ fontSize: 20 }}>❌</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Solicitud rechazada</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Tu solicitud para <strong>{joinRequest.business?.name}</strong> fue rechazada. Puedes intentar con otro código.
                  </p>
                </div>
              </div>
              <JoinCodeForm joinCode={joinCode} setJoinCode={setJoinCode} onSend={sendJoinRequest} loading={joinCodeLoading} error={joinCodeError} />
            </>
          )}

          {!joinRequest && (
            <>
              <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-2)' }}>
                No estás vinculado a ningún negocio
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                Ingresa el código de 6 caracteres que te dio el dueño del negocio.
              </p>
              <JoinCodeForm joinCode={joinCode} setJoinCode={setJoinCode} onSend={sendJoinRequest} loading={joinCodeLoading} error={joinCodeError} />
            </>
          )}
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-6)',
      }}>
        {[
          {
            label: 'Citas hoy', value: todayBookings.length, color: 'var(--violet)',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
          },
          {
            label: 'Próximas', value: upcomingBookings.length, color: 'var(--gold)',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
          {
            label: 'Confirmadas', value: confirmedTotal, color: 'var(--success)',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
          },
          {
            label: 'Pendientes', value: pendingTotal, color: 'var(--warning)',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
          },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderRadius: 'var(--r-xl)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ color: stat.color, marginBottom: 'var(--sp-3)' }}>{stat.icon}</div>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: stat.color, margin: '0 0 4px', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {loadingBookings ? '—' : stat.value}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="pro-dash-body">

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

      {/* ── Mis ingresos (si el negocio lo permite) ── */}
      {proRevenue && pro.businessId && (
        <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: '0 0 var(--sp-4)' }}>Mis ingresos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { label: 'Hoy',         val: proRevenue.day   },
              { label: 'Esta semana', val: proRevenue.week  },
              { label: 'Este mes',    val: proRevenue.month },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold)' }}>
                  ${val.toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mis Servicios (solo si está vinculado) ── */}
      {pro.businessId &&
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

      }

      {/* ── Duración por servicio + buffer (solo si está vinculado) ── */}
      {pro.businessId && bizServices.length > 0 &&
      <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>

        {/* Duración por servicio */}
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Duración real por servicio</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
                Cuánto tardas tú realmente. Si lo dejas vacío, se usa la duración base del negocio.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              {durationMsg && <span style={{ fontSize: 'var(--text-xs)', color: durationMsg === 'Guardado' ? 'var(--green)' : 'var(--red)' }}>{durationMsg}</span>}
              <button className="btn btn-primary" onClick={saveDurations} disabled={savingDurations} style={{ background: 'var(--violet)', padding: '6px 16px' }}>
                {savingDurations ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {bizServices.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
                padding: 'var(--sp-3) var(--sp-4)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{s.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Base del negocio: <strong>{s.duration} min</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    placeholder={String(s.duration)}
                    value={durationConfigs[s.id] ?? ''}
                    onChange={e => setDurationConfigs(prev => ({ ...prev, [s.id]: e.target.value }))}
                    style={{
                      width: 80, padding: '5px 8px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)', background: 'var(--surface-raised)',
                      color: 'var(--text)', fontSize: 'var(--text-sm)', textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buffer entre citas */}
        <div style={{ paddingTop: 'var(--sp-5)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Tiempo entre citas</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3, maxWidth: 380 }}>
                Minutos de pausa entre una cita y la siguiente. Ese tiempo se bloquea en la agenda para que no te queden citas seguidas sin margen.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexShrink: 0 }}>
              {bufferMsg && <span style={{ fontSize: 'var(--text-xs)', color: bufferMsg === 'Guardado' ? 'var(--green)' : 'var(--red)' }}>{bufferMsg}</span>}
              <button className="btn btn-primary" onClick={saveBuffer} disabled={savingBuffer} style={{ background: 'var(--violet)', padding: '6px 16px' }}>
                {savingBuffer ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
            {[0, 5, 10, 15, 20, 30].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBufferTime(val)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${bufferTime === val ? 'var(--violet)' : 'var(--border)'}`,
                  background: bufferTime === val ? 'var(--violet-subtle)' : 'var(--surface)',
                  color: bufferTime === val ? 'var(--violet)' : 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: bufferTime === val ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all .12s',
                }}
              >
                {val === 0 ? 'Sin pausa' : `${val} min`}
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginLeft: 'auto' }}>
              <input
                type="number"
                min="0"
                max="120"
                value={bufferTime}
                onChange={e => setBufferTime(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: 70, padding: '5px 8px', borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface-raised)',
                  color: 'var(--text)', fontSize: 'var(--text-sm)', textAlign: 'right',
                }}
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>min</span>
            </div>
          </div>
        </div>
      </div>
      }

      {/* ── Mi Disponibilidad (solo si está vinculado) ── */}
      {pro.businessId &&
      <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Mi disponibilidad</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
                Horarios específicos por semana. Si no hay override, se usa el horario recurrente.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              {scheduleMsg && <span style={{ fontSize: 'var(--text-xs)', color: scheduleMsg.includes('Error') ? 'var(--red)' : 'var(--green)' }}>{scheduleMsg}</span>}
              <button className="btn btn-ghost" onClick={resetWeek} style={{ padding: '5px 12px', fontSize: 'var(--text-xs)' }}>Usar recurrente</button>
              <button className="btn btn-primary" onClick={saveSchedule} disabled={savingSchedule} style={{ background: 'var(--violet)', padding: '6px 16px' }}>
                {savingSchedule ? 'Guardando…' : 'Guardar semana'}
              </button>
            </div>
          </div>

          {/* Week navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-2) var(--sp-3)', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', width: 'fit-content' }}>
            <button type="button" onClick={() => setWeekOffset(o => o - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', minWidth: 160, textAlign: 'center' }}>
              {weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : weekOffset === -1 ? 'Semana pasada' : fmtWeekRange(weekStart)}
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>{fmtWeekRange(weekStart)}</span>
            </span>
            <button type="button" onClick={() => setWeekOffset(o => o + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
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

              {/* Day name + override badge */}
              <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: day.isActive ? 600 : 400, color: day.isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                  {DAYS_LABEL[day.dayOfWeek]}
                </span>
                {day.isOverride && (
                  <span style={{ fontSize: 10, color: 'var(--violet)', fontWeight: 600 }}>personalizado</span>
                )}
              </div>

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
      }

      </>)} {/* end dashboard tab */}

      {/* ── Agenda tab ── */}
      {activeTab === 'agenda' && (() => {
        const agendaBookings = [...bookings]
          .filter(b => b.date?.startsWith(agendaDate))
          .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
        const aPending   = agendaBookings.filter(b => b.status === 'PENDING');
        const aConfirmed = agendaBookings.filter(b => b.status === 'CONFIRMED');
        const aCancelled = agendaBookings.filter(b => b.status === 'CANCELLED');
        return (
          <div className="pro-agenda">
            {/* Header */}
            <div className="agenda-header">
              <div>
                <p className="section-label">Panel profesional</p>
                <h2 className="page-title">Agenda</h2>
                <p className="page-subtitle" style={{ textTransform:'capitalize' }}>
                  {agendaDate ? fmtAgendaFull(agendaDate) : 'Selecciona una fecha'}
                </p>
              </div>
              {isAgendaToday(agendaDate) && (
                <div className="agenda-today-pill">
                  <span className="agenda-today-dot" />
                  Hoy
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="agenda-controls">
              <AgendaDateNav value={agendaDate} onChange={setAgendaDate} />
            </div>

            {/* Stats */}
            {!loadingBookings && agendaBookings.length > 0 && (
              <div className="agenda-stats-row">
                <AgendaStatCard num={agendaBookings.length} label="Total" color="var(--text-muted)"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                />
                <AgendaStatCard num={aPending.length} label="Pendientes" color="var(--warning)"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <AgendaStatCard num={aConfirmed.length} label="Confirmadas" color="var(--success)"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                />
                {aCancelled.length > 0 && (
                  <AgendaStatCard num={aCancelled.length} label="Canceladas" color="var(--text-subtle)"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  />
                )}
              </div>
            )}

            {/* Loading */}
            {loadingBookings && (
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

            {/* Empty */}
            {!loadingBookings && agendaBookings.length === 0 && (
              <div className="empty-state" style={{ marginTop:'var(--sp-6)' }}>
                <div className="empty-state-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text)', marginBottom:'var(--sp-2)' }}>
                  Sin citas para esta fecha
                </p>
                <p style={{ fontSize:'var(--text-sm)' }}>Tus reservas aparecerán aquí cuando las tengas.</p>
              </div>
            )}

            {/* Timeline */}
            {!loadingBookings && agendaBookings.length > 0 && (
              <div className="agenda-timeline">
                {agendaBookings.map(b => <ProTimelineRow key={b.id} b={b} />)}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── A domicilio tab ── */}
      {activeTab === 'domicilio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

          {/* Toggle home service */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              Configuración de servicios a domicilio
            </h3>
            {!homeConfig ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Cargando…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={homeConfig.offersHomeService ?? false}
                    onChange={e => setHomeConfig(c => ({ ...c, offersHomeService: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                    Ofrecer servicios a domicilio
                  </span>
                </label>

                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Ciudades que cubro (separadas por coma)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={(homeConfig.homeServiceArea?.cities ?? []).join(', ')}
                    onChange={e => {
                      const cities = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setHomeConfig(c => ({ ...c, homeServiceArea: { ...(c.homeServiceArea ?? {}), cities } }));
                    }}
                    placeholder="Ej: Medellín, Bello, Itagüí"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Nota para clientes (opcional)
                  </label>
                  <textarea
                    className="input"
                    value={homeConfig.homeServiceNotes ?? ''}
                    onChange={e => setHomeConfig(c => ({ ...c, homeServiceNotes: e.target.value }))}
                    rows={2}
                    placeholder="Ej: Atiendo con cita previa. Incluye materiales."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <button className="btn btn-primary" onClick={saveHomeConfig} disabled={homeConfigSaving} style={{ background: 'var(--violet)' }}>
                    {homeConfigSaving ? 'Guardando…' : 'Guardar configuración'}
                  </button>
                  {homeConfigMsg && <span style={{ fontSize: 'var(--text-sm)', color: homeConfigMsg.startsWith('Error') ? 'var(--red)' : 'var(--success)' }}>{homeConfigMsg}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Home services catalog */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Servicios a domicilio</h3>
              {!homeServiceForm && (
                <button className="btn btn-secondary btn-sm" onClick={() => setHomeServiceForm({ name: '', description: '', duration: 60, price: '', surcharge: '' })}>
                  + Nuevo servicio
                </button>
              )}
            </div>

            {homeServiceForm && (
              <form onSubmit={saveHomeService} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)', padding: 'var(--sp-4)', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0, color: 'var(--text)' }}>
                  {homeServiceForm.id ? 'Editar servicio' : 'Nuevo servicio a domicilio'}
                </p>
                {[
                  { key: 'name', label: 'Nombre', type: 'text', required: true },
                  { key: 'description', label: 'Descripción (opcional)', type: 'text' },
                  { key: 'duration', label: 'Duración (min)', type: 'number', required: true },
                  { key: 'price', label: 'Precio base ($)', type: 'number', required: true },
                  { key: 'surcharge', label: 'Recargo domicilio ($, opcional)', type: 'number' },
                ].map(({ key, label, type, required }) => (
                  <div key={key}>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>{label}</label>
                    <input
                      type={type} required={!!required} className="input"
                      value={homeServiceForm[key] ?? ''}
                      onChange={e => setHomeServiceForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="submit" className="btn btn-primary" disabled={homeServiceSaving} style={{ background: 'var(--violet)' }}>
                    {homeServiceSaving ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setHomeServiceForm(null)}>Cancelar</button>
                  {homeServiceMsg && <span style={{ fontSize: 'var(--text-sm)', color: homeServiceMsg.startsWith('Error') || homeServiceMsg === 'Error al guardar' ? 'var(--red)' : 'var(--success)' }}>{homeServiceMsg}</span>}
                </div>
              </form>
            )}

            {homeServices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Aún no tienes servicios a domicilio.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {homeServices.map(svc => (
                  <div key={svc.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                    padding: 'var(--sp-3) var(--sp-4)', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{svc.name}</p>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {svc.duration} min · ${Number(svc.price).toLocaleString('es-CO')}
                        {svc.surcharge && Number(svc.surcharge) > 0 && ` + $${Number(svc.surcharge).toLocaleString('es-CO')} domicilio`}
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--r-full)', background: svc.isActive ? 'rgba(34,197,94,.1)' : 'rgba(100,100,120,.1)', color: svc.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                      {svc.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setHomeServiceForm({ ...svc, price: String(svc.price), surcharge: String(svc.surcharge ?? '') })}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red)' }}
                      onClick={() => deleteHomeService(svc.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Home schedule */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              Horario para servicios a domicilio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {homeSchedule.map((day, i) => (
                <div key={day.dayOfWeek} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', minWidth: 120, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={e => setHomeSchedule(prev => prev.map((d, j) => j === i ? { ...d, isActive: e.target.checked } : d))}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: day.isActive ? 600 : 400, color: day.isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                      {DAYS_LABEL[day.dayOfWeek]}
                    </span>
                  </label>
                  {day.isActive && (
                    <>
                      <input
                        type="time" className="input"
                        value={day.startTime}
                        onChange={e => setHomeSchedule(prev => prev.map((d, j) => j === i ? { ...d, startTime: e.target.value } : d))}
                        style={{ width: 110 }}
                      />
                      <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>–</span>
                      <input
                        type="time" className="input"
                        value={day.endTime}
                        onChange={e => setHomeSchedule(prev => prev.map((d, j) => j === i ? { ...d, endTime: e.target.value } : d))}
                        style={{ width: 110 }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
              <button className="btn btn-primary" onClick={saveHomeSchedule} disabled={homeScheduleSaving} style={{ background: 'var(--violet)' }}>
                {homeScheduleSaving ? 'Guardando…' : 'Guardar horario'}
              </button>
              {homeScheduleMsg && <span style={{ fontSize: 'var(--text-sm)', color: homeScheduleMsg.startsWith('Error') ? 'var(--red)' : 'var(--success)' }}>{homeScheduleMsg}</span>}
            </div>
          </div>

        </div>
      )}

      {/* ── Perfil tab ── */}
      {activeTab === 'perfil' && profileForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

          {/* Sección Perfil */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              Información personal
            </h3>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                background: profile?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--violet) 0%, #9b59f7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 26, color: '#fff',
                overflow: 'hidden', boxShadow: '0 0 0 3px rgba(124,92,252,0.3)',
              }}>
                {profile?.avatarUrl
                  ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user?.name?.[0]?.toUpperCase() ?? 'P')
                }
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>Foto de perfil</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>JPG, PNG o WebP · máx. 3 MB</p>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                <button className="btn btn-secondary btn-sm" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                  {avatarUploading ? 'Subiendo…' : 'Cambiar foto'}
                </button>
              </div>
            </div>

            <form onSubmit={saveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
              {[
                { key: 'name', label: 'Nombre completo', required: true },
                { key: 'phone', label: 'Teléfono' },
                { key: 'specialty', label: 'Especialidad' },
                { key: 'experience', label: 'Experiencia' },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    className="input"
                    value={profileForm[key] ?? ''}
                    onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Biografía</label>
                <textarea
                  className="input"
                  value={profileForm.bio ?? ''}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <button className="btn btn-primary" type="submit" style={{ background: 'var(--violet)' }} disabled={profileSaving}>
                  {profileSaving ? 'Guardando…' : 'Guardar cambios'}
                </button>
                {profileMsg && (
                  <span style={{ fontSize: 'var(--text-sm)', color: profileMsg.startsWith('✓') ? 'var(--success)' : 'var(--red)' }}>
                    {profileMsg}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Sección Galería */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Galería de trabajo</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  Muestra tu trabajo · {photos.length} foto{photos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                {photoMsg && <span style={{ fontSize: 'var(--text-xs)', color: photoMsg.startsWith('✓') ? 'var(--success)' : 'var(--red)' }}>{photoMsg}</span>}
                <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={photoUploading}
                  style={{ background: 'var(--violet-subtle)', color: 'var(--violet)', borderColor: 'rgba(124,92,252,0.3)' }}
                >
                  {photoUploading ? 'Subiendo…' : '+ Añadir fotos'}
                </button>
              </div>
            </div>

            {photos.length === 0 ? (
              <div
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 'var(--r-lg)',
                  padding: 'var(--sp-10)', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 'var(--sp-2)' }}>📷</div>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Sube tus primeras fotos</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Haz clic para seleccionar una o varias imágenes
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--sp-3)' }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img
                      src={photo.url}
                      alt="trabajo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.65)', border: 'none',
                        color: '#fff', cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    aspectRatio: '1', borderRadius: 'var(--r-lg)',
                    border: '2px dashed var(--border)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: 'var(--text-xs)', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 24 }}>+</span>
                  Añadir
                </div>
              </div>
            )}
          </div>

          {/* Sección Seguridad */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              Seguridad
            </h3>
            <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', maxWidth: 400 }}>
              {[
                { key: 'currentPassword', label: 'Contraseña actual' },
                { key: 'newPassword', label: 'Nueva contraseña' },
                { key: 'confirm', label: 'Confirmar nueva contraseña' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    type="password"
                    className="input"
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <button className="btn btn-primary" type="submit" style={{ background: 'var(--violet)' }} disabled={pwSaving}>
                  {pwSaving ? 'Guardando…' : 'Cambiar contraseña'}
                </button>
                {pwMsg && (
                  <span style={{ fontSize: 'var(--text-sm)', color: pwMsg.startsWith('✓') ? 'var(--success)' : 'var(--red)' }}>
                    {pwMsg}
                  </span>
                )}
              </div>
            </form>

            {/* Desligarse del negocio */}
            {profile?.businessId && (
              <div style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-5)', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                  Desligarse del negocio
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                  Estás vinculado a <strong>{profile.business?.name}</strong>. Al desligarte perderás el acceso a sus servicios y agenda.
                </p>
                {!unlinkConfirm ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}
                    onClick={() => setUnlinkConfirm(true)}
                  >
                    Desligarme del negocio
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--red)', fontWeight: 600 }}>¿Confirmar?</p>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                      onClick={handleUnlink}
                      disabled={unlinkLoading}
                    >
                      {unlinkLoading ? 'Procesando…' : 'Sí, desligarme'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setUnlinkConfirm(false)}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
