import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 'var(--sp-4)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-8)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--violet-subtle)', color: 'var(--violet)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--sp-4)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 6 }}>
            Recuperar contraseña
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Ingresa tu correo y te enviaremos un enlace.
          </p>
        </div>

        {sent ? (
          <div style={{
            textAlign: 'center', padding: 'var(--sp-6)',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 'var(--sp-3)' }}>✉️</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>¡Correo enviado!</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {error && (
              <div style={{ padding: 'var(--sp-3)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', color: 'var(--red)', fontSize: 'var(--text-sm)' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                style={{ width: '100%' }}
              />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-5)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--violet)', fontWeight: 600, textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
