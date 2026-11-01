const TrackingPage = {
  async render(id) {
    if (!App.requireAuth('/tracking/' + id)) return;
    (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = '<div class="container" style="padding:80px 0;text-align:center"><div class="loader"></div></div>';

    try {
      const res = await API.get('/orders/' + id);
      const order = res.order;
      if (!order) throw new Error('Order not found');

      const stages = ['awaiting_supplier_confirmation', 'awaiting_payment', 'confirmed', 'preparing', 'dispatched', 'delivered'];
      const currentIndex = Math.max(0, stages.indexOf(order.status));
      const isCancelled = order.status === 'cancelled';

      const stageIcons = ['📝', '💳', '✅', '📋', '🚚', '🎉'];
      const eventIcon = (type) => {
        const map = { order_created:'🛒', supplier_accepted:'✅', supplier_rejected:'❌', payment_confirmed:'💳', preparing:'📋', dispatched:'🚚', delivered:'🎉', cancelled:'🚫' };
        return map[type] || '📌';
      };

      const html = `
        <section class="tracking-page-v2 fade-in">
          <div class="container">

            <div class="od-breadcrumb">
              <a href="/orders" data-link>My Orders</a>
              <span class="sep">/</span>
              <a href="/orders/${order.id}" data-link>Order ${order.order_number || '#' + order.id}</a>
              <span class="sep">/</span>
              <span>Tracking</span>
            </div>

            <div class="track-header">
              <h1>Track Order ${order.order_number || '#' + order.id}</h1>
              <p class="muted">Real-time status of your fencing equipment order</p>
            </div>

            ${isCancelled ? `
              <div class="track-cancelled-banner">
                <span class="track-cancelled-icon">🚫</span>
                <h2>Order Cancelled</h2>
                <p>This order has been cancelled and is no longer being processed.</p>
                <a href="/orders" data-link class="btn btn-primary">Back to Orders</a>
              </div>
            ` : `
              <div class="track-stepper-card">
                <div class="track-stepper">
                  ${stages.map((s, i) => `
                    <div class="track-step ${i <= currentIndex ? 'done' : ''} ${i === currentIndex ? 'current' : ''}">
                      <div class="track-step-connector ${i <= currentIndex ? 'filled' : ''}"></div>
                      <div class="track-step-circle">
                        <span>${i < currentIndex ? '✓' : stageIcons[i]}</span>
                      </div>
                      <div class="track-step-label">${Utils.formatStatus(s)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="track-status-card">
                <div class="track-status-icon">${stageIcons[currentIndex]}</div>
                <div class="track-status-info">
                  <span class="status-pill-lg status-${order.status}">${Utils.formatStatus(order.status)}</span>
                  <p class="muted">Last updated: ${Utils.formatDate(order.updated_at || order.created_at)}</p>
                </div>
              </div>

              <div class="track-info-grid">
                ${order.supplier_response_deadline ? `
                  <div class="track-info-card">
                    <span class="track-info-icon">⏰</span>
                    <div>
                      <strong>Supplier Deadline</strong>
                      <p class="muted">${Utils.formatDate(order.supplier_response_deadline)}</p>
                    </div>
                  </div>
                ` : ''}
                ${order.courier_reference ? `
                  <div class="track-info-card">
                    <span class="track-info-icon">📮</span>
                    <div>
                      <strong>Courier Reference</strong>
                      <p class="muted">${Utils.escape(order.courier_reference)}</p>
                    </div>
                  </div>
                ` : ''}
                <div class="track-info-card">
                  <span class="track-info-icon">🏪</span>
                  <div>
                    <strong>Supplier</strong>
                    <p class="muted">${Utils.escape(order.supplier_name || '-')}</p>
                  </div>
                </div>
                <div class="track-info-card">
                  <span class="track-info-icon">🚚</span>
                  <div>
                    <strong>Fulfilment</strong>
                    <p class="muted">${Utils.escape((order.fulfilment_method||'standard_shipping').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))}</p>
                  </div>
                </div>
              </div>
            `}

            <div class="od-card" style="margin-top:24px">
              <h3 class="od-card-title"><span class="od-card-icon">📋</span> Full Event Log</h3>
              <div class="od-timeline">
                ${(order.events || []).length === 0 ? '<p class="muted" style="padding:16px 0">No events recorded yet.</p>' : (order.events || []).map(e => `
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

            <div style="text-align:center;margin-top:32px">
              <a href="/orders/${order.id}" data-link class="btn btn-outline">← Back to Order Details</a>
            </div>
          </div>
        </section>
      `;
      (document.getElementById('main-content') || document.getElementById('app-content')).innerHTML = html;
    } catch (err) {
      Utils.showError('Could not load tracking: ' + err.message);
    }
  }
};