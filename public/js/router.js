// ============================================
// CLIENT-SIDE ROUTER
// ============================================

const Router = {
    currentPath: '/',
    routes: {},
    params: {},

    init() {
        // Define routes
        this.routes = {
            '/': HomePage,
            '/shop': ShopPage,
            '/product/:id': ProductPage,
            '/cart': CartPage,
            '/checkout': CheckoutPage,
            '/login': { render: () => AuthPage.renderLogin() },
            '/register': { render: () => AuthPage.renderRegister() },
            '/account': AccountPage,
            '/orders': OrdersPage,
            '/orders/:id': { render: (p) => OrdersPage.renderDetail(p.id) },  // ← ADDED
            '/order/:id': { render: (p) => OrdersPage.renderDetail(p.id) },
            '/tracking/:id': { render: (p) => TrackingPage.render(p.id) },
            '/quote': QuotePage,
            '/supplier': SupplierPage,
            '/admin': AdminPage,
            '/support': SupportPage,
            '/about': { render: () => StaticPages.about() },
            '/contact': { render: () => StaticPages.contact() },
            '/shipping-policy': { render: () => StaticPages.shipping() },
            '/returns-policy': { render: () => StaticPages.returns() },
            '/privacy-policy': { render: () => StaticPages.privacy() },
            '/terms': { render: () => StaticPages.terms() },
        };

        // Listen to popstate
        window.addEventListener('popstate', () => this.resolve());

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.getAttribute('href').startsWith('/') && !link.hasAttribute('download') && !link.hasAttribute('target')) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });

        // Resolve initial route
        this.resolve();
    },

    navigate(path, replace = false) {
        if (path === this.currentPath) {
            this.resolve();
            return;
        }
        if (replace) {
            history.replaceState(null, '', path);
        } else {
            history.pushState(null, '', path);
        }
        this.resolve();
    },

    resolve() {
        const path = window.location.pathname;
        this.currentPath = path;
        this.params = {};

        // Close mobile menu
        if (typeof Components !== 'undefined' && Components.closeMobileMenu) {
            Components.closeMobileMenu();
        }

        // Scroll to top
        if (typeof Utils !== 'undefined' && Utils.scrollToTop) {
            Utils.scrollToTop();
        }

        // Find matching route (strip query string first)
        const cleanPath = path.split('?')[0];
        let handler = null;
        for (const [pattern, routeHandler] of Object.entries(this.routes)) {
            const match = this.matchRoute(pattern, cleanPath);
            if (match) {
                this.params = match;
                handler = routeHandler;
                break;
            }
        }

        // Update header
        const header = document.getElementById('main-header');
        if (header && Components.renderHeader) {
            const h = Components.renderHeader();
            if (typeof h === 'string') header.innerHTML = h;
        }

        if (handler) {
            try {
                if (typeof handler === 'function') {
                    handler(this.params);
                } else if (handler && typeof handler.render === 'function') {
                    handler.render(this.params);
                }
            } catch (err) {
                console.error('Route handler error:', err);
                this.renderError(err.message);
            }
        } else {
            this.render404();
        }

        // Update footer
        const footer = document.getElementById('main-footer');
        if (footer && Components.renderFooter) {
            const f = Components.renderFooter();
            if (typeof f === 'string') footer.innerHTML = f;
        }

        // Setup scroll animations after render
        setTimeout(() => {
            if (typeof Utils !== 'undefined' && Utils.setupScrollAnimations) {
                Utils.setupScrollAnimations();
            }
        }, 100);
    },

    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].substring(1)] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    },

    render404() {
        const main = document.getElementById('main-content');
        if (!main) return;
        main.innerHTML = `
            <div style="margin-top: var(--header-height);" class="page-enter">
                ${Components.emptyState('🤷', 'Page Not Found', 'The page you\'re looking for doesn\'t exist or has been moved.', 'Go Home', '/')}
            </div>`;
    },

    renderError(msg) {
        const main = document.getElementById('main-content');
        if (!main) return;
        main.innerHTML = `
            <div style="margin-top: var(--header-height);" class="page-enter container">
                <div class="error-state">
                    <h2>Something went wrong</h2>
                    <p>${Utils.escapeHtml(msg || 'An error occurred')}</p>
                    <a href="/" class="btn btn-primary">Go Home</a>
                </div>
            </div>`;
    },

    getQueryParams() {
        const params = {};
        new URLSearchParams(window.location.search).forEach((v, k) => params[k] = v);
        return params;
    }
};