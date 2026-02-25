const Order = require('../models/Order');

// POST /api/orders
exports.create = async (req, res) => {
    try {
        const order = await Order.create({ ...req.body, userId: req.user?._id || null });
        res.status(201).json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// GET /api/orders  (staff/admin)
exports.getAll = async (req, res) => {
    try {
        const { status, type } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/mine  (authenticated user)
exports.getMine = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/:id
exports.getOne = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT /api/orders/:id  (staff/admin)
exports.update = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// DELETE /api/orders/:id  (admin)
exports.remove = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/stats  (admin)
exports.stats = async (req, res) => {
    try {
        const total = await Order.countDocuments();
        const pending = await Order.countDocuments({ status: 'pending' });
        const paid = await Order.countDocuments({ paid: true });
        const revenue = await Order.aggregate([
            { $match: { paid: true } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        res.json({ total, pending, paid, revenue: revenue[0]?.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
