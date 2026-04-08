import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessListPage from './pages/BusinessListPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BusinessAgendaPage from './pages/BusinessAgendaPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<BusinessListPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="businesses/:id" element={<BusinessDetailPage />} />
            <Route path="book" element={
              <ProtectedRoute role="CLIENT"><BookingPage /></ProtectedRoute>
            } />
            <Route path="my-bookings" element={
              <ProtectedRoute role="CLIENT"><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="agenda" element={
              <ProtectedRoute role="BUSINESS_OWNER"><BusinessAgendaPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
