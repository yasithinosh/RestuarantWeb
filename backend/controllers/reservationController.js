const { Op } = require('sequelize');
const Reservation = require('../models/Reservation');

// GET /api/reservations  (admin/staff)
exports.getAll = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.date) where.date = req.query.date;
        if (req.query.search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${req.query.search}%` } },
                { email: { [Op.iLike]: `%${req.query.search}%` } },
            ];
        }
        const reservations = await Reservation.findAll({
            where,
            order: [['date', 'DESC'], ['time', 'ASC']],
        });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/reservations/mine  (customer – own reservations)
exports.getMine = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            where: { email: req.user.email },
            order: [['date', 'DESC']],
        });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/reservations/stats
exports.stats = async (req, res) => {
    try {
        const [total, pending, confirmed, cancelled] = await Promise.all([
            Reservation.count(),
            Reservation.count({ where: { status: 'pending' } }),
            Reservation.count({ where: { status: 'confirmed' } }),
            Reservation.count({ where: { status: 'cancelled' } }),
        ]);
        res.json({ total, pending, confirmed, cancelled });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/reservations  (public)
exports.create = async (req, res) => {
    try {
        const reservation = await Reservation.create(req.body);
        res.status(201).json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/reservations/:id
exports.update = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
        await reservation.update(req.body);
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/reservations/:id
exports.remove = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
        await reservation.destroy();
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
