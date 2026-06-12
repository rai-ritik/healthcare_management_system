// ============================================
// HEA HEALTHCARE - AUTH JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // LOGIN FORM
  // ============================================
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // Redirect if already logged in
    auth.redirectIfLoggedIn();

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      ui.clearAlert();

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Validation
      if (!email || !password) {
        ui.showAlert('Please fill in all fields', 'error');
        return;
      }

      if (!validateEmail(email)) {
        ui.showAlert('Please enter a valid email address', 'error');
        return;
      }

      try {
        ui.setLoading('login-btn', true);

        const result = await api.post('/auth/login', { email, password });

        if (result.success) {
          // Save session
          auth.setSession(result.token, result.user);
          ui.showAlert('Login successful! Redirecting...', 'success');

          // Redirect based on role
          setTimeout(() => {
            auth.redirectByRole(result.user.role);
          }, 800);
        }

      } catch (error) {
        ui.showAlert(error.message || 'Login failed. Check your credentials.', 'error');
      } finally {
        ui.setLoading('login-btn', false);
      }
    });

    // Password toggle
    const pwdToggle = document.getElementById('pwd-toggle');
    if (pwdToggle) {
      pwdToggle.addEventListener('click', () => {
        const pwdInput = document.getElementById('password');
        const isText = pwdInput.type === 'text';
        pwdInput.type = isText ? 'password' : 'text';
        pwdToggle.textContent = isText ? '👁️' : '🙈';
      });
    }
  }

  // ============================================
  // REGISTER FORM
  // ============================================
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    auth.redirectIfLoggedIn();

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      ui.clearAlert();

      const name      = document.getElementById('name').value.trim();
      const email     = document.getElementById('email').value.trim();
      const password  = document.getElementById('password').value;
      const confirm   = document.getElementById('confirm-password').value;
      const role      = document.getElementById('role').value;

      // Validations
      if (!name || !email || !password || !confirm || !role) {
        ui.showAlert('Please fill in all required fields', 'error');
        return;
      }

      if (!validateEmail(email)) {
        ui.showAlert('Please enter a valid email address', 'error');
        return;
      }

      if (password.length < 6) {
        ui.showAlert('Password must be at least 6 characters', 'error');
        return;
      }

      if (password !== confirm) {
        ui.showAlert('Passwords do not match', 'error');
        return;
      }

      try {
        ui.setLoading('register-btn', true);

        const result = await api.post('/auth/register', {
          name, email, password, role
        });

        if (result.success) {
          auth.setSession(result.token, result.user);
          ui.showAlert('Account created! Redirecting to dashboard...', 'success');

          setTimeout(() => {
            auth.redirectByRole(result.user.role);
          }, 1000);
        }

      } catch (error) {
        ui.showAlert(error.message || 'Registration failed. Try again.', 'error');
      } finally {
        ui.setLoading('register-btn', false);
      }
    });

    // Password strength indicator
    const pwdInput = document.getElementById('password');
    const strengthBar = document.getElementById('pwd-strength');

    if (pwdInput && strengthBar) {
      pwdInput.addEventListener('input', () => {
        const val = pwdInput.value;
        let strength = 0;

        if (val.length >= 6)  strength++;
        if (val.length >= 10) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val)) strength++;

        const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#059669'];

        strengthBar.textContent = levels[strength] || '';
        strengthBar.style.color = colors[strength] || '';
      });
    }
  }

  // ============================================
  // LOGOUT BUTTON (on any page)
  // ============================================
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // Silent fail - still logout
      } finally {
        auth.logout();
      }
    });
  }

  // ============================================
  // CHANGE PASSWORD FORM
  // ============================================
  const changePwdForm = document.getElementById('change-password-form');
  if (changePwdForm) {
    changePwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPwd = document.getElementById('current-password').value;
      const newPwd     = document.getElementById('new-password').value;
      const confirmPwd = document.getElementById('confirm-new-password').value;

      if (!currentPwd || !newPwd || !confirmPwd) {
        ui.showAlert('Please fill in all fields', 'error');
        return;
      }

      if (newPwd.length < 6) {
        ui.showAlert('New password must be at least 6 characters', 'error');
        return;
      }

      if (newPwd !== confirmPwd) {
        ui.showAlert('New passwords do not match', 'error');
        return;
      }

      try {
        ui.setLoading('change-pwd-btn', true);

        const result = await api.post('/auth/change-password', {
          currentPassword: currentPwd,
          newPassword: newPwd
        });

        ui.showAlert('Password changed successfully!', 'success');
        changePwdForm.reset();

      } catch (error) {
        ui.showAlert(error.message || 'Failed to change password', 'error');
      } finally {
        ui.setLoading('change-pwd-btn', false);
      }
    });
  }
});