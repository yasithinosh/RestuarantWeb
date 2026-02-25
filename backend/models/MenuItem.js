const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['starters', 'pasta', 'pizza', 'mains', 'desserts', 'drinks'] },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
