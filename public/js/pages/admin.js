const AdminPage = {
  async render() {
    if (!App.requireRole('admin')) return;

    const html = `
      <section class="dash-page fade-in">
        <div class="container">
          <div class="dash-hero">
            <div>
              <h1>⚡ Admin Dashboard</h1>
              <p class="muted">Platform oversight, orders, catalogue, suppliers & users</p>
            </div>
            <div class="dash-role-chip">ADMIN</div>
          </div>

          <div class="dash-layout">
            <aside class="dash-sidebar">
              <nav class="dash-nav">
                <button class="dash-nav-item active" data-tab="overview"><span class="dn-icon">📊</span> Overview</button>
                <button class="dash-nav-item" data-tab="orders"><span class="dn-icon">📦</span> All Orders</button>
                <button class="dash-nav-item" data-tab="products"><span class="dn-icon">🛒</span> Products</button>
                <button class="dash-nav-item" data-tab="suppliers"><span class="dn-icon">🏢</span> Suppliers</button>
                <button class="dash-nav-item" data-tab="users"><span class="dn-icon">👥</span> Users</button>
                <button class="dash-nav-item" data-tab="quotes"><span class="dn-icon">📝</span> Quotes</button>
                <button class="dash-nav-item" data-tab="tickets"><span class="dn-icon">💬</span> Support</button>
              </nav>
            </aside>
            <div class="dash-content" id="admin-tab-content">
              <div class="loader"></div>
            </div>
          </div>
        </div>
      </section>
    `;
    (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = html;

    document.querySelectorAll('.dash-nav-item').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.dash-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadTab(btn.dataset.tab);
      };
    });

    this.loadTab('overview');
  },

  async loadTab(tab) {
    const container = document.getElementById('admin-tab-content');
    container.innerHTML = '<div class="loader"></div>';
    try {
      if (tab === 'overview') await this.renderOverview(container);
      else if (tab === 'orders') await this.renderOrders(container);
      else if (tab === 'products') await this.renderProducts(container);
      else if (tab === 'suppliers') await this.renderSuppliers(container);
      else if (tab === 'users') await this.renderUsers(container);
      else if (tab === 'quotes') await this.renderQuotes(container);
      else if (tab === 'tickets') await this.renderTickets(container);
    } catch (err) {
      container.innerHTML = `<div class="od-card"><p class="muted">${Utils.escape(err.message)}</p></div>`;
    }
  },

  async renderOverview(container) {
    try {
      const res = await API.get('/admin/stats');
      const s = res.stats || {};
      container.innerHTML = `
        <div class="dash-stats-grid">
          <div class="dash-stat-card color-blue">
            <div class="dsc-icon">📦</div>
            <div class="dsc-info"><h3>${s.total_orders || 0}</h3><p>Total Orders</p></div>
          </div>
          <div class="dash-stat-card color-green">
            <div class="dsc-icon">💰</div>
            <div class="dsc-info"><h3>₹${(Number(s.total_revenue||0)/100).toLocaleString('en-IN')}</h3><p>Revenue</p></div>
          </div>
          <div class="dash-stat-card color-purple">
            <div class="dsc-icon">🛒</div>
            <div class="dsc-info"><h3>${s.total_products || 0}</h3><p>Products</p></div>
          </div>
          <div class="dash-stat-card color-orange">
            <div class="dsc-icon">🏢</div>
            <div class="dsc-info"><h3>${s.total_suppliers || 0}</h3><p>Suppliers</p></div>
          </div>
          <div class="dash-stat-card color-pink">
            <div class="dsc-icon">👥</div>
            <div class="dsc-info"><h3>${s.total_users || 0}</h3><p>Users</p></div>
          </div>
          <div class="dash-stat-card color-amber">
            <div class="dsc-icon">📝</div>
            <div class="dsc-info"><h3>${s.pending_quotes || 0}</h3><p>Pending Quotes</p></div>
          </div>
        </div>
        <div class="od-card" style="margin-top:20px">
          <h3 class="od-card-title"><span class="od-card-icon">📈</span> Order Status Breakdown</h3>
          <div class="status-breakdown-v2">
            ${(s.status_counts || []).map(sc => `
              <div class="sb-row">
                <span class="status-pill status-${sc.status}">${Utils.formatStatus(sc.status)}</span>
                <strong>${sc.count}</strong>
              </div>
            `).join('') || '<p class="muted">No data available.</p>'}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="od-card"><p class="muted">${Utils.escape(err.message)}</p></div>`;
    }
  },

  async renderOrders(container) {
    const res = await API.get('/admin/orders');
    const orders = res.orders || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">📦</span> All Orders (${orders.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table-v2">
            <thead><tr><th>ID</th><th>Customer</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              ${orders.length === 0 ? '<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">No orders yet.</td></tr>' : orders.map(o => `
                <tr onclick="Router.navigate('/orders/${o.id}')">
                  <td class="mono">#${o.order_number || o.id}</td>
                  <td>${Utils.escape(o.customer_name || '-')}</td>
                  <td>${Utils.escape(o.supplier_name || '-')}</td>
                  <td class="mono">₹${(Number(o.total_amount||0)/100).toLocaleString('en-IN')}</td>
                  <td><span class="status-pill status-${o.status}">${Utils.formatStatus(o.status)}</span></td>
                  <td class="muted small">${Utils.formatDate(o.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderProducts(container) {
    const res = await API.get('/admin/products');
    const products = res.products || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">🛒</span> All Products (${products.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table-v2">
            <thead><tr><th>Name</th><th>Brand</th><th>Supplier</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${products.length === 0 ? '<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">No products.</td></tr>' : products.map(p => `
                <tr>
                  <td><strong>${Utils.escape(p.name)}</strong></td>
                  <td>${Utils.escape(p.brand || '-')}</td>
                  <td>${Utils.escape(p.supplier_name || '-')}</td>
                  <td>${Utils.escape(p.category_name || '-')}</td>
                  <td><span class="status-pill ${p.active ? 'status-delivered' : 'status-cancelled'}">${p.active ? 'Active' : 'Inactive'}</span></td>
                  <td><button class="btn btn-sm btn-outline" data-toggle="${p.id}">${p.active ? 'Hide' : 'Approve'}</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.onclick = async () => {
        try {
          await API.post(`/admin/products/${btn.dataset.toggle}/toggle`);
          this.renderProducts(container);
        } catch(e) { Utils.toast(e.message, 'error'); }
      };
    });
  },

  async renderSuppliers(container) {
    const res = await API.get('/admin/suppliers');
    const suppliers = res.suppliers || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">🏢</span> Suppliers (${suppliers.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table-v2">
            <thead><tr><th>Name</th><th>Contact</th><th>City</th><th>Status</th></tr></thead>
            <tbody>
              ${suppliers.length === 0 ? '<tr><td colspan="4" class="muted" style="text-align:center;padding:24px">No suppliers.</td></tr>' : suppliers.map(s => `
                <tr>
                  <td><strong>${Utils.escape(s.name)}</strong></td>
                  <td>${Utils.escape(s.contact_email || '-')}</td>
                  <td>${Utils.escape(s.city || '-')}</td>
                  <td><span class="status-pill ${s.approved ? 'status-delivered' : 'status-awaiting_supplier_confirmation'}">${s.approved ? 'Approved' : 'Pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderUsers(container) {
    const res = await API.get('/admin/users');
    const users = res.users || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">👥</span> Users (${users.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table-v2">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              ${users.length === 0 ? '<tr><td colspan="4" class="muted" style="text-align:center;padding:24px">No users.</td></tr>' : users.map(u => `
                <tr>
                  <td><strong>${Utils.escape(u.name)}</strong></td>
                  <td>${Utils.escape(u.email)}</td>
                  <td><span class="role-chip">${Utils.escape(u.role)}</span></td>
                  <td class="muted small">${Utils.formatDate(u.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderQuotes(container) {
    const res = await API.get('/admin/quotes');
    const quotes = res.quotes || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">📝</span> Quote Requests (${quotes.length})</h3>
        ${quotes.length === 0 ? '<div class="mini-empty"><span>📭</span><p>No quotes yet.</p></div>' : `
          <div class="data-table-wrap">
            <table class="data-table-v2">
              <thead><tr><th>ID</th><th>Organisation</th><th>Contact</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${quotes.map(q => `
                  <tr>
                    <td class="mono">#${q.id}</td>
                    <td><strong>${Utils.escape(q.organisation)}</strong></td>
                    <td>${Utils.escape(q.contact_name)}<br><small class="muted">${Utils.escape(q.contact_phone)}</small></td>
                    <td><span class="status-pill status-${q.status}">${Utils.formatStatus(q.status)}</span></td>
                    <td class="muted small">${Utils.formatDate(q.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  async renderTickets(container) {
    const res = await API.get('/admin/tickets');
    const tickets = res.tickets || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">💬</span> Support Tickets (${tickets.length})</h3>
        ${tickets.length === 0 ? '<div class="mini-empty"><span>💭</span><p>No tickets.</p></div>' : `
          <div class="data-table-wrap">
            <table class="data-table-v2">
              <thead><tr><th>ID</th><th>User</th><th>Subject</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${tickets.map(t => `
                  <tr>
                    <td class="mono">#${t.id}</td>
                    <td>${Utils.escape(t.user_name || '-')}</td>
                    <td><strong>${Utils.escape(t.subject)}</strong></td>
                    <td>${Utils.escape(t.type || '-')}</td>
                    <td><span class="status-pill status-${t.status}">${Utils.formatStatus(t.status)}</span></td>
                    <td class="muted small">${Utils.formatDate(t.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }
};