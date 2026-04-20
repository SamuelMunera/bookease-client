import { Link } from 'react-router-dom';

const UPDATED = '20 de abril de 2026';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <p className="section-label">Legal</p>
        <h1 className="legal-title">Términos y condiciones</h1>
        <p className="legal-updated">Última actualización: {UPDATED}</p>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <p className="legal-intro">
            Al acceder o usar Bookease aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Qué es Bookease</h2>
          <p>Bookease es una plataforma digital que conecta clientes con negocios de estética, bienestar y cuidado personal (barberías, spas, salones y similares), permitiendo reservar citas con profesionales de forma rápida y en tiempo real.</p>
          <p>Bookease actúa como intermediario tecnológico. No es parte del servicio prestado entre el cliente y el negocio o profesional, ni garantiza la disponibilidad permanente de ningún negocio registrado.</p>
        </section>

        <section className="legal-section">
          <h2>2. Registro y cuentas</h2>
          <p>Para reservar necesitas una cuenta de cliente. Puedes registrarte con email y contraseña o mediante Google. Eres responsable de mantener tu contraseña segura y de todo lo que ocurra en tu cuenta.</p>
          <p>Los profesionales y dueños de negocio tienen acceso a paneles específicos con funciones adicionales. El acceso de profesionales requiere vinculación aprobada por un negocio registrado.</p>
          <p>Podemos suspender o eliminar cuentas que incumplan estos términos, que contengan información falsa o que hagan un uso indebido de la plataforma.</p>
        </section>

        <section className="legal-section">
          <h2>3. Reservas y citas</h2>
          <p>Las reservas quedan pendientes hasta que el negocio o profesional las confirme. Una reserva confirmada es un compromiso entre el cliente y el negocio; Bookease facilita la gestión pero no es responsable si el servicio no se presta por causas ajenas a la plataforma.</p>
          <div className="legal-list">
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span>Puedes cancelar una reserva desde tu panel en cualquier momento antes de la cita.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span>Puedes aplazar una cita seleccionando una nueva fecha y hora disponible.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span>Los negocios pueden cancelar reservas por causas justificadas.</span>
            </div>
            <div className="legal-list-item">
              <span className="legal-list-dot" />
              <span>Bookease no gestiona pagos ni reembolsos; eso corresponde al negocio.</span>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Negocios y profesionales</h2>
          <p>Los negocios registrados son responsables de la veracidad de su información (servicios, precios, horarios, fotos) y de cumplir sus obligaciones frente a los clientes.</p>
          <p>Los profesionales vinculados a un negocio gestionan su disponibilidad y sus servicios asignados. Bookease no verifica titulaciones ni garantiza la calidad del servicio prestado.</p>
        </section>

        <section className="legal-section">
          <h2>5. Reseñas y contenido generado</h2>
          <p>Los clientes pueden dejar reseñas sobre los negocios. Las reseñas deben ser honestas, basadas en experiencia real y no contener lenguaje ofensivo, discriminatorio ni información falsa. Nos reservamos el derecho de eliminar reseñas que incumplan estas condiciones.</p>
          <p>Los profesionales pueden subir fotos de su trabajo. Eres responsable de que el contenido que publiques no infrinja derechos de terceros.</p>
        </section>

        <section className="legal-section">
          <h2>6. Propiedad intelectual</h2>
          <p>El diseño, código, marca y contenidos de Bookease son propiedad de sus creadores. No puedes copiarlos, redistribuirlos ni usarlos con fines comerciales sin autorización expresa.</p>
          <p>Al subir contenido a la plataforma (fotos, textos de perfil) nos concedes una licencia para mostrarlo dentro del servicio.</p>
        </section>

        <section className="legal-section">
          <h2>7. Limitación de responsabilidad</h2>
          <p>Bookease no se hace responsable de daños derivados del incumplimiento de citas por parte de negocios o profesionales, de la inexactitud de la información publicada por terceros, ni de interrupciones técnicas fuera de nuestro control.</p>
          <p>La plataforma se ofrece "tal cual". Hacemos todo lo posible por mantenerla disponible y segura, pero no garantizamos un funcionamiento ininterrumpido.</p>
        </section>

        <section className="legal-section">
          <h2>8. Cambios en los términos</h2>
          <p>Podemos actualizar estos términos. Si el cambio es relevante, te avisaremos con antelación razonable. El uso continuado de la plataforma implica aceptación de los términos vigentes.</p>
        </section>

        <section className="legal-section">
          <h2>9. Contacto</h2>
          <p>Para cualquier consulta relacionada con estos términos puedes escribirnos a <strong>legal@bookease.app</strong>.</p>
        </section>

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">Política de privacidad</Link>
          <span className="footer-bottom-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Política de cookies</Link>
        </div>

      </div>
    </div>
  );
}
