import { Link } from 'react-router-dom';

const UPDATED = '20 de abril de 2026';

export default function CookiesPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <p className="section-label">Legal</p>
        <h1 className="legal-title">Política de cookies</h1>
        <p className="legal-updated">Última actualización: {UPDATED}</p>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <p className="legal-intro">
            Esta página explica qué tecnologías de almacenamiento local utiliza Bookease, para qué sirven y cómo puedes gestionarlas.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Cookies y almacenamiento local</h2>
          <p>Bookease utiliza principalmente <strong>localStorage</strong> del navegador —una tecnología similar a las cookies— para guardar preferencias de sesión y configuración de usuario directamente en tu dispositivo. No enviamos esos datos a terceros salvo lo estrictamente necesario para el funcionamiento del servicio.</p>
        </section>

        <section className="legal-section">
          <h2>2. Tecnologías que usamos</h2>

          <div className="legal-cookie-table">

            <div className="legal-cookie-row legal-cookie-header">
              <span>Nombre / tipo</span>
              <span>Finalidad</span>
              <span>Duración</span>
            </div>

            <div className="legal-cookie-row">
              <span><strong>token</strong><br /><em>localStorage</em></span>
              <span>Mantiene tu sesión iniciada. Almacena el token de autenticación JWT que identifica tu cuenta.</span>
              <span>Hasta cerrar sesión</span>
            </div>

            <div className="legal-cookie-row">
              <span><strong>user</strong><br /><em>localStorage</em></span>
              <span>Guarda datos básicos del perfil (nombre, rol) para mostrarlos sin necesidad de consultar el servidor en cada carga.</span>
              <span>Hasta cerrar sesión</span>
            </div>

            <div className="legal-cookie-row">
              <span><strong>theme</strong><br /><em>localStorage</em></span>
              <span>Recuerda tu preferencia de modo claro u oscuro para mantenerla entre visitas.</span>
              <span>Persistente</span>
            </div>

            <div className="legal-cookie-row">
              <span><strong>Google OAuth</strong><br /><em>cookies de tercero</em></span>
              <span>Si inicias sesión con Google, Google puede establecer sus propias cookies de autenticación según su política de privacidad.</span>
              <span>Según Google</span>
            </div>

          </div>
        </section>

        <section className="legal-section">
          <h2>3. Sin cookies de rastreo ni publicidad</h2>
          <p>Bookease no utiliza cookies de rastreo publicitario, perfilado de usuarios ni redes de retargeting. No compartimos datos de navegación con plataformas publicitarias.</p>
          <p>Actualmente no usamos herramientas de analítica de terceros (como Google Analytics). Si en el futuro lo hacemos, actualizaremos esta página y te informaremos.</p>
        </section>

        <section className="legal-section">
          <h2>4. Cómo gestionar o eliminar estos datos</h2>
          <p>Puedes eliminar en cualquier momento los datos de almacenamiento local desde las herramientas de tu navegador:</p>

          <div className="legal-list">
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Borrar datos de navegación → Cookies y otros datos de sitios.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Firefox:</strong> Configuración → Privacidad y seguridad → Cookies y datos del sitio → Limpiar datos.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Safari:</strong> Preferencias → Privacidad → Administrar datos de sitios web.</span>
            </div>
          </div>

          <p style={{ marginTop: 'var(--sp-4)' }}>Ten en cuenta que eliminar estos datos cerrará tu sesión y restaurará las preferencias de la plataforma a sus valores predeterminados.</p>
        </section>

        <section className="legal-section">
          <h2>5. Cambios en esta política</h2>
          <p>Si añadimos nuevas tecnologías de almacenamiento o cambiamos el uso de las existentes, actualizaremos esta página. Para cambios relevantes, te informaremos en la plataforma.</p>
        </section>

        <section className="legal-section">
          <h2>6. Contacto</h2>
          <p>Para dudas sobre el uso de cookies o almacenamiento local escríbenos a <strong>privacidad@bookease.app</strong>.</p>
        </section>

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">Política de privacidad</Link>
          <span className="footer-bottom-sep">·</span>
          <Link to="/terms" className="legal-nav-link">Términos y condiciones</Link>
        </div>

      </div>
    </div>
  );
}
