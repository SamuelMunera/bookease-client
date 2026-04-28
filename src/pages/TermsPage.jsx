import { useState } from 'react';
import { Link } from 'react-router-dom';

const UPDATED_CO = '28 de abril de 2026';
const UPDATED_US = 'April 28, 2026';

function CountryToggle({ country, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', gap: 4, background: 'var(--surface-2)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
      padding: 4,
    }}>
      {[
        { code: 'CO', label: '🇨🇴 Colombia' },
        { code: 'US', label: '🇺🇸 United States' },
      ].map(c => (
        <button
          key={c.code}
          onClick={() => onChange(c.code)}
          style={{
            padding: '6px 18px', borderRadius: 'var(--r-lg)', border: 'none',
            cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600,
            transition: 'all .15s',
            background: country === c.code ? 'var(--gold)' : 'transparent',
            color: country === c.code ? '#000' : 'var(--text-muted)',
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function TermsCO() {
  return (
    <>
      <section className="legal-section">
        <p className="legal-intro">
          Al acceder o usar Bookease aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma.
          Estos términos se rigen por la legislación de la República de Colombia.
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
          {[
            'Puedes cancelar una reserva desde tu panel en cualquier momento antes de la cita.',
            'Puedes aplazar una cita seleccionando una nueva fecha y hora disponible.',
            'Los negocios pueden cancelar reservas por causas justificadas.',
            'Bookease no gestiona pagos ni reembolsos directamente; eso corresponde al negocio según lo dispuesto en la Ley 1480 de 2011 (Estatuto del Consumidor).',
          ].map((t, i) => (
            <div key={i} className="legal-list-item">
              <span className="legal-list-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="legal-section">
        <h2>4. Política de cancelación</h2>
        <p>Cada negocio puede configurar su propia política de cancelación (tiempo mínimo de antelación antes de la cita). Esta política es visible antes de confirmar la reserva. Los consumidores colombianos tienen los derechos reconocidos por la <strong>Ley 1480 de 2011</strong>; en caso de conflicto con la política del negocio, prevalecerá la norma legal.</p>
        <p>Bookease no intermedia en disputas económicas entre clientes y negocios, pero pone a disposición los canales de contacto para facilitar la resolución.</p>
      </section>

      <section className="legal-section">
        <h2>5. Negocios y profesionales</h2>
        <p>Los negocios registrados son responsables de la veracidad de su información (servicios, precios, horarios, fotos) y de cumplir sus obligaciones frente a los clientes conforme a la legislación colombiana vigente.</p>
        <p>Los profesionales vinculados a un negocio gestionan su disponibilidad y sus servicios asignados. Bookease no verifica titulaciones ni garantiza la calidad del servicio prestado.</p>
      </section>

      <section className="legal-section">
        <h2>6. Reseñas y contenido generado por el usuario</h2>
        <p>Los clientes pueden dejar reseñas sobre los negocios. Las reseñas deben ser honestas, basadas en experiencia real y no contener lenguaje ofensivo, discriminatorio ni información falsa. Nos reservamos el derecho de eliminar reseñas que incumplan estas condiciones.</p>
        <p>Los profesionales pueden subir fotos de su trabajo. Eres responsable de que el contenido que publiques no infrinja derechos de terceros.</p>
      </section>

      <section className="legal-section">
        <h2>7. Propiedad intelectual</h2>
        <p>El diseño, código, marca y contenidos de Bookease son propiedad de sus creadores y están protegidos por la legislación colombiana sobre derechos de autor y propiedad intelectual. No puedes copiarlos, redistribuirlos ni usarlos con fines comerciales sin autorización expresa.</p>
        <p>Al subir contenido a la plataforma (fotos, textos de perfil) nos concedes una licencia no exclusiva, gratuita y revocable para mostrarlo dentro del servicio.</p>
      </section>

      <section className="legal-section">
        <h2>8. Protección de datos personales</h2>
        <p>El tratamiento de datos personales se rige por la <strong>Ley 1581 de 2012</strong> y el Decreto 1377 de 2013. Puedes consultar nuestra Política de Privacidad para conocer los tipos de datos que recopilamos, las finalidades de su tratamiento, los derechos que te asisten (acceso, corrección, supresión, portabilidad) y cómo ejercerlos.</p>
        <p>El responsable del tratamiento es Bookease. Para ejercer tus derechos de <em>habeas data</em> escríbenos a <strong>privacidad@bookease.app</strong>.</p>
      </section>

      <section className="legal-section">
        <h2>9. Limitación de responsabilidad</h2>
        <p>Bookease no se hace responsable de daños derivados del incumplimiento de citas por parte de negocios o profesionales, de la inexactitud de la información publicada por terceros, ni de interrupciones técnicas fuera de nuestro control.</p>
        <p>La plataforma se ofrece "tal cual". Hacemos todo lo posible por mantenerla disponible y segura, pero no garantizamos un funcionamiento ininterrumpido.</p>
      </section>

      <section className="legal-section">
        <h2>10. Ley aplicable y jurisdicción</h2>
        <p>Estos términos se rigen por las leyes de la <strong>República de Colombia</strong>. Cualquier controversia derivada de su interpretación o cumplimiento será resuelta por los jueces competentes de la ciudad de <strong>Bogotá D.C.</strong>, salvo que las partes acuerden un mecanismo alternativo de solución de conflictos.</p>
      </section>

      <section className="legal-section">
        <h2>11. Cambios en los términos</h2>
        <p>Podemos actualizar estos términos. Si el cambio es relevante, te avisaremos con antelación razonable. El uso continuado de la plataforma implica aceptación de los términos vigentes.</p>
      </section>

      <section className="legal-section">
        <h2>12. Contacto</h2>
        <p>Para cualquier consulta relacionada con estos términos puedes escribirnos a <strong>legal@bookease.app</strong>.</p>
      </section>
    </>
  );
}

function TermsUS() {
  return (
    <>
      <section className="legal-section">
        <p className="legal-intro">
          By accessing or using Bookease you agree to these Terms in full. If you disagree, please do not use the platform.
          These Terms are governed by the laws of the <strong>State of Florida, United States</strong>.
        </p>
      </section>

      <section className="legal-section">
        <h2>1. What is Bookease</h2>
        <p>Bookease is a digital marketplace that connects clients with personal care and wellness businesses (barbershops, spas, salons, and similar services), enabling real-time appointment booking with licensed professionals.</p>
        <p>Bookease acts solely as a technology intermediary. We are not a party to any service agreement between a client and a business or professional, and we do not guarantee the continuous availability of any registered business.</p>
      </section>

      <section className="legal-section">
        <h2>2. Account Registration</h2>
        <p>You must create a client account to make bookings. You may register with an email address and password or via Google OAuth. You are solely responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.</p>
        <p>Professionals and business owners have access to dedicated dashboards with additional features. Professional access requires approval by a registered business.</p>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms, contain false information, or engage in misuse of the platform.</p>
        <p>You represent that you are at least <strong>18 years of age</strong>. Bookease does not knowingly collect information from persons under 13 in compliance with the Children's Online Privacy Protection Act (COPPA).</p>
      </section>

      <section className="legal-section">
        <h2>3. Bookings and Appointments</h2>
        <p>Bookings remain pending until confirmed by the business or professional. A confirmed booking constitutes an agreement between the client and the business. Bookease facilitates management but is not liable for service failures caused by the business or professional.</p>
        <div className="legal-list">
          {[
            'You may cancel a booking from your dashboard before the appointment time, subject to the business\'s cancellation policy.',
            'You may reschedule a booking by selecting a new available date and time.',
            'Businesses may cancel bookings for legitimate reasons and must notify clients promptly.',
            'Bookease does not process payments or issue refunds directly. Payment disputes are between you and the business, subject to applicable federal and state consumer protection laws.',
          ].map((t, i) => (
            <div key={i} className="legal-list-item">
              <span className="legal-list-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="legal-section">
        <h2>4. Cancellation Policy</h2>
        <p>Each business may set its own cancellation policy, including a minimum notice period before the appointment. This policy is displayed before you confirm a booking. Bookease is not responsible for enforcing or adjudicating cancellation disputes between clients and businesses.</p>
        <p>Refund rights may vary by state. Nothing in these Terms limits any rights you may have under applicable state consumer protection statutes.</p>
      </section>

      <section className="legal-section">
        <h2>5. Businesses and Professionals</h2>
        <p>Registered businesses are solely responsible for the accuracy of their information (services, pricing, hours, photos) and for fulfilling their obligations to clients in accordance with applicable federal, state, and local laws, including applicable licensing requirements.</p>
        <p>Bookease does not verify professional licenses or certifications and makes no representations regarding the quality of services provided by any business or professional listed on the platform.</p>
      </section>

      <section className="legal-section">
        <h2>6. Reviews and User-Generated Content</h2>
        <p>Clients may leave reviews about businesses. Reviews must be honest, based on genuine experience, and must not contain offensive, discriminatory, or defamatory content. We reserve the right to remove reviews that violate these guidelines.</p>
        <p>By submitting content (photos, profile text, reviews) to the platform, you grant Bookease a non-exclusive, royalty-free, worldwide license to display such content within the service. You represent that you have all rights necessary to grant this license.</p>
      </section>

      <section className="legal-section">
        <h2>7. Intellectual Property &amp; DMCA</h2>
        <p>The design, code, brand, and original content of Bookease are protected by U.S. copyright, trademark, and intellectual property laws. You may not copy, redistribute, or use them for commercial purposes without express written authorization.</p>
        <p>Bookease complies with the <strong>Digital Millennium Copyright Act (DMCA)</strong>. If you believe that content on the platform infringes your copyright, please send a notice to <strong>dmca@bookease.app</strong> containing: (i) identification of the copyrighted work; (ii) identification of the infringing material; (iii) your contact information; (iv) a statement of good faith belief; and (v) your signature.</p>
      </section>

      <section className="legal-section">
        <h2>8. Privacy &amp; California Residents (CCPA)</h2>
        <p>Our collection and use of personal data is described in our <Link to="/privacy" style={{ color: 'var(--gold)' }}>Privacy Policy</Link>. We do not sell your personal information to third parties.</p>
        <p>If you are a California resident, you have additional rights under the <strong>California Consumer Privacy Act (CCPA)</strong>, including the right to know what personal data we collect, the right to delete your data, and the right to opt out of the sale of your data. To exercise these rights, contact us at <strong>privacy@bookease.app</strong>.</p>
      </section>

      <section className="legal-section">
        <h2>9. Disclaimer of Warranties</h2>
        <p>THE PLATFORM IS PROVIDED <strong>"AS IS"</strong> AND <strong>"AS AVAILABLE"</strong> WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. BOOKEASE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>
      </section>

      <section className="legal-section">
        <h2>10. Limitation of Liability</h2>
        <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, BOOKEASE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
        <p>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE GREATER OF (A) $100 USD OR (B) THE AMOUNT PAID BY YOU TO BOOKEASE IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
      </section>

      <section className="legal-section">
        <h2>11. Dispute Resolution &amp; Arbitration</h2>
        <p>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</p>
        <p>Any dispute arising out of or relating to these Terms or the platform shall be resolved by <strong>binding arbitration</strong> administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, rather than in court, except that either party may bring individual claims in small claims court.</p>
        <p><strong>Class Action Waiver:</strong> You agree to resolve any disputes on an individual basis and waive your right to participate in a class action lawsuit or class-wide arbitration.</p>
        <p>This arbitration agreement does not apply to claims for injunctive or equitable relief.</p>
      </section>

      <section className="legal-section">
        <h2>12. Governing Law &amp; Jurisdiction</h2>
        <p>These Terms are governed by the laws of the <strong>State of Florida</strong>, without regard to conflict of law principles. To the extent arbitration does not apply, you consent to the exclusive jurisdiction of the state and federal courts located in <strong>Miami-Dade County, Florida</strong>.</p>
      </section>

      <section className="legal-section">
        <h2>13. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. If the change is material, we will provide at least 30 days' notice via email or a prominent notice on the platform. Your continued use of the platform after the effective date of the revised Terms constitutes your acceptance.</p>
      </section>

      <section className="legal-section">
        <h2>14. Contact</h2>
        <p>For questions about these Terms, contact us at <strong>legal@bookease.app</strong>.</p>
      </section>
    </>
  );
}

export default function TermsPage() {
  const [country, setCountry] = useState('CO');

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <p className="section-label">Legal</p>
        <h1 className="legal-title">
          {country === 'CO' ? 'Términos y condiciones' : 'Terms & Conditions'}
        </h1>
        <p className="legal-updated">
          {country === 'CO'
            ? `Última actualización: ${UPDATED_CO}`
            : `Last updated: ${UPDATED_US}`}
        </p>
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <CountryToggle country={country} onChange={setCountry} />
        </div>
      </div>

      <div className="legal-body">
        {country === 'CO' ? <TermsCO /> : <TermsUS />}

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">
            {country === 'CO' ? 'Política de privacidad' : 'Privacy Policy'}
          </Link>
          <span className="footer-bottom-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">
            {country === 'CO' ? 'Política de cookies' : 'Cookie Policy'}
          </Link>
        </div>
      </div>
    </div>
  );
}
