/* ─────────────────────────────────────────
   cart.js – Shopping cart (localStorage)
───────────────────────────────────────── */

const CART_KEY = 'lb_cart';

const cart = {
    get() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    },

    save(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        cart.updateBadge();
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    },

    add(item) {
        const items = cart.get();
        const existing = items.find(i => i._id === item._id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            items.push({ ...item, quantity: 1 });
        }
        cart.save(items);
        showToast(`${item.name} added to cart 🛒`);
    },

    updateQty(id, qty) {
        let items = cart.get();
        if (qty <= 0) {
            items = items.filter(i => i._id !== id);
        } else {
            const item = items.find(i => i._id === id);
            if (item) item.quantity = qty;
        }
        cart.save(items);
    },

    remove(id) {
        const items = cart.get().filter(i => i._id !== id);
        cart.save(items);
    },

    clear() {
        cart.save([]);
    },

    total() {
        return cart.get().reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
    },

    count() {
        return cart.get().reduce((sum, i) => sum + (i.quantity || 1), 0);
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = cart.count();
        badges.forEach(b => { b.textContent = count > 0 ? count : ''; });
    },

    renderDrawer() {
        const items = cart.get();
        const container = document.getElementById('cart-items');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Your cart is empty</p>
        </div>`;
        } else {
            container.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item._id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatZAR(item.price)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="cart.updateQty('${item._id}', ${item.quantity - 1})">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" onclick="cart.updateQty('${item._id}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="cart.remove('${item._id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>`).join('');
        }

        const totalEl = document.getElementById('cart-total-amount');
        if (totalEl) totalEl.textContent = formatZAR(cart.total());
    },

    openDrawer() {
        cart.renderDrawer();
        document.getElementById('cart-overlay')?.classList.add('open');
        document.getElementById('cart-drawer')?.classList.add('open');
    },

    closeDrawer() {
        document.getElementById('cart-overlay')?.classList.remove('open');
        document.getElementById('cart-drawer')?.classList.remove('open');
    },
};

// Listen for cart updates and re-render drawer if open
document.addEventListener('cartUpdated', () => {
    if (document.getElementById('cart-drawer')?.classList.contains('open')) {
        cart.renderDrawer();
    }
    cart.updateBadge();
});

// Init badge on page load
document.addEventListener('DOMContentLoaded', () => cart.updateBadge());
