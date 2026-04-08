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
  const data = await res.json();
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
  getBusinessServices: (id) => request(`/businesses/${id}/services`),
  getBusinessBookings: (id, params = {}) =>
    request(`/businesses/${id}/bookings?${new URLSearchParams(params)}`),

  // Slots
  getSlots: (params) => request(`/slots?${new URLSearchParams(params)}`),

  // Bookings
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/me'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  confirmBooking: (id) => request(`/bookings/${id}/confirm`, { method: 'PATCH' }),
};

export default api;
