const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT
const protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
    try {
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ error: 'User not found' });
        next();
    } catch {
        res.status(401).json({ error: 'Token invalid or expired' });
    }
};

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    res.status(403).json({ error: 'Admin access required' });
};

// Admin or Staff
const staffOrAdmin = (req, res, next) => {
    if (req.user && ['admin', 'staff'].includes(req.user.role)) return next();
    res.status(403).json({ error: 'Staff access required' });
};

module.exports = { protect, adminOnly, staffOrAdmin };
