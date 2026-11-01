// ============================================
// CHECKOUT PAGE
// ============================================

const CheckoutPage = {
    state: {
        items: [],
        supplier_id: null,
        supplier_name: null,
        deliveryMethod: 'standard_shipping',
        loading: false,
        pinVerified: false
    },

    async render() {
        if (!App.state.user) {
            Router.navigate('/login');
            return;
        }

        const main = document.getElementById('main-content');
        main.innerHTML = `<div style="margin-top: var(--header-height); padding: var(--space-xl); text-align:center;">Loading checkout…</div>`;

        // Load cart from backend
        try {
            const result = await API.cart.get();
            // Backend returns { cart: { items, supplier_id, supplier_name, subtotal, item_count } }
            const cart = result.cart || result;
            this.state.items = Array.isArray(cart.items) ? cart.items : [];
            this.state.supplier_id = cart.supplier_id || null;
            this.state.supplier_name = cart.supplier_name || null;
        } catch (err) {
            console.error('Failed to load cart for checkout:', err);
            this.state.items = [];
        }

        if (!this.state.items.length) {
            main.innerHTML = `<div style="margin-top: var(--header-height);">${Components.emptyState('🛒', 'Cart is Empty', 'Add items before checkout.', 'Shop Now', '/shop')}</div>`;
            return;
        }

        const subtotal = this.state.items.reduce((sum, i) => sum + ((i.price_paise || 0) * (i.quantity || 1)), 0);
        const shipping = 15000;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shipping + tax;

        const user = App.state.user || {};

        main.innerHTML = `
        <div class="page-enter">
            ${Components.pageHeader('Checkout', 'Complete your order', [{ label: 'Cart', path: '/cart' }, { label: 'Checkout', path: '/checkout' }])}
            <div class="container">
                <div class="checkout-layout">
                    <!-- Checkout Form -->
                    <div>
                        <!-- Delivery Address -->
                        <div class="checkout-section">
                            <h3 class="checkout-section-title">
                                <span class="checkout-section-number">1</span> Delivery Address
                            </h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Full Name <span class="required">*</span></label>
                                    <input class="form-input" type="text" id="addr-name" value="${Utils.escapeHtml(user.name || '')}" placeholder="Full name" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone <span class="required">*</span></label>
                                    <input class="form-input" type="tel" id="addr-phone" value="${Utils.escapeHtml(user.phone || '')}" placeholder="10-digit phone" maxlength="10">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input class="form-input" type="email" id="addr-email" value="${Utils.escapeHtml(user.email || '')}" placeholder="email@example.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Address Line 1 <span class="required">*</span></label>
                                <input class="form-input" type="text" id="addr-line1" placeholder="House/flat number, street">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Address Line 2</label>
                                <input class="form-input" type="text" id="addr-line2" placeholder="Landmark, area">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">City <span class="required">*</span></label>
                                    <input class="form-input" type="text" id="addr-city" placeholder="City">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">State <span class="required">*</span></label>
                                    <select class="form-select" id="addr-state">
                                        <option value="">Select state</option>
                                        ${['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => `<option value="${s}">${s}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">PIN Code <span class="required">*</span></label>
                                    <input class="form-input" type="text" id="addr-pin" maxlength="6" placeholder="6-digit PIN"
                                           oninput="this.value=this.value.replace(/\\D/g,'')">
                                </div>
                                <div class="form-group" style="display: flex; align-items: flex-end;">
                                    <button class="btn btn-outline" onclick="CheckoutPage.verifyPin()">Verify PIN</button>
                                </div>
                            </div>
                            <div id="checkout-pin-result"></div>
                        </div>

                        <!-- Delivery Method -->
                        <div class="checkout-section">
                            <h3 class="checkout-section-title">
                                <span class="checkout-section-number">2</span> Delivery Method
                            </h3>
                            <div class="delivery-option selected">
                                <input type="radio" name="delivery" value="standard_shipping" checked>
                                <div class="delivery-option-info">
                                    <div class="delivery-option-name">📦 Standard Shipping</div>
                                    <div class="delivery-option-desc">Estimated 5-7 business days</div>
                                </div>
                                <div class="delivery-option-price">${Utils.formatMoney(15000)}</div>
                            </div>
                        </div>

                        <!-- Payment -->
                        <div class="checkout-section">
                            <h3 class="checkout-section-title">
                                <span class="checkout-section-number">3</span> Payment Method
                            </h3>
                            <div class="delivery-option selected">
                                <input type="radio" name="payment" value="cod" checked>
                                <div class="delivery-option-info">
                                    <div class="delivery-option-name">💵 Cash on Delivery</div>
                                    <div class="delivery-option-desc">Pay when your order is delivered</div>
                                </div>
                            </div>
                            <div class="alert alert-info" style="margin-top: var(--space-md);">
                                <span>ℹ️</span>
                                <span>Online payment (sandbox) will activate after supplier confirmation.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="cart-summary">
                        <h3 class="cart-summary-title">Order Summary</h3>
                        ${this.state.supplier_name ? `
                            <div class="alert alert-info" style="margin-bottom: var(--space-md); font-size: 0.85rem;">
                                <span>🏪</span>
                                <span>Fulfilled by: <strong>${Utils.escapeHtml(this.state.supplier_name)}</strong></span>
                            </div>
                        ` : ''}

                        ${this.state.items.map(item => `
                            <div class="flex items-center gap-md" style="padding: var(--space-sm) 0; border-bottom: 1px solid var(--gray-100);">
                                <div class="cart-item-img" style="width: 48px; height: 48px; font-size: 1.2rem; flex-shrink: 0; display:flex; align-items:center; justify-content:center; background:#f3f4f6; border-radius:8px;">
                                    ${item.image_url ? `<img src="${Utils.escapeHtml(item.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.outerHTML='📦'">` : '📦'}
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; font-size: 0.85rem;">${Utils.escapeHtml(item.product_name || item.name || 'Product')}</div>
                                    <div class="text-sm text-muted">${Utils.escapeHtml(item.label || '')} • Qty: ${item.quantity || 1}</div>
                                </div>
                                <div style="font-weight: 700; white-space: nowrap;">${Utils.formatMoney((item.price_paise || 0) * (item.quantity || 1))}</div>
                            </div>
                        `).join('')}

                        <div class="summary-row" style="margin-top: var(--space-md);">
                            <span>Subtotal</span>
                            <span>${Utils.formatMoney(subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>${Utils.formatMoney(shipping)}</span>
                        </div>
                        <div class="summary-row">
                            <span>GST (18%)</span>
                            <span>${Utils.formatMoney(tax)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>${Utils.formatMoney(total)}</span>
                        </div>

                        <div class="alert alert-warning" style="margin-top: var(--space-md);">
                            <span>⚠️</span>
                            <span style="font-size: 0.8rem;">Final total is calculated by the server. Displayed amounts are estimates.</span>
                        </div>

                        <button class="btn btn-primary btn-block btn-lg" style="margin-top: var(--space-lg);"
                                onclick="CheckoutPage.placeOrder()" id="place-order-btn">
                            Send Order Request
                        </button>

                        <p class="text-center text-sm text-muted" style="margin-top: var(--space-sm);">
                            By placing this order, you agree to our <a onclick="Router.navigate('/terms')" class="text-accent" style="cursor:pointer;">Terms</a> and <a onclick="Router.navigate('/privacy-policy')" class="text-accent" style="cursor:pointer;">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    setDelivery(method) {
        this.state.deliveryMethod = method;
    },

    async verifyPin() {
        const pin = document.getElementById('addr-pin').value.trim();
        if (!/^\d{6}$/.test(pin)) {
            Utils.toast('Enter a valid 6-digit PIN code', 'error');
            return;
        }
        const el = document.getElementById('checkout-pin-result');
        el.innerHTML = `<div class="pin-result" style="margin-top: var(--space-sm);">⏳ Checking…</div>`;
        try {
            const result = await API.get('/products/check-pin/' + pin);
            if (result.serviceable) {
                this.state.pinVerified = true;
                el.innerHTML = `<div class="pin-result success" style="margin-top: var(--space-sm); color:#16a34a; font-weight:600;">✅ Delivery available to ${Utils.escapeHtml(result.city || pin)}${result.state ? ', ' + Utils.escapeHtml(result.state) : ''}</div>`;
            } else {
                this.state.pinVerified = false;
                el.innerHTML = `<div class="pin-result error" style="margin-top: var(--space-sm); color:#ef4444; font-weight:600;">❌ Delivery not available to this PIN code</div>`;
            }
        } catch (err) {
            console.error('PIN check failed:', err);
            el.innerHTML = `<div class="pin-result error" style="margin-top: var(--space-sm); color:#ef4444;">⚠️ Could not verify PIN. Please try again.</div>`;
        }
    },

    async placeOrder() {
        // Validate
        const name = document.getElementById('addr-name').value.trim();
        const phone = document.getElementById('addr-phone').value.trim();
        const email = document.getElementById('addr-email').value.trim();
        const line1 = document.getElementById('addr-line1').value.trim();
        const line2 = document.getElementById('addr-line2').value.trim();
        const city = document.getElementById('addr-city').value.trim();
        const state = document.getElementById('addr-state').value;
        const pin = document.getElementById('addr-pin').value.trim();

        if (!name || !phone || !line1 || !city || !state || !pin) {
            Utils.toast('Please fill in all required fields', 'error');
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
            Utils.toast('Please enter a valid 10-digit phone number', 'error');
            return;
        }
        if (!/^\d{6}$/.test(pin)) {
            Utils.toast('Please enter a valid 6-digit PIN code', 'error');
            return;
        }
        if (!this.state.items.length) {
            Utils.toast('Your cart is empty', 'error');
            return;
        }

        const btn = document.getElementById('place-order-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⏳ Placing order…';

        try {
            // Build payload matching backend contract exactly
            const payload = {
                items: this.state.items.map(i => ({
                    variant_id: i.variant_id,
                    quantity: i.quantity
                })),
                address: {
                    name,
                    phone,
                    email,
                    line1,
                    line2,
                    city,
                    state
                },
                pincode: pin,
                fulfilment_method: this.state.deliveryMethod || 'standard_shipping',
                payment_method: 'cod'
            };

            const result = await API.post('/orders', payload);

            // Backend returns { order_id, order_number, total_amount, status, message }
            const orderId = result.order_id || result.id;
            if (!orderId) throw new Error('Order created but no ID returned');

            // Clear cart on client side
            try { await API.delete('/cart/clear'); } catch {}
            App.state.cart = { items: [], subtotal: 0, item_count: 0 };
            if (typeof App.updateCartCount === 'function') App.updateCartCount();

            Utils.toast('✅ Order placed successfully!', 'success');
            setTimeout(() => Router.navigate('/orders/' + orderId), 500);
        } catch (err) {
            console.error('Order placement failed:', err);
            Utils.toast(err.message || 'Could not place order. Please try again.', 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
};