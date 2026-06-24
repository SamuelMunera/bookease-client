import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Home correspondiente a cada rol — usado cuando el rol no cumple el requerido
const ROLE_HOME = {
  BUSINESS_OWNER: '/dashboard',
  PROFESSIONAL: '/pro/dashboard',
  ADMIN: '/admin/dashboard',
  CLIENT: '/',
};

// role can be a string or array of strings
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
    }
  }
  return children;
}
