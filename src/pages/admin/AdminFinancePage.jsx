import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const PLAN_LABELS = { solo: 'Independiente', team: 'Equipo', studio: 'Estudio', enterprise: 'Empresarial' };

const SUB_STATUS_META = {
  active:    { label: 'Activo',      color: 'var(--success)',  bg: 'var(--success-bg)',       border: 'var(--success-border)' },
  trialing:  { label: 'En trial',    color: 'var(--gold)',     bg: 'var(--gold-subtle)',      border: 'var(--gold-border)' },
  trial:     { label: 'En trial',    color: 'var(--gold)',     bg: 'var(--gold-subtle)',      border: 'var(--gold-border)' },
  past_due:  { label: 'Vencido',     color: 'var(--warning)',  bg: 'rgba(245,158,11,.12)',    border: 'rgba(245,158,11,.3)' },
  cancelled: { label: 'Cancelado',   color: 'var(--error)',    bg: 'var(--error-bg)',         border: 'var(--error-border)' },
  canceled:  { label: 'Cancelado',   color: 'var(--error)',    bg: 'var(--error-bg)',         border: 'var(--error-border)' },
};

function formatMoney(cents, currency = 'COP') {
  const value = Math.round((cents || 0)) / 100;
  return `$${value.toLocaleString('es-CO')} ${currency}`;
}

const CURRENCY_FOR = { CO: 'COP', US: 'USD' };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium' });
}

function MetaBadge({ meta, fallback }) {
  const m = meta || (fallback ? { label: fallback, color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' } : null);
  if (!m) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 'var(--r-full)',
      background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

function PlanChip({ plan }) {
  if (!plan) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px',
      borderRadius: 'var(--r-full)', background: 'var(--gold-subtle)',
      border: '1px solid var(--gold-border)', color: 'var(--gold)', whiteSpace: 'nowrap',
    }}>
      {PLAN_LABELS[plan] || plan}
    </span>
  );
}

function KpiCard({ label, value, hint, color = 'var(--gold)' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color, lineHeight: 1.1 }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{hint}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <section style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', marginTop: 'var(--sp-6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap', marginBottom: 'var(--sp-5)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const TH = {
  textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
  color: 'var(--text-muted)', padding: 'var(--sp-3) var(--sp-4)', whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
};
const TD = {
  fontSize: 'var(--text-sm)', color: 'var(--text)', padding: 'var(--sp-3) var(--sp-4)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
};

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      border: '1px solid var(--error-border)', background: 'var(--error-bg)',
      borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', textAlign: 'center',
    }}>
      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)' }}>
        {message || 'No se pudieron cargar los datos.'}
      </p>
      <button className="btn btn-primary" onClick={onRetry}>Reintentar</button>
    </div>
  );
}

// ── Subscriptions section ──────────────────────────────────────────────
function SubscriptionsSection({ country }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');

  const cur = CURRENCY_FOR[country] || 'COP';

  const load = useCallback(() => {
    setLoading(true); setError('');
    api.adminFinanceSubscriptions({ country }) // el país lo fija el selector global
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [country]);

  useEffect(() => { load(); }, [load]);

  const plans = [...new Set(rows.map(r => r.plan).filter(Boolean))].sort();
  const statuses = [...new Set(rows.map(r => r.status).filter(Boolean))].sort();

  const filtered = rows.filter(r =>
    (!status || r.status === status) &&
    (!plan || r.plan === plan)
  );

  const filtersActive = status || plan;

  return (
    <SectionCard
      title="Suscripciones"
      subtitle={`${filtered.length} de ${rows.length} suscripciones`}
      right={
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="input" style={{ maxWidth: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {statuses.map(s => <option key={s} value={s}>{SUB_STATUS_META[s]?.label || s}</option>)}
          </select>
          <select className="input" style={{ maxWidth: 150 }} value={plan} onChange={e => setPlan(e.target.value)}>
            <option value="">Todos los planes</option>
            {plans.map(p => <option key={p} value={p}>{PLAN_LABELS[p] || p}</option>)}
          </select>
          {filtersActive && (
            <button
              onClick={() => { setStatus(''); setPlan(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 'var(--text-sm)' }}
            >
              Limpiar
            </button>
          )}
        </div>
      }
    >
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>{rows.length ? 'Ningún resultado con estos filtros.' : 'No hay suscripciones todavía.'}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Negocio</th>
                <th style={TH}>País</th>
                <th style={TH}>Plan</th>
                <th style={TH}>Facturación</th>
                <th style={TH}>Estado</th>
                <th style={{ ...TH, textAlign: 'right' }}>Precio</th>
                <th style={TH}>Próximo cobro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.businessId}>
                  <td style={{ ...TD, fontWeight: 600 }}>{r.businessName}</td>
                  <td style={TD}>{r.country || '—'}</td>
                  <td style={TD}><PlanChip plan={r.plan} /></td>
                  <td style={TD}>{r.billingPlan || '—'}</td>
                  <td style={TD}><MetaBadge meta={SUB_STATUS_META[r.status]} fallback={r.displayState || r.status} /></td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 600 }}>{formatMoney(r.priceCents, cur)}</td>
                  <td style={TD}>{formatDate(r.nextChargeAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

// ── Discounts section ──────────────────────────────────────────────────
function DiscountsSection({ country }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    api.adminFinanceDiscounts({ country })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [country]);

  useEffect(() => { load(); }, [load]);

  const cur = data?.currency || CURRENCY_FOR[country] || 'COP';
  const byType = data?.byType || {};
  const cards = [
    { key: 'courtesy', label: 'Cortesía', icon: '🎁', count: byType.courtesy?.count, amount: byType.courtesy?.forgoneCents, amountLabel: 'Ingreso no percibido' },
    { key: 'promoter', label: 'Promotor', icon: '🤝', count: byType.promoter?.count, amount: byType.promoter?.discountCents, amountLabel: 'Descuento aplicado' },
    { key: 'referral', label: 'Referido', icon: '👥', count: byType.referral?.count, amount: byType.referral?.discountCents, amountLabel: 'Descuento aplicado' },
  ];

  return (
    <SectionCard
      title="Descuentos por tipo de código"
      subtitle={data ? `Total descuentos: ${formatMoney(data.totalDiscountCents, cur)}` : undefined}
    >
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)' }}>
          {cards.map(c => (
            <div key={c.key} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold)', lineHeight: 1.1 }}>
                {formatMoney(c.amount, cur)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 4 }}>{c.amountLabel}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
                {c.count ?? 0} {(c.count === 1) ? 'código usado' : 'códigos usados'}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ── Commissions section ────────────────────────────────────────────────
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function CommissionsSection({ country }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    api.adminFinanceCommissions({ month, year, country })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, year, country]);

  useEffect(() => { load(); }, [load]);

  const cur = data?.currency || CURRENCY_FOR[country] || 'COP';
  const promoters = data?.promoters || [];
  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) years.push(y);

  return (
    <SectionCard
      title="Comisiones a promotores"
      subtitle={data?.periodLabel || `${MONTHS_ES[month - 1]} ${year}`}
      right={
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <select className="input" style={{ maxWidth: 150 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS_ES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="input" style={{ maxWidth: 110 }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      }
    >
      <p style={{
        fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-5)',
      }}>
        ℹ️ La comisión ({data?.commissionPct != null ? `${data.commissionPct}%` : '40%'}) es informativa: corresponde al monto que debes pagar
        manualmente a cada promotor cada mes. No se cobra ni descuenta por la pasarela de pago.
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : promoters.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay comisiones para este periodo.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Promotor</th>
                <th style={TH}>Código</th>
                <th style={{ ...TH, textAlign: 'right' }}>Referidos pagos</th>
                <th style={{ ...TH, textAlign: 'right' }}>Ingresos del mes</th>
                <th style={{ ...TH, textAlign: 'right' }}>Comisión del mes</th>
                <th style={{ ...TH, textAlign: 'right' }}>Comisión histórica</th>
              </tr>
            </thead>
            <tbody>
              {promoters.map(p => (
                <tr key={p.id}>
                  <td style={{ ...TD, fontWeight: 600 }}>
                    {p.name}
                    {p.status && p.status !== 'ACTIVE' && (
                      <span style={{ marginLeft: 8 }}><MetaBadge fallback="Inactivo" /></span>
                    )}
                  </td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold)' }}>{p.code}</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.referredPaid ?? 0}</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{formatMoney(p.monthlyRevenueCents, cur)}</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(p.monthlyCommissionCents, cur)}</td>
                  <td style={{ ...TD, textAlign: 'right', color: 'var(--text-muted)' }}>{formatMoney(p.allTimeCommissionCents, cur)}</td>
                </tr>
              ))}
            </tbody>
            {data?.totals && (
              <tfoot>
                <tr>
                  <td style={{ ...TD, fontWeight: 800, borderBottom: 'none' }} colSpan={3}>Totales</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 800, borderBottom: 'none' }}>{formatMoney(data.totals.monthlyRevenueCents, cur)}</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 800, color: 'var(--success)', borderBottom: 'none' }}>{formatMoney(data.totals.monthlyCommissionCents, cur)}</td>
                  <td style={{ ...TD, borderBottom: 'none' }} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </SectionCard>
  );
}

// ── Overview KPIs ──────────────────────────────────────────────────────
function OverviewSection({ country }) {
  const [data, setData] = useState(null);
  const [discounts, setDiscounts] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const now = new Date();
    setLoading(true); setError('');
    Promise.all([
      api.adminFinanceOverview({ country }),
      api.adminFinanceDiscounts({ country }).catch(() => null),
      api.adminFinanceCommissions({ month: now.getMonth() + 1, year: now.getFullYear(), country }).catch(() => null),
    ])
      .then(([ov, dc, cm]) => { setData(ov); setDiscounts(dc); setCommissions(cm); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [country]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const cur = data.currency || CURRENCY_FOR[country] || 'COP';
  const counts = data.counts || {};
  const cards = [
    { label: 'MRR actual', value: formatMoney(data.mrrCents, cur), hint: data.mrrPotentialCents != null ? `Potencial: ${formatMoney(data.mrrPotentialCents, cur)}` : undefined, color: 'var(--gold)' },
    { label: 'ARR', value: formatMoney(data.arrCents, cur), color: 'var(--gold)' },
    { label: 'Ingresos del mes', value: formatMoney(data.revenueThisMonthCents, cur), color: 'var(--success)' },
    { label: 'Negocios activos', value: counts.active ?? 0, color: 'var(--success)' },
    { label: 'En trial', value: counts.trial ?? 0, hint: data.trialConversionRate != null ? `Conversión: ${(data.trialConversionRate * 100).toFixed(0)}%` : undefined, color: 'var(--text)' },
    { label: 'Vencidos (past due)', value: counts.pastDue ?? 0, color: 'var(--warning)' },
    { label: 'Cancelados', value: counts.cancelledOrExpired ?? 0, color: 'var(--error)' },
    { label: 'Total descuentos', value: formatMoney(discounts?.totalDiscountCents, cur), hint: 'Cortesía + promotor + referido', color: 'var(--violet)' },
    { label: 'Comisiones del mes', value: formatMoney(commissions?.totals?.monthlyCommissionCents, cur), hint: 'A pagar a promotores', color: 'var(--violet)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-4)' }}>
      {cards.map(c => <KpiCard key={c.label} {...c} />)}
    </div>
  );
}

export default function AdminFinancePage() {
  // Selector global de país/moneda: las finanzas se muestran SIEMPRE de un solo
  // país a la vez (CO→COP, US→USD); nunca se suman ni convierten monedas.
  const [country, setCountry] = useState('CO');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Finanzas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Ingresos, suscripciones, descuentos y comisiones de la plataforma
          </p>
        </div>
        {/* Selector país/moneda */}
        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: 2 }}>
          {['CO', 'US'].map(c => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 'var(--text-sm)',
                background: country === c ? 'var(--gold)' : 'transparent',
                color: country === c ? '#000' : 'var(--text-muted)',
              }}
            >
              {c === 'CO' ? '🇨🇴 Colombia (COP)' : '🇺🇸 USA (USD)'}
            </button>
          ))}
        </div>
      </div>

      <OverviewSection country={country} />
      <SubscriptionsSection country={country} />
      <DiscountsSection country={country} />
      <CommissionsSection country={country} />
    </div>
  );
}
