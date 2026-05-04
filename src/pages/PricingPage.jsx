import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPlansForCountry } from '../utils/plans';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const COUNTRY_LABELS = { CO: '🇨🇴 Colombia', US: '🇺🇸 Estados Unidos' };

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PlanCard({ plan, isCurrentPlan, hasStripeSubscription, onSelect, onManage, busy }) {
  const isBusy = busy === plan.id || (busy === 'portal' && !isCurrentPlan);

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
        ) : isCurrentPlan ? (
          hasStripeSubscription ? (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onManage}
              disabled={busy === 'portal'}
            >
              {busy === 'portal' ? 'Redirigiendo…' : 'Gestionar suscripción'}
            </button>
          ) : (
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} disabled>
              Plan activo
            </button>
          )
        ) : hasStripeSubscription ? (
          <button
            className={`btn${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onSelect(plan.id)}
            disabled={!!busy}
          >
            {busy === plan.id ? 'Actualizando…' : 'Cambiar a este plan'}
          </button>
        ) : (
          <button
            className={`btn${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onSelect(plan.id)}
            disabled={!!busy}
          >
            {isBusy ? 'Redirigiendo…' : 'Suscribirme'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PricingPage({ currentPlan: propCurrentPlan, businessCountry }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [country, setCountry] = useState(businessCountry || 'CO');
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');
  const [subscription, setSubscription] = useState(null);

  // Show stripe result messages
  useEffect(() => {
    if (searchParams.get('stripe') === 'success') setMsg('✓ ¡Suscripción activada! Bienvenido a Bookease.');
    if (searchParams.get('stripe') === 'cancel') setMsg('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.');
  }, [searchParams]);

  // Fetch subscription for authenticated business owners / professionals
  useEffect(() => {
    if (!user) return;
    const fetch = user.role === 'BUSINESS_OWNER'
      ? api.getMySubscription()
      : user.role === 'PROFESSIONAL'
        ? api.getProSubscription()
        : null;
    fetch?.then(setSubscription).catch(() => {});
  }, [user]);

  const allPlans = getPlansForCountry(country);
  const plans = !user
    ? allPlans
    : user.role === 'PROFESSIONAL'
      ? allPlans.filter(p => p.forType === 'professional')
      : user.role === 'BUSINESS_OWNER'
        ? allPlans.filter(p => p.forType === 'business')
        : allPlans;
  // Has a real Stripe subscription (not cancelled/expired)
  const hasStripeSubscription = !!(
    subscription?.stripeSubscriptionId &&
    !['CANCELLED', 'EXPIRED'].includes(subscription?.status)
  );
  // Only show a plan as "current" if they actually subscribed via Stripe
  const currentPlan = hasStripeSubscription ? (propCurrentPlan || subscription?.plan) : null;

  function flash(text) {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  }

  async function handleSelect(planId) {
    if (!user) { navigate('/login'); return; }
    setBusy(planId);
    try {
      const result = await api.createCheckoutSession(planId, country);
      if (result.url) {
        // New subscription — redirect to Stripe Checkout
        window.location.href = result.url;
      } else if (result.updated) {
        // Plan changed on existing subscription
        flash('✓ Plan actualizado correctamente.');
        setBusy(null);
        // Refresh subscription state
        const fetch = user.role === 'BUSINESS_OWNER' ? api.getMySubscription() : api.getProSubscription();
        fetch.then(setSubscription).catch(() => {});
      }
    } catch (err) {
      flash(err.message);
      setBusy(null);
    }
  }

  async function handleManage() {
    if (!user) { navigate('/login'); return; }
    setBusy('portal');
    try {
      const { url } = await api.createPortalSession();
      window.location.href = url;
    } catch (err) {
      flash(err.message);
      setBusy(null);
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

      {/* ── Subscription status banner — only for active Stripe subscriptions ── */}
      {hasStripeSubscription && subscription && (
        <div style={{
          maxWidth: 640, margin: '0 auto var(--sp-8)',
          padding: 'var(--sp-3) var(--sp-4)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', textAlign: 'center',
          fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
        }}>
          {subscription.status === 'TRIALING' && (
            <>Estás en periodo de prueba gratuita hasta el{' '}
              <strong>{new Date(subscription.trialEndsAt).toLocaleDateString('es-CO')}</strong>.</>
          )}
          {subscription.status === 'ACTIVE' && (
            <>Suscripción activa — Plan <strong>{subscription.plan}</strong>. Próxima renovación el{' '}
              <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString('es-CO')}</strong>.</>
          )}
        </div>
      )}
      {subscription && !hasStripeSubscription && ['PAST_DUE','CANCELLED','EXPIRED'].includes(subscription.status) && (
        <div style={{
          maxWidth: 640, margin: '0 auto var(--sp-8)',
          padding: 'var(--sp-3) var(--sp-4)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', textAlign: 'center',
          fontSize: 'var(--text-sm)', color: 'var(--error)',
        }}>
          {subscription.status === 'PAST_DUE' && 'Pago pendiente — actualiza tu método de pago.'}
          {subscription.status === 'CANCELLED' && 'Tu suscripción está cancelada. Elige un plan para reactivar.'}
          {subscription.status === 'EXPIRED' && 'Tu acceso expiró. Elige un plan para continuar.'}
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            hasStripeSubscription={hasStripeSubscription}
            onSelect={handleSelect}
            onManage={handleManage}
            busy={busy}
          />
        ))}
      </div>

      {msg && (
        <p style={{
          textAlign: 'center', marginTop: 'var(--sp-5)',
          fontSize: 'var(--text-sm)',
          color: msg.startsWith('✓') ? 'var(--success)' : 'var(--error)',
          fontWeight: 600,
        }}>
          {msg}
        </p>
      )}

      {/* ── Footer note ── */}
      <p style={{ textAlign: 'center', marginTop: 'var(--sp-8)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
        Todos los planes incluyen 14 días de prueba gratuita · Cancela cuando quieras · Pagos seguros con Stripe
      </p>
    </div>
  );
}
