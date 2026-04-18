import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: 'dashboard', label: 'Dashboard', icon: '◎' },
  { to: 'businesses', label: 'Negocios', icon: '🏢' },
  { to: 'professionals', label: 'Profesionales', icon: '👤' },
  { to: 'finances', label: 'Finanzas', icon: '💰' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 220, flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 'var(--sp-6) var(--sp-5)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>
            <span style={{ color: 'var(--gold)' }}>Book</span><span style={{ color: 'var(--text)' }}>ease</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Admin Panel
          </div>
        </div>
        <nav style={{ flex: 1, padding: 'var(--sp-4) var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--r-md)',
                textDecoration: 'none', fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                background: isActive ? 'var(--gold-subtle)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 'var(--sp-4) var(--sp-3)', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--sp-2) var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
            {user?.name} · {user?.email}
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
            padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--r-md)',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'left',
          }}>
            ← Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 220, flex: 1, padding: 'var(--sp-8)', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
