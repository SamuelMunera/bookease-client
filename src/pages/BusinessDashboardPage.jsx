import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CAT_LABEL = { BARBERSHOP: 'Barbería', SPA: 'Spa & Wellness', SALON: 'Salón de belleza' };
const CAT_COLOR = { BARBERSHOP: 'var(--gold)', SPA: 'var(--violet)', SALON: 'var(--gold-light)' };

function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

function SectionCard({ title, action, children }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)', height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const TABS = [
  { key: 'panel',    label: 'Panel' },
  { key: 'finanzas', label: 'Finanzas' },
];

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('panel');
  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [joinCode, setJoinCode] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [revenue, setRevenue] = useState(null);
  const [showRevenue, setShowRevenue] = useState(false);
  const [togglingRevenue, setTogglingRevenue] = useState(false);

  useEffect(() => {
    api.getBusinesses()
      .then(all => {
        const mine = all.find(b => b.ownerId === user.id);
        if (!mine) { setLoading(false); return; }
        setBusiness(mine);
        return api.getBusinessBookings(mine.id, { date: todayISO() });
      })
      .then(bks => { if (bks) setBookings(bks); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (!business) return;
    setShowRevenue(business.showRevenueToProf ?? false);
    api.getBusinessJoinCode().then(d => setJoinCode(d.joinCode)).catch(() => {});
    api.getBusinessJoinRequests().then(r => setJoinRequests(Array.isArray(r) ? r : [])).catch(() => {});
    api.getBusinessRevenue().then(d => setRevenue(d)).catch(() => {});
  }, [business?.id]);

  async function handleApprove(id) {
    try {
      await api.approveJoinRequest(id);
      setJoinRequests(prev => prev.filter(r => r.id !== id));
      setActionMsg('Profesional aprobado');
    } catch (err) { setActionMsg(err.message); }
    finally { setTimeout(() => setActionMsg(''), 3000); }
  }

  async function handleReject(id) {
    try {
      await api.rejectJoinRequest(id);
      setJoinRequests(prev => prev.filter(r => r.id !== id));
      setActionMsg('Solicitud rechazada');
    } catch (err) { setActionMsg(err.message); }
    finally { setTimeout(() => setActionMsg(''), 3000); }
  }

  async function toggleRevenuePerm() {
    setTogglingRevenue(true);
    try {
      const next = !showRevenue;
      await api.updateBusinessSettings({ showRevenueToProf: next });
      setShowRevenue(next);
    } catch {}
    finally { setTogglingRevenue(false); }
  }

  function copyCode() {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 'var(--sp-10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 88, borderRadius: 'var(--r-xl)' }} />)}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="page" style={{ paddingTop: 'var(--sp-16)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--r-xl)', background: 'var(--gold-subtle)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-4)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 className="page-title">Aún no tienes un negocio</h1>
        <p className="page-subtitle" style={{ marginBottom: 'var(--sp-6)' }}>Crea tu negocio para empezar a recibir reservas.</p>
        <Link to="/register-business" className="btn btn-primary">
          Crear mi negocio
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    );
  }

  const catColor       = CAT_COLOR[business.category] || 'var(--gold)';
  const todayConfirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const todayPending   = bookings.filter(b => b.status === 'PENDING').length;

  const stats = [
    {
      num: bookings.length, label: 'Citas hoy', color: 'var(--text-muted)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      num: todayConfirmed, label: 'Confirmadas', color: 'var(--success)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    },
    {
      num: todayPending, label: 'Pendientes', color: 'var(--warning)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      num: business.services?.length ?? 0, label: 'Servicios', color: 'var(--violet)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    },
    {
      num: business.professionals?.length ?? 0, label: 'Profesionales', color: catColor,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  return (
    <div className="page" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-16)' }}>

      {/* ── Business hero ── */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--sp-4)',
        borderLeft: `4px solid ${catColor}`,
      }}>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--r-xl)', flexShrink: 0,
            background: `${catColor}18`, color: catColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)',
          }}>
            {business.name[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {business.name}
              </h2>
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.07em',
                padding: '2px 10px', borderRadius: 'var(--r-full)',
                background: `${catColor}18`, color: catColor,
              }}>
                {CAT_LABEL[business.category]}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {business.address}, {business.city}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <Link to="/agenda" className="btn btn-primary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Agenda
          </Link>
          <Link to={`/businesses/${business.id}`} className="btn btn-secondary btn-sm">
            Ver perfil público
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: 'var(--sp-4)',
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ color: s.color, marginBottom: 'var(--sp-2)' }}>{s.icon}</div>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color, margin: '0 0 2px', fontFamily: 'var(--font-heading)' }}>{s.num}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 'var(--sp-1)', marginBottom: 'var(--sp-5)',
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: 'var(--sp-2) var(--sp-4)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ PANEL TAB ══════════ */}
      {tab === 'panel' && (
        <>
          {/* Services + Professionals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
            <SectionCard
              title="Servicios"
              action={
                <Link to="/agenda" style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar
                </Link>
              }
            >
              {!business.services?.length ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--sp-6) 0' }}>
                  Sin servicios.{' '}<Link to="/agenda" style={{ color: 'var(--gold)' }}>Agregar uno</Link>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {business.services.map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 'var(--sp-3)', background: 'var(--surface-3)',
                      borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                    }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{s.name}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{s.duration} min</p>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap', marginLeft: 'var(--sp-3)' }}>
                        ${Number(s.price).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Profesionales">
              {!business.professionals?.length ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--sp-6) 0' }}>
                  Sin profesionales registrados.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {business.professionals.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                      padding: 'var(--sp-3)', background: 'var(--surface-3)',
                      borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: `${catColor}18`, color: catColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-sm)', fontWeight: 700,
                      }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                        {p.bio && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{p.bio}</p>}
                      </div>
                      <Link to={`/professionals/${p.id}`} style={{ color: 'var(--text-subtle)', textDecoration: 'none' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Join code + pending requests */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
            <SectionCard title="Código de vinculación">
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                Comparte este código con los profesionales que quieras añadir.
              </p>
              {joinCode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <span style={{
                    flex: 1, textAlign: 'center',
                    fontSize: 28, fontWeight: 800, letterSpacing: '0.25em',
                    padding: 'var(--sp-3)', borderRadius: 'var(--r-lg)',
                    background: 'var(--surface-3)', border: '1px dashed var(--border)',
                    color: 'var(--violet)', fontFamily: 'monospace',
                  }}>
                    {joinCode}
                  </span>
                  <button onClick={copyCode} className="btn btn-ghost btn-sm" style={{ flexShrink: 0, padding: '8px 12px' }}>
                    {copied
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--sp-4)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Cargando código…
                </div>
              )}
            </SectionCard>

            <SectionCard
              title={`Solicitudes pendientes${joinRequests.length ? ` (${joinRequests.length})` : ''}`}
              action={actionMsg ? <span style={{ fontSize: 'var(--text-xs)', color: actionMsg.includes('rechaz') ? 'var(--red)' : 'var(--green)' }}>{actionMsg}</span> : null}
            >
              {joinRequests.length === 0 ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--sp-6) 0' }}>
                  Sin solicitudes pendientes.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {joinRequests.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                      padding: 'var(--sp-3)', background: 'var(--surface-3)',
                      borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--violet-subtle)', color: 'var(--violet)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-sm)', fontWeight: 700,
                      }}>
                        {r.professional.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{r.professional.name}</p>
                        {r.professional.specialty && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.professional.specialty}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <button onClick={() => handleReject(r.id)} className="btn btn-ghost btn-sm" style={{ padding: '5px 12px', fontSize: 'var(--text-xs)', color: 'var(--red)' }}>
                          Rechazar
                        </button>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-primary btn-sm" style={{ padding: '5px 12px', fontSize: 'var(--text-xs)', background: 'var(--violet)' }}>
                          Aprobar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Today's bookings */}
          <SectionCard
            title={`Citas de hoy · ${new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`}
            action={
              <Link to="/agenda" style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
                Ver agenda →
              </Link>
            }
          >
            {!bookings.length ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--sp-8) 0' }}>
                No hay citas programadas para hoy.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {[...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(b => {
                  const statusColor = { CONFIRMED: 'var(--success)', PENDING: 'var(--warning)', CANCELLED: 'var(--text-subtle)' }[b.status];
                  const statusLabel = { CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada' }[b.status];
                  return (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                      padding: 'var(--sp-3) var(--sp-4)', background: 'var(--surface-3)',
                      borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                      opacity: b.status === 'CANCELLED' ? 0.5 : 1,
                    }}>
                      <div style={{ width: 4, height: 36, borderRadius: 2, background: statusColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', minWidth: 44 }}>{b.startTime}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.service.name}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>
                          {b.client.name} · {b.professional.name}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px',
                        borderRadius: 'var(--r-full)', whiteSpace: 'nowrap',
                        background: `${statusColor}18`, color: statusColor,
                      }}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* ══════════ FINANZAS TAB ══════════ */}
      {tab === 'finanzas' && (
        <>
          {/* Toggle visibilidad profesionales */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--sp-4) var(--sp-5)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', marginBottom: 'var(--sp-4)',
            flexWrap: 'wrap', gap: 'var(--sp-3)',
          }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 2 }}>
                Profesionales ven sus ingresos
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Cuando está activo, cada profesional puede ver sus propios totales.
              </p>
            </div>
            <button
              onClick={toggleRevenuePerm}
              disabled={togglingRevenue}
              style={{
                width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: showRevenue ? 'var(--violet)' : 'var(--border)',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 4, left: showRevenue ? 24 : 4,
                width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s',
              }} />
            </button>
          </div>

          {/* Resumen general */}
          {revenue ? (
            <>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 'var(--sp-3)' }}>
                Resumen del negocio
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                {[
                  { label: 'Hoy',         val: revenue.totals.day,   icon: '☀️' },
                  { label: 'Esta semana', val: revenue.totals.week,  icon: '📅' },
                  { label: 'Este mes',    val: revenue.totals.month, icon: '📆' },
                ].map(({ label, val, icon }) => (
                  <div key={label} style={{
                    padding: 'var(--sp-5)', borderRadius: 'var(--r-xl)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 18, marginBottom: 6 }}>{icon}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                      ${val.toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Per-professional */}
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 'var(--sp-3)' }}>
                Ingresos por profesional
              </p>
              {revenue.professionals.length === 0 ? (
                <div style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-8)',
                  textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--text-sm)',
                }}>
                  Sin ingresos registrados aún.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {revenue.professionals.map(p => (
                    <div key={p.id} style={{
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-xl)', padding: 'var(--sp-4) var(--sp-5)',
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: `${catColor}18`, color: catColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-base)', fontWeight: 700,
                      }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 120, flex: 1 }}>
                        <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{p.name}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{p.bookingCount ?? 0} citas confirmadas este mes</p>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Hoy',    val: p.day },
                          { label: 'Semana', val: p.week },
                          { label: 'Mes',    val: p.month },
                        ].map(({ label, val }) => (
                          <div key={label} style={{ textAlign: 'center', minWidth: 72 }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>{label}</p>
                            <p style={{
                              fontSize: 'var(--text-base)', fontWeight: 800,
                              color: val > 0 ? 'var(--gold)' : 'var(--text-subtle)',
                              fontFamily: 'var(--font-heading)',
                            }}>
                              ${val.toLocaleString('es-CO')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 80, borderRadius: 'var(--r-xl)' }} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
