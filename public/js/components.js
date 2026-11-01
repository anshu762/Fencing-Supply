// ============================================
// REUSABLE UI COMPONENTS
// ============================================

const Components = {

    // ---- Header ----
    renderHeader() {
        const user = App.state.user;
        const cartCount = (() => {
    const c = App.state.cart;
        if (!c) return 0;
        if (Array.isArray(c)) return c.length;
        if (Array.isArray(c.items)) return c.items.length;
        if (typeof c.count === 'number') return c.count;
        return 0;
    })();

        return `
        <div class="site-header" id="site-header">
            <div class="header-inner">
                <div class="logo" onclick="Router.navigate('/')">
                    <div class="logo-icon">🤺</div>
                    <div class="logo-text">Fencing<span>Supply</span></div>
                </div>

                <nav class="nav-desktop">
                    <a class="nav-link ${Router.currentPath === '/' ? 'active' : ''}" onclick="Router.navigate('/')">Home</a>
                    <a class="nav-link ${Router.currentPath === '/shop' ? 'active' : ''}" onclick="Router.navigate('/shop')">Shop</a>
                    <a class="nav-link ${Router.currentPath === '/quote' ? 'active' : ''}" onclick="Router.navigate('/quote')">Club Quote</a>
                    <a class="nav-link ${Router.currentPath === '/about' ? 'active' : ''}" onclick="Router.navigate('/about')">About</a>
                    <a class="nav-link ${Router.currentPath === '/contact' ? 'active' : ''}" onclick="Router.navigate('/contact')">Contact</a>
                    ${user && user.role === 'supplier' ? `<a class="nav-link ${Router.currentPath.startsWith('/supplier') ? 'active' : ''}" onclick="Router.navigate('/supplier')">Supplier</a>` : ''}
                    ${user && user.role === 'admin' ? `<a class="nav-link ${Router.currentPath.startsWith('/admin') ? 'active' : ''}" onclick="Router.navigate('/admin')">Admin</a>` : ''}
                </nav>

                <div class="header-actions">
                    <button class="header-btn" onclick="Router.navigate('/cart')" aria-label="Shopping cart" title="Cart">
                        🛒
                        <span class="cart-badge ${cartCount === 0 ? 'hidden' : ''}" id="cart-count">${cartCount || 0}</span>
                    </button>

                    ${user ? `
                        <button class="header-btn" onclick="Router.navigate('/account')" aria-label="My account" title="Account">
                            👤
                        </button>
                    ` : `
                        <button class="btn-login-header" onclick="Router.navigate('/login')">Sign In</button>
                    `}

                    <div class="mobile-menu-btn" id="mobile-menu-btn" onclick="Components.toggleMobileMenu()" aria-label="Toggle menu">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>

            <nav class="nav-mobile" id="mobile-nav">
                <a class="nav-link ${Router.currentPath === '/' ? 'active' : ''}" onclick="Router.navigate('/'); Components.closeMobileMenu();">Home</a>
                <a class="nav-link ${Router.currentPath === '/shop' ? 'active' : ''}" onclick="Router.navigate('/shop'); Components.closeMobileMenu();">Shop</a>
                <a class="nav-link ${Router.currentPath === '/quote' ? 'active' : ''}" onclick="Router.navigate('/quote'); Components.closeMobileMenu();">Club Quote</a>
                <a class="nav-link ${Router.currentPath === '/about' ? 'active' : ''}" onclick="Router.navigate('/about'); Components.closeMobileMenu();">About</a>
                <a class="nav-link ${Router.currentPath === '/contact' ? 'active' : ''}" onclick="Router.navigate('/contact'); Components.closeMobileMenu();">Contact</a>
                <a class="nav-link" onclick="Router.navigate('/cart'); Components.closeMobileMenu();">Cart ${cartCount > 0 ? `(${cartCount})` : ''}</a>
                ${user ? `
                    <a class="nav-link" onclick="Router.navigate('/account'); Components.closeMobileMenu();">My Account</a>
                    <a class="nav-link" onclick="Router.navigate('/orders'); Components.closeMobileMenu();">Orders</a>
                    ${user.role === 'supplier' ? `<a class="nav-link" onclick="Router.navigate('/supplier'); Components.closeMobileMenu();">Supplier Portal</a>` : ''}
                    ${user.role === 'admin' ? `<a class="nav-link" onclick="Router.navigate('/admin'); Components.closeMobileMenu();">Admin Portal</a>` : ''}
                    <a class="nav-link text-accent" onclick="App.logout(); Components.closeMobileMenu();">Sign Out</a>
                ` : `
                    <a class="nav-link" onclick="Router.navigate('/login'); Components.closeMobileMenu();">Sign In</a>
                    <a class="nav-link" onclick="Router.navigate('/register'); Components.closeMobileMenu();">Create Account</a>
                `}
            </nav>
        </div>`;
    },

    toggleMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('mobile-nav');
        btn.classList.toggle('open');
        nav.classList.toggle('open');
    },

    closeMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('mobile-nav');
        if (btn) btn.classList.remove('open');
        if (nav) nav.classList.remove('open');
    },

    // ---- Footer ----
    renderFooter() {
        return `
        <div class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div>
                        <div class="logo" style="margin-bottom: var(--space-sm);">
                            <div class="logo-icon">🤺</div>
                            <div class="logo-text">Fencing<span>Supply</span></div>
                        </div>
                        <p class="footer-brand-text">
                            India's premier destination for quality fencing equipment. From competition foils to protective gear, we connect fencers with trusted suppliers across the country.
                        </p>
                    </div>
                    <div>
                        <h4 class="footer-heading">Shop</h4>
                        <div class="footer-links">
                            <a onclick="Router.navigate('/shop?category=Foil')">Foils</a>
                            <a onclick="Router.navigate('/shop?category=Épée')">Épées</a>
                            <a onclick="Router.navigate('/shop?category=Sabre')">Sabres</a>
                            <a onclick="Router.navigate('/shop?category=Protective Equipment')">Protective Gear</a>
                            <a onclick="Router.navigate('/shop?category=Accessories')">Accessories</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="footer-heading">Company</h4>
                        <div class="footer-links">
                            <a onclick="Router.navigate('/about')">About Us</a>
                            <a onclick="Router.navigate('/contact')">Contact</a>
                            <a onclick="Router.navigate('/quote')">Club Quotes</a>
                            <a onclick="Router.navigate('/shipping-policy')">Shipping</a>
                            <a onclick="Router.navigate('/returns-policy')">Returns</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="footer-heading">Support</h4>
                        <div class="footer-links">
                            <a onclick="Router.navigate('/support')">Help Centre</a>
                            <a onclick="Router.navigate('/orders')">Track Order</a>
                            <a onclick="Router.navigate('/privacy-policy')">Privacy Policy</a>
                            <a onclick="Router.navigate('/terms')">Terms of Service</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© ${new Date().getFullYear()} Fencing Supply</span>
                    <div class="footer-bottom-links">
                        <a onclick="Router.navigate('/privacy-policy')">Privacy</a>
                        <a onclick="Router.navigate('/terms')">Terms</a>
                        <a onclick="Router.navigate('/shipping-policy')">Shipping</a>
                    </div>
                </div>
            </div>
        </div>`;
    },

    // ---- Toast Notifications ----
    toast(type, title, message, duration = 5000) {
        const container = document.getElementById('toast-container');
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const id = Utils.generateId();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.id = `toast-${id}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <div class="toast-content">
                <div class="toast-title">${Utils.escapeHtml(title)}</div>
                ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
            </div>
            <button class="toast-close" onclick="Components.removeToast('${id}')" aria-label="Close">✕</button>
        `;
        container.appendChild(toast);
        if (duration > 0) {
            setTimeout(() => Components.removeToast(id), duration);
        }
    },

    removeToast(id) {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }
    },

    // ---- Modal ----
    showModal(title, content, footer = '') {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="Components.closeModal()">✕</button>
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;
        overlay.onclick = () => Components.closeModal();
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
        document.body.style.overflow = '';
    },

    // ---- Confirm Dialog ----
    confirm(title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') {
        Components.showModal(
            title,
            `<p style="color: var(--gray-600); line-height: 1.6;">${message}</p>`,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">${cancelText}</button>
             <button class="btn btn-primary" onclick="Components.closeModal(); (${onConfirm.toString()})()">${confirmText}</button>`
        );
    },

    // ---- Page Header for inner pages ----
    pageHeader(title, subtitle = '', breadcrumbs = []) {
        const crumbs = [{ label: 'Home', path: '/' }, ...breadcrumbs];
        return `
        <div class="page-header">
            <div class="container page-header-content">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    ${crumbs.map((c, i) => {
                        if (i === crumbs.length - 1) return `<span>${Utils.escapeHtml(c.label)}</span>`;
                        return `<a onclick="Router.navigate('${c.path}')">${Utils.escapeHtml(c.label)}</a><span class="separator">›</span>`;
                    }).join('')}
                </nav>
                <h1>${title}</h1>
                ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
        </div>`;
    },

    // ---- Product Card ----
       productCard(product, index = 0) {
        const p = product || {};
        const price = Number(p.min_price || p.price_paise || 0);
        const stock = Number(p.total_stock ?? p.stock ?? p.on_hand ?? 0);
        const inStock = stock > 0;
        const imgUrl = p.image_url || '';
        const slug = p.id || p.slug || '';
        const delay = Math.min(index * 0.05, 0.4);

        return `
        <a href="/product/${slug}" class="product-card fade-up" style="animation-delay: ${delay}s;" onclick="event.preventDefault(); Router.navigate('/product/${slug}')">
            <div class="product-card-image">
                ${imgUrl
                    ? `<img src="${Utils.escapeHtml(imgUrl)}" alt="${Utils.escapeHtml(p.name || 'Product')}" loading="lazy"
                           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="product-card-emoji-fallback" style="display:none;">${Utils.getCategoryIcon(p.category_name)}</div>`
                    : `<div class="product-card-emoji-fallback">${Utils.getCategoryIcon(p.category_name)}</div>`
                }
                ${!inStock ? '<span class="product-card-badge oos">Out of Stock</span>' : ''}
                ${p.brand ? `<span class="product-card-badge brand">${Utils.escapeHtml(p.brand)}</span>` : ''}
            </div>
            <div class="product-card-body">
                <div class="product-card-category">${Utils.escapeHtml(p.category_name || 'Fencing')}</div>
                <h3 class="product-card-title">${Utils.escapeHtml(p.name || 'Product')}</h3>
                <div class="product-card-footer">
                    <span class="product-card-price">${price > 0 ? Utils.formatMoney(price) : 'Price on request'}</span>
                    <span class="product-card-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
                        ${inStock ? '● In Stock' : '○ Out of Stock'}
                    </span>
                </div>
            </div>
        </a>`;
    },
    // ---- Loading States ----
    pageLoading() {
        return `
        <div class="page-loader active">
            <div class="loader-spinner"></div>
            <p style="color: var(--gray-500);">Loading...</p>
        </div>`;
    },

    // ---- Product Card Skeleton ----
    productCardSkeleton() {
        return `
        <div class="product-card" style="pointer-events: none;">
            <div class="product-card-img"><div class="skeleton skeleton-img"></div></div>
            <div class="product-card-body">
                <div class="skeleton skeleton-text w-50"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text w-75"></div>
                <div class="skeleton skeleton-text w-50"></div>
            </div>
        </div>`;
    },

    // ---- Empty State ----
    emptyState(icon, title, text, actionLabel = '', actionPath = '') {
        return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h3 class="empty-state-title">${title}</h3>
            <p class="empty-state-text">${text}</p>
            ${actionLabel ? `<button class="btn btn-primary" onclick="Router.navigate('${actionPath}')">${actionLabel}</button>` : ''}
        </div>`;
    },

    // ---- Error State ----
    errorState(message = 'Something went wrong', retryFn = '') {
        return `
        <div class="error-state">
            <div class="error-state-icon">😞</div>
            <h3 class="empty-state-title">Oops!</h3>
            <p class="empty-state-text">${Utils.escapeHtml(message)}</p>
            ${retryFn ? `<button class="btn btn-primary" onclick="${retryFn}">Try Again</button>` : ''}
        </div>`;
    },

    // ---- Order Status Badge ----
    statusBadge(status) {
        const s = Utils.getStatusBadge(status);
        return `<span class="badge ${s.class}">${s.label}</span>`;
    },

    // ---- Pagination ----
    pagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';
        let html = '<div class="pagination">';

        html += `<button class="pagination-btn ${currentPage <= 1 ? 'disabled' : ''}"
                     onclick="${currentPage > 1 ? onPageChange + '(' + (currentPage - 1) + ')' : ''}" 
                     ${currentPage <= 1 ? 'disabled' : ''}>‹</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
                if (i === 4 || i === totalPages - 3) html += `<span class="pagination-btn disabled">…</span>`;
                continue;
            }
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}"
                         onclick="${onPageChange}(${i})">${i}</button>`;
        }

        html += `<button class="pagination-btn ${currentPage >= totalPages ? 'disabled' : ''}"
                     onclick="${currentPage < totalPages ? onPageChange + '(' + (currentPage + 1) + ')' : ''}"
                     ${currentPage >= totalPages ? 'disabled' : ''}>›</button>`;

        html += '</div>';
        return html;
    },

    // ---- Quantity Selector ----
    quantitySelector(value, max, onChange) {
        return `
        <div class="quantity-selector">
            <button class="quantity-btn" onclick="${onChange}(${Math.max(1, value - 1)})" ${value <= 1 ? 'disabled' : ''}>−</button>
            <div class="quantity-value">${value}</div>
            <button class="quantity-btn" onclick="${onChange}(${Math.min(max, value + 1)})" ${value >= max ? 'disabled' : ''}>+</button>
        </div>`;
    },

    // ---- Tab System ----
    tabs(tabs, activeId, onTabChange) {
        return `
        <div class="tab-buttons" role="tablist">
            ${tabs.map(t => `
                <button class="tab-btn ${t.id === activeId ? 'active' : ''}" 
                        role="tab" aria-selected="${t.id === activeId}"
                        onclick="${onTabChange}('${t.id}')">${t.label}</button>
            `).join('')}
        </div>`;
    },
};