import { useState, useEffect, useRef } from 'react';
import api from '../api';

/**
 * Modal de creación de servicio para el panel de negocio.
 * El dueño define el catálogo: nombre, descripción, precio y categoría.
 * QUÉ profesionales realizan cada servicio lo elige cada profesional
 * desde su propio panel, y la DURACIÓN real también la configura cada
 * profesional; aquí solo se fija una duración base (referencia / fallback)
 * hasta que el profesional ajuste la suya.
 */
const EMPTY = { name: '', description: '', price: '', categoryId: '', duration: '30' };

export default function ServiceModal({ businessId, categories = [], onClose, onCreated }) {
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Accesibilidad: cerrar con Escape y devolver el foco al elemento que abrió el
  // modal al desmontar (sin secuestrar el foco inicial, que va al primer campo).
  useEffect(() => {
    const opener = document.activeElement;
    function onKey(e) { if (e.key === 'Escape' && !saving) onClose(); }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const price = parseFloat(form.price);
    const duration = parseInt(form.duration, 10);
    if (!form.name.trim()) return setError('El nombre del servicio es obligatorio.');
    if (form.price === '' || isNaN(price) || price < 0) return setError('Ingresa un precio válido (≥ 0).');
    if (isNaN(duration) || duration <= 0) return setError('La duración base debe ser un número positivo.');
    setSaving(true);
    try {
      const created = await api.createService(businessId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        duration,
        categoryId: form.categoryId || null,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo crear el servicio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-drawer"
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="service-modal-title"
      >
        {/* Header */}
        <div className="modal-drawer-head">
          <div>
            <p style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', margin:0 }}>Nuevo servicio</p>
            <h2 className="modal-drawer-title" id="service-modal-title">Crear servicio</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-drawer-close" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-drawer-form">
          <div className="modal-drawer-body" style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
            {/* Nombre */}
            <div>
              <label className="input-label">Nombre del servicio *</label>
              <input
                className="input"
                placeholder="Ej. Corte de cabello"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="input-label">Descripción (opcional)</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Breve descripción del servicio"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize:'vertical' }}
              />
            </div>

            {/* Precio + categoría */}
            <div className={categories.length > 0 ? 'modal-field-row' : undefined}>
              <div>
                <label className="input-label">Precio *</label>
                <input
                  className="input"
                  type="number" min="0" step="100"
                  placeholder="0"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="input-label">Categoría</label>
                  <select
                    className="input"
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Duración base */}
            <div>
              <label className="input-label">Duración base (min)</label>
              <input
                className="input"
                type="number" min="1" step="5"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                style={{ maxWidth:160 }}
              />
              <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', margin:'var(--sp-2) 0 0', lineHeight:1.5 }}>
                Valor de referencia. Cada profesional ajusta su propio tiempo para este servicio desde su panel.
              </p>
            </div>

            {/* Nota: la asignación de profesionales no se hace aquí */}
            <div style={{ padding:'var(--sp-3) var(--sp-4)', borderRadius:'var(--r-lg)', background:'var(--surface-3)', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', margin:0, lineHeight:1.5 }}>
                Cada profesional elige qué servicios realiza y ajusta su propio tiempo desde su panel. Aquí solo defines el catálogo del negocio.
              </p>
            </div>

            {error && <p className="error-msg" style={{ marginBottom:0 }}>{error}</p>}
          </div>

          <div className="modal-drawer-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
