// ============================================
// API CLIENT
// ============================================

const API = {
    baseURL: '',

    async request(method, path, data = null, options = {}) {
        // Auto-prepend /api/ if missing (some pages omit it)
        if (path && !path.startsWith('/api/') && !path.startsWith('http')) {
            path = '/api' + (path.startsWith('/') ? path : '/' + path);
        }
        const url = this.baseURL + path;
        const config = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            ...options,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const token = Utils.storage.get('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const result = await response.json();

            if (!response.ok) {
                throw { status: response.status, message: result.error || result.message || 'Request failed', data: result };
            }

            return result;
        } catch (err) {
            if (err.status) throw err;
            throw { status: 0, message: 'Network error. Please check your connection.' };
        }
    },

    get(path) { return this.request('GET', path); },
    post(path, data) { return this.request('POST', path, data); },
    put(path, data) { return this.request('PUT', path, data); },
    patch(path, data) { return this.request('PATCH', path, data); },
    delete(path) { return this.request('DELETE', path); },

    // Auth
    auth: {
        login: (data) => API.post('/api/auth/login', data),
        register: (data) => API.post('/api/auth/register', data),
        logout: () => API.post('/api/auth/logout'),
        me: () => API.get('/api/auth/me'),
    },

    // Products
    products: {
        list: (params = '') => API.get(`/api/products${params ? '?' + params : ''}`),
        get: (id) => API.get(`/api/products/${id}`),
        categories: () => API.get('/api/products/categories/list'),
        search: (q) => API.get(`/api/products?search=${encodeURIComponent(q)}`),
    },

    // Cart
    cart: {
        get: () => API.get('/api/cart'),
        add: (data) => API.post('/api/cart/add', data),
        update: (itemId, data) => API.put(`/api/cart/item/${itemId}`, data),
        remove: (itemId) => API.delete(`/api/cart/item/${itemId}`),
        clear: () => API.delete('/api/cart'),
        checkPin: (pin) => API.post('/api/cart/check-pin', { pin_code: pin }),
    },

    // Orders
    orders: {
        list: () => API.get('/api/orders'),
        get: (id) => API.get(`/api/orders/${id}`),
        create: (data) => API.post('/api/orders', data),
        cancel: (id, data) => API.post(`/api/orders/${id}/cancel`, data),
    },

    // Quotes
    quotes: {
        list: () => API.get('/api/quotes'),
        get: (id) => API.get(`/api/quotes/${id}`),
        create: (data) => API.post('/api/quotes', data),
        accept: (id) => API.post(`/api/quotes/${id}/accept`),
        decline: (id) => API.post(`/api/quotes/${id}/decline`),
    },

    // Supplier
    supplier: {
        orders: () => API.get('/api/supplier/orders'),
        orderDetail: (id) => API.get(`/api/supplier/orders/${id}`),
        accept: (id) => API.post(`/api/supplier/orders/${id}/accept`),
        reject: (id, data) => API.post(`/api/supplier/orders/${id}/reject`, data),
        updateStatus: (id, data) => API.post(`/api/supplier/orders/${id}/status`, data),
        products: () => API.get('/api/supplier/products'),
        updateStock: (id, data) => API.put(`/api/supplier/products/${id}/stock`, data),
        dashboard: () => API.get('/api/supplier/dashboard'),
    },

    // Admin
    admin: {
        dashboard: () => API.get('/api/admin/dashboard'),
        orders: () => API.get('/api/admin/orders'),
        orderDetail: (id) => API.get(`/api/admin/orders/${id}`),
        products: () => API.get('/api/admin/products'),
        approveProduct: (id) => API.post(`/api/admin/products/${id}/approve`),
        suppliers: () => API.get('/api/admin/suppliers'),
        approveSupplier: (id) => API.post(`/api/admin/suppliers/${id}/approve`),
        users: () => API.get('/api/admin/users'),
        quotes: () => API.get('/api/admin/quotes'),
        quoteDetail: (id) => API.get(`/api/admin/quotes/${id}`),
        updateQuote: (id, data) => API.put(`/api/admin/quotes/${id}`, data),
        settings: () => API.get('/api/admin/settings'),
        updateSetting: (data) => API.put('/api/admin/settings', data),
    },

    // Support
    support: {
        list: () => API.get('/api/support'),
        get: (id) => API.get(`/api/support/${id}`),
        create: (data) => API.post('/api/support', data),
        addMessage: (id, data) => API.post(`/api/support/${id}/message`, data),
    }
};