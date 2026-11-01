const OrdersPage = {
  async render() {
    if (!App.requireAuth('/orders')) return;
    try {
      const res = await API.get('/orders');
      const orders = res.orders || [];
      const active = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
      const completed = orders.filter(o => o.status === 'delivered').length;

      const statusColor = (s) => {
        const map = { awaiting_supplier_confirmation:'#f59e0b', awaiting_payment:'#8b5cf6', confirmed:'#3b82f6', preparing:'#6366f1', dispatched:'#0ea5e9', delivered:'#10b981', cancelled:'#ef4444' };
        return map[s] || '#94a3b8';
      };

      const html = `
        <section class="orders-page-v2 fade-in">
          <div class="container">
            <div class="orders-hero">
              <div class="orders-hero-text">
                <h1>My Orders</h1>
                <p>Track, manage, and review all your fencing equipment orders</p>
              </div>
              <div class="orders-stats">
                <div class="stat-pill"><span class="stat-num">${orders.length}</span><span class="stat-label">Total</span></div>
                <div class="stat-pill active"><span class="stat-num">${active}</span><span class="stat-label">Active</span></div>
                <div class="stat-pill done"><span class="stat-num">${completed}</span><span class="stat-label">Delivered</span></div>
              </div>
            </div>

            ${orders.length === 0 ? `
              <div class="empty-state-v2">
                <div class="empty-icon-wrap">
                  <span class="empty-icon">📦</span>
                  <span class="empty-icon-ring"></span>
                </div>
                <h2>No orders yet</h2>
                <p>When you place your first order, it will appear here with full tracking details.</p>
                <a href="/shop" data-link class="btn btn-primary btn-lg">Start Shopping</a>
              </div>
            ` : `
              <div class="orders-list-v2">
                ${orders.map((o, idx) => `
                  <div class="order-card-v2" onclick="Router.navigate('/orders/${o.id}')" style="animation-delay:${idx * 0.06}s">
                    <div class="order-stripe" style="background:${statusColor(o.status)}"></div>
                    <div class="order-card-content">
                      <div class="order-card-top">
                        <div class="order-card-id">
                          <span class="order-hash">#</span>${o.order_number || o.id}
                        </div>
                        <span class="status-pill status-${o.status}">${Utils.formatStatus(o.status)}</span>
                      </div>
                      <div class="order-card-mid">
                        <div class="order-meta-item">
                          <span class="meta-icon">🏪</span>
                          <span>${Utils.escape(o.supplier_name || 'Supplier')}</span>
                        </div>
                        <div class="order-meta-item">
                          <span class="meta-icon">📅</span>
                          <span>${Utils.formatDate(o.created_at)}</span>
                        </div>
                        <div class="order-meta-item">
                          <span class="meta-icon">📦</span>
                          <span>${o.item_count || 0} item${(o.item_count||0)!==1?'s':''}</span>
                        </div>
                        <div class="order-meta-item">
                          <span class="meta-icon">🚚</span>
                          <span>${Utils.escape((o.fulfilment_method||'standard_shipping').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))}</span>
                        </div>
                      </div>
                      <div class="order-card-bottom">
                        <span class="order-total">₹${(Number(o.total_amount||0)/100).toLocaleString('en-IN')}</span>
                        <span class="order-view-link">View Details <span class="arrow">→</span></span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </section>
      `;
      (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = html;
    } catch (err) {
      Utils.showError('Could not load orders: ' + err.message);
    }
  },

  async renderDetail(id) {
    if (!App.requireAuth('/orders/' + id)) return;
    (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = '<div class="container" style="padding:80px 0;text-align:center"><div class="loader"></div></div>';

    try {
      const res = await API.get('/orders/' + id);
      const order = res.order;
      if (!order) throw new Error('Order not found');

      const items = order.items || [];
      const events = order.events || [];

      const stages = ['awaiting_supplier_confirmation','awaiting_payment','confirmed','preparing','dispatched','delivered'];
      const currentIdx = Math.max(0, stages.indexOf(order.status));
      const isCancelled = order.status === 'cancelled';

      const eventIcon = (type) => {
        const map = { order_created:'🛒', supplier_accepted:'✅', supplier_rejected:'❌', payment_confirmed:'💳', preparing:'📋', dispatched:'🚚', delivered:'🎉', cancelled:'🚫' };
        return map[type] || '📌';
      };

      const html = `
        <section class="order-detail-v2 fade-in">
          <div class="container">

            <div class="od-breadcrumb">
              <a href="/orders" data-link>My Orders</a>
              <span class="sep">/</span>
              <span>Order ${order.order_number || '#' + order.id}</span>
            </div>

            <div class="od-header">
              <div class="od-header-left">
                <h1>Order ${order.order_number || '#' + order.id}</h1>
                <p class="od-date">Placed on ${Utils.formatDate(order.created_at)}</p>
              </div>
              <span class="status-pill-lg status-${order.status}">${Utils.formatStatus(order.status)}</span>
            </div>

            ${!isCancelled ? `
            <div class="od-progress-bar">
              <div class="od-progress-track">
                <div class="od-progress-fill" style="width:${Math.min(100, (currentIdx / (stages.length - 1)) * 100)}%"></div>
              </div>
              <div class="od-progress-steps">
                ${stages.map((s, i) => `
                  <div class="od-step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}">
                    <div class="od-step-dot">${i < currentIdx ? '✓' : i + 1}</div>
                    <div class="od-step-label">${Utils.formatStatus(s)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : `
            <div class="od-cancelled-banner">
              <span>🚫</span> This order has been cancelled.
            </div>
            `}

            <div class="od-grid">
              <div class="od-main">

                <div class="od-card">
                  <h3 class="od-card-title"><span class="od-card-icon">📦</span> Items (${items.length})</h3>
                  <div class="od-items">
                    ${items.map(it => `
                      <div class="od-item">
                        <div class="od-item-img">
                          <img src="${it.image_url || '/images/placeholder.svg'}" alt="${Utils.escape(it.product_name)}" onerror="this.src='/images/placeholder.svg'">
                        </div>
                        <div class="od-item-info">
                          <strong>${Utils.escape(it.product_name)}</strong>
                          <p class="muted">${Utils.escape(it.variant_label || '')}</p>
                          <p class="muted small">SKU: ${Utils.escape(it.sku || '-')}</p>
                        </div>
                        <div class="od-item-qty">×${it.quantity}</div>
                        <div class="od-item-price">₹${(Number(it.unit_price||0) * Number(it.quantity||0) / 100).toLocaleString('en-IN')}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div class="od-card">
                  <h3 class="od-card-title"><span class="od-card-icon">📋</span> Order Timeline</h3>
                  <div class="od-timeline">
                    ${events.length === 0 ? '<p class="muted" style="padding:16px 0">No events yet.</p>' : events.map(e => `
                      <div class="od-tl-item">
                        <div class="od-tl-icon">${eventIcon(e.event_type)}</div>
                        <div class="od-tl-line"></div>
                        <div class="od-tl-body">
                          <strong>${Utils.formatStatus(e.event_type)}</strong>
                          <p class="muted small">${Utils.formatDate(e.created_at)}</p>
                          ${e.note ? `<p class="od-tl-note">${Utils.escape(e.note)}</p>` : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                ${order.status === 'awaiting_payment' ? `
                  <div class="od-card od-pay-card">
                    <div class="od-pay-icon">💳</div>
                    <h3>Complete Payment</h3>
                    <p>Supplier has accepted your order. Please complete payment within 15 minutes to confirm.</p>
                    <button id="pay-now-btn" class="btn btn-primary btn-lg btn-block">Pay ₹${(Number(order.total_amount||0)/100).toLocaleString('en-IN')}</button>
                  </div>
                ` : ''}
              </div>

              <aside class="od-side">
                <div class="od-card od-summary-card">
                  <h3 class="od-card-title">Order Summary</h3>
                  <div class="od-sum-row"><span>Subtotal</span><span>₹${(Number(order.subtotal||0)/100).toLocaleString('en-IN')}</span></div>
                  <div class="od-sum-row"><span>Delivery</span><span>₹${(Number(order.delivery_fee||0)/100).toLocaleString('en-IN')}</span></div>
                  <div class="od-sum-row"><span>GST (18%)</span><span>₹${(Number(order.tax_amount||0)/100).toLocaleString('en-IN')}</span></div>
                  <div class="od-sum-divider"></div>
                  <div class="od-sum-row total"><span>Total</span><span>₹${(Number(order.total_amount||0)/100).toLocaleString('en-IN')}</span></div>
                </div>

                <div class="od-card">
                  <h3 class="od-card-title"><span class="od-card-icon">📍</span> Delivery Address</h3>
                  <p class="od-addr-name">${Utils.escape(order.address_name)}</p>
                  <p class="muted">${Utils.escape(order.address_line1)}</p>
                  ${order.address_line2 ? `<p class="muted">${Utils.escape(order.address_line2)}</p>` : ''}
                  <p class="muted">${Utils.escape(order.address_city)}, ${Utils.escape(order.address_state)} — ${Utils.escape(order.address_pincode)}</p>
                  <p class="muted">📞 ${Utils.escape(order.address_phone)}</p>
                </div>

                <div class="od-card">
                  <h3 class="od-card-title"><span class="od-card-icon">🏪</span> Supplier</h3>
                  <p>${Utils.escape(order.supplier_name || '-')}</p>
                </div>

                ${['awaiting_supplier_confirmation', 'awaiting_payment', 'confirmed'].includes(order.status) ? `
                  <button id="cancel-order-btn" class="btn btn-outline btn-block btn-danger-outline">Cancel Order</button>
                ` : ''}

                <a href="/tracking/${order.id}" data-link class="btn btn-primary btn-block">📍 Track Order</a>
              </aside>
            </div>
          </div>
        </section>
      `;

      (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = html;

      const payBtn = document.getElementById('pay-now-btn');
      if (payBtn) {
        payBtn.onclick = async () => {
          Utils.setButtonLoading(payBtn, true);
          try {
            await API.post('/orders/' + order.id + '/pay', { method: 'sandbox' });
            Utils.toast('Payment successful!', 'success');
            this.renderDetail(id);
          } catch (err) {
            Utils.toast(err.message, 'error');
          } finally {
            Utils.setButtonLoading(payBtn, false);
          }
        };
      }

      const cancelBtn = document.getElementById('cancel-order-btn');
      if (cancelBtn) {
        cancelBtn.onclick = async () => {
          if (!confirm('Cancel this order?')) return;
          try {
            await API.post('/orders/' + order.id + '/cancel', { reason: 'Customer cancelled' });
            Utils.toast('Order cancelled', 'success');
            this.renderDetail(id);
          } catch (err) {
            Utils.toast(err.message, 'error');
          }
        };
      }
    } catch (err) {
      Utils.showError('Could not load order: ' + err.message);
    }
  }
};