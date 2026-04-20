import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const HAS_GOOGLE = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({ role = 'CLIENT', label = 'Continuar con Google', onError }) {
  if (!HAS_GOOGLE) return null;

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneState, setPhoneState] = useState(null); // { data, phone }
  const [phoneError, setPhoneError] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  function getRedirect(user, isNew) {
    if (user.role === 'BUSINESS_OWNER' && isNew) return '/register-business';
    if (user.role === 'PROFESSIONAL') return '/pro/dashboard';
    if (user.role === 'BUSINESS_OWNER') return '/dashboard';
    return '/';
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await api.googleAuth(tokenResponse.access_token, role);
        login(data);
        if (data.isNew) {
          setPhoneState({ data, phone: '' });
        } else {
          navigate(getRedirect(data.user, false));
        }
      } catch (err) {
        onError?.(err.message || 'Error al autenticar con Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError?.('Error al conectar con Google'),
  });

  async function handlePhoneSubmit(e) {
    e.preventDefault();
    const phone = phoneState.phone.trim();
    if (!phone) { setPhoneError('El teléfono es obligatorio'); return; }
    setSavingPhone(true);
    try {
      await api.updateMe({ phone });
      navigate(getRedirect(phoneState.data.user, true));
    } catch {
      navigate(getRedirect(phoneState.data.user, true));
    } finally {
      setSavingPhone(false);
    }
  }

  if (phoneState) {
    return (
      <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          padding: 'var(--sp-2) var(--sp-3)',
          background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.25)',
          borderRadius: 'var(--r-md)', fontSize: 'var(--text-xs)', color: '#34A853',
        }}>
          <IconGoogle />
          Cuenta creada con Google
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="google-phone">
            Teléfono de contacto
          </label>
          <input
            id="google-phone"
            className={`input${phoneError ? ' input-error' : ''}`}
            type="tel"
            placeholder="+57 300 000 0000"
            value={phoneState.phone}
            onChange={e => { setPhoneState(s => ({ ...s, phone: e.target.value })); setPhoneError(''); }}
            autoComplete="tel"
            autoFocus
          />
          {phoneError && <p className="field-error">{phoneError}</p>}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={savingPhone}
        >
          {savingPhone ? 'Guardando...' : 'Continuar'}
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 44,
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        color: 'var(--text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'background var(--ease), border-color var(--ease)',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--surface-3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
    >
      {loading
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        : <IconGoogle />
      }
      {loading ? 'Autenticando...' : label}
    </button>
  );
}
