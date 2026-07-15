const BASE = import.meta.env.VITE_API_URL || '/api';

// Modo de autenticación. 'cookie' => sesión vía cookie HttpOnly + CSRF (anti-XSS,
// sin token en JS). Cualquier otro valor / ausente => comportamiento actual
// (token en localStorage + Authorization: Bearer). Default seguro: NO cookie.
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE;
const COOKIE_MODE = AUTH_MODE === 'cookie';

// Lee una cookie legible por JS (p.ej. csrfToken, que NO es HttpOnly).
function getCookie(name) {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getToken() {
  // En modo cookie no existe token accesible desde JS: la sesión vive en la
  // cookie HttpOnly. Devolver null evita mandar Authorization por accidente.
  if (COOKIE_MODE) return null;
  return localStorage.getItem('token');
}

// Endpoints donde un 401 es un fallo de credenciales normal (login/registro),
// NO una sesión expirada: no deben limpiar sesión ni redirigir, o el propio
// formulario de login entraría en un bucle de recarga/redirección.
const AUTH_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/pro/register',
];

function isAuthExempt(path) {
  return AUTH_EXEMPT_PATHS.some((p) => path.startsWith(p));
}

// Deriva el login correcto según la zona de la app en la que está el usuario,
// para no mandar a un admin/profesional al login de clientes.
function loginPathForCurrentLocation() {
  const p = window.location.pathname;
  if (p.startsWith('/admin')) return '/admin/login';
  if (
    p.startsWith('/pro') ||
    p.startsWith('/dashboard') ||
    p.startsWith('/agenda') ||
    p.startsWith('/register-business')
  ) {
    return '/pro/login';
  }
  return '/login';
}

// Sesión expirada / token inválido: limpiar credenciales y mandar al login.
function handleUnauthorized() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  const target = loginPathForCurrentLocation();
  if (window.location.pathname !== target) {
    window.location.href = target;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const method = (options.method || 'GET').toUpperCase();
  // CSRF: en mutaciones, reflejar la cookie legible csrfToken en el header.
  // Solo se añade si la cookie existe (modo cookie); inofensivo en modo Bearer.
  const csrf = MUTATING_METHODS.has(method) ? getCookie('csrfToken') : null;
  const res = await fetch(`${BASE}${path}`, {
    // credentials:include => las cookies (HttpOnly token + csrfToken) viajan
    // cross-origin. En modo Bearer no molesta.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // Bearer solo fuera de modo cookie (y si hay token). En modo cookie
      // getToken() devuelve null, así que este header nunca se añade.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    ...options,
  });
  // Manejo global de 401: si la sesión expiró (no en el propio login/registro),
  // limpiar sesión y redirigir para no dejar al usuario "logueado" viendo vacíos.
  if (res.status === 401 && !isAuthExempt(path)) {
    handleUnauthorized();
  }
  if (res.status === 204) return null;
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El servidor no está disponible. Intenta de nuevo.');
  }
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    if (data.code) err.code = data.code;
    else if (res.status === 401) err.code = 'AUTH_REQUIRED';
    else if (res.status === 403) err.code = 'AUTH_FORBIDDEN';
    err.status = res.status;
    throw err;
  }
  return data;
}

// Subida de archivos (multipart). Comparte la comprobación de res.ok y el
// manejo de 401 con request(): un 413/500 ya no se trata como éxito.
async function uploadRequest(path, form) {
  const token = getToken();
  // uploadRequest siempre es POST (mutante): añadir CSRF si hay cookie.
  const csrf = getCookie('csrfToken');
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: form,
  });
  if (res.status === 401 && !isAuthExempt(path)) {
    handleUnauthorized();
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El servidor no está disponible. Intenta de nuevo.');
  }
  if (!res.ok) {
    const err = new Error(data.error || 'No se pudo subir el archivo.');
    if (data.code) err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  switchContext: (role) => request('/auth/switch-context', { method: 'POST', body: JSON.stringify({ role }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateMe: (body) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),

  // Businesses
  getBusinesses: (params = {}) => request(`/businesses?${new URLSearchParams(params)}`),
  getBusiness: (id) => request(`/businesses/${id}`),
  getBusinessProfessionals: (id) => request(`/businesses/${id}/professionals`),
  getProfessional: (id) => request(`/professionals/${id}`),
  getBusinessServices: (id) => request(`/businesses/${id}/services`),
  createBusiness: (body) =>
    request('/businesses', { method: 'POST', body: JSON.stringify(body) }),
  createService: (businessId, body) =>
    request(`/businesses/${businessId}/services`, { method: 'POST', body: JSON.stringify(body) }),
  updateService: (businessId, id, body) =>
    request(`/businesses/${businessId}/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getBusinessBookings: (id, params = {}) =>
    request(`/businesses/${id}/bookings?${new URLSearchParams(params)}`),

  // Professionals auth
  registerProfessional: (body) => request('/pro/register', { method: 'POST', body: JSON.stringify(body) }),
  getProMe: () => request('/pro/me'),
  getProBookings: () => request('/pro/me/bookings'),
  getProServices: () => request('/pro/me/services'),
  setProServices: (serviceIds) => request('/pro/me/services', { method: 'PUT', body: JSON.stringify({ serviceIds }) }),
  getProSchedule: () => request('/pro/me/schedule'),
  setProSchedule: (days) => request('/pro/me/schedule', { method: 'PUT', body: JSON.stringify({ days }) }),
  getWeekSchedule: (ws) => request(`/pro/me/schedule/week/${ws}`),
  setWeekSchedule: (ws, days) => request(`/pro/me/schedule/week/${ws}`, { method: 'PUT', body: JSON.stringify({ days }) }),
  deleteWeekSchedule: (ws) => request(`/pro/me/schedule/week/${ws}`, { method: 'DELETE' }),
  getProfessionalServices: (id) => request(`/professionals/${id}/services`),

  // Revenue & settings
  getBusinessRevenue: () => request('/businesses/me/revenue'),
  getBusinessReferrals: () => request('/businesses/me/referrals'),
  updateBusinessSettings: (body) => request('/businesses/me/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getProRevenue: () => request('/pro/me/revenue'),

  // Owner-as-professional (misma cuenta)
  getOwnerProfessional: () => request('/businesses/me/professional'),
  activateOwnerProfessional: () => request('/businesses/me/professional', { method: 'POST' }),
  setOwnerProfessionalBookable: (isBookable) => request('/businesses/me/professional', { method: 'PATCH', body: JSON.stringify({ isBookable }) }),

  // Analytics
  getBusinessAnalytics: (period = 'month') => request(`/businesses/me/analytics?period=${period}`),
  getProAnalytics: (period = 'month') => request(`/pro/me/analytics?period=${period}`),

  // Professional service configs & buffer
  getProServiceConfigs: () => request('/pro/me/service-configs'),
  saveProServiceConfigs: (configs) => request('/pro/me/service-configs', { method: 'PUT', body: JSON.stringify({ configs }) }),
  updateProBuffer: (bufferTime) => request('/pro/me/buffer', { method: 'PATCH', body: JSON.stringify({ bufferTime }) }),
  // Acepta la política completa: { cancelMinHours?, feeEnabled?, feeWindowHours?, feeAmount? }
  updateProCancelPolicy: (policy) => request('/pro/me/cancel-policy', { method: 'PATCH', body: JSON.stringify(policy) }),
  updateBizCancelPolicy: (bizId, cancelMinHours) => request(`/businesses/${bizId}`, { method: 'PUT', body: JSON.stringify({ cancelMinHours }) }),

  // Multas por cancelación tardía / no-show (deudas del cliente con el profesional)
  getProDebts: (status) => request(`/pro/me/debts${status ? `?status=${status}` : ''}`),
  updateProDebt: (id, status) => request(`/pro/me/debts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Join requests
  submitJoinRequest: (code) => request('/pro/join', { method: 'POST', body: JSON.stringify({ code }) }),
  getMyJoinRequest: () => request('/pro/me/join-request'),
  getBusinessJoinCode: () => request('/businesses/me/join-code'),
  getBusinessJoinRequests: () => request('/businesses/me/join-requests'),
  approveJoinRequest: (id) => request(`/businesses/me/join-requests/${id}/approve`, { method: 'PATCH' }),
  rejectJoinRequest: (id) => request(`/businesses/me/join-requests/${id}/reject`, { method: 'PATCH' }),

  // Auth
  changePassword: (body) => request('/auth/change-password', { method: 'PATCH', body: JSON.stringify(body) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Duplicate check (pre-submit)
  checkBusinessDuplicate: (body) => request('/businesses/check-duplicate', { method: 'POST', body: JSON.stringify(body) }),

  // Business email verification
  sendBusinessVerifyEmail: () => request('/businesses/me/verify-email/send', { method: 'POST' }),
  verifyBusinessEmail: (token) => request(`/businesses/verify-email/${token}`),

  // Business profile
  getMyBusiness: () => request('/businesses/me'),
  updateBusinessProfile: (body) => request('/businesses/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  uploadBusinessLogo: (file) => {
    const form = new FormData();
    form.append('file', file);
    return uploadRequest('/businesses/me/logo', form);
  },
  uploadBusinessCover: (file) => {
    const form = new FormData();
    form.append('file', file);
    return uploadRequest('/businesses/me/cover', form);
  },
  updateBusinessCustomization: (body) => request('/businesses/me/customization', { method: 'PATCH', body: JSON.stringify(body) }),

  // Business gallery
  getMyBusinessGallery: () => request('/businesses/me/gallery'),
  uploadBusinessGalleryPhoto: (file, caption) => {
    const form = new FormData();
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return uploadRequest('/businesses/me/gallery', form);
  },
  updateBusinessGalleryPhoto: (id, body) => request(`/businesses/me/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteBusinessGalleryPhoto: (id) => request(`/businesses/me/gallery/${id}`, { method: 'DELETE' }),
  getBusinessGallery: (id) => request(`/businesses/${id}/gallery`),

  // Business service categories
  getMyServiceCategories: () => request('/businesses/me/service-categories'),
  createServiceCategory: (body) => request('/businesses/me/service-categories', { method: 'POST', body: JSON.stringify(body) }),
  updateServiceCategory: (id, body) => request(`/businesses/me/service-categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteServiceCategory: (id) => request(`/businesses/me/service-categories/${id}`, { method: 'DELETE' }),
  getBusinessServiceCategories: (id) => request(`/businesses/${id}/service-categories`),

  // Business hours
  getMyBusinessHours: () => request('/businesses/me/hours'),
  setMyBusinessHours: (hours) => request('/businesses/me/hours', { method: 'PUT', body: JSON.stringify({ hours }) }),
  getBusinessHours: (id) => request(`/businesses/${id}/hours`),

  // Professional profile
  updateProProfile: (body) => request('/pro/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  uploadProAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return uploadRequest('/pro/me/avatar', form);
  },
  unlinkFromBusiness: () => request('/pro/me/business', { method: 'DELETE' }),

  // Professional gallery
  getProPhotos: () => request('/pro/me/photos'),
  uploadProPhoto: (file, caption) => {
    const form = new FormData();
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return uploadRequest('/pro/me/photos', form);
  },
  deleteProPhoto: (id) => request(`/pro/me/photos/${id}`, { method: 'DELETE' }),

  // Google OAuth
  googleAuth: (accessToken, role) => request('/auth/google', { method: 'POST', body: JSON.stringify({ accessToken, role }) }),

  // Admin
  adminStats:         () => request('/admin/stats'),
  adminBusinesses:    () => request('/admin/businesses'),
  adminProfessionals: () => request('/admin/professionals'),
  adminCategories:    () => request('/admin/categories'),
  adminCreateCategory: (body) => request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  adminDeleteCategory: (id)   => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Admin: referral codes
  adminPromoters:        () => request('/admin/promoters'),
  adminPromoterDetail:   (id) => request(`/admin/promoters/${id}`),
  adminReferralStats:   () => request('/admin/referrals/stats'),
  adminCreatePromoter:   (body) => request('/admin/promoters', { method: 'POST', body: JSON.stringify(body) }),
  adminSetPromoterStatus: (id, status) => request(`/admin/promoters/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminCourtesyCodes:       () => request('/admin/courtesy-codes'),
  adminCreateCourtesyCode:  (body) => request('/admin/courtesy-codes', { method: 'POST', body: JSON.stringify(body) }),

  // Admin: finance
  adminFinanceOverview:      () => request('/admin/finance/overview'),
  adminFinanceSubscriptions: (params = {}) => request(`/admin/finance/subscriptions?${new URLSearchParams(params)}`),
  adminFinanceDiscounts:     (params = {}) => request(`/admin/finance/discounts?${new URLSearchParams(params)}`),
  adminFinanceCommissions:   (params = {}) => request(`/admin/finance/commissions?${new URLSearchParams(params)}`),

  // Categories
  getCategories: () => request('/categories'),

  // Home service (pro dashboard)
  getHomeConfig: () => request('/pro/me/home-config'),
  updateHomeConfig: (body) => request('/pro/me/home-config', { method: 'PATCH', body: JSON.stringify(body) }),
  getMyHomeServices: () => request('/pro/me/home-services'),
  createHomeService: (body) => request('/pro/me/home-services', { method: 'POST', body: JSON.stringify(body) }),
  updateHomeService: (id, body) => request(`/pro/me/home-services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteHomeService: (id) => request(`/pro/me/home-services/${id}`, { method: 'DELETE' }),
  getMyHomeSchedule: () => request('/pro/me/home-schedule'),
  setMyHomeSchedule: (days) => request('/pro/me/home-schedule', { method: 'PUT', body: JSON.stringify({ days }) }),
  // Geo
  detectCountry: () => request('/geo/country'),

  // Home service (public)
  getHomeProfessionals: (params = {}) => request(`/professionals?${new URLSearchParams(params)}`),
  getHomeProsForCountry: (country) => request(`/professionals?${new URLSearchParams({ country })}`),
  getProfessionalHomeServices: (id) => request(`/professionals/${id}/home-services`),
  getHomeSlots: (params) => request(`/slots/home?${new URLSearchParams(params)}`),
  // Home bookings
  createHomeBooking: (body) => request('/bookings/home', { method: 'POST', body: JSON.stringify(body) }),
  cancelHomeBooking: (id) => request(`/bookings/home/${id}/cancel`, { method: 'PATCH' }),

  // Slots
  getSlots: (params) => request(`/slots?${new URLSearchParams(params)}`),

  // Bookings
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/me'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  cancelBookingAsOwner: (id) => request(`/bookings/${id}/cancel-owner`, { method: 'PATCH' }),
  cancelBookingAsPro: (id) => request(`/bookings/${id}/cancel-professional`, { method: 'PATCH' }),
  confirmBooking: (id) => request(`/bookings/${id}/confirm`, { method: 'PATCH' }),
  markNoShow: (id) => request(`/bookings/${id}/no-show`, { method: 'PATCH' }),
  markComplete: (id) => request(`/bookings/${id}/complete`, { method: 'PATCH' }),
  rescheduleBooking: (id, body) =>
    request(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(body) }),

  searchClient: (email) => request(`/bookings/clients/search?email=${encodeURIComponent(email)}`),
  createManualBookingBusiness: (businessId, body) => request(`/businesses/${businessId}/bookings/manual`, { method: 'POST', body: JSON.stringify(body) }),
  createManualBookingPro: (body) => request('/pro/me/bookings/manual', { method: 'POST', body: JSON.stringify(body) }),

  // Public stats
  getPlatformStats: () => request('/stats'),

  // Discovery
  getNewestBusinesses:    (userCountry) => request(`/businesses/newest${userCountry ? `?userCountry=${userCountry}` : ''}`),
  getTopBookedBusinesses: (userCountry) => request(`/businesses/top-booked${userCountry ? `?userCountry=${userCountry}` : ''}`),

  // Plans
  getPlans: (country = 'CO') => request(`/businesses/plans?country=${country}`),
  updateBusinessPlan: (plan) => request('/businesses/me/plan', { method: 'PATCH', body: JSON.stringify({ plan }) }),

  // Subscriptions
  getMySubscription: () => request('/subscriptions/business/me'),
  getProSubscription: () => request('/subscriptions/professional/me'),

  // Payments (Wompi)
  getWompiConfig: () => request('/payments/wompi/config'),
  createWompiCheckout: (plan) => request('/payments/wompi/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  getWompiTransaction: (reference) => request(`/payments/wompi/transactions/${reference}`),

  // Reviews
  getBusinessReviews:       (id)       => request(`/businesses/${id}/reviews`),
  getBusinessStats:         (id)       => request(`/businesses/${id}/stats`),
  canReviewBusiness:        (id)       => request(`/businesses/${id}/reviews/can-review`),
  createBusinessReview:     (id, body) => request(`/businesses/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  getProfessionalReviews:   (id)       => request(`/professionals/${id}/reviews`),
  getProfessionalStats:     (id)       => request(`/professionals/${id}/stats`),
  canReviewProfessional:    (id)       => request(`/professionals/${id}/reviews/can-review`),
  createProfessionalReview: (id, body) => request(`/professionals/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  // Feedback
  submitFeedback: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),

  // Promotions
  getMyPromotions:    ()         => request('/promotions/me'),
  createPromotion:    (body)     => request('/promotions/me', { method: 'POST', body: JSON.stringify(body) }),
  updatePromotion:    (id, body) => request(`/promotions/me/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePromotion:    (id)       => request(`/promotions/me/${id}`, { method: 'DELETE' }),
  getPublicPromotions:(bizId)    => request(`/promotions/${bizId}/active`),
  getPromotedBusinesses: ()      => request('/promotions/promoted-businesses'),
};

export default api;
