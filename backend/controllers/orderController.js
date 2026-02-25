const { Op, fn, col } = require('sequelize');
const Order = require('../models/Order');

// GET /api/orders
exports.getOrders = async (req, res) => {
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

// GET /api/orders/stats
exports.getStats = async (req, res) => {
    try {
        const [total, pending, paid, revenueResult] = await Promise.all([
            Order.count(),
            Order.count({ where: { status: 'pending' } }),
            Order.count({ where: { paid: true } }),
            Order.sum('total', { where: { paid: true } }),
        ]);
        res.json({ total, pending, paid, revenue: revenueResult || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
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
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        await order.destroy();
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
