import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ── Helpers ─────────────────────────────────────────────── */
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const WEEKDAYS  = ['L','M','X','J','V','S','D'];

function formatLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS_ES[d.getDay()]}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ── Mini calendar (same as BookingPage) ─────────────────── */
function MiniCalendar({ value, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));

  function prevMonth() { setView(v => { const d = new Date(v.year, v.month-1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); }
  function nextMonth() { setView(v => { const d = new Date(v.year, v.month+1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); }

  const firstDay = new Date(view.year, view.month, 1);
  let startOffset = firstDay.getDay() - 1; if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(view.year, view.month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function selectDay(day) {
    if (!day) return;
    const d = new Date(view.year, view.month, day); d.setHours(0,0,0,0);
    if (d < today) return;
    onChange(`${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
  }

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <div className="mini-cal">
      <div className="mini-cal-nav">
        <button className="mini-cal-arrow" onClick={prevMonth} aria-label="Mes anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="mini-cal-month">{monthLabel}</span>
        <button className="mini-cal-arrow" onClick={nextMonth} aria-label="Mes siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="mini-cal-grid">
        {WEEKDAYS.map(d => <div key={d} className="mini-cal-wday">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const date = new Date(view.year, view.month, day); date.setHours(0,0,0,0);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSel = selected && date.getTime() === selected.getTime();
          return (
            <button key={day}
              className={`mini-cal-day${isPast?' past':''}${isToday?' today':''}${isSel?' selected':''}`}
              onClick={() => selectDay(day)} disabled={isPast}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Steps ───────────────────────────────────────────────── */
function Steps({ step }) {
  const steps = ['Servicio','Fecha','Dirección','Confirmar'];
  return (
    <div className="booking-steps">
      {steps.map((s, i) => {
        const done = i+1 < step, active = i+1 === step;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div className={`booking-step${done?' done':''}${active?' active':''}`}>
              <span className="booking-step-num">
                {done
                  ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : i+1}
              </span>
              {s}
            </div>
            {i < steps.length-1 && <div className="booking-step-line" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Avatar palette ──────────────────────────────────────── */
const PALETTES = [
  {bg:'linear-gradient(135deg,#D4A853,#A8833F)',color:'#0A0808'},
  {bg:'linear-gradient(135deg,#7C5CFC,#5B3FD9)',color:'#fff'},
  {bg:'linear-gradient(135deg,#00D4C8,#008F8B)',color:'#0A0808'},
  {bg:'linear-gradient(135deg,#22C55E,#15803D)',color:'#fff'},
];
function palette(name) { return PALETTES[(name?.charCodeAt(0)??0)%PALETTES.length]; }

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
export default function HomeBookingPage() {
  const { professionalId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prof, setProf]               = useState(null);
  const [homeServices, setHomeServices] = useState([]);
  const [loading, setLoading]           = useState(true);

  // Step 1 — Service
  const [step, setStep]               = useState(1);
  const [selectedService, setService] = useState(null);

  // Step 2 — Date / Slots
  const [date, setDate]               = useState(todayStr());
  const [slots, setSlots]             = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSlot]       = useState(null);

  // Step 3 — Address
  const [city, setCity]               = useState('');
  const [address, setAddress]         = useState('');

  // Submit
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(null);

  /* Load professional + home services */
  useEffect(() => {
    Promise.all([
      api.getProfessional(professionalId),
      api.getProfessionalHomeServices(professionalId),
    ])
      .then(([profData, svcData]) => {
        setProf(profData);
        setHomeServices(svcData);
        if (svcData.length > 0) setService(svcData[0]);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [professionalId, navigate]);

  /* Load slots when service or date changes — no step dep to avoid resetting slot on step advance */
  useEffect(() => {
    if (!selectedService) return;
    setSlotsLoading(true);
    setSlot(null);
    setError('');
    api.getHomeSlots({ professionalId, homeServiceId: selectedService.id, date })
      .then(d => {
        let s = d.slots || [];
        const now = new Date();
        const t = todayStr();
        if (date === t) {
          const nowMins = now.getHours()*60 + now.getMinutes();
          s = s.filter(sl => { const [h,m] = sl.startTime.split(':').map(Number); return h*60+m > nowMins; });
        }
        setSlots(s);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, date, professionalId]);

  async function handleConfirm() {
    setError('');
    if (!city.trim())    return setError('Ingresa tu ciudad');
    if (!address.trim()) return setError('Ingresa tu dirección');
    setSubmitting(true);
    try {
      const booking = await api.createHomeBooking({
        professionalId,
        homeServiceId: selectedService.id,
        date,
        startTime: selectedSlot.startTime,
        clientAddress: address.trim(),
        clientCity: city.trim(),
      });
      setSuccess(booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.code === 'SLOT_CONFLICT') {
        setSlot(null);
        setStep(2);
        setError('Este horario acaba de ser tomado. Por favor elige otro turno.');
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-sm" style={{ paddingTop:'var(--sp-16)', textAlign:'center' }}>
        <p style={{ color:'var(--text-subtle)' }}>Cargando…</p>
      </div>
    );
  }

  /* ── Success ── */
  if (success) {
    return (
      <div className="page-sm">
        <div className="booking-success">
          <div className="booking-success-ring">
            <div className="booking-success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h2 className="booking-success-title">¡Reserva confirmada!</h2>
          <p className="booking-success-sub">
            {prof?.name} llegará a tu domicilio el<br />
            <strong style={{ textTransform:'capitalize' }}>{formatLabel(date)}</strong> a las <strong>{selectedSlot?.startTime}</strong>
          </p>
          <p className="booking-success-note">
            Dirección: {success.clientAddress}
          </p>
          <div className="booking-success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Ver mis reservas
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Explorar más</button>
          </div>
        </div>
      </div>
    );
  }

  const pal = palette(prof?.name);

  return (
    <div className="page-sm booking-page-v2">

      {/* ── Page header ── */}
      <div className="booking-page-header">
        <Link to={`/professionals/${professionalId}`}
          style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:'var(--text-xs)', fontWeight:600, textDecoration:'none', marginBottom:'var(--sp-4)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver al perfil
        </Link>

        {/* Pro identity strip */}
        {prof && (
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-5)' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0, overflow:'hidden',
              background: prof.avatarUrl ? 'transparent' : pal.bg,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {prof.avatarUrl
                ? <img src={prof.avatarUrl} alt={prof.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ color:pal.color, fontFamily:'var(--font-heading)', fontWeight:700, fontSize:18 }}>{prof.name[0].toUpperCase()}</span>
              }
            </div>
            <div>
              <p style={{ margin:0, fontWeight:700, fontSize:'var(--text-sm)', color:'var(--text)' }}>{prof.name}</p>
              <span className="home-service-badge" style={{ marginTop:3, display:'inline-flex' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Servicio a domicilio
              </span>
            </div>
          </div>
        )}

        <p className="section-label">Paso {step} de 4</p>
        <h1 className="page-title">
          {step === 1 && 'Elige el servicio'}
          {step === 2 && 'Elige fecha y hora'}
          {step === 3 && 'Ingresa tu dirección'}
          {step === 4 && 'Confirmar reserva'}
        </h1>
      </div>

      {/* ── Steps indicator ── */}
      <Steps step={step} />

      {/* ══ STEP 1: Service ══════════════════════════════════ */}
      {step === 1 && (
        <div className="booking-body" style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
          {homeServices.length === 0 ? (
            <div className="booking-slots-empty">
              <p>Este profesional no tiene servicios a domicilio activos.</p>
              <Link to={`/professionals/${professionalId}`} className="btn btn-secondary" style={{ marginTop:'var(--sp-4)' }}>Volver al perfil</Link>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                {homeServices.map(svc => (
                  <button key={svc.id} type="button"
                    onClick={() => setService(svc)}
                    className={`booking-section-card${selectedService?.id === svc.id ? ' booking-section-card--active' : ''}`}
                    style={{ textAlign:'left', cursor:'pointer', border: `1px solid ${selectedService?.id === svc.id ? 'var(--gold-border)' : 'var(--border)'}`,
                      background: selectedService?.id === svc.id ? 'var(--gold-subtle)' : 'var(--surface-2)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
                      <div>
                        <p style={{ margin:0, fontWeight:700, fontSize:'var(--text-sm)', color:'var(--text)' }}>{svc.name}</p>
                        {svc.description && <p style={{ margin:'2px 0 0', fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{svc.description}</p>}
                        <p style={{ margin:'4px 0 0', fontSize:'var(--text-xs)', color:'var(--text-subtle)' }}>{svc.duration} min</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, marginLeft:'var(--sp-4)' }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:'var(--text-base)', color:'var(--gold)' }}>
                          ${Number(svc.price).toLocaleString('es-CO')}
                        </p>
                        {svc.surcharge && Number(svc.surcharge) > 0 && (
                          <p style={{ margin:0, fontSize:10, color:'var(--text-subtle)' }}>
                            +${Number(svc.surcharge).toLocaleString('es-CO')} domicilio
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" disabled={!selectedService}
                onClick={() => setStep(2)}>
                Continuar
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* ══ STEP 2: Date + Slots ═════════════════════════════ */}
      {step === 2 && (
        <>
          <div className="booking-body">
            {/* Calendar */}
            <div className="booking-col">
              <div className="booking-section-card">
                <div className="booking-section-head">
                  <div className="booking-section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <p className="booking-section-title">Fecha</p>
                    {date && <p className="booking-section-val" style={{ textTransform:'capitalize' }}>{formatLabel(date)}</p>}
                  </div>
                </div>
                <MiniCalendar value={date} onChange={(d) => { setDate(d); setSlot(null); }} />
              </div>
            </div>

            {/* Slots */}
            <div className="booking-col">
              <div className="booking-section-card booking-section-card--slots">
                <div className="booking-section-head">
                  <div className="booking-section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <p className="booking-section-title">Horario disponible</p>
                    {!slotsLoading && slots.length > 0 && (
                      <p className="booking-section-val">{slots.length} turno{slots.length!==1?'s':''}</p>
                    )}
                  </div>
                </div>

                {slotsLoading && (
                  <div className="slot-grid">
                    {[...Array(6)].map((_,n) => <div key={n} className="skeleton" style={{ height:42, borderRadius:'var(--r-lg)' }} />)}
                  </div>
                )}
                {!slotsLoading && slots.length === 0 && (
                  <div className="booking-slots-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.25">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Sin horarios para esta fecha.</p>
                    <span>Elige otro día en el calendario.</span>
                  </div>
                )}
                {!slotsLoading && slots.length > 0 && (
                  <div className="slot-grid">
                    {slots.map(slot => (
                      <button key={slot.startTime}
                        className={`slot-btn2${selectedSlot?.startTime === slot.startTime ? ' active' : ''}`}
                        onClick={() => setSlot(slot)}>
                        <span className="slot-btn2-time">{slot.startTime}</span>
                        {slot.endTime && <span className="slot-btn2-end">{slot.endTime}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <p className="booking-error">{error}</p>}

          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Volver</button>
            <button className="btn btn-primary" disabled={!selectedSlot} onClick={() => setStep(3)}>
              Continuar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </>
      )}

      {/* ══ STEP 3: Address ══════════════════════════════════ */}
      {step === 3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-5)' }}>
          <div className="booking-section-card">
            <div className="booking-section-head">
              <div className="booking-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <p className="booking-section-title">Dirección de atención</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)', marginTop:'var(--sp-2)' }}>
              <div>
                <label className="input-label">Ciudad</label>
                <input className="input" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Ej: Medellín" />
              </div>
              <div>
                <label className="input-label">Dirección completa</label>
                <input className="input" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Ej: Calle 10 #43-50, Apt 301" />
              </div>
            </div>
          </div>

          {error && <p className="booking-error">{error}</p>}

          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>Volver</button>
            <button className="btn btn-primary" disabled={!city.trim() || !address.trim()}
              onClick={() => { setError(''); setStep(4); }}>
              Continuar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 4: Confirm ══════════════════════════════════ */}
      {step === 4 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
          <div className="booking-section-card">
            <p className="booking-section-title" style={{ marginBottom:'var(--sp-4)' }}>Resumen de la reserva</p>
            {[
              { label: 'Servicio',   val: selectedService?.name },
              { label: 'Duración',   val: `${selectedService?.duration} min` },
              { label: 'Precio',     val: selectedService && `$${Number(selectedService.price).toLocaleString('es-CO')}${selectedService.surcharge && Number(selectedService.surcharge) > 0 ? ` + $${Number(selectedService.surcharge).toLocaleString('es-CO')} domicilio` : ''}` },
              { label: 'Fecha',      val: <span style={{ textTransform:'capitalize' }}>{formatLabel(date)}</span> },
              { label: 'Hora',       val: selectedSlot?.startTime },
              { label: 'Ciudad',     val: city },
              { label: 'Dirección',  val: address },
            ].map(({ label, val }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'var(--sp-2) 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text)', textAlign:'right', maxWidth:'60%' }}>{val}</span>
              </div>
            ))}
          </div>

          {error && <p className="booking-error">{error}</p>}

          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>Volver</button>
            <button className="btn btn-primary" disabled={submitting} onClick={handleConfirm}>
              {submitting ? 'Confirmando…' : 'Confirmar reserva'}
              {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
