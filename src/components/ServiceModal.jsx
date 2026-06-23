import { useState } from 'react';
import api from '../api';

/**
 * Modal de creación de servicio para el panel de negocio.
 * El dueño define nombre, descripción, precio, categoría y qué
 * profesionales lo realizan. La DURACIÓN real la configura cada
 * profesional desde su panel; aquí solo se fija una duración base
 * (referencia / fallback) hasta que el profesional ajuste la suya.
 */
const EMPTY = { name: '', description: '', price: '', categoryId: '', duration: '30', professionalIds: [] };

export default function ServiceModal({ businessId, categories = [], professionals = [], onClose, onCreated }) {
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function togglePro(id) {
    setForm(f => ({
      ...f,
      professionalIds: f.professionalIds.includes(id)
        ? f.professionalIds.filter(x => x !== id)
        : [...f.professionalIds, id],
    }));
  }

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
        professionalIds: form.professionalIds,
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
      <div className="modal-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-drawer-head">
          <div>
            <p style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', margin:0 }}>Nuevo servicio</p>
            <h2 className="modal-drawer-title">Crear servicio</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-drawer-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
            <div style={{ display:'flex', gap:'var(--sp-3)' }}>
              <div style={{ flex:1 }}>
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
                <div style={{ flex:1 }}>
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

            {/* Profesionales que lo realizan */}
            <div>
              <label className="input-label">Profesionales que lo realizan</label>
              {professionals.length === 0 ? (
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', margin:0 }}>
                  Aún no tienes profesionales. Puedes asignarlos más tarde.
                </p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)', marginTop:'var(--sp-1)' }}>
                  {professionals.map(p => {
                    const checked = form.professionalIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display:'flex', alignItems:'center', gap:'var(--sp-3)', cursor:'pointer',
                          padding:'var(--sp-3)', borderRadius:'var(--r-lg)',
                          background:'var(--surface-3)',
                          border:`1px solid ${checked ? 'var(--gold)' : 'var(--border)'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePro(p.id)}
                          style={{ accentColor:'var(--gold)', width:16, height:16 }}
                        />
                        <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text)' }}>{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
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
