// ============================================
// CART PAGE
// ============================================

const CartPage = {
    state: { items: [], loading: true, pinCode: '', pinResult: null },

    async render() {
        const main = document.getElementById('main-content');
        main.innerHTML = `<div style="margin-top: var(--header-height);">${Components.pageLoading()}</div>`;

        try {
            const result = await API.cart.get();
            const raw = result.items || result.cart || [];
            this.state.items = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
        } catch {
            this.state.items = [];
        }

        this.renderCart();
    },

    renderCart() {
        const main = document.getElementById('main-content');
        const items = this.state.items;

        if (items.length === 0) {
            main.innerHTML = `
            <div class="page-enter" style="margin-top: var(--header-height);">
                ${Components.emptyState('🛒', 'Your Cart is Empty', 'Start shopping to add items to your cart.', 'Browse Shop', '/shop')}
            </div>`;
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + ((item.price_paise || item.price || 0) * (item.quantity || 1)), 0);
        const shipping = 0; // Calculated at checkout
        const total = subtotal;

        main.innerHTML = `
        <div class="page-enter">
            ${Components.pageHeader('Shopping Cart', `${items.length} item${items.length !== 1 ? 's' : ''} in your cart`, [{ label: 'Cart', path: '/cart' }])}
            <div class="container">
                <div class="cart-layout">
                    <!-- Cart Items -->
                    <div class="cart-items">
                        ${items.map((item, i) => this.renderCartItem(item, i)).join('')}
                    </div>

                    <!-- Cart Summary -->
                    <div class="cart-summary">
                        <h3 class="cart-summary-title">Order Summary</h3>

                        <div class="summary-row">
                            <span>Subtotal (${items.length} items)</span>
                            <span>${Utils.formatPrice(subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span class="text-muted">Calculated at checkout</span>
                        </div>

                        <!-- PIN Check -->
                        <div class="pin-check">
                            <div class="pin-check-title">📍 Check Delivery</div>
                            <div class="pin-check-input">
                                <input class="form-input" type="text" maxlength="6" placeholder="Enter PIN code"
                                       id="pin-input" value="${this.state.pinCode}"
                                       oninput="this.value=this.value.replace(/\\D/g,'')">
                                <button class="btn btn-primary btn-sm" onclick="CartPage.checkPIN()">Check</button>
                            </div>
                            <div id="pin-result">
                                ${this.state.pinResult ? this.renderPinResult() : ''}
                            </div>
                        </div>

                        <div class="summary-row total">
                            <span>Total</span>
                            <span>${Utils.formatPrice(total)}</span>
                        </div>

                        <button class="btn btn-primary btn-block btn-lg" style="margin-top: var(--space-lg);"
                                onclick="CartPage.proceedToCheckout()">
                            Proceed to Checkout →
                        </button>

                        <button class="btn btn-ghost btn-block" style="margin-top: var(--space-sm);"
                                onclick="Router.navigate('/shop')">
                            ← Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    renderCartItem(item, index) {
        const icon = Utils.getCategoryIcon(item.category_name || item.category || '');
        const price = item.price_paise || item.price || 0;
        const qty = item.quantity || 1;
        const variantStr = Object.entries(item.variant || item.selected_variant || {})
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ');

        return `
        <div class="cart-item" style="animation-delay: ${index * 0.1}s">
            <div class="cart-item-img">${icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${Utils.escapeHtml(item.name || item.product_name || 'Product')}</div>
                ${variantStr ? `<div class="cart-item-variant">${Utils.escapeHtml(variantStr)}</div>` : ''}
                <div class="cart-item-supplier">🏪 ${Utils.escapeHtml(item.supplier_name || 'Supplier')}</div>
                <div style="margin-top: var(--space-sm);">
                    ${Components.quantitySelector(qty, 10, `CartPage.updateQty.bind(null, ${item.id || index})`)}
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">${Utils.formatPrice(price * qty)}</div>
                <button class="cart-item-remove" onclick="CartPage.removeItem(${item.id || index})">✕ Remove</button>
            </div>
        </div>`;
    },

    renderPinResult() {
        const r = this.state.pinResult;
        if (!r) return '';
        if (r.serviceable) {
            return `<div class="pin-result success">✅ Delivery available to ${r.area || this.state.pinCode}. ${r.methods || 'Standard shipping available.'}</div>`;
        }
        return `<div class="pin-result error">❌ Delivery not available to this PIN code.</div>`;
    },

    async checkPIN() {
        const pin = document.getElementById('pin-input').value.trim();
        if (!Utils.isValidPIN(pin)) {
            Components.toast('error', 'Invalid PIN', 'Please enter a valid 6-digit PIN code.');
            return;
        }
        this.state.pinCode = pin;
        try {
            const result = await API.cart.checkPin(pin);
            this.state.pinResult = result;
        } catch {
            this.state.pinResult = { serviceable: true, area: pin, methods: 'Standard shipping available.' };
        }
        document.getElementById('pin-result').innerHTML = this.renderPinResult();
    },

    async updateQty(itemId, qty) {
        try {
            await API.cart.update(itemId, { quantity: qty });
            this.render();
        } catch {
            const item = this.state.items.find(i => (i.id || 0) === itemId) || this.state.items[itemId];
            if (item) item.quantity = qty;
            this.renderCart();
        }
    },

    async removeItem(itemId) {
        Components.confirm('Remove Item', 'Are you sure you want to remove this item from your cart?', async () => {
            try {
                await API.cart.remove(itemId);
            } catch { /* ignore */ }
            this.state.items = this.state.items.filter((item, i) => (item.id || i) !== itemId);
            App.updateCartCount();
            this.renderCart();
            Components.toast('info', 'Item Removed', 'Item has been removed from your cart.');
        }, 'Remove', 'Keep');
    },

    proceedToCheckout() {
        if (!App.state.user) {
            Components.toast('info', 'Sign In Required', 'Please sign in to proceed to checkout.');
            Router.navigate('/login');
            return;
        }
        if (this.state.items.length === 0) {
            Components.toast('error', 'Cart Empty', 'Please add items to proceed.');
            return;
        }
        Router.navigate('/checkout');
    }
};