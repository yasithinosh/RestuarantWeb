const md5 = require('md5');

const SANDBOX = process.env.PAYHERE_SANDBOX !== 'false';
const PAYHERE_URL = SANDBOX
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout';

// POST /api/payment/generate-hash
// Generates the MD5 hash and returns data needed to build the PayHere checkout form.
exports.generateHash = (req, res) => {
    try {
        const { orderId, amount, currency = 'LKR' } = req.body;

        if (!orderId || !amount)
            return res.status(400).json({ error: 'orderId and amount are required' });

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_SECRET;

        if (!merchantId || !merchantSecret)
            return res.status(500).json({ error: 'PayHere credentials not configured' });

        // Hash: md5(merchantId + orderId + amount + currency + md5(secret).toUpperCase())
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const amountFormatted = parseFloat(amount).toFixed(2);
        const hash = md5(merchantId + orderId + amountFormatted + currency + hashedSecret).toUpperCase();

        res.json({ hash, merchantId, payhereUrl: PAYHERE_URL, currency, amountFormatted, sandbox: SANDBOX });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/payment/notify
// PayHere server-to-server webhook. Verifies the signature and marks the order as paid.
exports.notify = async (req, res) => {
    try {
        const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

        const merchantSecret = process.env.PAYHERE_SECRET;
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const localSig = md5(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        ).toUpperCase();

        if (localSig !== md5sig) {
            console.warn('PayHere notify: hash mismatch, possible spoofed request');
            return res.sendStatus(400);
        }

        // status_code 2 = successful payment
        if (status_code === '2') {
            const Order = require('../models/Order');
            await Order.update(
                { paid: true, paymentId: order_id, status: 'confirmed' },
                { where: { id: order_id } }
            );
            console.log('Payment confirmed for order', order_id);
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('PayHere notify error:', err.message);
        res.sendStatus(500);
    }
};
