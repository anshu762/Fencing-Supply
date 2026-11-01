// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    // Format price from paise to rupees display
    formatPrice(paise) {
        if (paise == null || isNaN(paise)) return '₹0.00';
        const rupees = paise / 100;
        return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Format price without decimals for display
    formatPriceShort(paise) {
        if (paise == null || isNaN(paise)) return '₹0';
        const rupees = Math.round(paise / 100);
        return '₹' + rupees.toLocaleString('en-IN');
    },

    // Format date to Indian format
    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    // Format date with time
    formatDateTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    // Relative time
    timeAgo(dateStr) {
        const now = new Date();
        const past = new Date(dateStr);
        const seconds = Math.floor((now - past) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return Utils.formatDate(dateStr);
    },

    // Debounce
    debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    // Throttle
    throttle(fn, limit = 200) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Sanitize HTML to prevent XSS
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Truncate text
    truncate(str, len = 100) {
        if (!str || str.length <= len) return str;
        return str.substring(0, len) + '...';
    },

    // Slugify
    slugify(str) {
        return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
    },

    // Generate simple ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate Indian phone
    isValidPhone(phone) {
        return /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
    },

    // Validate PIN code
    isValidPIN(pin) {
        return /^\d{6}$/.test(pin);
    },

    // Category emoji map
    getCategoryIcon(category) {
        const icons = {
            'Foil': '🤺',
            'Épée': '⚔️',
            'Sabre': '🗡️',
            'Protective Equipment': '🛡️',
            'Electrical Equipment': '⚡',
            'Replacement Parts': '🔧',
            'Accessories': '🎒',
            'Clothing': '👕',
            'Masks': '😷',
            'Gloves': '🧤',
            'Weapons': '⚔️',
            'Blades': '🗡️',
            'Body Cords': '🔌',
        };
        return icons[category] || '📦';
    },

    // Status badge class mapping
    getStatusBadge(status) {
        const map = {
            'awaiting_confirmation': { class: 'badge-warning', label: 'Awaiting Confirmation' },
            'confirmed': { class: 'badge-info', label: 'Confirmed' },
            'awaiting_payment': { class: 'badge-warning', label: 'Awaiting Payment' },
            'preparing': { class: 'badge-info', label: 'Preparing' },
            'dispatched': { class: 'badge-info', label: 'Dispatched' },
            'delivered': { class: 'badge-success', label: 'Delivered' },
            'ready_for_pickup': { class: 'badge-info', label: 'Ready for Pickup' },
            'collected': { class: 'badge-success', label: 'Collected' },
            'cancelled': { class: 'badge-danger', label: 'Cancelled' },
            'rejected': { class: 'badge-danger', label: 'Rejected' },
            'expired': { class: 'badge-neutral', label: 'Expired' },
            'refund_pending': { class: 'badge-warning', label: 'Refund Pending' },
            'refunded': { class: 'badge-success', label: 'Refunded' },
            'active': { class: 'badge-success', label: 'Active' },
            'inactive': { class: 'badge-neutral', label: 'Inactive' },
            'pending': { class: 'badge-warning', label: 'Pending' },
            'approved': { class: 'badge-success', label: 'Approved' },
            'draft': { class: 'badge-neutral', label: 'Draft' },
            'sent': { class: 'badge-info', label: 'Sent' },
            'accepted': { class: 'badge-success', label: 'Accepted' },
            'declined': { class: 'badge-danger', label: 'Declined' },
            'open': { class: 'badge-warning', label: 'Open' },
            'in_progress': { class: 'badge-info', label: 'In Progress' },
            'resolved': { class: 'badge-success', label: 'Resolved' },
            'closed': { class: 'badge-neutral', label: 'Closed' },
        };
        const s = map[status];
        return s || { class: 'badge-neutral', label: status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown' };
    },

    // Intersection observer for animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    },

    // Scroll to top
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    },

    // Local storage helpers
    storage: {
        get(key, fallback = null) {
            try {
                const val = localStorage.getItem(key);
                return val ? JSON.parse(val) : fallback;
            } catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch { }
        }
    }
};