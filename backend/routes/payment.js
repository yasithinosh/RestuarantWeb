const express = require('express');
const router = express.Router();
const { generateHash, notify } = require('../controllers/paymentController');

// POST /api/payment/generate-hash  – frontend calls to get PayHere hash
router.post('/generate-hash', generateHash);

// POST /api/payment/notify  – PayHere server-to-server callback
router.post('/notify', notify);

module.exports = router;
