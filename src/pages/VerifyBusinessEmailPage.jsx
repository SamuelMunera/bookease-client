import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function VerifyBusinessEmailPage() {
  const [params] = useSearchParams();
  const token    = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | ok | already | error
  const [msg,    setMsg]    = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('Enlace inválido.'); return; }
    api.verifyBusinessEmail(token)
      .then(r => {
        if (r.alreadyVerified) { setStatus('already'); }
        else { setStatus('ok'); }
      })
      .catch(e => { setStatus('error'); setMsg(e.message || 'No se pudo verificar.'); });
  }, [token]);

  const content = {
    loading: { icon: '⏳', title: 'Verificando…',              body: 'Un momento.' },
    ok:      { icon: '✅', title: '¡Email verificado!',         body: 'Tu negocio está confirmado en el catálogo.' },
    already: { icon: '✔️', title: 'Ya verificado',             body: 'El email de tu negocio ya estaba confirmado.' },
    error:   { icon: '❌', title: 'No se pudo verificar',       body: msg },
  }[status];

  return (
    <div style={{ display:'flex', minHeight:'80vh', alignItems:'center', justifyContent:'center', padding:'var(--sp-8)' }}>
      <div style={{
        maxWidth: 420, width: '100%', textAlign: 'center',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-10)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>{content.icon}</div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text)', marginBottom: 'var(--sp-3)' }}>
          {content.title}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
          {content.body}
        </p>
        {status !== 'loading' && (
          <Link to="/dashboard" style={{
            display: 'inline-block', padding: '10px 28px',
            background: 'var(--gold)', color: '#000',
            borderRadius: 999, fontWeight: 700, fontSize: 'var(--text-sm)',
            textDecoration: 'none',
          }}>
            Ir al panel
          </Link>
        )}
      </div>
    </div>
  );
}
