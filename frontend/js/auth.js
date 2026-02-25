/* ─────────────────────────────────────────
   auth.js – Auth state management
───────────────────────────────────────── */

const auth = {
    getToken: () => localStorage.getItem('lb_token'),
    getUser: () => { try { return JSON.parse(localStorage.getItem('lb_user')); } catch { return null; } },
    isLoggedIn: () => !!auth.getToken(),
    isAdmin: () => auth.getUser()?.role === 'admin',
    isStaff: () => ['admin', 'staff'].includes(auth.getUser()?.role),

    save(token, user) {
        localStorage.setItem('lb_token', token);
        localStorage.setItem('lb_user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('lb_token');
        localStorage.removeItem('lb_user');
        window.location.href = '/frontend/index.html';
    },

    requireLogin() {
        if (!auth.isLoggedIn()) {
            window.location.href = `/frontend/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!auth.isAdmin()) {
            window.location.href = '/frontend/index.html';
            return false;
        }
        return true;
    },

    // Update nav UI based on auth state
    updateNavUI() {
        const user = auth.getUser();
        const loginLink = document.getElementById('nav-login');
        const logoutLink = document.getElementById('nav-logout');
        const adminLink = document.getElementById('nav-admin');
        const userName = document.getElementById('nav-username');

        if (user) {
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'flex';
            if (userName) userName.textContent = user.name.split(' ')[0];
            if (adminLink && auth.isStaff()) adminLink.style.display = 'flex';
        }
    },
};

document.addEventListener('DOMContentLoaded', () => auth.updateNavUI());
