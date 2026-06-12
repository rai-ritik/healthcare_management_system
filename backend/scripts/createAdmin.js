const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('password', 10);

    await db.execute("DELETE FROM users WHERE email = 'admin@hea.com'");

    await db.execute(
      `INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 'admin', 1, NOW())`,
      ['Admin', 'User', 'admin@hea.com', hashedPassword]
    );

    console.log('');
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:    admin@hea.com');
    console.log('🔑 Password: password');
    console.log('🎭 Role:     admin');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
