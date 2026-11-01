const QuotePage = {
     init() {
        const container = document.getElementById('main-content') || document.getElementById('app-content');
        if (!container) return;
        this.render(container);
    },

       render(container) {
        // Router passes params object, not a DOM element — detect and fallback
        if (!container || !(container instanceof HTMLElement)) {
            container = document.getElementById('main-content') || document.getElementById('app-content');
        }
        if (!container) return;
        container.innerHTML = `
            <div class="quote-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Club Quote</span>
                        </div>
                        <h1>Club / Bulk Quote</h1>
                        <p>Get custom pricing for your fencing club, academy, or competition</p>
                    </div>
                </div>

                <div class="container static-page-body">
                    <div class="quote-layout">
                        <div class="card quote-form-card">
                            <div class="quote-form-header">
                                <h2>Request a Quote</h2>
                                <p class="muted">Fill in the details below and our team will get back to you within 1 business day with a custom quote.</p>
                            </div>

                            <form class="form" id="quote-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Club / Organization Name <span class="required-mark">*</span></label>
                                        <input type="text" name="club_name" required placeholder="e.g., Mumbai Fencing Academy">
                                    </div>
                                    <div class="form-group">
                                        <label>Contact Person <span class="required-mark">*</span></label>
                                        <input type="text" name="contact_name" required placeholder="Full name">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Email <span class="required-mark">*</span></label>
                                        <input type="email" name="email" required placeholder="you@club.com">
                                    </div>
                                    <div class="form-group">
                                        <label>Phone <span class="required-mark">*</span></label>
                                        <input type="tel" name="phone" required placeholder="+91 98765 43210">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>City / State</label>
                                        <input type="text" name="city" placeholder="e.g., Mumbai, Maharashtra">
                                    </div>
                                    <div class="form-group">
                                        <label>Number of Fencers</label>
                                        <select name="fencer_count">
                                            <option value="">Select range</option>
                                            <option value="1-10">1 – 10</option>
                                            <option value="11-25">11 – 25</option>
                                            <option value="26-50">26 – 50</option>
                                            <option value="51-100">51 – 100</option>
                                            <option value="100+">100+</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Equipment Needed <span class="required-mark">*</span></label>
                                    <textarea name="equipment" rows="5" required placeholder="List the equipment you need with approximate quantities.&#10;&#10;Example:&#10;• 20x Foil complete sets (mask, jacket, glove, weapon)&#10;• 10x Épée body cords&#10;• 5x Scoring apparatus"></textarea>
                                </div>

                                <div class="form-group">
                                    <label>Preferred Brands <span class="muted">(optional)</span></label>
                                    <input type="text" name="brands" placeholder="e.g., Leon Paul, Allstar, PBT">
                                </div>

                                <div class="form-group">
                                    <label>Additional Notes <span class="muted">(optional)</span></label>
                                    <textarea name="notes" rows="3" placeholder="Any special requirements, budget constraints, or timeline needs?"></textarea>
                                </div>

                                <button type="submit" class="btn btn-primary btn-block btn-lg">Submit Quote Request</button>
                            </form>
                        </div>

                        <div class="quote-sidebar">
                            <div class="quote-benefit-card">
                                <div class="quote-benefit-icon">💰</div>
                                <h3>Bulk Discounts</h3>
                                <p>Get better pricing on large orders compared to individual purchases.</p>
                            </div>
                            <div class="quote-benefit-card">
                                <div class="quote-benefit-icon">🎯</div>
                                <h3>Custom Configurations</h3>
                                <p>We'll help you find the right equipment mix for your club's needs and skill levels.</p>
                            </div>
                            <div class="quote-benefit-card">
                                <div class="quote-benefit-icon">🤝</div>
                                <h3>Dedicated Support</h3>
                                <p>A dedicated account manager for your club's ongoing equipment needs.</p>
                            </div>
                            <div class="quote-benefit-card">
                                <div class="quote-benefit-icon">🚚</div>
                                <h3>Priority Shipping</h3>
                                <p>Consolidated shipping with priority handling for bulk orders.</p>
                            </div>

                            <div class="quote-help-box">
                                <h4>Need Help?</h4>
                                <p>Not sure what equipment you need? Contact us and we'll guide you.</p>
                                <a href="/contact" class="btn btn-outline btn-sm btn-block">Contact Us</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('quote-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Submitting...';
                btn.disabled = true;

                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    await API.quotes.create(data);

                    if (Utils && Utils.toast) {
                        Utils.toast("Quote request submitted! We'll contact you within 1 business day.", 'success');
                    }
                    form.reset();
                } catch (err) {
                    if (Utils && Utils.toast) {
                        Utils.toast(err.message || 'Failed to submit quote. Please try again.', 'error');
                    }
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
    }
};