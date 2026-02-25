const MenuItem = require('../models/MenuItem');

// GET /api/menu
exports.getAll = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category, available: true } : { available: true };
        const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/menu/all  (admin – includes unavailable)
exports.getAllAdmin = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/menu/:id
exports.getOne = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/menu  (admin)
exports.create = async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// PUT /api/menu/:id  (admin)
exports.update = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// DELETE /api/menu/:id  (admin)
exports.remove = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
