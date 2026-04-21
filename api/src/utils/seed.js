const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

async function seedAdmin() {
    const name = 'Admin';
    const email = 'admin@mashhor-hub.com';
    const password = 'MashhorAdmin2026!'; // Change this after first login

    try {
        console.log('Seeding initial admin...');
        
        // Check if admin exists
        const [rows] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'superadmin']
        );

        console.log('--- ADMIN SEEDED SUCCESSFULLY ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
