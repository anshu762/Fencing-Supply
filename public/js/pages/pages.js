const StaticPages = {
    init(page) {
        const container = document.getElementById('app-content');
        if (!container) return;

        switch(page) {
            case 'about': this.about(container); break;
            case 'contact': this.contact(container); break;
            case 'terms': this.terms(container); break;
            case 'privacy': this.privacy(container); break;
            case 'shipping': this.shipping(container); break;
            case 'returns': this.returns(container); break;
            default: this.notFound(container);
        }
    },

    about(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page about-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>About</span>
                        </div>
                        <h1>About Fencing Supply</h1>
                        <p>India's first dedicated fencing equipment marketplace</p>
                    </div>
                </div>

                <div class="container static-page-body">
                    <div class="card about-hero-card">
                        <div class="about-hero-icon">🤺</div>
                        <h2>Our Mission</h2>
                        <p>Fencing Supply was created to solve a real problem: Indian fencers struggle to find quality equipment at fair prices. Most fencers rely on importing gear at high costs or settling for subpar local alternatives.</p>
                        <p>We connect fencers directly with verified suppliers, ensuring authentic products, competitive pricing, and reliable delivery across India.</p>
                    </div>

                    <div class="card">
                        <h2>What We Offer</h2>
                        <div class="about-features-grid">
                            <div class="about-feature-item">
                                <div class="about-feature-icon">🤺</div>
                                <div class="about-feature-body">
                                    <h3>All Weapons</h3>
                                    <p>Foil, Épée, and Sabre equipment from top international brands like Leon Paul, Allstar, PBT, and Uhlmann.</p>
                                </div>
                            </div>
                            <div class="about-feature-item">
                                <div class="about-feature-icon">🛡️</div>
                                <div class="about-feature-body">
                                    <h3>Protective Gear</h3>
                                    <p>FIE-certified masks, jackets, plastrons, breeches, and gloves for all weapon disciplines.</p>
                                </div>
                            </div>
                            <div class="about-feature-item">
                                <div class="about-feature-icon">⚡</div>
                                <div class="about-feature-body">
                                    <h3>Electrical Equipment</h3>
                                    <p>Body cords, reels, scoring apparatus, floor cords, and all electrical accessories.</p>
                                </div>
                            </div>
                            <div class="about-feature-item">
                                <div class="about-feature-icon">🚚</div>
                                <div class="about-feature-body">
                                    <h3>Pan-India Delivery</h3>
                                    <p>Fast, reliable shipping to all major cities and towns across India with real-time tracking.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="about-stats-row">
                        <div class="about-stat">
                            <div class="about-stat-number">14+</div>
                            <div class="about-stat-label">Products</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-number">7</div>
                            <div class="about-stat-label">Categories</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-number">20+</div>
                            <div class="about-stat-label">PIN Codes</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-number">4</div>
                            <div class="about-stat-label">Top Brands</div>
                        </div>
                    </div>

                    <div class="card about-cta-card">
                        <div class="about-cta-content">
                            <div>
                                <h2>For Clubs & Academies</h2>
                                <p>We offer special bulk pricing and custom quotes for fencing clubs, academies, and competition organizers. Whether you need 10 sets or 100, we'll work with you to get the best deal.</p>
                            </div>
                            <a href="/quote" class="btn btn-primary btn-lg">Request a Club Quote →</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

     contact(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page contact-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Contact</span>
                        </div>
                        <h1>Contact Us</h1>
                        <p>We'd love to hear from you — reach out anytime</p>
                    </div>
                </div>

                <div class="container static-page-body">
                    <div class="contact-layout">
                        <div class="card contact-form-card">
                            <h2>Send us a Message</h2>
                            <p class="muted contact-form-subtitle">Fill out the form and we'll get back to you within 24 hours.</p>
                            <form class="form" id="contact-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Your Name <span class="required-mark">*</span></label>
                                        <input type="text" name="name" required placeholder="Full name">
                                    </div>
                                    <div class="form-group">
                                        <label>Email Address <span class="required-mark">*</span></label>
                                        <input type="email" name="email" required placeholder="you@example.com">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Subject <span class="required-mark">*</span></label>
                                    <select name="subject" required>
                                        <option value="">Select a topic</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Support</option>
                                        <option value="supplier">Supplier Partnership</option>
                                        <option value="club">Club / Bulk Order</option>
                                        <option value="feedback">Feedback</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Message <span class="required-mark">*</span></label>
                                    <textarea name="message" rows="5" required placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block btn-lg">Send Message</button>
                            </form>
                        </div>

                        <div class="contact-info-column">
                            <div class="contact-info-card">
                                <div class="contact-info-icon">📧</div>
                                <div class="contact-info-body">
                                    <div class="contact-info-label">Email</div>
                                    <div class="contact-info-value">support@fencingsupply.in</div>
                                    <div class="contact-info-sub">We respond within 24 hours</div>
                                </div>
                            </div>
                            <div class="contact-info-card">
                                <div class="contact-info-icon">📞</div>
                                <div class="contact-info-body">
                                    <div class="contact-info-label">Phone</div>
                                    <div class="contact-info-value">+91 98765 43210</div>
                                    <div class="contact-info-sub">Mon–Sat, 10 AM – 7 PM IST</div>
                                </div>
                            </div>
                            <div class="contact-info-card">
                                <div class="contact-info-icon">📍</div>
                                <div class="contact-info-body">
                                    <div class="contact-info-label">Address</div>
                                    <div class="contact-info-value">Fencing Supply India<br>Mumbai, Maharashtra</div>
                                </div>
                            </div>
                            <div class="contact-info-card">
                                <div class="contact-info-icon">💬</div>
                                <div class="contact-info-body">
                                    <div class="contact-info-label">Support Ticket</div>
                                    <div class="contact-info-sub">For order-specific issues, use our support system for faster resolution.</div>
                                    <a href="/support" class="btn btn-outline btn-sm contact-info-btn">Open Ticket →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const orig = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;
                setTimeout(() => {
                    if (Utils && Utils.toast) {
                        Utils.toast("Message sent! We'll get back to you within 24 hours.", 'success');
                    }
                    form.reset();
                    btn.textContent = orig;
                    btn.disabled = false;
                }, 600);
            });
        }
    },

     terms(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Terms</span>
                        </div>
                        <h1>Terms of Service</h1>
                        <p>Last updated: January 2025</p>
                    </div>
                </div>
                <div class="container static-page-body">
                    <div class="card policy-content">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using Fencing Supply, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
                        <h2>2. User Accounts</h2>
                        <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
                        <h2>3. Orders & Payments</h2>
                        <p>All orders are subject to supplier confirmation. Prices are listed in Indian Rupees (₹) and include applicable GST. Payment must be completed within the specified window after supplier acceptance.</p>
                        <h2>4. Cancellations & Refunds</h2>
                        <p>Orders can be cancelled before supplier confirmation. After confirmation, our Returns & Refunds policy applies.</p>
                        <h2>5. Limitation of Liability</h2>
                        <p>Fencing Supply acts as a marketplace connecting buyers and suppliers. While we verify suppliers, we are not the manufacturer of products sold on the platform.</p>
                    </div>
                </div>
            </div>
        `;
    },

    privacy(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Privacy</span>
                        </div>
                        <h1>Privacy Policy</h1>
                        <p>Last updated: January 2025</p>
                    </div>
                </div>
                <div class="container static-page-body">
                    <div class="card policy-content">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly: name, email, phone number, shipping address, and order details.</p>
                        <h2>2. How We Use Your Information</h2>
                        <p>Your information is used to process orders, communicate about your purchases, and improve our services. We do not sell your personal data to third parties.</p>
                        <h2>3. Data Security</h2>
                        <p>We implement industry-standard security measures to protect your data, including encryption and secure payment processing.</p>
                        <h2>4. Cookies</h2>
                        <p>We use essential cookies for authentication and cart functionality. No third-party tracking cookies are used.</p>
                        <h2>5. Your Rights</h2>
                        <p>You can request access to, correction of, or deletion of your personal data by contacting us at privacy@fencingsupply.in.</p>
                    </div>
                </div>
            </div>
        `;
    },

    shipping(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Shipping</span>
                        </div>
                        <h1>Shipping Policy</h1>
                        <p>Delivery information for orders across India</p>
                    </div>
                </div>
                <div class="container static-page-body">
                    <div class="card policy-content">
                        <h2>Standard Delivery</h2>
                        <p>Most orders are delivered within 5–7 business days to metro cities and 7–10 business days to other locations.</p>
                        <h2>Shipping Charges</h2>
                        <p>A flat delivery fee of ₹150 applies to all orders. Free shipping may be available on orders above ₹5,000 during promotional periods.</p>
                        <h2>Order Processing</h2>
                        <p>After your payment is confirmed, the supplier has 1–2 business days to prepare and dispatch your order. You'll receive tracking information once shipped.</p>
                        <h2>Delivery Areas</h2>
                        <p>We currently deliver to all major PIN codes across India. Use the PIN code checker on the product page to verify delivery availability.</p>
                    </div>
                </div>
            </div>
        `;
    },

     returns(container) {
        container = container || document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = `
            <div class="static-page fade-in">
                <div class="page-header">
                    <div class="container page-header-content">
                        <div class="breadcrumb">
                            <a href="/">Home</a>
                            <span class="separator">›</span>
                            <span>Returns</span>
                        </div>
                        <h1>Returns & Refunds</h1>
                        <p>Our return and refund policy</p>
                    </div>
                </div>
                <div class="container static-page-body">
                    <div class="card policy-content">
                        <h2>Return Window</h2>
                        <p>You can initiate a return within 7 days of receiving your order. Items must be unused, in original packaging, and in resalable condition.</p>
                        <h2>Non-Returnable Items</h2>
                        <ul>
                            <li>Custom-sized or personalized equipment</li>
                            <li>Items marked as final sale</li>
                            <li>Used or damaged items (not due to manufacturing defect)</li>
                        </ul>
                        <h2>Refund Process</h2>
                        <p>Once your return is received and inspected, refunds are processed within 5–7 business days to the original payment method.</p>
                        <h2>Defective Items</h2>
                        <p>If you receive a defective or incorrect item, please raise a support ticket within 48 hours of delivery. We'll arrange a replacement or full refund.</p>
                    </div>
                </div>
            </div>
        `;
    },

     notFound(container) {
        container.innerHTML = `
            <div class="static-page fade-in">
                <div class="container">
                    <div class="empty-state-large" style="margin-top: 6rem;">
                        <div class="icon-xl">🔍</div>
                        <h1>Page Not Found</h1>
                        <p>The page you're looking for doesn't exist or has been moved.</p>
                        <a href="/" class="btn btn-primary btn-lg">Go Home</a>
                    </div>
                </div>
            </div>
        `;
    }
};