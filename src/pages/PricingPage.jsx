import { Link } from 'react-router-dom';
import { getPlansForCountry } from '../utils/plans';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';
import useSEO from '../hooks/useSEO';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 United States' };

const TRUST_BADGES = [
  { icon: '🔒', label: 'Sin tarjeta de crédito' },
  { icon: '↩️', label: 'Cancela cuando quieras' },
  { icon: '💬', label: 'Soporte en español' },
  { icon: '🛡️', label: 'Datos seguros y cifrados' },
];

const FAQ_ITEMS = [
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí. Puedes actualizar tu plan en cualquier momento desde el panel de tu negocio a medida que tu equipo crece.',
  },
  {
    q: '¿Hay permanencia mínima?',
    a: 'No. Todos los planes son mensuales y puedes cancelar cuando quieras, sin penalizaciones.',
  },
  {
    q: '¿Qué pasa si supero el número de profesionales de mi plan?',
    a: 'Te avisaremos a tiempo para que actualices a un plan superior antes de que esto afecte tu agenda.',
  },
  {
    q: '¿Cómo funciona la prueba gratuita?',
    a: '14 días con acceso completo, sin necesidad de tarjeta de crédito. Si no continúas, no se realiza ningún cobro.',
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function planCta(plan, user) {
  if (plan.enterprise) {
    return (
      <a
        href="mailto:hola@slotly.app?subject=Plan Empresarial"
        className="btn btn-secondary btn-full"
      >
        {plan.ctaLabel}
      </a>
    );
  }

  if (user?.role === 'PROFESSIONAL' && plan.forType === 'professional') {
    return (
      <Link to="/pro/dashboard" className={`btn btn-full${plan.popular ? ' btn-primary' : ' btn-secondary'}`}>
        Ir a mi panel
      </Link>
    );
  }

  if (user?.role === 'BUSINESS_OWNER' && plan.forType === 'business') {
    return (
      <Link to="/dashboard" className={`btn btn-full${plan.popular ? ' btn-primary' : ' btn-secondary'}`}>
        Gestionar en mi panel
      </Link>
    );
  }

  return (
    <Link to={plan.ctaTo} className={`btn btn-full${plan.popular ? ' btn-primary' : ' btn-secondary'}`}>
      {plan.ctaLabel}
    </Link>
  );
}

function PlanCard({ plan, user }) {
  return (
    <div className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}>
      {plan.popular && <div className="pricing-popular-badge">Más popular</div>}

      <div className="pricing-card-head">
        <p className="pricing-audience">{plan.audience}</p>
        <p className="pricing-plan-name">{plan.name}</p>
        <p className="pricing-plan-tagline">{plan.tagline}</p>
      </div>

      <div className="pricing-price-block">
        {plan.enterprise ? (
          <p className="pricing-price-main">{plan.priceLabel}</p>
        ) : (
          <>
            <span className="pricing-currency">{plan.currency}</span>
            <span className="pricing-price-main">{plan.priceLabel}</span>
            <span className="pricing-interval">/ {plan.interval}</span>
          </>
        )}
      </div>

      <div className="pricing-limit-pill">
        {plan.professionals
          ? `${plan.professionals === 1 ? '1' : `1 – ${plan.professionals}`} profesional${plan.professionals !== 1 ? 'es' : ''}`
          : '6 o más profesionales'}
      </div>

      <p className="pricing-benefit">{plan.mainBenefit}</p>

      <ul className="pricing-features">
        {plan.features.slice(1, 5).map(f => (
          <li key={f} className="pricing-feature-item">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {plan.features.length > 5 && (
        <p className="pricing-more-features">+ {plan.features.length - 5} funciones más en la tabla comparativa</p>
      )}

      <p className="pricing-ideal">{plan.idealFor}</p>

      <div className="pricing-cta">
        {planCta(plan, user)}
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="pricing-grid">
      {Array(4).fill(null).map((_, i) => (
        <div key={i} className="pricing-card" style={{ minHeight: 420 }}>
          <div className="skeleton" style={{ height: 16, width: '55%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-2)' }} />
          <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-6)' }} />
          <div className="skeleton" style={{ height: 44, width: '50%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-4)' }} />
          {[1,2,3,4].map(n => (
            <div key={n} className="skeleton" style={{ height: 12, width: `${60 + n * 8}%`, borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-3)' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PricingComparison({ plans }) {
  const rows = [
    { label: 'Profesionales', values: plans.map(p => p.professionals ? (p.professionals === 1 ? '1' : `Hasta ${p.professionals}`) : '6 o más') },
    { label: 'Reservas online ilimitadas', values: plans.map(() => true) },
    { label: 'Agenda digital', values: plans.map(() => true) },
    { label: 'Notificaciones por email', values: plans.map(() => true) },
    { label: 'Panel de negocio', values: plans.map(() => true) },
    { label: 'Código de vinculación', values: plans.map(() => true) },
    { label: 'Analytics avanzados', values: plans.map(() => true) },
    { label: 'Servicios a domicilio', values: plans.map(() => true) },
    { label: 'Soporte prioritario', values: plans.map(p => !!p.enterprise) },
    { label: 'Onboarding personalizado', values: plans.map(p => !!p.enterprise) },
  ];

  return (
    <div className="pricing-compare-wrap">
      <table className="pricing-compare">
        <thead>
          <tr>
            <th>Incluye</th>
            {plans.map(p => (
              <th key={p.id} className={p.popular ? 'pricing-compare-popular-col' : ''}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((v, i) => (
                <td key={plans[i].id} className={plans[i].popular ? 'pricing-compare-popular-col' : ''}>
                  {typeof v === 'boolean'
                    ? (v ? <span className="pricing-compare-yes"><CheckIcon /></span> : <span className="pricing-compare-no"><DashIcon /></span>)
                    : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingPage() {
  useSEO({
    title: 'Planes y precios',
    description: 'Compara los planes de Slotly para profesionales independientes y negocios de estética y bienestar. Precios claros en pesos colombianos o dólares, sin sorpresas.',
    path: '/pricing',
  });

  const { user } = useAuth();
  // country es la única fuente de verdad — viene del contexto (geo detectado + cache + override)
  const { country, loading: geoLoading, setCountry } = useCountry();

  const allPlans = getPlansForCountry(country);
  const plans = !user
    ? allPlans
    : user.role === 'PROFESSIONAL'
      ? allPlans.filter(p => p.forType === 'professional')
      : user.role === 'BUSINESS_OWNER'
        ? allPlans.filter(p => p.forType === 'business')
        : allPlans;

  return (
    <div className="page" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 'var(--sp-2)' }}>
          Planes y precios
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text)', marginBottom: 'var(--sp-3)', fontFamily: 'var(--font-heading)' }}>
          Un plan para cada etapa de tu negocio
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto var(--sp-5)' }}>
          {country === 'CO'
            ? 'Precios fijos en pesos colombianos, sin comisiones por reserva ni costos ocultos. Empieza gratis y crece a tu ritmo.'
            : 'Fixed prices in US dollars, no per-booking commissions and no hidden fees. Start free and grow at your pace.'}
        </p>

        {/* País detectado — prominente */}
        {geoLoading ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '8px 20px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Detectando ubicación…
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '8px 20px', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold)' }}>
            {COUNTRY_LABELS[country]}
          </div>
        )}

        {/* Override manual — enlace discreto debajo */}
        {!geoLoading && (
          <p style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
            ¿Estás en otro país?{' '}
            {['CO', 'US'].filter(c => c !== country).map(c => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontWeight: 600, fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}
              >
                Ver precios {COUNTRY_LABELS[c]}
              </button>
            ))}
          </p>
        )}
      </div>

      {/* ── Role context hint ── */}
      {user?.role === 'PROFESSIONAL' && (
        <p style={{ textAlign: 'center', marginTop: 'calc(var(--sp-6) * -1)', marginBottom: 'var(--sp-8)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Como profesional independiente solo puedes contratar el plan Independiente.
        </p>
      )}
      {user?.role === 'BUSINESS_OWNER' && (
        <p style={{ textAlign: 'center', marginTop: 'calc(var(--sp-6) * -1)', marginBottom: 'var(--sp-8)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Estos planes son para tu negocio. El plan Independiente es para profesionales sin negocio.
        </p>
      )}

      {/* ── Plan cards ── */}
      {geoLoading
        ? <PricingSkeleton />
        : (
          <div className="pricing-grid">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} user={user} />)}
          </div>
        )
      }

      {/* ── Footer note ── */}
      {!geoLoading && (
        <p style={{ textAlign: 'center', marginTop: 'var(--sp-8)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
          Todos los planes incluyen 14 días de prueba gratuita · Cancela cuando quieras
        </p>
      )}

      {/* ── Trust badges ── */}
      {!geoLoading && (
        <div className="pricing-trust-row">
          {TRUST_BADGES.map(b => (
            <div key={b.label} className="pricing-trust-item">
              <span className="pricing-trust-icon">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Comparison table ── */}
      {!geoLoading && plans.length > 1 && (
        <div className="pricing-compare-section">
          <h2 className="pricing-section-title">Compara los planes en detalle</h2>
          <PricingComparison plans={plans} />
        </div>
      )}

      {/* ── FAQ ── */}
      {!geoLoading && (
        <div className="pricing-faq-section">
          <h2 className="pricing-section-title">Preguntas frecuentes</h2>
          <div className="pricing-faq">
            {FAQ_ITEMS.map(item => (
              <details key={item.q} className="pricing-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ── Final CTA ── */}
      {!geoLoading && !user && (
        <div className="pricing-final-cta">
          <h2 className="pricing-final-cta-title">¿Listo para empezar?</h2>
          <p className="pricing-final-cta-sub">Crea tu cuenta gratis, configura tu agenda en minutos y prueba Slotly durante 14 días sin costo.</p>
          <div className="pricing-final-cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Crear cuenta de negocio</Link>
            <Link to="/pro/register" className="btn btn-secondary btn-lg">Soy profesional independiente</Link>
          </div>
        </div>
      )}
    </div>
  );
}
