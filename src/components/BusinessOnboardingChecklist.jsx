import { Link } from 'react-router-dom';

const STEPS = [
  {
    id: 'created',
    label: 'Crear el negocio',
    desc: 'Tu negocio ya está registrado en la plataforma.',
    done: () => true,
    cta: null,
  },
  {
    id: 'profile',
    label: 'Completar el perfil',
    desc: 'Agrega descripción y teléfono para que los clientes te encuentren.',
    done: b => !!(b.description?.trim() && b.phone?.trim()),
    cta: { label: 'Ir a Perfil', tab: 'perfil' },
  },
  {
    id: 'service',
    label: 'Agregar un servicio',
    desc: 'Sin servicios los clientes no pueden hacer reservas.',
    done: b => (b.services?.length ?? 0) > 0,
    cta: { label: 'Ir a Agenda', href: '/agenda' },
  },
  {
    id: 'professional',
    label: 'Añadir un profesional',
    desc: 'Usa el código de vinculación para invitar a tu equipo.',
    done: b => (b.professionals?.length ?? 0) > 0,
    cta: null,
  },
  {
    id: 'email',
    label: 'Verificar el email',
    desc: 'Tu negocio aparecerá como verificado en el catálogo público.',
    done: b => !!b.emailVerified,
    cta: { label: 'Ir a Perfil', tab: 'perfil' },
  },
];

export default function BusinessOnboardingChecklist({ business, onSwitchTab }) {
  const steps  = STEPS.map(s => ({ ...s, isDone: s.done(business) }));
  const done   = steps.filter(s => s.isDone).length;
  const total  = steps.length;
  const allDone = done === total;
  const pct    = Math.round((done / total) * 100);

  if (allDone) return null;

  return (
    <div className="ob-checklist">
      <div className="ob-header">
        <div>
          <p className="ob-title">Primeros pasos</p>
          <p className="ob-sub">{done} de {total} completados</p>
        </div>
        <span className="ob-pct">{pct}%</span>
      </div>

      <div className="ob-track">
        <div className="ob-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="ob-steps">
        {steps.map(step => (
          <div key={step.id} className={`ob-step${step.isDone ? ' ob-step--done' : ''}`}>
            <div className="ob-step-icon">
              {step.isDone
                ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <span />
              }
            </div>
            <div className="ob-step-body">
              <p className="ob-step-label">{step.label}</p>
              {!step.isDone && <p className="ob-step-desc">{step.desc}</p>}
            </div>
            {!step.isDone && step.cta && (
              step.cta.tab
                ? <button className="ob-step-cta" onClick={() => onSwitchTab(step.cta.tab)}>{step.cta.label}</button>
                : <Link to={step.cta.href} className="ob-step-cta">{step.cta.label}</Link>
            )}
          </div>
        ))}
      </div>

      <p className="ob-footer">
        Cuando completes todos los pasos, tu negocio estará listo para recibir reservas.
      </p>
    </div>
  );
}
