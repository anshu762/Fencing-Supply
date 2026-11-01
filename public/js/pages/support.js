const SupportPage = {
  async render() {
    const html = `
      <section class="support-page fade-in">
        <div class="container narrow">
          <div class="page-header">
            <h1>Contact Support</h1>
            <p>We're here to help with your orders and queries</p>
          </div>

          <div class="card">
            <form id="support-form" class="form">
              <div class="form-group">
                <label>Type of Query</label>
                <select name="type" required>
                  <option value="">Select...</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="return">Return / Exchange</option>
                  <option value="damaged">Damaged / Missing Item</option>
                  <option value="payment">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Order ID (if applicable)</label>
                <input name="order_id" type="number" placeholder="e.g. 123">
              </div>
              <div class="form-group">
                <label>Subject</label>
                <input name="subject" required placeholder="Brief subject">
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea name="message" rows="6" required placeholder="Describe your issue in detail..."></textarea>
              </div>
              ${!App.state.user ? `
                <div class="form-row">
                  <div class="form-group"><label>Your Name</label><input name="guest_name" required></div>
                  <div class="form-group"><label>Email</label><input type="email" name="guest_email" required></div>
                </div>
              ` : ''}
              <button type="submit" class="btn btn-primary btn-block btn-lg">Submit Ticket</button>
            </form>
          </div>

          <div class="card">
            <h3>Other Ways to Reach Us</h3>
            <p>📧 Email: support@fencingsupply.in</p>
            <p>📞 Phone: +91 1800-FENCING (demo)</p>
            <p>🕒 Hours: Mon-Sat, 10 AM - 7 PM IST</p>
          </div>
        </div>
      </section>
    `;
    document.getElementById('app-content').innerHTML = html;

    document.getElementById('support-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      Utils.setButtonLoading(btn, true);
      try {
        const data = {
          type: form.type.value,
          order_id: form.order_id.value || null,
          subject: form.subject.value.trim(),
          message: form.message.value.trim()
        };
        if (!App.state.user) {
          data.guest_name = form.guest_name.value.trim();
          data.guest_email = form.guest_email.value.trim();
        }
        const res = await API.post('/support/tickets', data);
        Utils.toast('Ticket #' + res.ticket_id + ' created successfully', 'success');
        form.reset();
      } catch (err) {
        Utils.toast(err.message || 'Submission failed', 'error');
      } finally {
        Utils.setButtonLoading(btn, false);
      }
    });
  }
};