// ============================================
// PRODUCT DETAIL PAGE
// ============================================

const ProductPage = {
    state: {
        product: null,
        variants: [],
        selectedVariant: null,
        selectedSize: null,
        selectedHand: null,
        quantity: 1,
        loading: true
    },

    async render(params) {
        const productId = params?.id;
        if (!productId) {
            Router.navigate('/shop');
            return;
        }

        const main = document.getElementById('main-content');
        main.innerHTML = `
        <div class="page-enter">
            <div class="container" style="padding-top: calc(var(--header-height) + var(--space-lg));">
                <div class="product-detail-skeleton">
                    <div class="skeleton" style="height: 500px; border-radius: var(--radius-lg);"></div>
                    <div>
                        <div class="skeleton" style="height: 40px; width: 70%; margin-bottom: 1rem;"></div>
                        <div class="skeleton" style="height: 20px; width: 50%; margin-bottom: 2rem;"></div>
                        <div class="skeleton" style="height: 60px; width: 40%; margin-bottom: 2rem;"></div>
                        <div class="skeleton" style="height: 100px; width: 100%; margin-bottom: 2rem;"></div>
                        <div class="skeleton" style="height: 50px; width: 100%;"></div>
                    </div>
                </div>
            </div>
        </div>`;

        // Reset state
        this.state = {
            product: null,
            variants: [],
            selectedVariant: null,
            selectedSize: null,
            selectedHand: null,
            quantity: 1,
            loading: true
        };

        await this.loadProduct(productId);
    },

    async loadProduct(id) {
        try {
            const result = await API.products.get(id);
            this.state.product = result.product;
            this.state.variants = result.variants || [];

            // Auto-select first variant if only one
            if (this.state.variants.length === 1) {
                this.state.selectedVariant = this.state.variants[0];
            }

            this.renderProduct();
        } catch (err) {
            console.error('Failed to load product:', err);
            this.renderError();
        }
    },

    renderError() {
        const main = document.getElementById('main-content');
        main.innerHTML = `
        <div class="page-enter" style="margin-top: var(--header-height);">
            ${Components.emptyState('❌', 'Product Not Found', 'The product you are looking for does not exist or has been removed.', 'Back to Shop', '/shop')}
        </div>`;
    },

    renderProduct() {
        const p = this.state.product;
        if (!p) return this.renderError();

        const main = document.getElementById('main-content');
        const sizes = [...new Set(this.state.variants.filter(v => v.size).map(v => v.size))];
        const hands = [...new Set(this.state.variants.filter(v => v.hand).map(v => v.hand))];
        const minPrice = this.state.variants.length
            ? Math.min(...this.state.variants.map(v => v.price_paise))
            : 0;
        const totalStock = this.state.variants.reduce((sum, v) => sum + Math.max(0, (v.on_hand || 0) - (v.reserved || 0)), 0);

        main.innerHTML = `
        <div class="page-enter">
            <div class="container" style="padding-top: calc(var(--header-height) + var(--space-md));">
                <!-- Breadcrumb -->
                <nav class="breadcrumb" style="margin-bottom: var(--space-md);">
                    <a href="/">Home</a>
                    <span>›</span>
                    <a href="/shop">Shop</a>
                    <span>›</span>
                    <a href="/shop?category=${encodeURIComponent(p.category_name || '')}">${Utils.escapeHtml(p.category_name || 'Products')}</a>
                    <span>›</span>
                    <span>${Utils.escapeHtml(p.name)}</span>
                </nav>

                <div class="product-detail-layout">
                    <!-- Image Section -->
                    <div class="product-detail-image">
                        <div class="product-image-wrap">
                            ${p.image_url
                                ? `<img src="${Utils.escapeHtml(p.image_url)}" alt="${Utils.escapeHtml(p.name)}" class="product-detail-img"
                                       onerror="this.style.display='none'; this.parentElement.querySelector('.product-emoji-xl').style.display='flex';">`
                                : ''}
                            <div class="product-emoji-xl" style="${p.image_url ? 'display:none;' : ''}">${Utils.getCategoryIcon(p.category_name)}</div>
                        </div>
                    </div>

                    <!-- Info Section -->
                    <div class="product-detail-info">
                        <div class="product-brand-label">${Utils.escapeHtml(p.brand || 'Fencing Supply')}</div>
                        <h1 class="product-detail-title">${Utils.escapeHtml(p.name)}</h1>
                        
                        <div class="product-detail-meta">
                            ${p.model ? `<span class="meta-item"><strong>Model:</strong> ${Utils.escapeHtml(p.model)}</span>` : ''}
                            ${p.supplier_name ? `<span class="meta-item"><strong>Supplier:</strong> ${Utils.escapeHtml(p.supplier_name)}</span>` : ''}
                            ${p.category_name ? `<span class="meta-item"><strong>Category:</strong> ${Utils.escapeHtml(p.category_name)}</span>` : ''}
                        </div>

                        <div class="product-detail-price">
                            ${this.state.selectedVariant
                                ? Utils.formatMoney(this.state.selectedVariant.price_paise)
                                : `From ${Utils.formatMoney(minPrice)}`}
                        </div>

                        <div class="product-stock-indicator">
                            ${totalStock > 0
                                ? `<span class="stock-badge in-stock">✓ In Stock (${totalStock} available)</span>`
                                : `<span class="stock-badge out-of-stock">✕ Out of Stock</span>`}
                        </div>

                        ${p.description ? `
                            <div class="product-description">
                                <h3>Description</h3>
                                <p>${Utils.escapeHtml(p.description)}</p>
                            </div>` : ''}

                        <!-- Variant Selection -->
                        <div class="product-variants" id="variant-selector">
                            ${hands.length > 0 ? `
                                <div class="variant-group">
                                    <div class="variant-label">Handedness: ${this.state.selectedHand ? `<strong>${this.state.selectedHand}</strong>` : '<span class="required">* Required</span>'}</div>
                                    <div class="variant-options">
                                        ${hands.map(h => `
                                            <button class="variant-btn ${this.state.selectedHand === h ? 'selected' : ''}" 
                                                    onclick="ProductPage.selectHand('${h}')">${h}</button>
                                        `).join('')}
                                    </div>
                                </div>` : ''}

                            ${sizes.length > 0 ? `
                                <div class="variant-group">
                                    <div class="variant-label">Size: ${this.state.selectedSize ? `<strong>${this.state.selectedSize}</strong>` : '<span class="required">* Required</span>'}</div>
                                    <div class="variant-options">
                                        ${sizes.map(s => `
                                            <button class="variant-btn ${this.state.selectedSize === s ? 'selected' : ''}"
                                                    onclick="ProductPage.selectSize('${s}')">${s}</button>
                                        `).join('')}
                                    </div>
                                </div>` : ''}

                            ${hands.length === 0 && sizes.length === 0 && this.state.variants.length > 1 ? `
                                <div class="variant-group">
                                    <div class="variant-label">Variant:</div>
                                    <div class="variant-options">
                                        ${this.state.variants.map(v => `
                                            <button class="variant-btn ${this.state.selectedVariant?.id === v.id ? 'selected' : ''}"
                                                    onclick="ProductPage.selectVariantById(${v.id})">
                                                ${Utils.escapeHtml(v.label || v.sku)}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>` : ''}
                        </div>

                        <!-- Selected Variant Info -->
                        <div id="selected-variant-info">
                            ${this.renderSelectedVariantInfo()}
                        </div>

                        <!-- Quantity Selector -->
                        <div class="quantity-selector" style="margin: var(--space-md) 0;">
                            <div class="variant-label">Quantity:</div>
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="ProductPage.changeQty(-1)">−</button>
                                <input type="number" id="qty-input" value="${this.state.quantity}" min="1" max="99"
                                       onchange="ProductPage.setQty(this.value)">
                                <button class="qty-btn" onclick="ProductPage.changeQty(1)">+</button>
                            </div>
                        </div>

                        <!-- Add to Cart -->
                        <div class="product-actions">
                            <button class="btn btn-primary btn-lg btn-block" id="add-to-cart-btn" onclick="ProductPage.addToCart()">
                                🛒 Add to Cart
                            </button>
                        </div>

                        <!-- Features -->
                        <div class="product-features">
                            <div class="feature-item">
                                <span class="feature-icon">🚚</span>
                                <div>
                                    <strong>Standard Shipping</strong>
                                    <p>Available to serviceable PIN codes</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">↩️</span>
                                <div>
                                    <strong>${p.return_eligible ? 'Returns Accepted' : 'Non-Returnable'}</strong>
                                    <p>${p.return_eligible ? 'As per return policy' : 'This item cannot be returned'}</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">✓</span>
                                <div>
                                    <strong>Verified Supplier</strong>
                                    <p>Authentic equipment guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        Utils.setupScrollAnimations();
    },

    renderSelectedVariantInfo() {
        if (!this.state.selectedVariant) return '';
        const v = this.state.selectedVariant;
        const available = Math.max(0, (v.on_hand || 0) - (v.reserved || 0));
        return `
            <div class="selected-variant-box">
                <div class="variant-detail-row"><strong>SKU:</strong> ${Utils.escapeHtml(v.sku)}</div>
                <div class="variant-detail-row"><strong>Price:</strong> ${Utils.formatMoney(v.price_paise)}</div>
                <div class="variant-detail-row"><strong>Available:</strong> ${available} units</div>
                ${v.certification ? `<div class="variant-detail-row"><strong>Certification:</strong> ${Utils.escapeHtml(v.certification)}</div>` : ''}
                ${v.compatibility ? `<div class="variant-detail-row"><strong>Compatibility:</strong> ${Utils.escapeHtml(v.compatibility)}</div>` : ''}
            </div>`;
    },

    selectHand(hand) {
        this.state.selectedHand = hand;
        this.resolveSelectedVariant();
        this.updateVariantUI();
    },

    selectSize(size) {
        this.state.selectedSize = size;
        this.resolveSelectedVariant();
        this.updateVariantUI();
    },

    selectVariantById(id) {
        const v = this.state.variants.find(x => x.id === id);
        if (v) {
            this.state.selectedVariant = v;
            if (v.size) this.state.selectedSize = v.size;
            if (v.hand) this.state.selectedHand = v.hand;
            this.renderProduct();
        }
    },

    resolveSelectedVariant() {
        const matches = this.state.variants.filter(v => {
            if (this.state.selectedSize && v.size !== this.state.selectedSize) return false;
            if (this.state.selectedHand && v.hand !== this.state.selectedHand) return false;
            return true;
        });
        this.state.selectedVariant = matches.length === 1 ? matches[0] : null;
    },

    updateVariantUI() {
        this.renderProduct();
    },

    changeQty(delta) {
        const newQty = Math.max(1, Math.min(99, this.state.quantity + delta));
        this.state.quantity = newQty;
        const input = document.getElementById('qty-input');
        if (input) input.value = newQty;
    },

    setQty(val) {
        const n = parseInt(val) || 1;
        this.state.quantity = Math.max(1, Math.min(99, n));
        const input = document.getElementById('qty-input');
        if (input) input.value = this.state.quantity;
    },

    async addToCart() {
        // Validation
        const hasSize = this.state.variants.some(v => v.size);
        const hasHand = this.state.variants.some(v => v.hand);

        if (hasHand && !this.state.selectedHand) {
            Utils.toast('Please select handedness', 'warning');
            return;
        }
        if (hasSize && !this.state.selectedSize) {
            Utils.toast('Please select a size', 'warning');
            return;
        }
        if (!this.state.selectedVariant) {
            Utils.toast('Please select a valid variant', 'warning');
            return;
        }

        const available = (this.state.selectedVariant.on_hand || 0) - (this.state.selectedVariant.reserved || 0);
        if (available < this.state.quantity) {
            Utils.toast(`Only ${available} units available`, 'error');
            return;
        }

        const btn = document.getElementById('add-to-cart-btn');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⏳ Adding...';

        try {
            const res = await API.cart.add({
                variant_id: this.state.selectedVariant.id,
                quantity: this.state.quantity
            });

            if (res && res.error === 'different_supplier') {
                this.showSupplierConflict(res);
                return;
            }

            await App.loadCart();
            Utils.toast('✓ Added to cart!', 'success');
            btn.innerHTML = '✓ Added!';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 1500);
        } catch (err) {
            if (err.data && err.data.error === 'different_supplier') {
                this.showSupplierConflict(err.data);
            } else {
                Utils.toast(err.message || 'Failed to add to cart', 'error');
            }
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    },

    showSupplierConflict(data) {
        const confirmed = confirm(
            `Your cart has items from "${data.current_supplier}".\n\n` +
            `You can only order from one supplier at a time.\n\n` +
            `Click OK to REPLACE the cart with items from "${data.new_supplier}", or Cancel to keep the current cart.`
        );
        if (confirmed) {
            API.post('/api/cart/replace-supplier').then(() => {
                this.addToCart();
            });
        }
    }
};