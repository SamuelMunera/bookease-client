import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Negocios', value: stats?.businesses, icon: '🏢', color: '#f59e0b' },
    { label: 'Profesionales', value: stats?.professionals, icon: '👤', color: '#6366f1' },
    { label: 'Reservas', value: stats?.bookings, icon: '📅', color: '#10b981' },
    { label: 'Usuarios', value: stats?.users, icon: '🧑', color: '#3b82f6' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
        Resumen general de la plataforma
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
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
