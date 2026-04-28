export default function BusinessWelcomeModal({ business, onClose }) {
  const steps = [
    'Completa el perfil de tu negocio',
    'Agrega tus servicios',
    'Añade profesionales al equipo',
    'Verifica el email del negocio',
    'Recibe tu primera reserva',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)', padding: 'var(--sp-8)',
          maxWidth: 440, width: '90%', position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position:'absolute', top:'var(--sp-4)', right:'var(--sp-4)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4, borderRadius:'var(--r-md)' }}
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={{ textAlign:'center', marginBottom:'var(--sp-6)' }}>
          <div style={{ width:56, height:56, borderRadius:'var(--r-xl)', background:'var(--gold-subtle)', color:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto var(--sp-4)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h2 style={{ fontSize:'var(--text-xl)', fontWeight:800, color:'var(--text)', margin:'0 0 var(--sp-2)', fontFamily:'var(--font-heading)' }}>
            ¡Bienvenido, {business.name}!
          </h2>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.6, margin:0 }}>
            Tu negocio ya está creado. Completa estos pasos para empezar a recibir reservas.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-1)', marginBottom:'var(--sp-6)' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', padding:'var(--sp-2) 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--gold-subtle)', color:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize:'var(--text-sm)', color:'var(--text)', fontWeight:500 }}>{s}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={onClose}>
          Empezar ahora
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
