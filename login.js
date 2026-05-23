/* =========================================
   HEA — Login Page Logic
   login.js
   ========================================= */

// Role badge selection
const badges = document.querySelectorAll('#roleBadges .badge');
badges.forEach(badge => {
  badge.addEventListener('click', () => {
    badges.forEach(b => b.classList.remove('active'));
    badge.classList.add('active');
  });
});

// Password show/hide toggle
const pwInput = document.getElementById('password');
const pwToggle = document.getElementById('pwToggle');
const eyeIcon = document.getElementById('eyeIcon');

let showPassword = false;

pwToggle.addEventListener('click', () => {
  showPassword = !showPassword;
  pwInput.type = showPassword ? 'text' : 'password';
  pwToggle.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');

  // Swap icon between eye and eye-off
  eyeIcon.innerHTML = showPassword
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
});

// Form validation + submit
document.getElementById('loginBtn').addEventListener('click', handleLogin);

document.getElementById('email').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const emailErr = document.getElementById('emailErr');
  const pwErr = document.getElementById('pwErr');

  let valid = true;

  // Reset errors
  emailErr.classList.remove('visible');
  pwErr.classList.remove('visible');

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    emailErr.classList.add('visible');
    valid = false;
  }

  // Validate password
  if (!password) {
    pwErr.classList.add('visible');
    valid = false;
  }

  if (!valid) return;

  const role = document.querySelector('#roleBadges .badge.active').dataset.role;

  // TODO: Replace with actual API call to your backend
  console.log('Login attempt:', { email, role });

  // Redirect based on role
  switch (role) {
    case 'patient':
      window.location.href = 'patients/records.html';
      break;
    case 'doctor':
      window.location.href = 'appointments/appointments.html';
      break;
    case 'admin':
      window.location.href = 'dashboard/dashboard.html';
      break;
    default:
      window.location.href = 'index.html';
  }
}
