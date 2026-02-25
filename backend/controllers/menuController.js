const { Op } = require('sequelize');
const MenuItem = require('../models/MenuItem');

// GET /api/menu  (public – available only)
exports.getAll = async (req, res) => {
    try {
        const where = { isAvailable: true };
        if (req.query.category) where.category = req.query.category;
        const items = await MenuItem.findAll({ where, order: [['createdAt', 'ASC']] });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/menu/all  (admin – includes unavailable)
exports.getAllAdmin = async (req, res) => {
    try {
        const items = await MenuItem.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/menu/:id
exports.getOne = async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/menu
exports.create = async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/menu/:id
exports.update = async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.update(req.body);
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/menu/:id
exports.remove = async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.destroy();
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
