const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
    },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    type: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'takeaway' },
    status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
    paid: { type: Boolean, default: false },
    stripeSessionId: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
