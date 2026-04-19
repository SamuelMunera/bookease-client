import { useState, useEffect } from 'react';
import api from '../../api';

const ICONS = ['✂️','💆','💅','🧖','🪒','💇','🧴','🌿','💊','🏋️'];

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({ name: '', slug: '', icon: '✂️' });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.adminCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleNameChange(e) {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: slugify(name) }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true); setError('');
    try {
      const cat = await api.adminCreateCategory(form);
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', slug: '', icon: '✂️' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta categoría? Los negocios que la usen quedarán sin categoría válida.')) return;
    setDeletingId(id);
    try {
      await api.adminDeleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Categorías</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
        {categories.length} categorías en la plataforma
      </p>

      {/* Create form */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-8)',
      }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>Nueva categoría</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--sp-3)', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Nombre
              </label>
              <input
                className="input"
                placeholder="ej. Barbería"
                value={form.name}
                onChange={handleNameChange}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Slug
              </label>
              <input
                className="input"
                placeholder="ej. barbershop"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                required
                style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ícono
              </label>
              <select
                className="input"
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                style={{ width: 80 }}
              >
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)' }}>
              {error}
            </p>
          )}

          <div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ minWidth: 140 }}>
              {saving ? 'Guardando…' : '+ Crear categoría'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : categories.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay categorías todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {categories.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
              padding: 'var(--sp-4) var(--sp-5)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-lg)', flexShrink: 0,
                background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {c.icon || '📁'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{c.name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{c.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--r-md)',
                  background: 'var(--error-bg)', border: '1px solid var(--error-border)',
                  color: 'var(--error)', fontSize: 'var(--text-xs)', fontWeight: 600,
                  cursor: 'pointer', opacity: deletingId === c.id ? 0.5 : 1,
                }}
              >
                {deletingId === c.id ? '…' : 'Eliminar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
