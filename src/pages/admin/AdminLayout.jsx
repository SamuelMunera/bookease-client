import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: 'dashboard',    label: 'Dashboard',     icon: '◎' },
  { to: 'businesses',   label: 'Negocios',       icon: '🏢' },
  { to: 'professionals',label: 'Profesionales',  icon: '👤' },
  { to: 'categories',   label: 'Categorías',     icon: '🏷️' },
  { to: 'finances',     label: 'Finanzas',       icon: '💰' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  function handleLogout() { logout(); navigate('/admin/login'); }

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      width: mobile ? '100%' : 220, flexShrink: 0,
      ...(mobile ? {} : { position: 'fixed', top: 0, left: 0, height: '100vh' }),
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: 'var(--sp-6) var(--sp-5)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>
            <span style={{ color: 'var(--gold)' }}>Book</span><span style={{ color: 'var(--text)' }}>ease</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Admin Panel
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSideOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
      <nav style={{ flex: 1, padding: 'var(--sp-4) var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} onClick={() => setSideOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              padding: 'var(--sp-3)', borderRadius: 'var(--r-md)',
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
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--sp-2) var(--sp-3)', marginBottom: 'var(--sp-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name}
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          padding: 'var(--sp-3)', borderRadius: 'var(--r-md)',
          border: 'none', background: 'none', cursor: 'pointer',
          fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'left',
        }}>
          ← Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sideOpen && (
        <>
          <div
            onClick={() => setSideOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', zIndex: 201 }}>
            <Sidebar mobile />
          </div>
        </>
      )}

      <main className="admin-main">
        {/* Mobile topbar */}
        <div className="admin-topbar">
          <button onClick={() => setSideOpen(true)} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)' }}>
            <span style={{ color: 'var(--gold)' }}>Book</span>ease Admin
          </div>
        </div>

        <div style={{ padding: 'var(--sp-8)' }} className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
