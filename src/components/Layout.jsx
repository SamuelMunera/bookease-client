import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <nav className="nav">
        <Link to="/" className="nav-brand">
          Book<span className="nav-brand-accent">ease</span>
        </Link>

        <div className="nav-links">
          {!user && (
            <>
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
              <Link to="/register">
                <button className="btn btn-primary btn-sm">Registrarse</button>
              </Link>
            </>
          )}

          {user?.role === 'CLIENT' && (
            <Link to="/my-bookings" className="nav-link">Mis reservas</Link>
          )}

          {user?.role === 'BUSINESS_OWNER' && (
            <Link to="/agenda" className="nav-link">Mi agenda</Link>
          )}

          {user && (
            <>
              <span className="nav-divider" />
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Salir</button>
            </>
          )}
        </div>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="footer">
        <span className="footer-brand">Book<span>ease</span></span>
        <span className="footer-copy">© {new Date().getFullYear()} · Reservas para barberías, spa y salones</span>
      </footer>
    </div>
  );
}
