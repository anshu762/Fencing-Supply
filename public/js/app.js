// ============================================
// MAIN APPLICATION ENTRY POINT
// ============================================

const App = {
    state: {
        user: null,
        cart: null,
        loading: false,
    },

    async init() {
        try {
            // Load current user if logged in
            await this.loadUser();

            // Load cart
            await this.loadCart();

            // Setup global event listeners
            this.setupEventListeners();

            // Initialize router (this will render the initial page)
            Router.init();

            console.log('✓ Fencing Supply App initialized');
        } catch (err) {
            console.error('App init error:', err);
            // Still try to initialize router so user sees something
            try { Router.init(); } catch (e) { console.error(e); }
        }
    },

    async loadUser() {
        try {
            const res = await API.get('/api/auth/me');
            if (res && res.user) {
                this.state.user = res.user;
            }
        } catch (err) {
            this.state.user = null;
        }
    },

    async loadCart() {
        try {
            const res = await API.get('/api/cart');
            this.state.cart = res.cart || { items: [], total: 0 };
            this.updateCartBadge();
        } catch (err) {
            this.state.cart = { items: [], total: 0 };
        }
    },

    updateCartBadge() {
        const badges = document.querySelectorAll('#cart-badge, .cart-badge');
        const count = this.state.cart?.items?.length || 0;
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        });
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Mobile menu toggle
            if (e.target.closest('#mobile-menu-toggle, .mobile-menu-toggle')) {
                document.querySelector('.main-nav')?.classList.toggle('mobile-open');
            }
            // Close user dropdown on outside click
            if (!e.target.closest('.user-menu')) {
                document.querySelectorAll('.user-dropdown.open').forEach(d => d.classList.remove('open'));
            }
        });

        // Global logout handler
        document.addEventListener('click', async (e) => {
            if (e.target.closest('[data-action="logout"]')) {
                e.preventDefault();
                await this.logout();
            }
        });
    },

    async logout() {
        try {
            await API.post('/api/auth/logout');
            this.state.user = null;
            this.state.cart = { items: [], total: 0 };
            this.updateCartBadge();
            if (typeof Utils !== 'undefined') Utils.toast('Logged out successfully', 'success');
            Router.navigate('/');
        } catch (err) {
            if (typeof Utils !== 'undefined') Utils.toast('Logout failed', 'error');
        }
    },

    requireAuth(redirectPath) {
        if (!this.state.user) {
            if (typeof Utils !== 'undefined') Utils.toast('Please login to continue', 'info');
            Router.navigate('/login?redirect=' + encodeURIComponent(redirectPath || window.location.pathname));
            return false;
        }
        return true;
    },

    requireRole(role) {
        if (!this.state.user) {
            Router.navigate('/login');
            return false;
        }
        if (this.state.user.role !== role && this.state.user.role !== 'admin') {
            if (typeof Utils !== 'undefined') Utils.toast('Access denied', 'error');
            Router.navigate('/');
            return false;
        }
        return true;
    }
};

// Start the app on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());