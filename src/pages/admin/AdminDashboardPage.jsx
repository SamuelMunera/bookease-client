import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      border: '1px solid var(--error-border)', background: 'var(--error-bg)',
      borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', textAlign: 'center',
    }}>
      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)' }}>
        {message || 'No se pudieron cargar los datos.'}
      </p>
      <button className="btn btn-primary" onClick={onRetry}>Reintentar</button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    api.adminStats()
      .then(setStats)
      .catch(err => setError(err.message || 'No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = [
    { label: 'Negocios', value: stats?.businesses, icon: '🏢', color: 'var(--warning)' },
    { label: 'Profesionales', value: stats?.professionals, icon: '👤', color: 'var(--violet)' },
    { label: 'Reservas', value: stats?.bookings, icon: '📅', color: 'var(--success)' },
    { label: 'Usuarios', value: stats?.users, icon: '🧑', color: 'var(--teal)' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
        Resumen general de la plataforma
      </p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-5)' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 148, borderRadius: 'var(--r-xl)' }} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-5)' }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 'var(--sp-3)' }}>{c.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: c.color, lineHeight: 1 }}>
                {c.value ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
