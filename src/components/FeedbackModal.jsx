import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const TYPES = [
  { value: 'bug',        label: 'Error / Bug' },
  { value: 'suggestion', label: 'Sugerencia' },
  { value: 'ux',         label: 'Experiencia de uso' },
  { value: 'other',      label: 'Otro' },
];

export default function FeedbackModal({ onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'suggestion',
    description: '',
    page: window.location.pathname,
    userEmail: user?.email ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.submitFeedback(form);
      setDone(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        padding:'var(--sp-4)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background:'var(--surface)', borderRadius:'var(--r-2xl)',
        border:'1px solid var(--border)', padding:'var(--sp-6)',
        width:'100%', maxWidth:480,
        boxShadow:'0 -8px 40px rgba(0,0,0,.4)',
        marginBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'var(--sp-4) 0' }}>
            <div style={{ fontSize:48, marginBottom:'var(--sp-3)' }}>🙏</div>
            <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-xl)', marginBottom:'var(--sp-2)' }}>
              ¡Gracias por tu feedback!
            </h3>
            <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'var(--sp-6)' }}>
              Lo revisaremos pronto para mejorar Bookease.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ height:44 }}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--sp-5)' }}>
              <div>
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-xl)', margin:0 }}>
                  Ayúdanos a mejorar
                </h3>
                <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', margin:'var(--sp-1) 0 0' }}>
                  Tu opinión hace a Bookease mejor
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--text-muted)', padding:'var(--sp-1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Type selector */}
              <div style={{ display:'flex', gap:'var(--sp-2)', flexWrap:'wrap', marginBottom:'var(--sp-4)' }}>
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    style={{
                      padding:'var(--sp-1) var(--sp-3)',
                      borderRadius:'var(--r-full)',
                      border:`1px solid ${form.type === t.value ? 'var(--gold)' : 'var(--border)'}`,
                      background: form.type === t.value ? 'rgba(212,168,83,.12)' : 'transparent',
                      color: form.type === t.value ? 'var(--gold)' : 'var(--text-muted)',
                      fontSize:'var(--text-sm)', cursor:'pointer', fontWeight: form.type === t.value ? 600 : 400,
                      transition:'all .15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Description */}
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe el problema o sugerencia con el mayor detalle posible…"
                required
                minLength={10}
                rows={4}
                style={{
                  width:'100%', background:'var(--bg)',
                  border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                  padding:'var(--sp-3)', color:'var(--text)', fontSize:'var(--text-sm)',
                  resize:'vertical', outline:'none', boxSizing:'border-box',
                  marginBottom:'var(--sp-3)',
                }}
              />

              {/* Email (prefilled if logged in) */}
              <input
                type="email"
                value={form.userEmail}
                onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))}
                placeholder="Tu email (opcional, para seguimiento)"
                style={{
                  width:'100%', background:'var(--bg)',
                  border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                  padding:'var(--sp-3)', color:'var(--text)', fontSize:'var(--text-sm)',
                  outline:'none', boxSizing:'border-box', marginBottom:'var(--sp-4)',
                }}
              />

              {error && <p style={{ color:'var(--error)', fontSize:'var(--text-sm)', marginBottom:'var(--sp-3)' }}>{error}</p>}

              <div style={{ display:'flex', gap:'var(--sp-3)' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex:1, height:44 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex:2, height:44 }}>
                  {submitting ? 'Enviando…' : 'Enviar feedback'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
