const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Name, email and password are required' });

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const user = await User.create({ name, email, password });
        const token = signToken(user.id);

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });

        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.isActive)
            return res.status(403).json({ error: 'Account is deactivated' });

        const token = signToken(user.id);
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/users  (admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/auth/users/:id  (admin)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const allowed = ['name', 'role', 'isActive'];
        allowed.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
        await user.save();

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
