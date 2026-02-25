const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { isEmail: true },
    },
    phone: {
        type: DataTypes.STRING(20),
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
    },
    occasion: {
        type: DataTypes.STRING(100),
    },
    specialRequests: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending',
    },
}, {
    tableName: 'reservations',
    timestamps: true,
});

module.exports = Reservation;
