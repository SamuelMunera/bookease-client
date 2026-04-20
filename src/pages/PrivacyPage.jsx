import { Link } from 'react-router-dom';

const UPDATED = '20 de abril de 2026';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <p className="section-label">Legal</p>
        <h1 className="legal-title">Política de privacidad</h1>
        <p className="legal-updated">Última actualización: {UPDATED}</p>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <p className="legal-intro">
            En Bookease nos tomamos en serio la privacidad de las personas que usan nuestra plataforma. Esta política explica qué datos recopilamos, para qué los usamos y cómo los protegemos.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Responsable del tratamiento</h2>
          <p>El responsable del tratamiento de los datos es <strong>Bookease</strong>. Para cualquier consulta relacionada con privacidad puedes contactarnos en <strong>privacidad@bookease.app</strong>.</p>
        </section>

        <section className="legal-section">
          <h2>2. Datos que recopilamos</h2>
          <p>Dependiendo de cómo uses la plataforma, podemos recopilar los siguientes datos:</p>

          <div className="legal-card-grid">
            <div className="legal-card">
              <div className="legal-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <p className="legal-card-title">Datos de cuenta</p>
                <p className="legal-card-desc">Nombre, dirección de correo electrónico, contraseña cifrada y, de forma opcional, número de teléfono.</p>
              </div>
            </div>
            <div className="legal-card">
              <div className="legal-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="legal-card-title">Reservas y actividad</p>
                <p className="legal-card-desc">Historial de citas, fechas, horarios, servicios contratados, estado de las reservas y reseñas que hayas publicado.</p>
              </div>
            </div>
            <div className="legal-card">
              <div className="legal-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
              <div>
                <p className="legal-card-title">Contenido de perfil</p>
                <p className="legal-card-desc">Para profesionales: foto de perfil, biografía, especialidad, experiencia y fotos de galería de trabajo que decidan publicar.</p>
              </div>
            </div>
            <div className="legal-card">
              <div className="legal-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <p className="legal-card-title">Datos técnicos</p>
                <p className="legal-card-desc">Información de sesión, preferencias de la plataforma (modo claro/oscuro) almacenadas localmente en tu dispositivo.</p>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 'var(--sp-4)' }}>Si te registras con Google, recibimos tu nombre y correo desde la API de Google OAuth. No accedemos a ningún otro dato de tu cuenta de Google.</p>
        </section>

        <section className="legal-section">
          <h2>3. Para qué usamos tus datos</h2>
          <div className="legal-list">
            <div className="legal-list-item">
              <span className="legal-list-dot" style={{ background: 'var(--violet)' }} />
              <span>Gestionar tu cuenta y permitirte iniciar sesión.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" style={{ background: 'var(--violet)' }} />
              <span>Procesar y gestionar tus reservas de citas.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" style={{ background: 'var(--violet)' }} />
              <span>Mostrar tu perfil y galería a clientes potenciales (solo profesionales).</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" style={{ background: 'var(--violet)' }} />
              <span>Enviarte confirmaciones, recordatorios o notificaciones relacionadas con tu actividad en la plataforma.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" style={{ background: 'var(--violet)' }} />
              <span>Mejorar la experiencia de uso y detectar errores técnicos.</span>
            </div>
          </div>
          <p style={{ marginTop: 'var(--sp-4)' }}>No usamos tus datos para publicidad de terceros ni los vendemos a ninguna empresa.</p>
        </section>

        <section className="legal-section">
          <h2>4. Base legal del tratamiento</h2>
          <p>El tratamiento de datos se basa en la <strong>ejecución del contrato</strong> (prestación del servicio de reservas), el <strong>interés legítimo</strong> (mejorar la plataforma y prevenir fraudes) y, en su caso, tu <strong>consentimiento</strong> para comunicaciones opcionales.</p>
        </section>

        <section className="legal-section">
          <h2>5. Conservación de datos</h2>
          <p>Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta, borraremos tus datos personales en un plazo razonable, salvo que exista obligación legal de conservarlos.</p>
        </section>

        <section className="legal-section">
          <h2>6. Compartición de datos con terceros</h2>
          <p>Podemos compartir datos en estos casos limitados:</p>
          <div className="legal-list">
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Google LLC</strong> — Si usas el inicio de sesión con Google, tu autenticación se procesa a través de la API de Google OAuth según la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">política de privacidad de Google</a>.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Proveedor de infraestructura</strong> — Nuestros servidores y base de datos están alojados en servicios de nube de terceros que actúan como encargados del tratamiento bajo acuerdos de confidencialidad.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span><strong>Negocios y profesionales</strong> — Cuando reservas una cita, el negocio y el profesional ven tu nombre, correo y los detalles de la reserva para poder atenderte.</span>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Tus derechos</h2>
          <p>Puedes ejercer en cualquier momento los siguientes derechos escribiendo a <strong>privacidad@bookease.app</strong>:</p>
          <div className="legal-rights-grid">
            {[
              { title: 'Acceso', desc: 'Conocer qué datos tuyos tenemos.' },
              { title: 'Rectificación', desc: 'Corregir datos incorrectos o desactualizados.' },
              { title: 'Supresión', desc: 'Solicitar la eliminación de tu cuenta y datos.' },
              { title: 'Oposición', desc: 'Oponerte a ciertos usos de tus datos.' },
              { title: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado.' },
              { title: 'Limitación', desc: 'Restringir el tratamiento en determinados casos.' },
            ].map(r => (
              <div key={r.title} className="legal-right-item">
                <p className="legal-right-title">{r.title}</p>
                <p className="legal-right-desc">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Seguridad</h2>
          <p>Las contraseñas se almacenan cifradas mediante hash seguro. Las comunicaciones con la plataforma se realizan sobre HTTPS. Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no autorizados.</p>
        </section>

        <section className="legal-section">
          <h2>9. Cambios en esta política</h2>
          <p>Si actualizamos esta política de forma relevante, te lo comunicaremos a través de la plataforma o por correo electrónico con antelación razonable.</p>
        </section>

        <div className="legal-footer-nav">
          <Link to="/terms" className="legal-nav-link">Términos y condiciones</Link>
          <span className="footer-bottom-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Política de cookies</Link>
        </div>

      </div>
    </div>
  );
}
