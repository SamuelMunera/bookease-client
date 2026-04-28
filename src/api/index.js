const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El servidor no está disponible. Intenta de nuevo.');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
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
  updateBusinessSettings: (body) => request('/businesses/me/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getProRevenue: () => request('/pro/me/revenue'),

  // Analytics
  getBusinessAnalytics: (period = 'month') => request(`/businesses/me/analytics?period=${period}`),
  getProAnalytics: (period = 'month') => request(`/pro/me/analytics?period=${period}`),

  // Professional service configs & buffer
  getProServiceConfigs: () => request('/pro/me/service-configs'),
  saveProServiceConfigs: (configs) => request('/pro/me/service-configs', { method: 'PUT', body: JSON.stringify({ configs }) }),
  updateProBuffer: (bufferTime) => request('/pro/me/buffer', { method: 'PATCH', body: JSON.stringify({ bufferTime }) }),
  updateProCancelPolicy: (cancelMinHours) => request('/pro/me/cancel-policy', { method: 'PATCH', body: JSON.stringify({ cancelMinHours }) }),
  updateBizCancelPolicy: (bizId, cancelMinHours) => request(`/businesses/${bizId}`, { method: 'PUT', body: JSON.stringify({ cancelMinHours }) }),

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
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/businesses/me/logo`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
    }).then(r => r.json());
  },

  // Professional profile
  updateProProfile: (body) => request('/pro/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  uploadProAvatar: (file) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/pro/me/avatar`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
    }).then(r => r.json());
  },
  unlinkFromBusiness: () => request('/pro/me/business', { method: 'DELETE' }),

  // Professional gallery
  getProPhotos: () => request('/pro/me/photos'),
  uploadProPhoto: (file, caption) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return fetch(`${BASE}/pro/me/photos`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
    }).then(r => r.json());
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
  // Home service (public)
  getHomeProfessionals: (params = {}) => request(`/professionals?${new URLSearchParams(params)}`),
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
  confirmBooking: (id) => request(`/bookings/${id}/confirm`, { method: 'PATCH' }),
  markNoShow: (id) => request(`/bookings/${id}/no-show`, { method: 'PATCH' }),
  markComplete: (id) => request(`/bookings/${id}/complete`, { method: 'PATCH' }),
  rescheduleBooking: (id, body) =>
    request(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(body) }),

  searchClient: (email) => request(`/bookings/clients/search?email=${encodeURIComponent(email)}`),
  createManualBookingBusiness: (businessId, body) => request(`/businesses/${businessId}/bookings/manual`, { method: 'POST', body: JSON.stringify(body) }),
  createManualBookingPro: (body) => request('/pro/me/bookings/manual', { method: 'POST', body: JSON.stringify(body) }),

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
};

export default api;
