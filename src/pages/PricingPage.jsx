import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlansForCountry, FEATURES, COMPARE_FEATURE_KEYS } from '../utils/plans';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';
import useSEO from '../hooks/useSEO';
import api from '../api';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 United States' };

const TRUST_BADGES = [
  { icon: '🔒', label: 'Sin tarjeta de crédito' },
  { icon: '↩️', label: 'Cancela cuando quieras' },
  { icon: '⚡', label: 'Soporte prioritario incluido' },
  { icon: '🛡️', label: 'Datos seguros y cifrados' },
];

const FAQ_ITEMS = [
  {
    q: '¿El soporte prioritario es solo para los planes más caros?',
    a: 'No. El soporte prioritario está incluido desde el plan Independiente — todos los negocios en Slotly reciben la misma atención rápida.',
  },
  {
    q: '¿Qué diferencia a Equipo de Estudio?',
    a: 'Ambos incluyen código de vinculación y analíticas avanzadas. La diferencia es la capacidad: Equipo organiza hasta 3 profesionales y Estudio hasta 6, ideal para negocios que siguen creciendo.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí. Puedes subir de plan en cualquier momento desde el panel de tu negocio a medida que tu equipo crece.',
  },
  {
    q: '¿Hay permanencia mínima?',
    a: 'No. Todos los planes son mensuales y puedes cancelar cuando quieras, sin penalizaciones.',
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

function CrossIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function planLimitLabel(plan) {
  if (!plan.professionals) return '7+ profesionales';
  if (plan.professionals === 1) return '1 profesional';
  return `Hasta ${plan.professionals} profesionales`;
}

function planCta(plan, user) {
  if (plan.enterprise) {
    return (
      <a href="mailto:hola@slotly.app?subject=Plan Empresarial" className="btn btn-secondary btn-full">
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

// Redirects the browser to Wompi's sandbox Web Checkout via a hidden auto-submitted form.
function redirectToWompiCheckout(checkout, redirectUrl) {
  const form = document.createElement('form');
  form.method = 'GET';
  form.action = checkout.checkoutUrl;
  form.style.display = 'none';

  const fields = {
    'public-key': checkout.publicKey,
    'currency': checkout.currency,
    'amount-in-cents': String(checkout.amountInCents),
    'reference': checkout.reference,
    'signature:integrity': checkout.signature,
    'redirect-url': redirectUrl,
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

function WompiPayButton({ plan, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eligible = !plan.enterprise && plan.price
    && ((user?.role === 'BUSINESS_OWNER' && plan.forType === 'business')
      || (user?.role === 'PROFESSIONAL' && plan.forType === 'professional'));

  if (!eligible) return null;

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const checkout = await api.createWompiCheckout(plan.id);
      const redirectPath = user.role === 'BUSINESS_OWNER' ? '/dashboard' : '/pro/dashboard';
      redirectToWompiCheckout(checkout, `${window.location.origin}${redirectPath}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 'var(--sp-2)' }}>
      <button type="button" className="btn btn-secondary btn-full" onClick={handlePay} disabled={loading}>
        {loading ? 'Redirigiendo a Wompi…' : 'Pagar con Wompi (sandbox)'}
      </button>
      {error && <p className="error-msg" style={{ marginTop: 'var(--sp-2)' }}>{error}</p>}
    </div>
  );
}

function PlanCard({ plan, user }) {
  return (
    <div className={`pricing2-card${plan.popular ? ' pricing2-card--featured' : ''}`}>
      <div className="pricing2-card-top">
        <span className="pricing2-audience">{plan.audience}</span>
        {plan.popular && <span className="pricing2-recommended">Recomendado</span>}
      </div>

      <h3 className="pricing2-name">{plan.name}</h3>
      <p className="pricing2-tagline">{plan.tagline}</p>

      <div className="pricing2-price">
        {plan.enterprise ? (
          <span className="pricing2-amount pricing2-amount--custom">{plan.priceLabel}</span>
        ) : (
          <>
            <span className="pricing2-currency">{plan.currency}</span>
            <span className="pricing2-amount">{plan.priceLabel}</span>
            <span className="pricing2-period">/{plan.interval}</span>
          </>
        )}
      </div>

      <p className="pricing2-limit">{planLimitLabel(plan)}</p>
      <p className="pricing2-benefit">{plan.mainBenefit}</p>

      <ul className="pricing2-includes">
        {plan.features.map(f => (
          <li key={f}><CheckIcon /><span>{f}</span></li>
        ))}
      </ul>

      {plan.excludedFeatures.length > 0 && (
        <ul className="pricing2-excludes">
          {plan.excludedFeatures.map(f => (
            <li key={f}><CrossIcon /><span>{f}</span></li>
          ))}
        </ul>
      )}

      <p className="pricing2-ideal">{plan.idealFor}</p>

      <div className="pricing2-cta">
        {planCta(plan, user)}
        <WompiPayButton plan={plan} user={user} />
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="pricing2-grid">
      {Array(4).fill(null).map((_, i) => (
        <div key={i} className="pricing2-card" style={{ minHeight: 460 }}>
          <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-4)' }} />
          <div className="skeleton" style={{ height: 20, width: '40%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-2)' }} />
          <div className="skeleton" style={{ height: 12, width: '75%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-6)' }} />
          <div className="skeleton" style={{ height: 48, width: '55%', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-6)' }} />
          {[1,2,3,4,5].map(n => (
            <div key={n} className="skeleton" style={{ height: 12, width: `${55 + n * 7}%`, borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-3)' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function planHasFeature(plan, key) {
  return plan.features.includes(FEATURES[key]);
}

function CompareMatrix({ plans }) {
  const rows = [
    { label: 'Profesionales', values: plans.map(planLimitLabel) },
    ...COMPARE_FEATURE_KEYS.map(key => ({
      label: FEATURES[key],
      values: plans.map(p => planHasFeature(p, key)),
    })),
  ];

  return (
    <div className="pricing2-matrix-wrap">
      <table className="pricing2-matrix">
        <thead>
          <tr>
            <th></th>
            {plans.map(p => (
              <th key={p.id} className={p.popular ? 'pricing2-matrix-featured-col' : ''}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((v, i) => (
                <td key={plans[i].id} className={plans[i].popular ? 'pricing2-matrix-featured-col' : ''}>
                  {typeof v === 'boolean'
                    ? (v ? <span className="pricing2-matrix-yes"><CheckIcon /></span> : <span className="pricing2-matrix-no"><CrossIcon /></span>)
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
    description: 'Compara los planes de Slotly para profesionales independientes y negocios de estética y bienestar. Precios claros en pesos colombianos o dólares, soporte prioritario incluido en todos los planes.',
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
    <div className="page pricing2-page">

      {/* ── Hero ── */}
      <div className="pricing2-hero">
        <p className="pricing2-eyebrow">Planes Slotly</p>
        <h1 className="pricing2-title">Un plan claro para cada etapa de tu negocio</h1>
        <p className="pricing2-subtitle">
          {country === 'CO'
            ? 'Precios fijos en pesos colombianos, sin comisiones por reserva. Soporte prioritario incluido desde el primer plan.'
            : 'Fixed prices in US dollars, no per-booking commissions. Priority support included from day one, on every plan.'}
        </p>

        {geoLoading ? (
          <div className="pricing2-country-badge pricing2-country-badge--loading">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Detectando ubicación…
          </div>
        ) : (
          <div className="pricing2-country-badge">{COUNTRY_LABELS[country]}</div>
        )}

        {!geoLoading && (
          <p className="pricing2-country-switch">
            ¿Estás en otro país?{' '}
            {['CO', 'US'].filter(c => c !== country).map(c => (
              <button key={c} onClick={() => setCountry(c)} className="pricing2-link-btn">
                Ver precios {COUNTRY_LABELS[c]}
              </button>
            ))}
          </p>
        )}
      </div>

      {/* ── Role context hint ── */}
      {user?.role === 'PROFESSIONAL' && (
        <p className="pricing2-role-hint">
          Como profesional independiente solo puedes contratar el plan Independiente.
        </p>
      )}
      {user?.role === 'BUSINESS_OWNER' && (
        <p className="pricing2-role-hint">
          Estos planes son para tu negocio. El plan Independiente es para profesionales sin negocio.
        </p>
      )}

      {/* ── Plan cards ── */}
      {geoLoading
        ? <PricingSkeleton />
        : (
          <div className="pricing2-grid">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} user={user} />)}
          </div>
        )
      }

      {!geoLoading && (
        <p className="pricing2-trial-note">
          Todos los planes incluyen 14 días de prueba gratuita · Cancela cuando quieras
        </p>
      )}

      {/* ── Trust badges ── */}
      {!geoLoading && (
        <div className="pricing2-trust-row">
          {TRUST_BADGES.map(b => (
            <div key={b.label} className="pricing2-trust-item">
              <span className="pricing2-trust-icon">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Compare matrix ── */}
      {!geoLoading && plans.filter(p => !p.enterprise).length > 1 && (
        <div className="pricing2-section">
          <h2 className="pricing2-section-title">Las diferencias clave entre planes</h2>
          <CompareMatrix plans={plans.filter(p => !p.enterprise)} />
        </div>
      )}

      {/* ── FAQ ── */}
      {!geoLoading && (
        <div className="pricing2-section">
          <h2 className="pricing2-section-title">Preguntas frecuentes</h2>
          <div className="pricing2-faq">
            {FAQ_ITEMS.map(item => (
              <details key={item.q} className="pricing2-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ── Final CTA ── */}
      {!geoLoading && !user && (
        <div className="pricing2-final-cta">
          <h2 className="pricing2-final-cta-title">¿Listo para empezar?</h2>
          <p className="pricing2-final-cta-sub">Crea tu cuenta gratis, configura tu agenda en minutos y prueba Slotly durante 14 días sin costo.</p>
          <div className="pricing2-final-cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Crear cuenta de negocio</Link>
            <Link to="/pro/register" className="btn btn-secondary btn-lg">Soy profesional independiente</Link>
          </div>
        </div>
      )}
    </div>
  );
}
