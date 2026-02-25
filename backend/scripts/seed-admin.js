/* ─────────────────────────────────────────────────────
   seed-admin.js  –  Run once to create the admin account
   Usage:  node backend/scripts/seed-admin.js
           npm run seed
───────────────────────────────────────────────────── */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const sequelize = require('../db');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@labellacucina.co.za';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

(async () => {
    try {
        // Connect + sync schema
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Connected to PostgreSQL');

        // Check if admin already exists
        const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });

        if (existing) {
            if (existing.role !== 'admin') {
                await existing.update({ role: 'admin', isActive: true });
                console.log(`✏️  Existing user "${ADMIN_EMAIL}" promoted to admin.`);
            } else {
                console.log(`ℹ️  Admin "${ADMIN_EMAIL}" already exists. Nothing changed.`);
            }
        } else {
            await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,   // hashed by beforeCreate hook
                role: 'admin',
                isActive: true,
            });
            console.log(`✅ Admin account created!`);
        }

        console.log('');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│         Admin Login Credentials         │');
        console.log('├─────────────────────────────────────────┤');
        console.log(`│  Email   : ${ADMIN_EMAIL.padEnd(29)} │`);
        console.log(`│  Password: ${ADMIN_PASSWORD.padEnd(29)} │`);
        console.log('└─────────────────────────────────────────┘');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
})();
