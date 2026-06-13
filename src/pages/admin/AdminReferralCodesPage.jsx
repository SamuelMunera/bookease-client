import { useState, useEffect } from 'react';
import api from '../../api';

const TABS = [
  { id: 'promoters', label: 'Promotor', icon: '🤝' },
  { id: 'courtesy',  label: 'Cortesías', icon: '🎁' },
];

function StatusBadge({ active, activeLabel, inactiveLabel }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 'var(--r-full)',
      background: active ? 'var(--success-bg)' : 'var(--surface-2)',
      color: active ? 'var(--success)' : 'var(--text-muted)',
      border: `1px solid ${active ? 'var(--success-border)' : 'var(--border)'}`,
    }}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function CodeChip({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar código"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
        fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 700,
        padding: '4px 10px', borderRadius: 'var(--r-md)',
        background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
        color: 'var(--gold)', cursor: 'pointer',
      }}
    >
      {code}
      <span style={{ fontSize: 11 }}>{copied ? '✓' : '📋'}</span>
    </button>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function PromotersTab() {
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    api.adminPromoters().then(setPromoters).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSaving(true); setError('');
    try {
      const promoter = await api.adminCreatePromoter(form);
      setPromoters(prev => [promoter, ...prev]);
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(promoter) {
    const nextStatus = promoter.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(promoter.id);
    try {
      const updated = await api.adminSetPromoterStatus(promoter.id, nextStatus);
      setPromoters(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 'var(--sp-6)', alignItems: 'start' }} className="admin-referrals-grid">
      {/* Register form */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)',
      }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>Registrar promotor</h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
          Se genera un código único de promotor automáticamente.
        </p>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nombre
            </label>
            <input
              className="input"
              placeholder="ej. Laura"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Apellido
            </label>
            <input
              className="input"
              placeholder="ej. Gómez"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="laura@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Teléfono (opcional)
            </label>
            <input
              className="input"
              placeholder="ej. +57 300 000 0000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)' }}>
              {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : '+ Registrar promotor'}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
          Promotores ({promoters.length})
        </h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
        ) : promoters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay promotores registrados todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {promoters.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
                padding: 'var(--sp-4) var(--sp-5)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
              }}>
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{p.firstName} {p.lastName}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.email}{p.phone ? ` · ${p.phone}` : ''}
                  </p>
                </div>
                <CodeChip code={p.code} />
                <StatusBadge active={p.status === 'ACTIVE'} activeLabel="Activo" inactiveLabel="Inactivo" />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>{formatDate(p.createdAt)}</p>
                <button
                  onClick={() => handleToggleStatus(p)}
                  disabled={togglingId === p.id}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--r-md)',
                    background: p.status === 'ACTIVE' ? 'var(--error-bg)' : 'var(--success-bg)',
                    border: `1px solid ${p.status === 'ACTIVE' ? 'var(--error-border)' : 'var(--success-border)'}`,
                    color: p.status === 'ACTIVE' ? 'var(--error)' : 'var(--success)',
                    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                    opacity: togglingId === p.id ? 0.5 : 1,
                  }}
                >
                  {togglingId === p.id ? '…' : (p.status === 'ACTIVE' ? 'Desactivar' : 'Activar')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourtesyTab() {
  const [codes, setCodes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]     = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    api.adminCourtesyCodes().then(setCodes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true); setError('');
    try {
      const code = await api.adminCreateCourtesyCode();
      setCodes(prev => [code, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleStatus(code) {
    const nextStatus = code.status === 'UNUSED' ? 'USED' : 'UNUSED';
    setTogglingId(code.id);
    try {
      const updated = await api.adminSetCourtesyCodeStatus(code.id, nextStatus);
      setCodes(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-1)' }}>Generar código de cortesía</h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Código de un solo uso. Una vez canjeado, cámbialo a "Usado" para que no pueda reutilizarse.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generando…' : '+ Generar código'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-4)' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : codes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay códigos de cortesía generados todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {codes.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap',
              padding: 'var(--sp-4) var(--sp-5)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
            }}>
              <CodeChip code={c.code} />
              <StatusBadge active={c.status === 'UNUSED'} activeLabel="Sin usar" inactiveLabel="Usado" />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>
                Creado: {formatDate(c.createdAt)}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 110 }}>
                Usado: {formatDate(c.usedAt)}
              </p>
              <button
                onClick={() => handleToggleStatus(c)}
                disabled={togglingId === c.id}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--r-md)',
                  background: c.status === 'UNUSED' ? 'var(--error-bg)' : 'var(--success-bg)',
                  border: `1px solid ${c.status === 'UNUSED' ? 'var(--error-border)' : 'var(--success-border)'}`,
                  color: c.status === 'UNUSED' ? 'var(--error)' : 'var(--success)',
                  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                  opacity: togglingId === c.id ? 0.5 : 1, marginLeft: 'auto',
                }}
              >
                {togglingId === c.id ? '…' : (c.status === 'UNUSED' ? 'Marcar usado' : 'Marcar sin usar')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReferralCodesPage() {
  const [tab, setTab] = useState('promoters');

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Códigos de referidos</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
        Gestiona promotores y códigos de cortesía del programa de referidos.
      </p>

      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
              padding: 'var(--sp-3) var(--sp-4)', marginBottom: -1,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'promoters' ? <PromotersTab /> : <CourtesyTab />}
    </div>
  );
}
