/* ─────────────────────────────────────────
   api.js – Centralized fetch helpers
   All requests go through BASE_URL to backend
───────────────────────────────────────── */

const API_BASE = 'http://localhost:5000/api';

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('lb_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
}

const api = {
    // Auth
    register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => apiFetch('/auth/me'),
    getUsers: () => apiFetch('/auth/users'),
    updateUser: (id, body) => apiFetch(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    // Menu
    getMenu: (cat) => apiFetch(`/menu${cat ? `?category=${cat}` : ''}`),
    getMenuAdmin: () => apiFetch('/menu/all'),
    createItem: (body) => apiFetch('/menu', { method: 'POST', body: JSON.stringify(body) }),
    updateItem: (id, body) => apiFetch(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteItem: (id) => apiFetch(`/menu/${id}`, { method: 'DELETE' }),

    // Reservations
    createReservation: (body) => apiFetch('/reservations', { method: 'POST', body: JSON.stringify(body) }),
    getReservations: (q) => apiFetch(`/reservations${q || ''}`),
    updateReservation: (id, b) => apiFetch(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
    deleteReservation: (id) => apiFetch(`/reservations/${id}`, { method: 'DELETE' }),
    getReservationStats: () => apiFetch('/reservations/stats'),

    // Orders
    createOrder: (body) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) }),
    getOrders: (q) => apiFetch(`/orders${q || ''}`),
    updateOrder: (id, body) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteOrder: (id) => apiFetch(`/orders/${id}`, { method: 'DELETE' }),
    getOrderStats: () => apiFetch('/orders/stats'),

    // Payment
    createCheckout: (body) => apiFetch('/payment/create-session', { method: 'POST', body: JSON.stringify(body) }),
};

// Toast notification helper
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Date formatter
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Currency formatter
function formatZAR(amount) {
    return `R ${Number(amount).toFixed(2)}`;
}
