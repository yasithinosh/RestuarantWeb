const { Op } = require('sequelize');
const Order = require('../models/Order');

// GET /api/orders (admin/staff)
exports.getAll = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.type) where.type = req.query.type;
        const orders = await Order.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/orders/mine (authenticated customer)
exports.getMine = async (req, res) => {
    try {
        const all = await Order.findAll({ order: [['createdAt', 'DESC']] });
        const mine = all.filter(o => o.customer && o.customer.email === req.user.email);
        res.json(mine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/orders/stats
exports.stats = async (req, res) => {
    try {
        const [total, pending, paid, revenue] = await Promise.all([
            Order.count(),
            Order.count({ where: { status: 'pending' } }),
            Order.count({ where: { paid: true } }),
            Order.sum('total', { where: { paid: true } }),
        ]);
        res.json({ total, pending, paid, revenue: revenue || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/orders/:id
exports.getOne = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/orders (public)
exports.create = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/orders/:id
exports.update = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        await order.update(req.body);
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/orders/:id
exports.remove = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        await order.destroy();
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/orders/:id/confirm-payment (public)
// Called by the frontend after PayHere redirects back. Marks the order as paid.
// In production, rely on the PayHere server webhook (/api/payment/notify) instead.
exports.confirmPayment = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (!order.paid) {
            await order.update({
                paid: true,
                status: 'confirmed',
                paymentId: req.body.paymentId || req.params.id,
            });
            console.log('Payment confirmed for order', req.params.id);
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
