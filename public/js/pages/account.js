const AccountPage = {
  async render() {
    if (!App.requireAuth('/account')) return;
    const user = App.state.user;
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const html = `
      <section class="account-page-v2 fade-in">
        <div class="container">

          <div class="account-hero">
            <div class="account-avatar">${initials}</div>
            <div class="account-hero-info">
              <h1>${Utils.escape(user.name)}</h1>
              <p class="muted">${Utils.escape(user.email)} <span class="role-chip">${Utils.escape(user.role)}</span></p>
            </div>
          </div>

          <div class="account-layout-v2">
            <aside class="account-sidebar-v2">
              <nav class="account-nav-v2">
                <button class="acc-nav-item active" data-tab="profile">
                  <span class="acc-nav-icon">👤</span>
                  <span>Profile</span>
                </button>
                <button class="acc-nav-item" data-tab="addresses">
                  <span class="acc-nav-icon">📍</span>
                  <span>Addresses</span>
                </button>
                <button class="acc-nav-item" data-tab="orders">
                  <span class="acc-nav-icon">📦</span>
                  <span>My Orders</span>
                </button>
                <button class="acc-nav-item" data-tab="support">
                  <span class="acc-nav-icon">💬</span>
                  <span>Support</span>
                </button>
                <div class="acc-nav-divider"></div>
                <button class="acc-nav-item logout" data-action="logout">
                  <span class="acc-nav-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </nav>
            </aside>

            <div class="account-content-v2" id="account-tab-content">
              <div class="loader"></div>
            </div>
          </div>
        </div>
      </section>
    `;

    (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = html;
    this.bindTabs();
    this.loadTab('profile');
  },

  bindTabs() {
    document.querySelectorAll('.acc-nav-item[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.acc-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadTab(btn.dataset.tab);
      });
    });
    const logoutBtn = document.querySelector('.acc-nav-item[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        if (!confirm('Log out of your account?')) return;
        try {
          if (API.auth && API.auth.logout) await API.auth.logout();
        } catch (e) {}
        Utils.storage.remove('auth_token');
        App.state.user = null;
        Utils.toast('Logged out', 'success');
        Router.navigate('/');
      };
    }
  },

  async loadTab(tab) {
    const container = document.getElementById('account-tab-content');
    container.innerHTML = '<div class="loader"></div>';
    try {
      if (tab === 'profile') await this.renderProfile(container);
      else if (tab === 'addresses') await this.renderAddresses(container);
      else if (tab === 'orders') await this.renderOrders(container);
      else if (tab === 'support') await this.renderSupport(container);
    } catch (err) {
      container.innerHTML = `<div class="od-card"><p class="muted">Error loading tab: ${Utils.escape(err.message)}</p></div>`;
    }
  },

  async renderProfile(container) {
    const user = App.state.user;
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">👤</span> Profile Information</h3>
        <form id="profile-form" class="form-v2">
          <div class="form-group-v2">
            <label>Full Name</label>
            <input type="text" name="name" value="${Utils.escape(user.name)}" required>
          </div>
          <div class="form-group-v2">
            <label>Email <span class="form-locked">🔒 locked</span></label>
            <input type="email" value="${Utils.escape(user.email)}" disabled>
          </div>
          <div class="form-group-v2">
            <label>Phone Number</label>
            <input type="tel" name="phone" value="${Utils.escape(user.phone || '')}" pattern="[0-9]{10}" placeholder="10-digit mobile">
          </div>
          <div class="form-group-v2">
            <label>Account Role <span class="form-locked">🔒 locked</span></label>
            <input type="text" value="${Utils.escape(user.role)}" disabled>
          </div>
          <button type="submit" class="btn btn-primary">💾 Update Profile</button>
        </form>
      </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button');
      Utils.setButtonLoading(btn, true);
      try {
        const data = { name: form.name.value.trim(), phone: form.phone.value.trim() };
        const res = await API.put('/auth/profile', data);
        if (res.user) {
          App.state.user = res.user;
          if (Components.renderHeader) Components.renderHeader();
          Utils.toast('Profile updated', 'success');
        }
      } catch (err) {
        Utils.toast(err.message || 'Update failed', 'error');
      } finally {
        Utils.setButtonLoading(btn, false);
      }
    });
  },

  async renderAddresses(container) {
    const res = await API.get('/auth/addresses');
    const addresses = res.addresses || [];

    container.innerHTML = `
      <div class="od-card">
        <div class="card-head-v2">
          <h3 class="od-card-title"><span class="od-card-icon">📍</span> Saved Addresses</h3>
          <button class="btn btn-primary btn-sm" id="add-address-btn">+ Add New</button>
        </div>
        <div class="address-list-v2" id="address-list">
          ${addresses.length === 0 ? `
            <div class="mini-empty">
              <span>📭</span>
              <p>No saved addresses yet. Add one for faster checkout.</p>
            </div>
          ` : addresses.map(a => `
            <div class="address-card-v2">
              <div class="address-card-body">
                <div class="address-card-head">
                  <strong>${Utils.escape(a.name)}</strong>
                  ${a.is_default ? '<span class="chip-default">Default</span>' : ''}
                </div>
                <p>${Utils.escape(a.line1)}${a.line2 ? ', ' + Utils.escape(a.line2) : ''}</p>
                <p class="muted">${Utils.escape(a.city)}, ${Utils.escape(a.state)} — ${Utils.escape(a.pincode)}</p>
                <p class="muted">📞 ${Utils.escape(a.phone)}</p>
              </div>
              <div class="address-card-actions">
                <button class="btn btn-sm btn-outline btn-danger-outline" data-delete="${a.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="address-form-modal" class="modal-v2" style="display:none;">
        <div class="modal-backdrop"></div>
        <div class="modal-content-v2">
          <button class="modal-close-v2" id="close-address-modal">×</button>
          <h3>Add New Address</h3>
          <form id="address-form" class="form-v2">
            <div class="form-group-v2"><label>Name</label><input name="name" required></div>
            <div class="form-group-v2"><label>Phone</label><input name="phone" required pattern="[0-9]{10}"></div>
            <div class="form-group-v2"><label>Address Line 1</label><input name="line1" required></div>
            <div class="form-group-v2"><label>Address Line 2 (optional)</label><input name="line2"></div>
            <div class="form-row-v2">
              <div class="form-group-v2"><label>City</label><input name="city" required></div>
              <div class="form-group-v2"><label>State</label><input name="state" required></div>
            </div>
            <div class="form-group-v2"><label>PIN Code</label><input name="pincode" required pattern="[0-9]{6}"></div>
            <div class="form-check-v2"><label><input type="checkbox" name="is_default"> Set as default address</label></div>
            <button type="submit" class="btn btn-primary btn-block">💾 Save Address</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('add-address-btn').onclick = () => {
      document.getElementById('address-form-modal').style.display = 'flex';
    };
    document.getElementById('close-address-modal').onclick = () => {
      document.getElementById('address-form-modal').style.display = 'none';
    };

    document.getElementById('address-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      try {
        const data = {
          name: f.name.value.trim(),
          phone: f.phone.value.trim(),
          line1: f.line1.value.trim(),
          line2: f.line2.value.trim(),
          city: f.city.value.trim(),
          state: f.state.value.trim(),
          pincode: f.pincode.value.trim(),
          is_default: f.is_default.checked ? 1 : 0
        };
        await API.post('/auth/addresses', data);
        Utils.toast('Address saved', 'success');
        this.renderAddresses(container);
      } catch (err) {
        Utils.toast(err.message || 'Failed to save', 'error');
      }
    });

    container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete this address?')) return;
        try {
          await API.delete('/auth/addresses/' + btn.dataset.delete);
          Utils.toast('Address deleted', 'success');
          this.renderAddresses(container);
        } catch (err) {
          Utils.toast(err.message, 'error');
        }
      };
    });
  },

  async renderOrders(container) {
    const res = await API.get('/orders');
    const orders = res.orders || [];
    container.innerHTML = `
      <div class="od-card">
        <div class="card-head-v2">
          <h3 class="od-card-title"><span class="od-card-icon">📦</span> My Orders (${orders.length})</h3>
          <a href="/orders" data-link class="btn btn-outline btn-sm">View All →</a>
        </div>
        ${orders.length === 0 ? `
          <div class="mini-empty">
            <span>🛍️</span>
            <p>No orders yet. <a href="/shop" data-link>Start shopping</a></p>
          </div>
        ` : `
          <div class="mini-orders-list">
            ${orders.slice(0, 10).map(o => `
              <div class="mini-order-row" onclick="Router.navigate('/orders/${o.id}')">
                <div class="mini-order-main">
                  <strong>#${o.order_number || o.id}</strong>
                  <p class="muted small">${Utils.formatDate(o.created_at)}</p>
                </div>
                <div class="mini-order-count">${o.item_count || 0} items</div>
                <div class="mini-order-amt">₹${(Number(o.total_amount||0)/100).toLocaleString('en-IN')}</div>
                <span class="status-pill status-${o.status}">${Utils.formatStatus(o.status)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  async renderSupport(container) {
    try {
      const res = await API.get('/support/tickets');
      const tickets = res.tickets || [];
      container.innerHTML = `
        <div class="od-card">
          <div class="card-head-v2">
            <h3 class="od-card-title"><span class="od-card-icon">💬</span> Support Tickets (${tickets.length})</h3>
            <a href="/support" data-link class="btn btn-primary btn-sm">+ New Ticket</a>
          </div>
          ${tickets.length === 0 ? `
            <div class="mini-empty">
              <span>💭</span>
              <p>No support tickets. Need help? <a href="/support" data-link>Create one</a></p>
            </div>
          ` : `
            <div class="mini-orders-list">
              ${tickets.map(t => `
                <div class="mini-order-row">
                  <div class="mini-order-main">
                    <strong>#${t.id} — ${Utils.escape(t.subject)}</strong>
                    <p class="muted small">${Utils.formatDate(t.created_at)}</p>
                  </div>
                  <span class="status-pill status-${t.status}">${Utils.formatStatus(t.status)}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="od-card"><div class="mini-empty"><span>⚠️</span><p>Could not load tickets.</p></div></div>`;
    }
  }
};