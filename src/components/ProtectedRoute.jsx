import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Home correspondiente a cada rol — usado cuando el rol no cumple el requerido
const ROLE_HOME = {
  BUSINESS_OWNER: '/dashboard',
  PROFESSIONAL: '/pro/dashboard',
  ADMIN: '/admin/dashboard',
  CLIENT: '/',
};

// Login correspondiente al rol requerido por la ruta, para no mandar a un
// admin o profesional al login de clientes cuando su sesión no existe/expiró.
const ROLE_LOGIN = {
  ADMIN: '/admin/login',
  PROFESSIONAL: '/pro/login',
  BUSINESS_OWNER: '/pro/login', // dueños de negocio entran por el área profesional
  CLIENT: '/login',
};

// Deriva el login a usar a partir del rol requerido (string o array).
function loginPathFor(role) {
  if (!role) return '/login';
  const roles = Array.isArray(role) ? role : [role];
  // Si CLIENT es una opción válida, el login de clientes es el destino natural.
  if (roles.includes('CLIENT')) return '/login';
  return ROLE_LOGIN[roles[0]] || '/login';
}

// role can be a string or array of strings
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();
  // Sesión inválida: sin usuario en contexto o sin token en almacenamiento
  // (un 401 global pudo limpiar el token). No dejar ver contenido protegido.
  const hasToken = !!localStorage.getItem('token');
  if (!user || !hasToken) {
    return <Navigate to={loginPathFor(role)} state={{ from: location }} replace />;
  }
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
    }
  }
  return children;
}
