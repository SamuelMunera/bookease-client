import { useState, useEffect } from 'react';
import api from '../../api';
import { PLAN_NAMES_ES, getPlanLimit } from '../../utils/plans';

const CAT_EMOJI = { BARBERSHOP: '✂️', SPA: '💆', SALON: '💅' };
const PLAN_OPTIONS = [
  { id: 'team',       label: 'Equipo (3)' },
  { id: 'studio',     label: 'Estudio (5)' },
  { id: 'enterprise', label: 'Empresarial (6+)' },
];

function PlanSelector({ businessId, currentPlan, professionalCount, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [warn, setWarn]     = useState('');

  async function handleChange(e) {
    const plan = e.target.value;
    setSaving(true);
    setWarn('');
    try {
      const res = await api.adminUpdateBusinessPlan(businessId, plan);
      if (res.downgradeWarning) setWarn(res.downgradeWarning);
      onUpdated(businessId, res.plan);
    } catch (err) {
      setWarn(err.message);
    } finally {
      setSaving(false);
    }
  }

  const limit = getPlanLimit(currentPlan);
  const atLimit = limit !== Infinity && professionalCount >= limit;
  const overLimit = limit !== Infinity && professionalCount > limit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
          padding: '2px 8px', borderRadius: 'var(--r-full)',
          background: overLimit ? 'rgba(239,68,68,.12)' : 'var(--violet-subtle)',
          color: overLimit ? 'var(--error)' : 'var(--violet)',
          border: `1px solid ${overLimit ? 'rgba(239,68,68,.3)' : 'rgba(139,92,246,.3)'}`,
        }}>
          {PLAN_NAMES_ES[currentPlan] ?? currentPlan}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: overLimit ? 'var(--error)' : atLimit ? 'var(--warning)' : 'var(--text-subtle)' }}>
          {professionalCount}/{limit === Infinity ? '∞' : limit} pros
          {overLimit && ' ⚠ sobre límite'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
        <select
          className="input"
          value={currentPlan}
          onChange={handleChange}
          disabled={saving}
          style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', height: 'auto' }}
        >
          {PLAN_OPTIONS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        {saving && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>…</span>}
      </div>
      {warn && (
        <p style={{ fontSize: 'var(--text-xs)', color: overLimit ? 'var(--error)' : 'var(--warning)', lineHeight: 1.4, margin: 0 }}>
          {warn}
        </p>
      )}
    </div>
  );
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.adminBusinesses().then(setBusinesses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handlePlanUpdated(id, newPlan) {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, plan: newPlan } : b));
  }

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Negocios</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
        {businesses.length} negocios registrados en la plataforma
      </p>

      <input
        className="input"
        placeholder="Buscar por nombre o ciudad…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 360, marginBottom: 'var(--sp-6)' }}
      />

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Sin resultados.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
          {filtered.map(b => (
            <div key={b.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
              display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-lg)', flexShrink: 0,
                  background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {CAT_EMOJI[b.category] || '🏢'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{b.city} · {b.country} · {b.category}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-2)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Servicios',      value: b.serviceCount },
                  { label: 'Profesionales',  value: b.professionalCount },
                  { label: 'Reservas',       value: b.bookingCount },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold)' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <PlanSelector
                businessId={b.id}
                currentPlan={b.plan ?? 'team'}
                professionalCount={b.professionalCount}
                onUpdated={handlePlanUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
