// ============================================
// HOME PAGE
// ============================================

const HomePage = {
    async render() {
        const main = document.getElementById('main-content');

        main.innerHTML = `
        <div class="page-enter">
            <!-- Hero Section -->
            <section class="hero">
                <div class="container hero-content">
                    <div class="hero-badge">
                        ⚡ India's Premier Fencing Equipment Store
                    </div>
                    <h1 class="hero-title">
                        Equip Your <span class="highlight">Fencing</span> Journey With Confidence
                    </h1>
                    <p class="hero-desc">
                        Discover competition-grade foils, épées, sabres, protective gear, and accessories from trusted suppliers. 
                        Everything a fencer needs, delivered across India.
                    </p>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-xl" onclick="Router.navigate('/shop')">
                            🛍️ Shop Equipment
                        </button>
                        <button class="btn btn-outline btn-xl" onclick="Router.navigate('/quote')" style="border-color: rgba(255,255,255,0.2); color: #000;">
                            📋 Club Quote
                        </button>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <div class="hero-stat-number">500+</div>
                            <div class="hero-stat-label">Products</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-number">50+</div>
                            <div class="hero-stat-label">Brands</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-number">1000+</div>
                            <div class="hero-stat-label">Fencers Served</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-number">All India</div>
                            <div class="hero-stat-label">Delivery</div>
                        </div>
                    </div>
                </div>
                <div class="hero-visual">🤺</div>
            </section>

            <!-- Categories Section -->
            <section class="section" style="background: var(--white);">
                <div class="container">
                    <div class="text-center">
                        <h2 class="section-title" data-animate="up">Shop By Category</h2>
                        <p class="section-subtitle" data-animate="up">Find exactly what you need for training and competition</p>
                    </div>
                    <div class="category-grid">
                        ${this.renderCategories()}
                    </div>
                </div>
            </section>

            <!-- Featured Products -->
            <section class="section">
                <div class="container">
                    <div class="text-center">
                        <h2 class="section-title" data-animate="up">Featured Equipment</h2>
                        <p class="section-subtitle" data-animate="up">Hand-picked products from our trusted suppliers</p>
                    </div>
                    <div id="featured-products" class="products-grid">
                        ${Components.productCardSkeleton().repeat(8)}
                    </div>
                    <div class="text-center" style="margin-top: var(--space-2xl);" data-animate="up">
                        <button class="btn btn-primary btn-lg" onclick="Router.navigate('/shop')">
                            View All Products →
                        </button>
                    </div>
                </div>
            </section>

            <!-- Brands Section -->
            <section class="brands-section section-sm">
                <div class="container">
                    <div class="text-center" style="margin-bottom: var(--space-lg);">
                        <p class="text-sm font-semibold text-gray" style="text-transform: uppercase; letter-spacing: 2px;">TRUSTED BRANDS</p>
                    </div>
                    <div class="brands-scroll">
                        <span class="brand-item">Allstar</span>
                        <span class="brand-item">Leon Paul</span>
                        <span class="brand-item">Uhlmann</span>
                        <span class="brand-item">Absolute</span>
                        <span class="brand-item">PBT</span>
                        <span class="brand-item">Negrini</span>
                        <span class="brand-item">StM</span>
                        <span class="brand-item">FWF</span>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="section" style="background: var(--white);">
                <div class="container">
                    <div class="text-center">
                        <h2 class="section-title" data-animate="up">Why Choose Fencing Supply?</h2>
                        <p class="section-subtitle" data-animate="up">We're committed to serving India's fencing community</p>
                    </div>
                    <div class="features-grid">
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">🏪</div>
                            <h3 class="feature-title">Verified Suppliers</h3>
                            <p class="feature-text">Every supplier is reviewed and approved before listing. Know exactly who you're buying from.</p>
                        </div>
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">🎯</div>
                            <h3 class="feature-title">Exact Variants</h3>
                            <p class="feature-text">Select the precise size, hand, grip type, and configuration. No guessing, no wrong orders.</p>
                        </div>
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">📦</div>
                            <h3 class="feature-title">Pan-India Delivery</h3>
                            <p class="feature-text">Check serviceability with your PIN code. Standard shipping to thousands of locations across India.</p>
                        </div>
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">🏫</div>
                            <h3 class="feature-title">Club Quotes</h3>
                            <p class="feature-text">Academies and clubs can request bulk quotes with size breakdowns and group pricing.</p>
                        </div>
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">🛡️</div>
                            <h3 class="feature-title">Return Protection</h3>
                            <p class="feature-text">Clear return and exchange policies. Item eligibility shown before checkout.</p>
                        </div>
                        <div class="feature-card" data-animate="up">
                            <div class="feature-icon">💬</div>
                            <h3 class="feature-title">Dedicated Support</h3>
                            <p class="feature-text">Post-order assistance for cancellations, returns, exchanges, and any issues.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="section">
                <div class="container">
                    <div class="cta-banner" data-animate="scale">
                        <h2 class="cta-title">Ready to Gear Up?</h2>
                        <p class="cta-text">Whether you're a beginner or competing at national level, find the right equipment from verified Indian suppliers.</p>
                        <div class="flex justify-center gap-md flex-wrap">
                            <button class="btn btn-primary btn-xl" onclick="Router.navigate('/shop')">Browse Equipment</button>
                            <button class="btn btn-gold btn-xl" onclick="Router.navigate('/quote')">Request Club Quote</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>`;

        // Load featured products
        this.loadFeaturedProducts();
    },

    renderCategories() {
        const categories = [
            { name: 'Foil', icon: '🤺', count: 45, path: '/shop?category=Foil' },
            { name: 'Épée', icon: '⚔️', count: 38, path: '/shop?category=Épée' },
            { name: 'Sabre', icon: '🗡️', count: 32, path: '/shop?category=Sabre' },
            { name: 'Protective Equipment', icon: '🛡️', count: 56, path: '/shop?category=Protective Equipment' },
            { name: 'Electrical Equipment', icon: '⚡', count: 24, path: '/shop?category=Electrical Equipment' },
            { name: 'Replacement Parts', icon: '🔧', count: 42, path: '/shop?category=Replacement Parts' },
            { name: 'Accessories', icon: '🎒', count: 35, path: '/shop?category=Accessories' },
        ];

        return categories.map((c, i) => `
            <div class="category-card" onclick="Router.navigate('${c.path}')" data-animate="up" style="animation-delay: ${i * 0.08}s">
                <span class="category-card-icon">${c.icon}</span>
                <div class="category-card-name">${c.name}</div>
                <div class="category-card-count">${c.count} Products</div>
            </div>
        `).join('');
    },

    async loadFeaturedProducts() {
        try {
            const result = await API.products.list('limit=8&sort=popular');
            const container = document.getElementById('featured-products');
            if (result.products && result.products.length > 0) {
                container.innerHTML = result.products.map((p, i) => Components.productCard(p, i)).join('');
            } else {
                container.innerHTML = this.getDemoProducts().map((p, i) => Components.productCard(p, i)).join('');
            }
            Utils.setupScrollAnimations();
        } catch {
            document.getElementById('featured-products').innerHTML =
                this.getDemoProducts().map((p, i) => Components.productCard(p, i)).join('');
            Utils.setupScrollAnimations();
        }
    },

    getDemoProducts() {
        return [
            { id: 1, name: 'Competition Foil Blade — Maraging Steel', brand: 'Allstar', category_name: 'Foil', supplier_name: 'Elite Fencing India', price_paise: 1250000, available_stock: 15, is_popular: true },
            { id: 2, name: 'FIE Épée Mask 1600N', brand: 'Leon Paul', category_name: 'Protective Equipment', supplier_name: 'Elite Fencing India', price_paise: 1850000, available_stock: 8 },
            { id: 3, name: 'Practice Sabre — Complete Weapon', brand: 'Absolute', category_name: 'Sabre', supplier_name: 'Mumbai Fencing Co', price_paise: 450000, available_stock: 22, is_new: true },
            { id: 4, name: 'Washable Fencing Jacket 350N', brand: 'PBT', category_name: 'Protective Equipment', supplier_name: 'Mumbai Fencing Co', price_paise: 680000, available_stock: 12 },
            { id: 5, name: 'Foil Body Cord — Bayonet', brand: 'Uhlmann', category_name: 'Electrical Equipment', supplier_name: 'Elite Fencing India', price_paise: 185000, available_stock: 30 },
            { id: 6, name: 'Fencing Glove — Washable', brand: 'Allstar', category_name: 'Protective Equipment', supplier_name: 'Elite Fencing India', price_paise: 295000, available_stock: 18, is_new: true },
            { id: 7, name: 'Épée Guard — Standard', brand: 'StM', category_name: 'Replacement Parts', supplier_name: 'Mumbai Fencing Co', price_paise: 125000, available_stock: 25 },
            { id: 8, name: 'Fencing Equipment Bag — Roller', brand: 'Negrini', category_name: 'Accessories', supplier_name: 'Elite Fencing India', price_paise: 750000, available_stock: 6, is_popular: true },
        ];
    }
};