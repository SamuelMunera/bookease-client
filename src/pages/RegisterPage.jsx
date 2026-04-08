import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data);
      navigate(data.user.role === 'BUSINESS_OWNER' ? '/agenda' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">Book<span>ease</span></div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-sub">Únete a Bookease en segundos</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre completo</label>
            <input id="name" className="input" placeholder="Tu nombre" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input id="password" className="input" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Tipo de cuenta</label>
            <select id="role" className="input" value={form.role} onChange={set('role')}>
              <option value="CLIENT">Soy cliente — quiero reservar</option>
              <option value="BUSINESS_OWNER">Soy negocio — quiero recibir reservas</option>
            </select>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-foot">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
