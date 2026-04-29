import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlansForCountry } from '../utils/plans';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 Estados Unidos' };

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PlanCard({ plan, isCurrentPlan, onSelect, selecting }) {

  return (
    <div className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}${isCurrentPlan ? ' pricing-card--current' : ''}`}>
      {plan.popular && <div className="pricing-popular-badge">Más popular</div>}
      {isCurrentPlan && <div className="pricing-current-badge">Plan actual</div>}

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
          : '6 o más profesionales'
        }
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
        ) : isCurrentPlan ? (
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} disabled>
            Plan activo
          </button>
        ) : (
          <button
            className={`btn${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onSelect(plan.id)}
            disabled={selecting}
          >
            {selecting ? 'Actualizando…' : 'Elegir plan'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PricingPage({ currentPlan, businessCountry, onPlanSelected }) {
  const [country, setCountry] = useState(businessCountry || 'CO');
  const [selecting, setSelecting] = useState(null);
  const [msg, setMsg] = useState('');

  const plans = getPlansForCountry(country);

  async function handleSelect(planId) {
    if (!onPlanSelected) return;
    setSelecting(planId);
    setMsg('');
    try {
      await onPlanSelected(planId);
      setMsg('✓ Plan actualizado');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSelecting(null);
      setTimeout(() => setMsg(''), 3500);
    }
  }

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
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto var(--sp-6)' }}>
          {country === 'CO'
            ? 'Precios fijos en pesos colombianos. Sin sorpresas, sin conversiones.'
            : 'Precios fijos en dólares. Sin sorpresas, sin conversiones.'}
        </p>

        {/* Country toggle */}
        <div style={{ display: 'inline-flex', gap: 'var(--sp-1)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: 4 }}>
          {['CO', 'US'].map(c => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                background: country === c ? 'var(--gold)' : 'transparent',
                color: country === c ? '#0A0808' : 'var(--text-muted)',
                transition: 'all .15s',
              }}
            >
              {COUNTRY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            onSelect={handleSelect}
            selecting={selecting === plan.id}
          />
        ))}
      </div>

      {msg && (
        <p style={{ textAlign: 'center', marginTop: 'var(--sp-5)', fontSize: 'var(--text-sm)', color: msg.startsWith('✓') ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
          {msg}
        </p>
      )}

      {/* ── Footer note ── */}
      <p style={{ textAlign: 'center', marginTop: 'var(--sp-8)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
        Todos los planes incluyen soporte básico por email. Los pagos se habilitarán próximamente.
      </p>
    </div>
  );
}
