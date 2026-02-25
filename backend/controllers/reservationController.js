const Reservation = require('../models/Reservation');

// POST /api/reservations
exports.create = async (req, res) => {
    try {
        const reservation = await Reservation.create({ ...req.body, userId: req.user?._id || null });
        res.status(201).json(reservation);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// GET /api/reservations  (staff/admin)
exports.getAll = async (req, res) => {
    try {
        const { status, date } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (date) {
            const d = new Date(date);
            filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
        }
        const reservations = await Reservation.find(filter).sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reservations/mine  (authenticated user)
exports.getMine = async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.user._id }).sort({ date: - 1 });
        res.json(reservations);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT /api/reservations/:id  (staff/admin)
exports.update = async (req, res) => {
    try {
        const r = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!r) return res.status(404).json({ error: 'Reservation not found' });
        res.json(r);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// DELETE /api/reservations/:id  (admin)
exports.remove = async (req, res) => {
    try {
        const r = await Reservation.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ error: 'Reservation not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reservations/stats  (admin)
exports.stats = async (req, res) => {
    try {
        const total = await Reservation.countDocuments();
        const pending = await Reservation.countDocuments({ status: 'pending' });
        const confirmed = await Reservation.countDocuments({ status: 'confirmed' });
        const cancelled = await Reservation.countDocuments({ status: 'cancelled' });
        res.json({ total, pending, confirmed, cancelled });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
