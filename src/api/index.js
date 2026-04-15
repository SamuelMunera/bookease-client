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

  // Slots
  getSlots: (params) => request(`/slots?${new URLSearchParams(params)}`),

  // Bookings
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/me'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  cancelBookingAsOwner: (id) => request(`/bookings/${id}/cancel-owner`, { method: 'PATCH' }),
  confirmBooking: (id) => request(`/bookings/${id}/confirm`, { method: 'PATCH' }),
  rescheduleBooking: (id, body) =>
    request(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export default api;
