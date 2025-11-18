const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof body === 'string' ? body : body?.error || 'Request failed';
    throw new Error(message);
  }
  return body;
}

export const api = {
  getRooms: () => request('/rooms'),
  seedRooms: () => request('/rooms/seed', { method: 'POST' }),
  listBookings: () => request('/bookings'),
  createBooking: (payload) => request('/bookings/create', { method: 'POST', body: JSON.stringify(payload) }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),
  getAnalytics: (from, to) => request(`/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
};

export function toISTIso(dateStr, timeStr) {
  // Compose ISO with explicit IST offset so backend interprets business-local time correctly
  return `${dateStr}T${timeStr}:00+05:30`;
}