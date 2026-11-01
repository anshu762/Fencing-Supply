// ============================================
// SHOP PAGE
// ============================================

const ShopPage = {
    state: {
        products: [],
        filters: { category: '', brand: '', search: '', sort: 'name_asc', hand: '', availability: '' },
        page: 1,
        totalPages: 1,
        loading: true,
        categories: [],
        brands: []
    },

    async loadFilterMeta() {
        try {
            const meta = await API.get('/products/meta/filters');
            this.state.categories = meta.categories || [];
            this.state.brands = meta.brands || [];
            // Re-render the sidebar filter sections
            const catEl = document.getElementById('filter-categories');
            const brandEl = document.getElementById('filter-brands');
            if (catEl) catEl.innerHTML = this.renderCategoryFilters();
            if (brandEl) brandEl.innerHTML = this.renderBrandFilters();
        } catch (err) {
            console.error('Failed to load filter metadata:', err);
        }
    },

    async render() {
        const params = Router.getQueryParams();
        if (params.category) this.state.filters.category = params.category;
        if (params.search) this.state.filters.search = params.search;
        this.state.page = 1;

        const main = document.getElementById('main-content');
        main.innerHTML = `
        <div class="page-enter">
            ${Components.pageHeader('Shop Equipment', 'Browse our complete range of fencing equipment', [{ label: 'Shop', path: '/shop' }])}
            <div class="container">
                <div class="shop-layout">
                    <!-- Sidebar Filters -->
                    <aside class="shop-sidebar" id="shop-sidebar">
                        <div class="filter-section">
                            <div class="filter-title">
                                Search
                                <button class="btn btn-ghost btn-sm" onclick="ShopPage.clearFilters()" style="font-size: 0.75rem;">Clear All</button>
                            </div>
                            <div class="search-bar" style="max-width: 100%;">
                                <input type="text" placeholder="Search products..." id="shop-search"
                                       value="${Utils.escapeHtml(this.state.filters.search)}"
                                       oninput="ShopPage.onSearch(this.value)">
                                <button onclick="ShopPage.applyFilters()">🔍</button>
                            </div>
                        </div>

                        <div class="filter-section">
                            <div class="filter-title">Category</div>
                            <div class="filter-options" id="filter-categories">
                                ${this.renderCategoryFilters()}
                            </div>
                        </div>

                        <div class="filter-section">
                            <div class="filter-title">Brand</div>
                            <div class="filter-options" id="filter-brands">
                                ${this.renderBrandFilters()}
                            </div>
                        </div>

                        <div class="filter-section">
                            <div class="filter-title">Handedness</div>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="hand" value="" ${!this.state.filters.hand ? 'checked' : ''} onchange="ShopPage.setFilter('hand', '')"> All
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="hand" value="Right" ${this.state.filters.hand === 'Right' ? 'checked' : ''} onchange="ShopPage.setFilter('hand', 'Right')"> Right Hand
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="hand" value="Left" ${this.state.filters.hand === 'Left' ? 'checked' : ''} onchange="ShopPage.setFilter('hand', 'Left')"> Left Hand
                                </label>
                            </div>
                        </div>

                        <div class="filter-section">
                            <div class="filter-title">Availability</div>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="avail" value="" ${!this.state.filters.availability ? 'checked' : ''} onchange="ShopPage.setFilter('availability', '')"> All
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="avail" value="in_stock" ${this.state.filters.availability === 'in_stock' ? 'checked' : ''} onchange="ShopPage.setFilter('availability', 'in_stock')"> In Stock Only
                                </label>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-block" onclick="document.getElementById('shop-sidebar').classList.remove('open');" style="display: none;" id="close-filter-btn">
                            Apply Filters
                        </button>
                    </aside>

                    <!-- Products Grid -->
                    <div class="shop-main">
                        <div class="shop-toolbar">
                            <button class="btn btn-outline btn-sm shop-mobile-filter-btn" onclick="ShopPage.toggleFilters()">
                                ⚙️ Filters
                            </button>
                            <div class="shop-result-count" id="result-count">Loading products...</div>
                            <div class="shop-sort">
                                <label class="text-sm text-gray" for="sort-select">Sort:</label>
                                <select class="form-select" id="sort-select" style="width: auto; padding: 6px 32px 6px 10px; font-size: 0.85rem;"
                                        onchange="ShopPage.setFilter('sort', this.value)">
                                    <option value="name_asc" ${this.state.filters.sort === 'name_asc' ? 'selected' : ''}>Name A–Z</option>
                                    <option value="name_desc" ${this.state.filters.sort === 'name_desc' ? 'selected' : ''}>Name Z–A</option>
                                    <option value="price_asc" ${this.state.filters.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                                    <option value="price_desc" ${this.state.filters.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                                    <option value="newest" ${this.state.filters.sort === 'newest' ? 'selected' : ''}>Newest</option>
                                </select>
                            </div>
                        </div>

                        <!-- Active Filters -->
                        <div id="active-filters" class="flex gap-sm flex-wrap" style="margin-bottom: var(--space-md);"></div>

                        <div class="products-grid" id="products-grid">
                            ${Components.productCardSkeleton().repeat(8)}
                        </div>

                        <div id="pagination-container"></div>
                    </div>
                </div>
            </div>
        </div>`;

        // Setup mobile filter close button visibility
        const style = window.getComputedStyle(document.querySelector('.shop-mobile-filter-btn'));
        if (style.display !== 'none') {
            document.getElementById('close-filter-btn').style.display = 'block';
        }

        await this.loadFilterMeta();
        await this.loadProducts();
    },

    renderCategoryFilters() {
        const categories = this.state.categories && this.state.categories.length
            ? this.state.categories
            : [
                { name: 'Foil', slug: 'foil', count: 0 },
                { name: 'Épée', slug: 'epee', count: 0 },
                { name: 'Sabre', slug: 'sabre', count: 0 },
                { name: 'Protective Equipment', slug: 'protective', count: 0 },
                { name: 'Electrical Equipment', slug: 'electrical', count: 0 },
                { name: 'Replacement Parts', slug: 'parts', count: 0 },
                { name: 'Accessories', slug: 'accessories', count: 0 }
            ];
        return `
            <label class="filter-option">
                <input type="radio" name="category" value=""
                       ${!this.state.filters.category ? 'checked' : ''}
                       onchange="ShopPage.setFilter('category', '')">
                All Categories
            </label>
        ` + categories.map(c => `
            <label class="filter-option">
                <input type="radio" name="category" value="${Utils.escapeHtml(c.name)}"
                       ${this.state.filters.category === c.name ? 'checked' : ''}
                       onchange="ShopPage.setFilter('category', '${Utils.escapeHtml(c.name).replace(/'/g, "\\'")}')">
                ${Utils.getCategoryIcon(c.name)} ${Utils.escapeHtml(c.name)}
                ${c.count ? `<span class="filter-count">(${c.count})</span>` : ''}
            </label>
        `).join('');
    },

        renderBrandFilters() {
        const brands = this.state.brands && this.state.brands.length
            ? this.state.brands
            : ['Leon Paul', 'Allstar', 'Uhlmann', 'PBT'];
        return `
            <label class="filter-option">
                <input type="radio" name="brand" value=""
                       ${!this.state.filters.brand ? 'checked' : ''}
                       onchange="ShopPage.setFilter('brand', '')">
                All Brands
            </label>
        ` + brands.map(b => `
            <label class="filter-option">
                <input type="radio" name="brand" value="${Utils.escapeHtml(b)}"
                       ${this.state.filters.brand === b ? 'checked' : ''}
                       onchange="ShopPage.setFilter('brand', '${Utils.escapeHtml(b).replace(/'/g, "\\'")}')">
                ${Utils.escapeHtml(b)}
            </label>
        `).join('');
    },

    onSearch: Utils.debounce(function (val) {
        ShopPage.state.filters.search = val;
        ShopPage.state.page = 1;
        ShopPage.loadProducts();
    }, 400),

    setFilter(key, value) {
        this.state.filters[key] = value;
        this.state.page = 1;
        this.loadProducts();
    },

    clearFilters() {
        this.state.filters = { category: '', brand: '', search: '', sort: 'name_asc', hand: '', availability: '' };
        this.state.page = 1;
        const searchInput = document.getElementById('shop-search');
        if (searchInput) searchInput.value = '';
        this.render();
    },

    toggleFilters() {
        document.getElementById('shop-sidebar').classList.toggle('open');
    },

    async loadProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = Components.productCardSkeleton().repeat(6);

        try {
            const params = new URLSearchParams();
            if (this.state.filters.category) params.set('category', this.state.filters.category);
            if (this.state.filters.brand) params.set('brand', this.state.filters.brand);
            if (this.state.filters.search) params.set('search', this.state.filters.search);
            if (this.state.filters.sort) params.set('sort', this.state.filters.sort);
            if (this.state.filters.hand) params.set('hand', this.state.filters.hand);
            if (this.state.filters.availability) params.set('availability', this.state.filters.availability);
            params.set('page', this.state.page);
            params.set('limit', 12);

            const result = await API.products.list(params.toString());
            this.state.products = result.products || [];
            this.state.totalPages = result.totalPages || 1;
            this.renderProducts();
        } catch {
            // Use demo data on error
            this.state.products = HomePage.getDemoProducts();
            this.state.totalPages = 1;
            this.renderProducts();
        }
    },

    renderProducts() {
        const grid = document.getElementById('products-grid');
        const countEl = document.getElementById('result-count');
        const pagEl = document.getElementById('pagination-container');
        const activeEl = document.getElementById('active-filters');

        if (this.state.products.length === 0) {
            grid.innerHTML = Components.emptyState('🔍', 'No Products Found', 'Try adjusting your filters or search terms.', 'Clear Filters', '/shop');
            countEl.innerHTML = '<strong>0</strong> products found';
        } else {
            grid.innerHTML = this.state.products.map((p, i) => Components.productCard(p, i)).join('');
            countEl.innerHTML = `Showing <strong>${this.state.products.length}</strong> products`;
        }

        pagEl.innerHTML = Components.pagination(this.state.page, this.state.totalPages, 'ShopPage.goToPage');

        // Active filter chips
        const chips = [];
        if (this.state.filters.category) chips.push({ label: this.state.filters.category, key: 'category' });
        if (this.state.filters.brand) chips.push({ label: this.state.filters.brand, key: 'brand' });
        if (this.state.filters.hand) chips.push({ label: this.state.filters.hand + ' Hand', key: 'hand' });
        if (this.state.filters.availability) chips.push({ label: 'In Stock', key: 'availability' });
        if (this.state.filters.search) chips.push({ label: `"${this.state.filters.search}"`, key: 'search' });

        activeEl.innerHTML = chips.map(c => `
            <span class="chip active">
                ${Utils.escapeHtml(c.label)}
                <span class="chip-close" onclick="ShopPage.setFilter('${c.key}', '')">✕</span>
            </span>
        `).join('');

        Utils.setupScrollAnimations();
    },

    goToPage(page) {
        this.state.page = page;
        this.loadProducts();
        Utils.scrollToTop();
    }
};
