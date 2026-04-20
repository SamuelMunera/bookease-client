import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessListPage from './pages/BusinessListPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BusinessAgendaPage from './pages/BusinessAgendaPage';
import ProfessionalProfilePage from './pages/ProfessionalProfilePage';
import BusinessesPage from './pages/BusinessesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import RegisterBusinessPage from './pages/RegisterBusinessPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import ProLoginPage from './pages/ProLoginPage';
import ProRegisterPage from './pages/ProRegisterPage';
import ProfessionalDashboardPage from './pages/ProfessionalDashboardPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminFinancesPage from './pages/admin/AdminFinancesPage';
import AdminBusinessesPage from './pages/admin/AdminBusinessesPage';
import AdminProfessionalsPage from './pages/admin/AdminProfessionalsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Main app ── */}
          <Route element={<Layout />}>
            <Route index element={<BusinessListPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="businesses/:id" element={<BusinessDetailPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="professionals/:id" element={<ProfessionalProfilePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="book" element={
              <ProtectedRoute><BookingPage /></ProtectedRoute>
            } />
            <Route path="my-bookings" element={
              <ProtectedRoute role={['CLIENT','PROFESSIONAL']}><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="agenda" element={
              <ProtectedRoute role="BUSINESS_OWNER"><BusinessAgendaPage /></ProtectedRoute>
            } />
            <Route path="register-business" element={
              <ProtectedRoute role="BUSINESS_OWNER"><RegisterBusinessPage /></ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute role="BUSINESS_OWNER"><BusinessDashboardPage /></ProtectedRoute>
            } />
            <Route path="pro/login" element={<ProLoginPage />} />
            <Route path="pro/register" element={<ProRegisterPage />} />
            <Route path="pro/dashboard" element={
              <ProtectedRoute role="PROFESSIONAL"><ProfessionalDashboardPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* ── Admin panel ── */}
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin" element={
            <ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="professionals" element={<AdminProfessionalsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="finances" element={<AdminFinancesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
