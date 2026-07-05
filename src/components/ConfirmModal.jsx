import { useEffect, useRef } from 'react';

/**
 * Modal de confirmación reutilizable.
 *
 * Props:
 *  - open        (bool)                    controla la visibilidad
 *  - title       (string)                  título del diálogo
 *  - message     (string)                  cuerpo / pregunta
 *  - confirmLabel(string, def 'Confirmar') texto del botón de confirmar
 *  - cancelLabel (string, def 'Cancelar')  texto del botón de cancelar
 *  - variant     ('danger'|'default')      estilo del botón de confirmar
 *  - onConfirm   (fn)                       callback al confirmar
 *  - onCancel    (fn)                       callback al cancelar / cerrar
 *
 * Accesible: role="dialog" + aria-modal, cierra con Escape y click en overlay,
 * foco inicial en el botón de confirmar y bloquea el scroll del body mientras
 * está abierto. Sigue el design system (modal-overlay / modal-drawer + btn).
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  // Cierre con Escape mientras está abierto.
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  // Bloquea el scroll del body mientras está abierto y enfoca el botón confirmar.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('no-scroll');
    confirmRef.current?.focus();
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        className="modal-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        style={{ maxWidth: 440 }}
      >
        <div className="modal-drawer-head">
          <h3 id="confirm-modal-title" className="modal-drawer-title">{title}</h3>
          <button
            type="button"
            className="modal-drawer-close"
            aria-label="Cerrar"
            onClick={() => onCancel?.()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {message && (
          <div className="modal-drawer-body">
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
        )}

        <div className="modal-drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={() => onCancel?.()}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
