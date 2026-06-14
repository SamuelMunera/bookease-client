import { useState, useEffect } from 'react';
import api from '../../api';

const TABS = [
  { id: 'promoters',   label: 'Promotor',     icon: '🤝' },
  { id: 'conversions', label: 'Conversiones', icon: '📈' },
  { id: 'courtesy',    label: 'Cortesías',    icon: '🎁' },
];

const STATUS_META = {
  registered:    { label: 'Registrado',    color: 'var(--text-muted)', bg: 'var(--surface-2)',   border: 'var(--border)' },
  trial_active:  { label: 'Trial activo',  color: 'var(--gold)',       bg: 'var(--gold-subtle)', border: 'var(--gold-border)' },
  trial_expired: { label: 'Trial vencido', color: 'var(--warning)',    bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
  active:        { label: 'Activo',        color: 'var(--success)',    bg: 'var(--success-bg)',  border: 'var(--success-border)' },
  inactive:      { label: 'Inactivo',      color: 'var(--error)',      bg: 'var(--error-bg)',    border: 'var(--error-border)' },
};

const PAYMENT_META = {
  paid:    { label: 'Pagado',           color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
  pending: { label: 'Pendiente de pago', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
};

const COURTESY_PLAN_OPTIONS = [
  { value: 'solo',       label: 'Independiente' },
  { value: 'team',       label: 'Equipo' },
  { value: 'studio',     label: 'Estudio' },
  { value: 'enterprise', label: 'Empresarial' },
];

function StatusBadge({ active, activeLabel, inactiveLabel }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 'var(--r-full)',
      background: active ? 'var(--success-bg)' : 'var(--surface-2)',
      color: active ? 'var(--success)' : 'var(--text-muted)',
      border: `1px solid ${active ? 'var(--success-border)' : 'var(--border)'}`,
    }}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function CodeChip({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar código"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
        fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 700,
        padding: '4px 10px', borderRadius: 'var(--r-md)',
        background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
        color: 'var(--gold)', cursor: 'pointer',
      }}
    >
      {code}
      <span style={{ fontSize: 11 }}>{copied ? '✓' : '📋'}</span>
    </button>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

const PLAN_LABELS = { solo: 'Independiente', team: 'Equipo', studio: 'Estudio', enterprise: 'Empresarial' };

function MetaBadge({ meta }) {
  if (!meta) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 'var(--r-full)',
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

// Highlight visual claro para negocios cuya suscripción se activó hace poco
// (ver RECENT_PAYMENT_HOURS en backend) — desaparece solo cuando deja de ser reciente.
function JustPaidBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 'var(--r-full)',
      background: 'rgba(34,197,94,.15)', color: 'var(--success)',
      border: '1px solid var(--success-border)', whiteSpace: 'nowrap',
    }}>
      ✨ Recién pagó
    </span>
  );
}

function KpiPill({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--r-md)',
      background: 'var(--surface-2)', border: '1px solid var(--border)', minWidth: 84,
    }}>
      <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--text)' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

function PromotersTab() {
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    api.adminPromoters().then(setPromoters).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSaving(true); setError('');
    try {
      const promoter = await api.adminCreatePromoter(form);
      setPromoters(prev => [promoter, ...prev]);
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(promoter) {
    const nextStatus = promoter.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(promoter.id);
    try {
      const updated = await api.adminSetPromoterStatus(promoter.id, nextStatus);
      setPromoters(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 'var(--sp-6)', alignItems: 'start' }} className="admin-referrals-grid">
      {/* Register form */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)',
      }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>Registrar promotor</h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
          Se genera un código único de promotor automáticamente.
        </p>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nombre
            </label>
            <input
              className="input"
              placeholder="ej. Laura"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Apellido
            </label>
            <input
              className="input"
              placeholder="ej. Gómez"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="laura@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Teléfono (opcional)
            </label>
            <input
              className="input"
              placeholder="ej. +57 300 000 0000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)' }}>
              {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : '+ Registrar promotor'}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
          Promotores ({promoters.length})
        </h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
        ) : promoters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay promotores registrados todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {promoters.map(p => {
              const planEntries = Object.entries(p.planBreakdown || {}).filter(([, v]) => v > 0);
              return (
                <div key={p.id} style={{
                  padding: 'var(--sp-4) var(--sp-5)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{p.firstName} {p.lastName}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.email}{p.phone ? ` · ${p.phone}` : ''}
                      </p>
                    </div>
                    <CodeChip code={p.code} />
                    <StatusBadge active={p.status === 'ACTIVE'} activeLabel="Activo" inactiveLabel="Inactivo" />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>{formatDate(p.createdAt)}</p>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={togglingId === p.id}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--r-md)',
                        background: p.status === 'ACTIVE' ? 'var(--error-bg)' : 'var(--success-bg)',
                        border: `1px solid ${p.status === 'ACTIVE' ? 'var(--error-border)' : 'var(--success-border)'}`,
                        color: p.status === 'ACTIVE' ? 'var(--error)' : 'var(--success)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                        opacity: togglingId === p.id ? 0.5 : 1,
                      }}
                    >
                      {togglingId === p.id ? '…' : (p.status === 'ACTIVE' ? 'Desactivar' : 'Activar')}
                    </button>
                  </div>

                  {/* Métricas del promotor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
                    <KpiPill label="Negocios" value={p.businessesLinked} />
                    <KpiPill label="Independientes" value={p.independentsLinked} />
                    <KpiPill label="Activos" value={p.activeCount} />
                    {planEntries.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginLeft: 'var(--sp-2)' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Por plan:</span>
                        {planEntries.map(([plan, count]) => (
                          <span key={plan} style={{
                            fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px',
                            borderRadius: 'var(--r-full)', background: 'var(--gold-subtle)',
                            border: '1px solid var(--gold-border)', color: 'var(--gold)',
                          }}>
                            {PLAN_LABELS[plan] || plan}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Vista 1 (landing): lista de promotores con sus métricas. Click → vista 2
// (PromoterDetail) con los negocios/independientes referidos por ese promotor.
function ConversionsTab() {
  const [promoters, setPromoters] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    Promise.all([api.adminPromoters(), api.adminReferralStats()])
      .then(([p, s]) => { setPromoters(p); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return <PromoterDetail promoter={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      {stats && (
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
          <KpiPill label="Promotores" value={stats.totalPromoters} />
          <KpiPill label="Referidos" value={stats.totalReferred} />
          <KpiPill label="Pagados" value={stats.totalPaid} />
          <KpiPill label="Pendientes" value={stats.totalPending} />
          <KpiPill label="Últ. 7 días" value={stats.recentConversions} />
        </div>
      )}

      <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
        Promotores ({promoters.length})
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
        Selecciona un promotor para ver los negocios e independientes que ha referido y su estado actual.
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : promoters.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay promotores registrados todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {promoters.map(p => {
            const referred = p.businessesLinked + p.independentsLinked;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={e => { if (e.key === 'Enter') setSelected(p); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
                  padding: 'var(--sp-4) var(--sp-5)', cursor: 'pointer',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', transition: 'border-color .15s',
                }}
              >
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{p.firstName} {p.lastName}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{p.email}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <CodeChip code={p.code} />
                </div>
                <KpiPill label="Negocios referidos" value={referred} />
                <KpiPill label="Conv. pagadas" value={p.paidConversions} />
                <StatusBadge active={p.status === 'ACTIVE'} activeLabel="Activo" inactiveLabel="Inactivo" />
                <span style={{ marginLeft: 'auto', color: 'var(--text-subtle)', fontSize: 'var(--text-lg)' }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Vista 2: detalle de un promotor — todos los negocios/independientes que
// entraron con su código, con su estado actual y de pago, y filtros simples.
function PromoterDetail({ promoter, onBack }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [justPaidOnly, setJustPaidOnly] = useState(false);

  useEffect(() => {
    api.adminPromoterDetail(promoter.id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [promoter.id]);

  const items = (data?.items || []).filter(i =>
    (statusFilter === 'all' || i.currentStatus === statusFilter)
    && (!justPaidOnly || i.justPaid)
  );

  const filtersActive = statusFilter !== 'all' || justPaidOnly;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)',
        }}
      >
        ← Volver a promotores
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{promoter.firstName} {promoter.lastName}</h2>
        <CodeChip code={promoter.code} />
        <StatusBadge active={promoter.status === 'ACTIVE'} activeLabel="Activo" inactiveLabel="Inactivo" />
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
        {data?.items.length ?? 0} negocios/independientes referidos · {promoter.paidConversions} conversiones pagadas
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
        <select className="input" style={{ maxWidth: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={justPaidOnly} onChange={e => setJustPaidOnly(e.target.checked)} />
          Solo recién pagados
        </label>
        {filtersActive && (
          <button
            onClick={() => { setStatusFilter('all'); setJustPaidOnly(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 'var(--text-sm)' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          {data?.items.length ? 'Ningún resultado con estos filtros.' : 'Este promotor aún no tiene negocios ni independientes referidos.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {items.map(item => (
            <div key={`${item.type}-${item.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
              padding: 'var(--sp-4) var(--sp-5)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
            }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  {item.name}
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: 'var(--r-full)',
                    background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                  }}>
                    {item.type === 'BUSINESS' ? 'Negocio' : 'Independiente'}
                  </span>
                  {item.justPaid && <JustPaidBadge />}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>
                  {item.email || 'Sin correo'} · Registrado: {formatDate(item.createdAt)}
                </p>
              </div>
              <div style={{ minWidth: 100 }}>
                <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Plan</p>
                <span style={{
                  fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px',
                  borderRadius: 'var(--r-full)', background: 'var(--gold-subtle)',
                  border: '1px solid var(--gold-border)', color: 'var(--gold)',
                }}>
                  {PLAN_LABELS[item.billingPlan || item.plan] || item.plan}
                </span>
              </div>
              <div style={{ minWidth: 110 }}>
                <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Estado</p>
                <MetaBadge meta={STATUS_META[item.currentStatus]} />
              </div>
              <div style={{ minWidth: 110 }}>
                <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Pago</p>
                <MetaBadge meta={PAYMENT_META[item.paymentStatus]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourtesyTab() {
  const [codes, setCodes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ plan: 'team', label: '' });

  useEffect(() => {
    api.adminCourtesyCodes().then(setCodes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true); setError('');
    try {
      const code = await api.adminCreateCourtesyCode(form);
      setCodes(prev => [code, ...prev]);
      setForm({ plan: 'team', label: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleGenerate}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)',
          display: 'flex', alignItems: 'flex-end', gap: 'var(--sp-4)', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '2 1 280px' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-1)' }}>Generar código de cortesía</h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Código de un solo uso. El plan elegido aquí es el que se activa automáticamente al canjearlo.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', flex: '1 1 160px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Plan a regalar
          </label>
          <select
            className="input"
            value={form.plan}
            onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
          >
            {COURTESY_PLAN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', flex: '2 1 220px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Referencia interna (opcional)
          </label>
          <input
            className="input"
            placeholder="ej. Cortesía evento Medellín"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={generating}>
          {generating ? 'Generando…' : '+ Generar código'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-4)' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : codes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay códigos de cortesía generados todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {codes.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
              padding: 'var(--sp-4) var(--sp-5)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
            }}>
              <CodeChip code={c.code} />
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px',
                borderRadius: 'var(--r-full)', background: 'var(--gold-subtle)',
                border: '1px solid var(--gold-border)', color: 'var(--gold)',
              }}>
                {PLAN_LABELS[c.plan] || c.plan}
              </span>
              {c.label && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.label}</span>
              )}
              <StatusBadge active={c.status === 'UNUSED'} activeLabel="Sin usar" inactiveLabel="Usado" />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>
                Creado: {formatDate(c.createdAt)}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>
                Usado: {formatDate(c.usedAt)}
              </p>
              {c.status === 'USED' && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text)', marginLeft: 'auto' }}>
                  Redimido por{' '}
                  <strong>{c.redeemedByName || '—'}</strong>
                  {' '}
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: 'var(--r-full)',
                    background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                  }}>
                    {c.redeemedByType === 'BUSINESS' ? 'Negocio' : c.redeemedByType === 'PROFESSIONAL' ? 'Independiente' : '—'}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReferralCodesPage() {
  const [tab, setTab] = useState('promoters');

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Códigos de referidos</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
        Gestiona promotores y códigos de cortesía del programa de referidos.
      </p>

      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
              padding: 'var(--sp-3) var(--sp-4)', marginBottom: -1,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'promoters' ? <PromotersTab /> : tab === 'conversions' ? <ConversionsTab /> : <CourtesyTab />}
    </div>
  );
}
