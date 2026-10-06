const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, field: 'birth_date' },
  bodyweightKg: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'bodyweight_kg' },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = User;
