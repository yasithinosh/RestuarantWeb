/* ─────────────────────────────────────────
   db.js – Sequelize (PostgreSQL) instance
───────────────────────────────────────── */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'labellacucina',
    process.env.DB_USER || 'labella',
    process.env.DB_PASS || 'labella_secret',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,          // Set to console.log to see SQL queries
    }
);

module.exports = sequelize;
