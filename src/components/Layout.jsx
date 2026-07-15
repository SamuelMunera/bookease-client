import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FeedbackModal from './FeedbackModal';
import api from '../api';

const NAV_LINKS = [
  { to: '/businesses', label: 'Negocios' },
  { to: '/how-it-works', label: 'Cómo funciona' },
];

// Etiqueta legible del rol activo y accesos del panel por rol — alimentan el
// menú de cuenta (hamburguesa) que agrupa dashboards, agendas y logout.
const ROLE_LABELS = { BUSINESS_OWNER: 'Negocio', PROFESSIONAL: 'Profesional', CLIENT: 'Cliente', ADMIN: 'Admin' };
const PANEL_LINKS = {
  BUSINESS_OWNER: [{ to: '/dashboard', label: 'Panel de negocio' }, { to: '/agenda', label: 'Agenda' }],
  PROFESSIONAL:   [{ to: '/pro/dashboard', label: 'Mi panel' }, { to: '/my-bookings', label: 'Mis citas' }],
  CLIENT:         [{ to: '/', label: 'Explorar' }, { to: '/my-bookings', label: 'Mis reservas' }],
  ADMIN:          [{ to: '/admin/dashboard', label: 'Panel admin' }],
};

const FOOTER_COLS = [
  {
    title: 'Para clientes',
    links: [
      { label: 'Explorar negocios', to: '/businesses' },
      { label: 'Servicios a domicilio', to: '/home-service' },
      { label: 'Mis reservas', to: '/my-bookings' },
      { label: 'Cómo funciona', to: '/how-it-works' },
      { label: 'Crear cuenta', to: '/register' },
    ],
  },
  {
    title: 'Para negocios',
    links: [
      { label: 'Registrar mi negocio', to: '/register' },
      { label: 'Panel de control', to: '/dashboard' },
      { label: 'Agenda y reservas', to: '/agenda' },
      { label: 'Para profesionales', to: '/pro/register' },
      { label: 'Planes y precios', to: '/pricing' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { label: 'Barberías', to: '/businesses?category=BARBERSHOP' },
      { label: 'Spas & Wellness', to: '/businesses?category=SPA' },
      { label: 'Salones de belleza', to: '/businesses?category=SALON' },
      { label: 'Ver todas las categorías', to: '/businesses' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', to: '/privacy' },
      { label: 'Términos de uso', to: '/terms' },
      { label: 'Cookies', to: '/cookies' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const { user, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Cambio de contexto para identidades con varios accesos (negocio + profesional).
  const CTX_HOME = { BUSINESS_OWNER: '/dashboard', PROFESSIONAL: '/pro/dashboard', CLIENT: '/', ADMIN: '/admin/dashboard' };
  async function switchTo(role) {
    try {
      const data = await api.switchContext(role);
      login(data);
      navigate(CTX_HOME[role] || '/');
    } catch { /* el guard del backend rechaza contextos no poseídos */ }
  }
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackHover, setFeedbackHover] = useState(false);
  const [footerStats, setFooterStats] = useState(null);

  useEffect(() => {
    api.getPlatformStats()
      .then(d => setFooterStats(d))
      .catch(() => {});
  }, []);

  // Lock body scroll while the mobile menu is open, so sticky/fixed page
  // elements (e.g. category filters bar) can't scroll over the drawer.
  // Solo en móvil: el dropdown de escritorio no cubre la página y no debe
  // congelar el scroll (.no-scroll lo comparten los modales).
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    document.body.classList.toggle('no-scroll', menuOpen && mobile);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen]);

  // Cerrar el menú con Escape o con un click/tap fuera de él. Los triggers
  // (chip y hamburguesa) se excluyen porque ya alternan el estado solos.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e) { if (e.key === 'Escape') setMenuOpen(false); }
    function onDown(e) {
      if (e.target instanceof Element &&
          !e.target.closest('.nav-user-menu, .nav-mobile-menu, .nav-user-chip, .nav-hamburger')) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [menuOpen]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isActive = (to) => location.pathname === to;

  // Hide the "create account" footer CTA on auth pages — it's redundant
  // (the page itself is already that call to action).
  const AUTH_PATHS = ['/login', '/register', '/pro/login', '/pro/register', '/register-business'];
  const hideRegisterCta = AUTH_PATHS.includes(location.pathname);

  return (
    <div className="app-shell">

      {/* ══════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════ */}
      <nav className="nav">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            </svg>
          </span>
          Slot<span className="nav-brand-accent">ly</span>
        </Link>

        {/* Center links */}
        <div className="nav-center">
          {NAV_LINKS.map(l => (
            <Link key={l.to + l.label} to={l.to} className={`nav-link${isActive(l.to) ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
          <Link to="/home-service" className={`nav-link${isActive('/home-service') ? ' active' : ''}`}
            style={{ color: 'var(--gold)', fontWeight: 600 }}>
            A domicilio
          </Link>
        </div>

        {/* Right side */}
        <div className="nav-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {/* — Guest — */}
          {!user && (
            <>
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
              <Link to="/register" className="nav-cta">Comenzar gratis</Link>
            </>
          )}

          {/* — Cliente — */}
          {user?.role === 'CLIENT' && (
            <>
              <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Explorar
              </Link>
              <Link to="/my-bookings" className="nav-cta-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Mis reservas
              </Link>
            </>
          )}

          {/* — Business owner — */}
          {user?.role === 'BUSINESS_OWNER' && (
            <>
              <Link to="/dashboard" className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Panel de negocio
              </Link>
              <Link to="/agenda" className="nav-cta-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Agenda
              </Link>
            </>
          )}

          {/* — Professional — */}
          {user?.role === 'PROFESSIONAL' && (
            <>
              <Link to="/pro/dashboard" className={`nav-link${isActive('/pro/dashboard') ? ' active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Mi panel
              </Link>
              <Link to="/my-bookings" className="nav-cta-outline" style={{ borderColor: 'rgba(124,92,252,0.4)', color: 'var(--violet)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Mis citas
              </Link>
            </>
          )}

          {/* — User chip: trigger del menú de cuenta en escritorio — */}
          {user && (
            <button
              type="button"
              className="nav-user-chip"
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-controls="nav-user-menu"
              aria-haspopup="true"
              aria-label="Menú de cuenta"
            >
              <div className="nav-user-avatar">
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="nav-user-name">{user.name}</span>
              <svg className="nav-user-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}

          {/* Hamburger (mobile) */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú" aria-expanded={menuOpen} aria-controls={user ? 'nav-user-menu' : 'nav-mobile-menu'}>
            {menuOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Menú de invitados (móvil): navegación pública + acceso a login/registro */}
      {menuOpen && !user && (
        <div id="nav-mobile-menu" className="nav-mobile-menu" onClick={() => setMenuOpen(false)}>
          <Link to="/businesses" className="nav-mobile-link">Negocios</Link>
          <Link to="/home-service" className="nav-mobile-link" style={{ color:'var(--gold)', fontWeight:600 }}>A domicilio</Link>
          <Link to="/how-it-works" className="nav-mobile-link">Cómo funciona</Link>
          <Link to="/pro/login" className="nav-mobile-link" style={{ color: 'var(--violet)' }}>Soy profesional</Link>
          <Link to="/login" className="nav-mobile-link">Iniciar sesión</Link>
          <Link to="/register" className="nav-mobile-cta">Comenzar gratis</Link>
          <button className="nav-mobile-link nav-mobile-theme" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
            {theme === 'dark' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Modo claro
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Modo oscuro
              </>
            )}
          </button>
        </div>
      )}

      {/* Menú de cuenta (hamburguesa de usuario): agrupa panel, agenda,
          cambio de contexto negocio/profesional y logout. El mismo JSX es
          dropdown anclado en escritorio y panel completo en móvil (CSS). */}
      {menuOpen && user && (
        <div id="nav-user-menu" className="nav-user-menu" onClick={() => setMenuOpen(false)}>
          {/* — Cuenta — */}
          <div className="nav-mobile-account" onClick={e => e.stopPropagation()}>
            <div className="nav-user-avatar">{user.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="nav-mobile-account-info">
              <span className="nav-mobile-account-name">{user.name}</span>
              <span className="nav-mobile-account-role">{ROLE_LABELS[user.role] || ''}</span>
            </div>
          </div>

          {/* — Cambio de contexto (negocio + profesional) — */}
          {user.availableRoles?.length > 1 && (
            <div onClick={e => e.stopPropagation()}>
              <span className="nav-menu-section">Ver como</span>
              <div className="nav-mobile-ctx">
                {user.availableRoles
                  .filter(r => r === 'BUSINESS_OWNER' || r === 'PROFESSIONAL')
                  .map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`nav-mobile-ctx-btn${user.role === r ? ' active' : ''}`}
                      onClick={() => r !== user.role && switchTo(r)}
                    >
                      {r === 'BUSINESS_OWNER' ? 'Negocio' : 'Profesional'}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* — Panel del rol activo (dashboards y agendas) — */}
          <span className="nav-menu-section">Tu panel</span>
          {(PANEL_LINKS[user.role] ?? []).map(l => (
            <Link key={l.to + l.label} to={l.to} className={`nav-mobile-link${isActive(l.to) ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}

          {/* — Navegación general: solo móvil (en escritorio vive en nav-center) — */}
          <div className="nav-menu-general">
            <span className="nav-menu-section">Descubre</span>
            <Link to="/businesses" className={`nav-mobile-link${isActive('/businesses') ? ' active' : ''}`}>Negocios</Link>
            <Link to="/home-service" className={`nav-mobile-link${isActive('/home-service') ? ' active' : ''}`} style={{ color:'var(--gold)', fontWeight:600 }}>A domicilio</Link>
            <Link to="/how-it-works" className={`nav-mobile-link${isActive('/how-it-works') ? ' active' : ''}`}>Cómo funciona</Link>
          </div>

          {/* — Tema — */}
          <button className="nav-mobile-link nav-mobile-theme" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
            {theme === 'dark' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Modo claro
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Modo oscuro
              </>
            )}
          </button>

          {/* — Cerrar sesión: siempre al final, separado del resto — */}
          <button className="nav-mobile-link nav-menu-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="site-footer">

        {/* ── CTA banner — hidden for business owners and professionals ── */}
        {!['BUSINESS_OWNER', 'PROFESSIONAL'].includes(user?.role) && <div className="footer-cta-banner">
          <div className="footer-cta-inner">
            <div className="footer-cta-text">
              <h3 className="footer-cta-title">
                Descubre los mejores profesionales de tu ciudad
              </h3>
              <p className="footer-cta-sub">
                Barberías, spas y salones verificados — explora, compara servicios y reserva con un clic.
              </p>
            </div>
            <div className="footer-cta-actions">
              <Link to="/businesses" className="footer-cta-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Explorar negocios
              </Link>
            </div>
          </div>
        </div>}

        {/* ── Main footer body ── */}
        <div className="footer-body">
          {/* Brand column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                </svg>
              </span>
              Slot<span>ly</span>
            </Link>
            <p className="footer-brand-desc">
              La plataforma de reservas para barberías, spas y salones de belleza. Conectamos clientes con los mejores profesionales.
            </p>
            {/* Social */}
            <div className="footer-social">
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href="#" className="footer-social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Trust badges */}
            <div className="footer-trust">
              <div className="footer-trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Pagos seguros
              </div>
              <div className="footer-trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Cancelación gratis
              </div>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title} className="footer-link-col">
              <h4 className="footer-col-title">{col.title}</h4>
              <ul className="footer-link-list">
                {col.links
                  .filter(l => !(hideRegisterCta && l.to === '/register'))
                  .map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="footer-link">{l.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* Newsletter column */}
          <div className="footer-newsletter-col">
            <h4 className="footer-col-title">Novedades</h4>
            <p className="footer-newsletter-sub">
              Recibe ofertas exclusivas y los mejores negocios de tu ciudad.
            </p>
            <div className="footer-newsletter-form">
              <input
                type="email"
                placeholder="tu@email.com"
                className="footer-newsletter-input"
                aria-label="Correo electrónico"
              />
              <button className="footer-newsletter-btn" aria-label="Suscribirse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="footer-stat-num">
                  {footerStats ? `${footerStats.businesses.toLocaleString()}+` : '—'}
                </span>
                <span className="footer-stat-label">Negocios</span>
              </div>
              <div className="footer-stat-sep" />
              <div className="footer-stat">
                <span className="footer-stat-num">
                  {footerStats ? `${footerStats.bookings.toLocaleString()}+` : '—'}
                </span>
                <span className="footer-stat-label">Reservas</span>
              </div>
              <div className="footer-stat-sep" />
              <div className="footer-stat">
                <span className="footer-stat-num">
                  {footerStats ? `${footerStats.cities}` : '—'}
                </span>
                <span className="footer-stat-label">Ciudades</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Slotly · Todos los derechos reservados
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
            <button
              onClick={() => setFeedbackOpen(true)}
              style={{
                background: feedbackHover ? 'rgba(212,168,83,.2)' : 'rgba(212,168,83,.1)',
                border:'1px solid rgba(212,168,83,.25)',
                borderRadius:'var(--r-full)', padding:'4px 14px',
                color:'var(--gold)', fontSize:'var(--text-xs)', fontWeight:600,
                cursor:'pointer', letterSpacing:'.04em', textTransform:'uppercase',
                transition:'background .15s',
              }}
              onMouseEnter={() => setFeedbackHover(true)}
              onMouseLeave={() => setFeedbackHover(false)}
            >
              Ayúdanos a mejorar
            </button>
            <div className="footer-bottom-badge">
              <span className="footer-live-dot" />
              Sistema activo
            </div>
          </div>
        </div>
      </footer>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
