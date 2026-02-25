const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// POST /api/payment/create-session
exports.createSession = async (req, res) => {
    try {
        const { items, customer, type, address, notes, orderId } = req.body;

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'zar',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/frontend/checkout.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/frontend/checkout.html?cancelled=true`,
            customer_email: customer.email,
            metadata: { orderId: orderId || '', type, address: address || '' },
        });

        res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/payment/webhook
exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { orderId } = session.metadata;
        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                paid: true,
                stripeSessionId: session.id,
                status: 'confirmed',
            });
        }
    }

    res.json({ received: true });
};
