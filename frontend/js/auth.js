// ============================================
// HEA HEALTHCARE - AUTH JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Helper function to validate email strings locally before submission
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

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

        // Payload structure aligns directly with what the backend expects
        const result = await api.post('/auth/register', {
          name, 
          email, 
          password, 
          role
        });

        if (result.success) {
