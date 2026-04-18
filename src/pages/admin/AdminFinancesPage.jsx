export default function AdminFinancesPage() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Finanzas</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
        Ingresos, comisiones y métricas financieras de la plataforma
      </p>
      <div style={{
        border: '2px dashed var(--border)', borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-16)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>💰</div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
          Próximamente
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 360, margin: '0 auto' }}>
          Aquí verás ingresos por negocio, comisiones de la plataforma, pagos pendientes y métricas financieras en tiempo real.
        </p>
      </div>
    </div>
  );
}
