const AuthPage = {
  renderLogin() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';

    const html = `
      <section class="auth-page fade-in">
        <div class="container narrow">
          <div class="auth-card">
            <div class="auth-header">
              <h1>Welcome Back</h1>
              <p>Login to your Fencing Supply account</p>
            </div>
            <form id="login-form" class="form">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••">
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                <span>Login</span>
              </button>
            </form>
            <div class="auth-footer">
              <p>Don't have an account? <a href="/register" data-link>Register here</a></p>
              <div class="demo-accounts">
                <p class="demo-title">Demo Accounts:</p>
                <small>Customer: customer@demo.com / demo123</small><br>
                <small>Supplier: supplier@demo.com / demo123</small><br>
                <small>Admin: admin@demo.com / demo123</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    document.getElementById('app-content').innerHTML = html;
    this.bindLogin(redirect);
  },

  bindLogin(redirect) {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      Utils.setButtonLoading(btn, true);

      try {
        const data = {
          email: form.email.value.trim(),
          password: form.password.value
        };
        const res = await API.post('/auth/login', data);
        if (res.user) {
          App.state.user = res.user;
          await App.loadCart();
          Components.renderHeader();
          Utils.toast('Welcome back, ' + res.user.name + '!', 'success');
          Router.navigate(redirect);
        }
      } catch (err) {
        Utils.toast(err.message || 'Login failed', 'error');
      } finally {
        Utils.setButtonLoading(btn, false);
      }
    });
  },

  renderRegister() {
    const html = `
      <section class="auth-page fade-in">
        <div class="container narrow">
          <div class="auth-card">
            <div class="auth-header">
              <h1>Create Account</h1>
              <p>Join Fencing Supply India</p>
            </div>
            <form id="register-form" class="form">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required autocomplete="name" placeholder="Your name">
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label for="phone">Phone (10 digits)</label>
                <input type="tel" id="phone" name="phone" required pattern="[0-9]{10}" placeholder="9876543210">
              </div>
              <div class="form-group">
                <label for="password">Password (min 6 chars)</label>
                <input type="password" id="password" name="password" required minlength="6" autocomplete="new-password">
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                <span>Create Account</span>
              </button>
            </form>
            <div class="auth-footer">
              <p>Already have an account? <a href="/login" data-link>Login here</a></p>
            </div>
          </div>
        </div>
      </section>
    `;

    document.getElementById('app-content').innerHTML = html;
    this.bindRegister();
  },

  bindRegister() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      Utils.setButtonLoading(btn, true);

      try {
        const data = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          password: form.password.value
        };
        const res = await API.post('/auth/register', data);
        if (res.user) {
          App.state.user = res.user;
          await App.loadCart();
          Components.renderHeader();
          Utils.toast('Account created successfully!', 'success');
          Router.navigate('/account');
        }
      } catch (err) {
        Utils.toast(err.message || 'Registration failed', 'error');
      } finally {
        Utils.setButtonLoading(btn, false);
      }
    });
  }
};