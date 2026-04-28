import { useState, useEffect } from 'react';
import api from '../api';

const SOURCES = [
  { value: 'WHATSAPP',  label: 'WhatsApp'   },
  { value: 'CALL',      label: 'Llamada'     },
  { value: 'PRESENCIAL',label: 'Presencial'  },
  { value: 'MANUAL',    label: 'Otro'        },
];

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAYS  = ['L','M','X','J','V','S','D'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function MiniCal({ value, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const sel   = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const prev = () => setView(v => { const d = new Date(v.year, v.month-1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const next = () => setView(v => { const d = new Date(v.year, v.month+1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const first = new Date(view.year, view.month, 1);
  let offset = first.getDay() - 1; if (offset < 0) offset = 6;
  const days  = new Date(view.year, view.month+1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({length:days},(_,i)=>i+1)];
  const pick  = (day) => {
    if (!day) return;
    const d = new Date(view.year, view.month, day); d.setHours(0,0,0,0);
    if (d < today) return;
    onChange(`${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
  };
  const label = new Date(view.year, view.month, 1).toLocaleDateString('es-CO', { month:'long', year:'numeric' });
  return (
    <div className="mini-cal">
      <div className="mini-cal-nav">
        <button className="mini-cal-arrow" type="button" onClick={prev}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
        <span className="mini-cal-month">{label}</span>
        <button className="mini-cal-arrow" type="button" onClick={next}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
      <div className="mini-cal-grid">
        {WEEKDAYS.map(d => <div key={d} className="mini-cal-wday">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`}/>;
          const d = new Date(view.year, view.month, day); d.setHours(0,0,0,0);
          const past  = d < today;
          const today2 = d.getTime() === today.getTime();
          const isSel  = sel && d.getTime() === sel.getTime();
          return (
            <button key={day} type="button" disabled={past}
              className={`mini-cal-day${past?' past':''}${today2?' today':''}${isSel?' selected':''}`}
              onClick={() => pick(day)}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function ManualBookingModal({ mode, businessId, professionals = [], services = [], onClose, onCreated }) {
  // mode: 'business' | 'pro'
  const [step, setStep]         = useState(1); // 1=servicio+pro 2=fecha+hora 3=cliente 4=confirm
  const [proId, setProId]       = useState(professionals.length === 1 ? professionals[0].id : '');
  const [serviceId, setService] = useState('');
  const [date, setDate]         = useState(todayStr());
  const [slots, setSlots]       = useState([]);
  const [slotsLoading, setSlL]  = useState(false);
  const [startTime, setSlot]    = useState('');
  const [clientEmail, setEmail] = useState('');
  const [clientName, setName]   = useState('');
  const [clientPhone, setPhone] = useState('');
  const [foundClient, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [source, setSource]     = useState('PRESENCIAL');
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState('');

  // Derived service list — for business: from professionals; for pro: passed directly
  const [proServices, setProServices] = useState(services);
  useEffect(() => {
    if (mode === 'business' && proId) {
      api.getProfessionalServices(proId).then(s => setProServices(s || [])).catch(() => setProServices([]));
    }
  }, [proId, mode]);

  // Load slots when service + date changes
  useEffect(() => {
    const pid = mode === 'pro' ? (professionals[0]?.id || proId) : proId;
    if (!serviceId || !pid || !date) { setSlots([]); return; }
    setSlL(true); setSlot('');
    api.getSlots({ professionalId: pid, serviceId, date })
      .then(d => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlL(false));
  }, [serviceId, date, proId]);

  async function searchClient() {
    if (!clientEmail.trim()) return;
    setSearching(true);
    try {
      const c = await api.searchClient(clientEmail.trim());
      setFound(c);
      if (c) setName(c.name);
    } catch { setFound(null); }
    finally { setSearching(false); }
  }

  async function handleSubmit() {
    setError(''); setSub(true);
    try {
      const pid = mode === 'pro' ? (professionals[0]?.id || proId) : proId;
      const body = { professionalId: pid, serviceId, date, startTime, clientEmail: clientEmail.trim() || undefined, clientName: clientName.trim() || undefined, clientPhone: clientPhone.trim() || undefined, source };
      const booking = mode === 'business'
        ? await api.createManualBookingBusiness(businessId, body)
        : await api.createManualBookingPro(body);
      onCreated(booking);
      onClose();
    } catch (err) {
      if (err.code === 'SLOT_CONFLICT') {
        setSlot('');
        setStep(2);
        setError('Este horario acaba de ser tomado. Elige otra fecha u hora.');
      } else {
        setError(err.message);
      }
    }
    finally { setSub(false); }
  }

  const pid = mode === 'pro' ? (professionals[0]?.id || proId) : proId;
  const svcOk = !!serviceId;
  const proOk = !!pid;
  const dateOk = !!date;
  const slotOk = !!startTime;
  const clientOk = !!(clientEmail.trim() || clientName.trim());
  const selectedSvc = proServices.find(s => s.id === serviceId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-drawer-head">
          <div>
            <p style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', margin:0 }}>Paso {step} de 4</p>
            <h2 className="modal-drawer-title">
              {step===1 && 'Servicio y profesional'}
              {step===2 && 'Fecha y hora'}
              {step===3 && 'Datos del cliente'}
              {step===4 && 'Confirmar cita'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="modal-drawer-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="modal-drawer-body">
          {/* ── Step 1: Pro + Service ── */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
              {mode === 'business' && professionals.length > 1 && (
                <div>
                  <label className="input-label">Profesional</label>
                  <select className="input" value={proId} onChange={e => { setProId(e.target.value); setService(''); }}>
                    <option value="">Selecciona un profesional</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="input-label">Servicio</label>
                {proServices.length === 0 ? (
                  <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>
                    {mode === 'business' && !proId ? 'Selecciona primero un profesional.' : 'No hay servicios disponibles.'}
                  </p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                    {proServices.map(s => (
                      <button key={s.id} type="button" onClick={() => setService(s.id)}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'var(--sp-3) var(--sp-4)', borderRadius:'var(--r-lg)', textAlign:'left', cursor:'pointer', border:`1.5px solid ${serviceId===s.id?'var(--violet)':'var(--border)'}`, background:serviceId===s.id?'var(--violet-subtle)':'var(--surface-2)', transition:'all .12s' }}>
                        <div>
                          <p style={{ margin:0, fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>{s.name}</p>
                          <p style={{ margin:0, fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{s.duration} min</p>
                        </div>
                        <span style={{ fontWeight:700, fontSize:'var(--text-sm)', color: serviceId===s.id?'var(--violet)':'var(--text-muted)' }}>
                          ${Number(s.price).toLocaleString('es-CO')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Date + Slot ── */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
              <MiniCal value={date} onChange={d => { setDate(d); setSlot(''); }} />
              <div>
                <label className="input-label">Hora disponible</label>
                {slotsLoading && <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>Cargando horarios…</p>}
                {!slotsLoading && slots.length === 0 && <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>Sin horarios para esta fecha.</p>}
                {!slotsLoading && slots.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--sp-2)' }}>
                    {slots.map(s => (
                      <button key={s.startTime} type="button" onClick={() => setSlot(s.startTime)}
                        style={{ padding:'7px 14px', borderRadius:'var(--r-md)', border:`1.5px solid ${startTime===s.startTime?'var(--gold)':'var(--border)'}`, background:startTime===s.startTime?'var(--gold-subtle)':'var(--surface-2)', color:startTime===s.startTime?'var(--gold)':'var(--text-muted)', fontSize:'var(--text-sm)', fontWeight:startTime===s.startTime?700:500, cursor:'pointer', transition:'all .12s' }}>
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Client ── */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
              <div>
                <label className="input-label">Email del cliente (para buscar cuenta existente)</label>
                <div style={{ display:'flex', gap:'var(--sp-2)' }}>
                  <input className="input" style={{ flex:1 }} type="email" placeholder="cliente@email.com"
                    value={clientEmail} onChange={e => { setEmail(e.target.value); setFound(null); }} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={searchClient} disabled={searching || !clientEmail.trim()}>
                    {searching ? '…' : 'Buscar'}
                  </button>
                </div>
                {foundClient && (
                  <div style={{ marginTop:'var(--sp-2)', padding:'var(--sp-2) var(--sp-3)', borderRadius:'var(--r-md)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', fontSize:'var(--text-xs)', color:'var(--success)' }}>
                    Cliente encontrado: <strong>{foundClient.name}</strong>
                  </div>
                )}
                {foundClient === false && clientEmail && (
                  <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginTop:'var(--sp-1)' }}>
                    No encontrado — se creará una cuenta nueva con los datos que ingreses.
                  </p>
                )}
              </div>
              <div>
                <label className="input-label">Nombre <span style={{ fontWeight:400, color:'var(--text-subtle)' }}>(requerido si no hay email)</span></label>
                <input className="input" type="text" placeholder="Juan Pérez" value={clientName} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="input-label">Teléfono <span style={{ fontWeight:400, color:'var(--text-subtle)' }}>(opcional)</span></label>
                <input className="input" type="tel" placeholder="+57 300 000 0000" value={clientPhone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="input-label">¿Cómo llegó este cliente?</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--sp-2)' }}>
                  {SOURCES.map(s => (
                    <button key={s.value} type="button" onClick={() => setSource(s.value)}
                      style={{ padding:'6px 14px', borderRadius:'var(--r-full)', border:`1.5px solid ${source===s.value?'var(--gold-border)':'var(--border)'}`, background:source===s.value?'var(--gold-subtle)':'transparent', color:source===s.value?'var(--gold)':'var(--text-muted)', fontSize:'var(--text-xs)', fontWeight:source===s.value?700:500, cursor:'pointer', transition:'all .12s' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Summary ── */}
          {step === 4 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {[
                { label:'Servicio',    val: selectedSvc?.name },
                { label:'Duración',    val: selectedSvc ? `${selectedSvc.duration} min` : undefined },
                { label:'Precio',      val: selectedSvc ? `$${Number(selectedSvc.price).toLocaleString('es-CO')}` : undefined },
                { label:'Fecha',       val: date ? new Date(date+'T00:00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}) : undefined },
                { label:'Hora',        val: startTime },
                { label:'Cliente',     val: clientName || clientEmail || '—' },
                { label:'Origen',      val: SOURCES.find(s=>s.value===source)?.label },
              ].map(({ label, val }) => val && (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'var(--sp-2) 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text)', textAlign:'right', maxWidth:'60%', textTransform:'capitalize' }}>{val}</span>
                </div>
              ))}
              {error && <p style={{ color:'var(--error)', fontSize:'var(--text-sm)', marginTop:'var(--sp-2)' }}>{error}</p>}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="modal-drawer-foot">
          {step > 1 && <button type="button" className="btn btn-ghost" onClick={() => { setStep(s=>s-1); setError(''); }}>Atrás</button>}
          {step < 4 && (
            <button type="button" className="btn btn-primary" style={{ marginLeft:'auto' }}
              disabled={
                (step===1 && (!proOk || !svcOk)) ||
                (step===2 && (!dateOk || !slotOk)) ||
                (step===3 && !clientOk)
              }
              onClick={() => setStep(s=>s+1)}>
              Continuar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          )}
          {step === 4 && (
            <button type="button" className="btn btn-primary" style={{ marginLeft:'auto', background:'var(--gold)', color:'#0A0808' }}
              disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Creando…' : 'Confirmar cita'}
              {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
