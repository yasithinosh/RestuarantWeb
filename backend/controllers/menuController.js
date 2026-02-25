const { Op } = require('sequelize');
const MenuItem = require('../models/MenuItem');

// GET /api/menu
exports.getMenu = async (req, res) => {
    try {
        const where = { isAvailable: true };
        if (req.query.category) where.category = req.query.category;
        const items = await MenuItem.findAll({ where, order: [['createdAt', 'ASC']] });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/menu/all  (admin)
exports.getAllMenu = async (req, res) => {
    try {
        const items = await MenuItem.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/menu
exports.createItem = async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/menu/:id
exports.updateItem = async (req, res) => {
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
exports.deleteItem = async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.destroy();
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
