const SupplierPage = {
  async render() {
    if (!App.state.user || (App.state.user.role !== 'supplier' && App.state.user.role !== 'admin')) {
      Utils.toast('Supplier access required', 'error');
      Router.navigate('/login');
      return;
    }

    const html = `
      <section class="dash-page fade-in">
        <div class="container">
          <div class="dash-hero">
            <div>
              <h1>🏪 Supplier Dashboard</h1>
              <p class="muted">Manage orders, update statuses, review catalogue & stock</p>
            </div>
            <div class="dash-role-chip supplier">SUPPLIER</div>
          </div>

          <div class="dash-layout">
            <aside class="dash-sidebar">
              <nav class="dash-nav">
                <button class="dash-nav-item active" data-tab="requests"><span class="dn-icon">📥</span> New Requests</button>
                <button class="dash-nav-item" data-tab="active"><span class="dn-icon">🚀</span> Active Orders</button>
                <button class="dash-nav-item" data-tab="catalogue"><span class="dn-icon">📦</span> Catalogue</button>
                <button class="dash-nav-item" data-tab="stock"><span class="dn-icon">📊</span> Stock</button>
              </nav>
            </aside>
            <div class="dash-content" id="supplier-tab-content">
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

    this.loadTab('requests');
  },

  async loadTab(tab) {
    const container = document.getElementById('supplier-tab-content');
    container.innerHTML = '<div class="loader"></div>';
    try {
      if (tab === 'requests') await this.renderRequests(container);
      else if (tab === 'active') await this.renderActive(container);
      else if (tab === 'catalogue') await this.renderCatalogue(container);
      else if (tab === 'stock') await this.renderStock(container);
    } catch (err) {
      container.innerHTML = `<div class="od-card"><p class="muted">${Utils.escape(err.message)}</p></div>`;
    }
  },

  async renderRequests(container) {
    const res = await API.get('/supplier/orders?status=awaiting_supplier_confirmation');
    const orders = res.orders || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">📥</span> Awaiting Confirmation (${orders.length})</h3>
        ${orders.length === 0 ? '<div class="mini-empty"><span>✨</span><p>No new requests. You\'re all caught up!</p></div>' : `
          <div class="sup-orders-list">
            ${orders.map(o => `
              <div class="sup-order-card">
                <div class="sup-order-head">
                  <div>
                    <strong class="mono">#${o.order_number || o.id}</strong>
                    <p class="muted small">${Utils.formatDate(o.created_at)}</p>
                    ${o.supplier_response_deadline ? `<p class="muted small">⏰ Respond by: ${Utils.formatDate(o.supplier_response_deadline)}</p>` : ''}
                  </div>
                  <div class="sup-order-amt">₹${(Number(o.total_amount||0)/100).toLocaleString('en-IN')}</div>
                </div>
                <div class="sup-items-compact">
                  ${(o.items || []).map(it => `
                    <div class="sup-compact-item">
                      <span class="qty-chip">${it.quantity}×</span>
                      <span>${Utils.escape(it.product_name)}</span>
                      <span class="muted small">(${Utils.escape(it.variant_label || '-')})</span>
                    </div>
                  `).join('')}
                </div>
                <div class="sup-order-actions">
                  <button class="btn btn-success btn-sm" data-accept="${o.id}">✓ Accept Order</button>
                  <button class="btn btn-outline btn-sm btn-danger-outline" data-reject="${o.id}">✗ Reject</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-accept]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Accept this order? Stock will be reserved.')) return;
        try {
          await API.post(`/supplier/orders/${btn.dataset.accept}/accept`);
          Utils.toast('Order accepted', 'success');
          this.renderRequests(container);
        } catch (err) { Utils.toast(err.message, 'error'); }
      };
    });

    container.querySelectorAll('[data-reject]').forEach(btn => {
      btn.onclick = async () => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        try {
          await API.post(`/supplier/orders/${btn.dataset.reject}/reject`, { reason });
          Utils.toast('Order rejected', 'success');
          this.renderRequests(container);
        } catch (err) { Utils.toast(err.message, 'error'); }
      };
    });
  },

  async renderActive(container) {
    const res = await API.get('/supplier/orders?status=active');
    const orders = res.orders || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">🚀</span> Active Orders (${orders.length})</h3>
        ${orders.length === 0 ? '<div class="mini-empty"><span>📭</span><p>No active orders.</p></div>' : `
          <div class="data-table-wrap">
            <table class="data-table-v2">
              <thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td class="mono">#${o.order_number || o.id}</td>
                    <td class="muted small">${Utils.formatDate(o.created_at)}</td>
                    <td><span class="status-pill status-${o.status}">${Utils.formatStatus(o.status)}</span></td>
                    <td class="mono">₹${(Number(o.total_amount||0)/100).toLocaleString('en-IN')}</td>
                    <td>
                      ${o.status === 'confirmed' ? `<button class="btn btn-sm btn-primary" data-prepare="${o.id}">📋 Prepare</button>` : ''}
                      ${o.status === 'preparing' ? `<button class="btn btn-sm btn-primary" data-dispatch="${o.id}">🚚 Dispatch</button>` : ''}
                      ${o.status === 'dispatched' ? `<button class="btn btn-sm btn-success" data-deliver="${o.id}">🎉 Delivered</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-prepare]').forEach(btn => {
      btn.onclick = async () => {
        try { await API.post(`/supplier/orders/${btn.dataset.prepare}/status`, { status: 'preparing' }); Utils.toast('Updated', 'success'); this.renderActive(container); }
        catch(e) { Utils.toast(e.message, 'error'); }
      };
    });
    container.querySelectorAll('[data-dispatch]').forEach(btn => {
      btn.onclick = async () => {
        const ref = prompt('Courier reference (optional):') || '';
        try { await API.post(`/supplier/orders/${btn.dataset.dispatch}/status`, { status: 'dispatched', courier_reference: ref }); Utils.toast('Updated', 'success'); this.renderActive(container); }
        catch(e) { Utils.toast(e.message, 'error'); }
      };
    });
    container.querySelectorAll('[data-deliver]').forEach(btn => {
      btn.onclick = async () => {
        try { await API.post(`/supplier/orders/${btn.dataset.deliver}/status`, { status: 'delivered' }); Utils.toast('Marked delivered', 'success'); this.renderActive(container); }
        catch(e) { Utils.toast(e.message, 'error'); }
      };
    });
  },

  async renderCatalogue(container) {
    const res = await API.get('/supplier/products');
    const products = res.products || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">📦</span> My Catalogue (${products.length})</h3>
        ${products.length === 0 ? '<div class="mini-empty"><span>📭</span><p>No products yet.</p></div>' : `
          <div class="data-table-wrap">
            <table class="data-table-v2">
              <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Status</th></tr></thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td><strong>${Utils.escape(p.name)}</strong></td>
                    <td>${Utils.escape(p.brand || '-')}</td>
                    <td>${Utils.escape(p.category_name || '-')}</td>
                    <td><span class="status-pill ${p.active ? 'status-delivered' : 'status-cancelled'}">${p.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  async renderStock(container) {
    const res = await API.get('/supplier/stock');
    const stock = res.stock || [];
    container.innerHTML = `
      <div class="od-card">
        <h3 class="od-card-title"><span class="od-card-icon">📊</span> Stock Overview (${stock.length})</h3>
        ${stock.length === 0 ? '<div class="mini-empty"><span>📭</span><p>No stock records.</p></div>' : `
          <div class="data-table-wrap">
            <table class="data-table-v2">
              <thead><tr><th>SKU</th><th>Product</th><th>Variant</th><th>On Hand</th><th>Reserved</th><th>Available</th></tr></thead>
              <tbody>
                ${stock.map(s => {
                  const avail = Number(s.available || 0);
                  const low = avail <= 2;
                  return `
                  <tr>
                    <td class="mono small">${Utils.escape(s.sku)}</td>
                    <td><strong>${Utils.escape(s.product_name)}</strong></td>
                    <td class="muted">${Utils.escape(s.variant_label || '-')}</td>
                    <td class="mono">${s.on_hand}</td>
                    <td class="mono">${s.reserved}</td>
                    <td><strong class="${low ? 'stock-low' : 'stock-ok'}">${avail}${low ? ' ⚠️' : ''}</strong></td>
                  </tr>
                `;}).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }
};