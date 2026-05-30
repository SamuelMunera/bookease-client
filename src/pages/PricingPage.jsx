import { useEffect, useState } from 'react';
import { getPlansForCountry } from '../utils/plans';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 Estados Unidos' };

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

export default function PricingPage() {
  const { user } = useAuth();
  const { country: detectedCountry, loading: geoLoading } = useCountry();
  const [country, setCountry] = useState(null); // null = aún no inicializado

  // Sincroniza con el país detectado la primera vez que llega
  useEffect(() => {
    if (!geoLoading && country === null) setCountry(detectedCountry);
  }, [geoLoading, detectedCountry, country]);

  const activeCountry = country ?? detectedCountry ?? 'CO';
  const allPlans = getPlansForCountry(activeCountry);
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
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto var(--sp-4)' }}>
          {activeCountry === 'CO'
            ? 'Precios fijos en pesos colombianos. Sin sorpresas, sin conversiones.'
            : 'Fixed prices in US dollars. No surprises, no conversions.'}
        </p>

        {/* País activo + opción de cambio discreto */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 16px', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold)' }}>
            {COUNTRY_LABELS[activeCountry]}
            {geoLoading && <span style={{ opacity: .6, fontSize: 11 }}>· detectando…</span>}
          </div>
          {/* Toggle discreto: solo si el usuario quiere ver el otro país */}
          <div style={{ display: 'inline-flex', gap: 2, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: 3 }}>
            {['CO', 'US'].map(c => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                style={{
                  padding: '4px 12px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  background: activeCountry === c ? 'var(--surface-3)' : 'transparent',
                  color: activeCountry === c ? 'var(--text)' : 'var(--text-dim)',
                  transition: 'all .15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
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
      <div className="pricing-grid">
        {(geoLoading && country === null
          ? Array(4).fill(null).map((_, i) => (
              <div key={i} className="pricing-card" style={{ minHeight: 380, background: 'var(--surface-2)' }}>
                <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 'var(--r-sm)', margin: 'var(--sp-4) 0' }} />
                <div className="skeleton" style={{ height: 40, width: '50%', borderRadius: 'var(--r-sm)', margin: 'var(--sp-3) 0' }} />
              </div>
            ))
          : plans.map(plan => <PlanCard key={plan.id} plan={plan} />)
        )}
      </div>

      {/* ── Footer note ── */}
      <p style={{ textAlign: 'center', marginTop: 'var(--sp-8)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
        Todos los planes incluyen 14 días de prueba gratuita · Cancela cuando quieras
      </p>
    </div>
  );
}
