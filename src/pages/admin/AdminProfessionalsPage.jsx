import { useState, useEffect } from 'react';
import api from '../../api';

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold)',
    }}>
      {initials}
    </div>
  );
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.adminProfessionals().then(setProfessionals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = professionals.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.business?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Profesionales</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
        {professionals.length} profesionales registrados en la plataforma
      </p>

      <input
        className="input"
        placeholder="Buscar por nombre o negocio…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 360, marginBottom: 'var(--sp-6)' }}
      />

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Sin resultados.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
              display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <Avatar name={p.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.specialty || 'Sin especialidad'}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'var(--surface-2)', borderRadius: 'var(--r-md)',
                padding: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
              }}>
                🏢 {p.business ? p.business.name : <em>Sin negocio vinculado</em>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Reservas', value: p._count.bookings },
                  { label: 'Servicios', value: p._count.services },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold)' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {p.user?.email && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>✉️ {p.user.email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
