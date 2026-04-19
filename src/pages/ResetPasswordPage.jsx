import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirm) return setError('Las contraseñas no coinciden');
    if (newPassword.length < 8) return setError('Mínimo 8 caracteres');
    setLoading(true);
    setError('');
    try {
      await api.resetPassword({ token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
          <p style={{ color: 'var(--red)', fontWeight: 600 }}>Enlace inválido o expirado.</p>
          <Link to="/forgot-password" style={{ color: 'var(--violet)', fontWeight: 600 }}>Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
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
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 6 }}>Nueva contraseña</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Elige una contraseña segura.</p>
        </div>

        {done ? (
          <div style={{
            textAlign: 'center', padding: 'var(--sp-6)',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 'var(--sp-3)' }}>✅</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>¡Contraseña actualizada!</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Serás redirigido al login en unos segundos…
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
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirmar contraseña</label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
                style={{ width: '100%' }}
              />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Guardando…' : 'Establecer nueva contraseña'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-5)', fontSize: 'var(--text-sm)' }}>
          <Link to="/login" style={{ color: 'var(--violet)', fontWeight: 600, textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
