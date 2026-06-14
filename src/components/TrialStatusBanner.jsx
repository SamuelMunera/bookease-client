import { Link } from 'react-router-dom';

const baseStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
  gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-lg)',
  marginBottom: 'var(--sp-4)', fontSize: 'var(--text-sm)',
};

// Shows the trial countdown (no card required) while trialing, and a
// payment-required notice once the 15-day trial ends without a paid plan.
export default function TrialStatusBanner({ subscription }) {
  if (!subscription) return null;
  const { billingState, trialDaysRemaining } = subscription;

  if (billingState === 'trial_active') {
    return (
      <div style={{ ...baseStyle, background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.25)' }}>
        <span>
          🎁 Prueba gratis: te quedan <strong>{trialDaysRemaining} día{trialDaysRemaining === 1 ? '' : 's'}</strong>.
          {' '}No necesitas tarjeta — te pediremos tus datos bancarios al finalizar el periodo de prueba.
        </span>
      </div>
    );
  }

  if (billingState === 'payment_required') {
    return (
      <div style={{ ...baseStyle, background: 'rgba(255,159,28,0.1)', border: '1px solid rgba(255,159,28,0.3)' }}>
        <span>
          ⏰ Tu prueba gratis de 15 días terminó. Agrega un método de pago para seguir recibiendo reservas nuevas.
        </span>
        <Link to="/pricing" className="btn btn-primary btn-sm">Agregar método de pago</Link>
      </div>
    );
  }

  return null;
}
