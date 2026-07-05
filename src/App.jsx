import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CountryProvider } from './context/CountryContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

/* ── CORE-02: entry public routes stay eager to protect first paint ── */
import BusinessListPage from './pages/BusinessListPage';
import LoginPage from './pages/LoginPage';

/* ── CORE-02: everything below is code-split via React.lazy ── */
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const BusinessAgendaPage = lazy(() => import('./pages/BusinessAgendaPage'));
const ProfessionalProfilePage = lazy(() => import('./pages/ProfessionalProfilePage'));
const BusinessesPage = lazy(() => import('./pages/BusinessesPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const RegisterBusinessPage = lazy(() => import('./pages/RegisterBusinessPage'));
const BusinessDashboardPage = lazy(() => import('./pages/BusinessDashboardPage'));
const ProLoginPage = lazy(() => import('./pages/ProLoginPage'));
const ProRegisterPage = lazy(() => import('./pages/ProRegisterPage'));
const ProfessionalDashboardPage = lazy(() => import('./pages/ProfessionalDashboardPage'));
const HomeBookingPage = lazy(() => import('./pages/HomeBookingPage'));
const HomeServicePage = lazy(() => import('./pages/HomeServicePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const VerifyBusinessEmailPage = lazy(() => import('./pages/VerifyBusinessEmailPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

/* ── CORE-02: admin panel is never on the first-paint path ── */
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminFinancesPage = lazy(() => import('./pages/admin/AdminFinancesPage'));
const AdminFinancePage = lazy(() => import('./pages/admin/AdminFinancePage'));
const AdminBusinessesPage = lazy(() => import('./pages/admin/AdminBusinessesPage'));
const AdminProfessionalsPage = lazy(() => import('./pages/admin/AdminProfessionalsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminReferralCodesPage = lazy(() => import('./pages/admin/AdminReferralCodesPage'));

/* ── CORE-02: shared fallback while a lazy chunk loads ── */
function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        role="status"
        aria-label="Cargando"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <CountryProvider>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ── Main app ── */}
          <Route element={<Layout />}>
            <Route index element={<BusinessListPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="businesses/:id" element={<BusinessDetailPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="professionals" element={<Navigate to="/home-service" replace />} />
            <Route path="home-service" element={<HomeServicePage />} />
            <Route path="professionals/:id" element={<ProfessionalProfilePage />} />
            <Route path="professionals/:professionalId/book-home" element={
              <ProtectedRoute><HomeBookingPage /></ProtectedRoute>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="cookies" element={<CookiesPage />} />
            <Route path="verify-business-email" element={<VerifyBusinessEmailPage />} />
            <Route path="pricing" element={<PricingPage />} />
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
            <Route path="referral-codes" element={<AdminReferralCodesPage />} />
            <Route path="finances" element={<AdminFinancesPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </CountryProvider>
    </ThemeProvider>
  );
}
