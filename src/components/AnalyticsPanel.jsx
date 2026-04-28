import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const HOURS_LABELS = Array.from({ length: 24 }, (_, h) =>
  `${String(h).padStart(2, '0')}:00`
);

function fmt(val, currency) {
  if (currency === 'USD') return `$${Number(val).toLocaleString('en-US')}`;
  return `$${Number(val).toLocaleString('es-CO')}`;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      padding: 'var(--sp-4) var(--sp-5)', borderRadius: 'var(--r-xl)',
      background: 'var(--surface-2)', border: `1.5px solid ${accent ? 'var(--gold-border)' : 'var(--border)'}`,
      background: accent ? 'var(--gold-subtle)' : 'var(--surface-2)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: accent ? 'var(--gold)' : 'var(--text)', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function InsightPill({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
      padding: '6px 14px', borderRadius: 999,
      background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{label}:</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function MiniBar({ label, count, max, color = 'var(--gold)' }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', minWidth: 0 }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 32, flexShrink: 0, textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 20, flexShrink: 0 }}>{count}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      padding: 'var(--sp-10)', textAlign: 'center',
      color: 'var(--text-subtle)', fontSize: 'var(--text-sm)',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 'var(--sp-3)' }}>📊</div>
      {text}
    </div>
  );
}

export default function AnalyticsPanel({ role = 'business' }) {
  const [period, setPeriod]   = useState('month');
  const [data,   setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = role === 'business'
        ? await api.getBusinessAnalytics(p)
        : await api.getProAnalytics(p);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { load(period); }, [period, load]);

  const currency = data?.currency ?? 'COP';

  // Derived from data
  const peakHoursFiltered = data
    ? data.peakHours.filter(h => h.count > 0)
    : [];
  const maxHour = peakHoursFiltered.length > 0
    ? Math.max(...peakHoursFiltered.map(h => h.count)) : 1;
  const maxDay  = data
    ? Math.max(...data.peakDays.map(d => d.count), 1) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '6px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 'var(--text-sm)', transition: 'all .15s',
              background: period === p.key ? 'var(--gold)' : 'var(--surface-2)',
              color:      period === p.key ? '#000' : 'var(--text-muted)',
              border: `1.5px solid ${period === p.key ? 'var(--gold)' : 'var(--border)'}`,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 72, borderRadius: 'var(--r-xl)' }} />)}
        </div>
      )}

      {!loading && !data && (
        <EmptyState text="No se pudieron cargar los datos. Intenta de nuevo." />
      )}

      {!loading && data && data.summary.total === 0 && (
        <EmptyState text="Sin reservas en este período. ¡Cuando lleguen tus primeras citas verás aquí tus métricas!" />
      )}

      {!loading && data && data.summary.total > 0 && (
        <>
          {/* Insights pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {data.insights.peakHour !== null && (
              <InsightPill icon="⏰" label="Hora pico" value={`${String(data.insights.peakHour).padStart(2,'0')}:00`} />
            )}
            {data.insights.peakDay && (
              <InsightPill icon="📅" label="Mejor día" value={data.insights.peakDay} />
            )}
            {data.insights.topService && (
              <InsightPill icon="⭐" label="Servicio top" value={data.insights.topService} />
            )}
            {data.customers.total > 0 && (
              <InsightPill icon="🔄" label="Recurrentes" value={`${data.insights.recurringPct}%`} />
            )}
            {data.insights.noShowRate > 0 && (
              <InsightPill icon="⚠️" label="Tasa no-show" value={`${data.insights.noShowRate}%`} />
            )}
          </div>

          {/* Summary cards */}
          {(() => {
            const attended = data.summary.confirmed + data.summary.completed;
            const noShowRate = data.summary.total > 0
              ? Math.round((data.summary.noShow / data.summary.total) * 100) : 0;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--sp-3)' }}>
                <StatCard label="Ingresos" value={fmt(data.summary.revenue, currency)} accent />
                <StatCard label="Total citas" value={data.summary.total} />
                <StatCard label="Atendidas" value={attended}
                  sub={data.summary.completed > 0 ? `${data.summary.completed} completadas` : undefined} />
                <StatCard label="Canceladas" value={data.summary.cancelled} />
                <StatCard
                  label="No asistieron"
                  value={data.summary.noShow}
                  sub={data.summary.noShow > 0 ? `${noShowRate}% del total` : 'Sin ausencias'}
                />
              </div>
            );
          })()}

          {/* Clientes */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
          }}>
            <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
              Clientes
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Total únicos</span>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{data.customers.total}</span>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                {/* stacked bar */}
                <div style={{ display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                  {data.customers.new > 0 && (
                    <div style={{
                      flex: data.customers.new,
                      background: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>
                        {data.customers.total > 0 ? Math.round((data.customers.new / data.customers.total) * 100) : 0}%
                      </span>
                    </div>
                  )}
                  {data.customers.recurring > 0 && (
                    <div style={{
                      flex: data.customers.recurring,
                      background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 10, color: '#000', fontWeight: 700 }}>
                        {data.customers.recurringPct}%
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--violet)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nuevos: <strong>{data.customers.new}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Recurrentes: <strong>{data.customers.recurring}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horas pico + Días */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>

            {/* Peak hours */}
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
                Horas pico
              </p>
              {peakHoursFiltered.length === 0 ? (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>Sin datos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {peakHoursFiltered
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .sort((a, b) => a.hour - b.hour)
                    .map(h => (
                      <MiniBar
                        key={h.hour}
                        label={HOURS_LABELS[h.hour]}
                        count={h.count}
                        max={maxHour}
                        color={h.hour === data.insights.peakHour ? 'var(--gold)' : 'var(--violet)'}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Peak days */}
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
                Días con más demanda
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {data.peakDays.map(d => (
                  <MiniBar
                    key={d.day}
                    label={d.label}
                    count={d.count}
                    max={maxDay}
                    color={d.label === data.insights.peakDay ? 'var(--gold)' : 'var(--violet)'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Top services */}
          {data.topServices.length > 0 && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
                Servicios más reservados
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {data.topServices.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                    padding: 'var(--sp-3) var(--sp-4)',
                    background: i === 0 ? 'var(--gold-subtle)' : 'transparent',
                    border: `1px solid ${i === 0 ? 'var(--gold-border)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-lg)',
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'var(--gold)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: i === 0 ? '#000' : 'var(--text-muted)',
                    }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {s.count} cita{s.count !== 1 ? 's' : ''}
                    </span>
                    {s.revenue > 0 && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 700 }}>
                        {fmt(s.revenue, currency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No-shows por servicio */}
          {data.servicesByNoShow && data.servicesByNoShow.length > 0 && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
                Servicios con más ausencias
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {data.servicesByNoShow.map((s, i) => {
                  const rate = s.count > 0 ? Math.round((s.noShow / s.count) * 100) : 0;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                      padding: 'var(--sp-3) var(--sp-4)',
                      border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                    }}>
                      <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {s.noShow} ausencia{s.noShow !== 1 ? 's' : ''}
                      </span>
                      <span style={{
                        fontSize: 'var(--text-xs)', fontWeight: 700, color: '#ef4444',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 999, padding: '2px 8px',
                      }}>
                        {rate}% de sus citas
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-professional (business only) */}
          {role === 'business' && data.professionals && data.professionals.length > 0 && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', color: 'var(--text)' }}>
                Rendimiento por profesional
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {data.professionals.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
                    padding: 'var(--sp-3) var(--sp-4)',
                    border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--gold-subtle)', color: 'var(--gold)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 'var(--text-sm)',
                    }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <p style={{ flex: 1, fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', minWidth: 100 }}>{p.name}</p>
                    <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                      {[
                        { label: 'Atendidas', val: p.confirmed },
                        { label: 'Canceladas', val: p.cancelled },
                        { label: 'Ingresos', val: fmt(p.revenue, currency), gold: true },
                      ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center', minWidth: 64 }}>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>{item.label}</p>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: item.gold ? 'var(--gold)' : 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                            {item.val}
                          </p>
                        </div>
                      ))}
                      {p.noShow > 0 && (
                        <div style={{ textAlign: 'center', minWidth: 64 }}>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>No-shows</p>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>
                            {p.noShow}
                            {p.noShowRate > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 3 }}>({p.noShowRate}%)</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
