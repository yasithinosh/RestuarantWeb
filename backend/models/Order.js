const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // customer info stored as JSONB
    customer: {
        type: DataTypes.JSONB,
        allowNull: false,
        // shape: { name, email, phone, address }
    },
    // items array stored as JSONB
    items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        // shape: [{ id, name, price, quantity }]
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('dine-in', 'takeaway', 'delivery'),
        defaultValue: 'takeaway',
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    paymentId: {
        type: DataTypes.STRING,
    },
    notes: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'orders',
    timestamps: true,
});

module.exports = Order;
