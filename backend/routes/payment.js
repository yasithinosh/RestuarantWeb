const express = require('express');
const router = express.Router();
const { createSession, webhook } = require('../controllers/paymentController');

// Stripe webhook requires raw body
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    req.rawBody = req.body;
    next();
}, webhook);

router.post('/create-session', createSession);

module.exports = router;
