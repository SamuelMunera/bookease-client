import { useState } from 'react';
import { Link } from 'react-router-dom';

const UPDATED_CO = '28 de abril de 2026';
const UPDATED_US = '28 de abril de 2026';

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
          Al acceder o usar Bookease aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma.
          Estos términos se rigen por las leyes del <strong>Estado de Florida, Estados Unidos</strong>.
        </p>
      </section>

      <section className="legal-section">
        <h2>1. Qué es Bookease</h2>
        <p>Bookease es un mercado digital que conecta clientes con negocios de cuidado personal y bienestar (barberías, spas, salones y servicios similares), permitiendo reservar citas en tiempo real con profesionales.</p>
        <p>Bookease actúa exclusivamente como intermediario tecnológico. No somos parte de ningún acuerdo de servicio entre un cliente y un negocio o profesional, y no garantizamos la disponibilidad permanente de ningún negocio registrado.</p>
      </section>

      <section className="legal-section">
        <h2>2. Registro y cuentas</h2>
        <p>Debes crear una cuenta de cliente para realizar reservas. Puedes registrarte con un correo electrónico y contraseña o mediante Google. Eres el único responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra en tu cuenta.</p>
        <p>Los profesionales y dueños de negocio tienen acceso a paneles específicos con funciones adicionales. El acceso de profesionales requiere aprobación de un negocio registrado.</p>
        <p>Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos, contengan información falsa o hagan un uso indebido de la plataforma.</p>
        <p>Declaras tener al menos <strong>18 años de edad</strong>. Bookease no recopila intencionalmente información de personas menores de 13 años, en cumplimiento de la <em>Children's Online Privacy Protection Act</em> (COPPA).</p>
      </section>

      <section className="legal-section">
        <h2>3. Reservas y citas</h2>
        <p>Las reservas quedan pendientes hasta que el negocio o profesional las confirme. Una reserva confirmada constituye un acuerdo entre el cliente y el negocio. Bookease facilita la gestión pero no es responsable de fallas en el servicio causadas por el negocio o profesional.</p>
        <div className="legal-list">
          {[
            'Puedes cancelar una reserva desde tu panel antes de la hora de la cita, sujeto a la política de cancelación del negocio.',
            'Puedes reprogramar una cita seleccionando una nueva fecha y hora disponible.',
            'Los negocios pueden cancelar reservas por razones justificadas y deben notificar al cliente con prontitud.',
            'Bookease no procesa pagos ni emite reembolsos directamente. Las disputas de pago son entre tú y el negocio, sujetas a las leyes de protección al consumidor federales y estatales aplicables.',
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
        <p>Cada negocio puede establecer su propia política de cancelación, incluyendo un período mínimo de anticipación antes de la cita. Esta política se muestra antes de confirmar la reserva. Bookease no es responsable de hacer cumplir ni de resolver disputas de cancelación entre clientes y negocios.</p>
        <p>Los derechos de reembolso pueden variar según el estado. Nada en estos términos limita los derechos que puedas tener bajo las leyes estatales de protección al consumidor aplicables.</p>
      </section>

      <section className="legal-section">
        <h2>5. Negocios y profesionales</h2>
        <p>Los negocios registrados son los únicos responsables de la exactitud de su información (servicios, precios, horarios, fotos) y de cumplir sus obligaciones con los clientes conforme a las leyes federales, estatales y locales aplicables, incluidos los requisitos de licencia correspondientes.</p>
        <p>Bookease no verifica licencias ni certificaciones profesionales y no hace ninguna declaración respecto a la calidad de los servicios prestados por los negocios o profesionales listados en la plataforma.</p>
      </section>

      <section className="legal-section">
        <h2>6. Reseñas y contenido generado por el usuario</h2>
        <p>Los clientes pueden dejar reseñas sobre los negocios. Las reseñas deben ser honestas, basadas en experiencia real y no contener lenguaje ofensivo, discriminatorio ni difamatorio. Nos reservamos el derecho de eliminar reseñas que incumplan estas condiciones.</p>
        <p>Al subir contenido a la plataforma (fotos, textos de perfil, reseñas), nos concedes una licencia no exclusiva, libre de regalías y mundial para mostrar dicho contenido dentro del servicio. Declaras tener todos los derechos necesarios para otorgar esta licencia.</p>
      </section>

      <section className="legal-section">
        <h2>7. Propiedad intelectual y DMCA</h2>
        <p>El diseño, código, marca y contenidos originales de Bookease están protegidos por las leyes de derechos de autor, marcas registradas y propiedad intelectual de los Estados Unidos. No puedes copiarlos, redistribuirlos ni usarlos con fines comerciales sin autorización expresa por escrito.</p>
        <p>Bookease cumple con la <strong>Digital Millennium Copyright Act (DMCA)</strong>. Si consideras que algún contenido en la plataforma infringe tus derechos de autor, envía una notificación a <strong>dmca@bookease.app</strong> indicando: (i) identificación de la obra protegida; (ii) identificación del material infractor; (iii) tus datos de contacto; (iv) una declaración de buena fe; y (v) tu firma.</p>
      </section>

      <section className="legal-section">
        <h2>8. Privacidad y derechos CCPA (residentes de California)</h2>
        <p>El uso de tus datos personales se describe en nuestra <Link to="/privacy" style={{ color: 'var(--gold)' }}>Política de Privacidad</Link>. No vendemos tu información personal a terceros.</p>
        <p>Si eres residente de California, tienes derechos adicionales bajo la <strong>California Consumer Privacy Act (CCPA)</strong>, incluyendo el derecho a saber qué datos recopilamos, el derecho a eliminar tus datos y el derecho a optar por no participar en la venta de tus datos. Para ejercer estos derechos, contáctanos en <strong>privacidad@bookease.app</strong>.</p>
      </section>

      <section className="legal-section">
        <h2>9. Exención de garantías</h2>
        <p>LA PLATAFORMA SE OFRECE <strong>"TAL CUAL"</strong> Y <strong>"SEGÚN DISPONIBILIDAD"</strong>, SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS, INCLUYENDO, ENTRE OTRAS, LAS GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN DETERMINADO Y NO INFRACCIÓN. BOOKEASE NO GARANTIZA QUE EL SERVICIO SEA ININTERRUMPIDO, LIBRE DE ERRORES O SEGURO.</p>
      </section>

      <section className="legal-section">
        <h2>10. Limitación de responsabilidad</h2>
        <p>EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, BOOKEASE NO SERÁ RESPONSABLE DE DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES NI PUNITIVOS, INCLUYENDO PÉRDIDA DE GANANCIAS, DATOS O CLIENTELA, QUE SURJAN DE O ESTÉN RELACIONADOS CON EL USO DE LA PLATAFORMA, INCLUSO SI SE HA ADVERTIDO DE LA POSIBILIDAD DE TALES DAÑOS.</p>
        <p>NUESTRA RESPONSABILIDAD TOTAL ANTE TI POR CUALQUIER RECLAMACIÓN NO EXCEDERÁ EL MAYOR DE (A) $100 USD O (B) EL MONTO PAGADO POR TI A BOOKEASE EN LOS 12 MESES ANTERIORES A LA RECLAMACIÓN.</p>
      </section>

      <section className="legal-section">
        <h2>11. Resolución de disputas y arbitraje</h2>
        <p><strong>Lee esta sección con atención. Afecta tus derechos legales.</strong></p>
        <p>Cualquier disputa derivada de o relacionada con estos términos o la plataforma se resolverá mediante <strong>arbitraje vinculante</strong> administrado por la American Arbitration Association (AAA) bajo sus Reglas de Arbitraje del Consumidor, en lugar de ante un tribunal, salvo que cualquiera de las partes pueda presentar reclamaciones individuales ante el tribunal de pequeñas causas (<em>small claims court</em>).</p>
        <p><strong>Renuncia a demandas colectivas:</strong> Aceptas resolver cualquier disputa de forma individual y renuncias a tu derecho de participar en una demanda colectiva (<em>class action</em>) o en un arbitraje colectivo.</p>
        <p>Este acuerdo de arbitraje no se aplica a reclamaciones de medidas cautelares o equitativas.</p>
      </section>

      <section className="legal-section">
        <h2>12. Ley aplicable y jurisdicción</h2>
        <p>Estos términos se rigen por las leyes del <strong>Estado de Florida</strong>, sin tener en cuenta los principios de conflicto de leyes. En la medida en que el arbitraje no aplique, aceptas la jurisdicción exclusiva de los tribunales estatales y federales ubicados en el <strong>Condado de Miami-Dade, Florida</strong>.</p>
      </section>

      <section className="legal-section">
        <h2>13. Cambios en los términos</h2>
        <p>Podemos actualizar estos términos periódicamente. Si el cambio es sustancial, te notificaremos con al menos 30 días de anticipación mediante correo electrónico o un aviso destacado en la plataforma. El uso continuado de la plataforma después de la fecha de entrada en vigor de los términos revisados constituye tu aceptación.</p>
      </section>

      <section className="legal-section">
        <h2>14. Contacto</h2>
        <p>Para consultas sobre estos términos, contáctanos en <strong>legal@bookease.app</strong>.</p>
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
        <h1 className="legal-title">Términos y condiciones</h1>
        <p className="legal-updated">Última actualización: {country === 'CO' ? UPDATED_CO : UPDATED_US}</p>
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <CountryToggle country={country} onChange={setCountry} />
        </div>
      </div>

      <div className="legal-body">
        {country === 'CO' ? <TermsCO /> : <TermsUS />}

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">Política de privacidad</Link>
          <span className="footer-bottom-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Política de cookies</Link>
        </div>
      </div>
    </div>
  );
}
