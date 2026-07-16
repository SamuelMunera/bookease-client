/**
 * Tarjeta de sellos (punch-card) reutilizable.
 *
 * Se usa en tres contextos: la ficha pública del negocio, la vista "Mis
 * tarjetas" del cliente y el panel de fidelización del negocio (preview).
 * Usa var(--gold) para heredar el acento y quedar coherente con el resto.
 *
 * Props:
 *  - stamps        (number)   sellos acumulados en el ciclo actual
 *  - target        (number)   sellos necesarios para la recompensa
 *  - rewardLabel   (string)   descripción de la recompensa (ej. "1 servicio gratis")
 *  - state         ('active'|'reward'|'paused')  estado visual
 *  - compact       (bool)     versión reducida (para listas)
 *  - businessName  (string?)  cabecera opcional
 *  - businessLogo  (string?)  logo opcional junto al nombre
 *  - cyclesCompleted (number?) ciclos ya completados (canjes históricos)
 */
export default function LoyaltyPunchCard({
  stamps = 0,
  target = 8,
  rewardLabel,
  state = 'active',
  compact = false,
  businessName,
  businessLogo,
  cyclesCompleted = 0,
}) {
  const safeTarget = Math.max(1, Number(target) || 1);
  const safeStamps = Math.min(Math.max(0, Number(stamps) || 0), safeTarget);
  const remaining = Math.max(0, safeTarget - safeStamps);
  const isReward = state === 'reward';
  const isPaused = state === 'paused';

  const dot = compact ? 22 : 34;
  const gap = compact ? 6 : 10;

  return (
    <div
      className="loyalty-card"
      style={{
        border: `1px solid ${isReward ? 'var(--gold)' : 'var(--gold-border)'}`,
        borderRadius: 'var(--radius-lg, 16px)',
        padding: compact ? 14 : 20,
        background: isReward ? 'var(--gold-subtle)' : 'var(--surface, var(--bg-elevated, #fff))',
        opacity: isPaused ? 0.6 : 1,
        boxShadow: isReward ? 'var(--shadow-gold)' : 'none',
      }}
    >
      {(businessName || businessLogo) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {businessLogo && (
            <img
              src={businessLogo}
              alt=""
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
            />
          )}
          {businessName && (
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{businessName}</span>
          )}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${dot}px, 1fr))`,
          gap,
          marginBottom: compact ? 8 : 14,
          maxWidth: safeTarget <= 10 ? (dot + gap) * Math.min(safeTarget, 5) : undefined,
        }}
        role="img"
        aria-label={`${safeStamps} de ${safeTarget} sellos`}
      >
        {Array.from({ length: safeTarget }).map((_, i) => {
          const filled = i < safeStamps;
          return (
            <span
              key={i}
              style={{
                width: dot,
                height: dot,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: filled ? 'var(--gold)' : 'transparent',
                border: filled ? 'none' : '2px dashed var(--gold-border)',
                color: filled ? '#1a1205' : 'var(--text-muted)',
                transition: 'all .2s ease',
              }}
            >
              {filled ? (
                <svg width={dot * 0.5} height={dot * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span style={{ fontSize: compact ? 10 : 12, opacity: 0.5 }}>{i + 1}</span>
              )}
            </span>
          );
        })}
      </div>

      {!compact && (
        <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
          {isPaused ? (
            <span style={{ color: 'var(--text-muted)' }}>Programa en pausa</span>
          ) : isReward ? (
            <strong style={{ color: 'var(--gold-dark)' }}>
              ¡Recompensa lista! {rewardLabel ? `— ${rewardLabel}` : ''}
            </strong>
          ) : remaining === 0 ? (
            <strong style={{ color: 'var(--gold-dark)' }}>¡Completaste la tarjeta!</strong>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Te {remaining === 1 ? 'falta' : 'faltan'} <strong style={{ color: 'var(--text)' }}>{remaining}</strong>{' '}
              {remaining === 1 ? 'sello' : 'sellos'} para <strong style={{ color: 'var(--text)' }}>{rewardLabel || 'tu recompensa'}</strong>
            </span>
          )}
          {cyclesCompleted > 0 && (
            <span style={{ display: 'block', marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {cyclesCompleted} {cyclesCompleted === 1 ? 'recompensa ganada' : 'recompensas ganadas'} en total
            </span>
          )}
        </div>
      )}

      {compact && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {isReward ? (
            <strong style={{ color: 'var(--gold-dark)' }}>¡Recompensa lista!</strong>
          ) : (
            <span>{safeStamps}/{safeTarget} sellos</span>
          )}
        </div>
      )}
    </div>
  );
}
