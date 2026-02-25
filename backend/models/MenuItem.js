const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MenuItem = sequelize.define('MenuItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('starters', 'pasta', 'pizza', 'mains', 'desserts', 'drinks'),
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
    },
    emoji: {
        type: DataTypes.STRING(10),
        defaultValue: '🍽️',
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
}, {
    tableName: 'menu_items',
    timestamps: true,
});

module.exports = MenuItem;
