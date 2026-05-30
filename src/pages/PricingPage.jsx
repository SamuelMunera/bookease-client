import { getPlansForCountry } from '../utils/plans';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 United States' };

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PlanCard({ plan }) {
  return (
    <div className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}>
      {plan.popular && <div className="pricing-popular-badge">Más popular</div>}

      <div className="pricing-card-head">
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

      <ul className="pricing-features">
        {plan.features.map(f => (
          <li key={f} className="pricing-feature-item">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="pricing-cta">
        {plan.enterprise ? (
          <a
            href="mailto:hola@bookease.app?subject=Plan Empresarial"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Contactar ventas
          </a>
        ) : (
          <button
            className={`btn${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            disabled
          >
            Próximamente
          </button>
        )}
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="pricing-grid">
      {Array(4).fill(null).map((_, i) => (
        <div key={i} className="pricing-card" style={{ minHeight: 380 }}>
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

export default function PricingPage() {
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
          Elige el plan que se adapta a tu negocio
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto var(--sp-5)' }}>
          {country === 'CO'
            ? 'Precios fijos en pesos colombianos. Sin sorpresas, sin conversiones.'
            : 'Fixed prices in US dollars. No surprises, no conversions.'}
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
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        )
      }

      {/* ── Footer note ── */}
      {!geoLoading && (
        <p style={{ textAlign: 'center', marginTop: 'var(--sp-8)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
          Todos los planes incluyen 14 días de prueba gratuita · Cancela cuando quieras
        </p>
      )}
    </div>
  );
}
