require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

// Import models so Sequelize registers them before sync
require('./models/User');
require('./models/MenuItem');
require('./models/Reservation');
require('./models/Order');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ── Database + Start ────────────────────────────────────────
sequelize
    .sync({ alter: true })   // auto-create/update tables
    .then(() => {
        console.log('✅ PostgreSQL connected & tables synced');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ PostgreSQL connection error:', err.message);
        process.exit(1);
    });
