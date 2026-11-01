const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthToken = sequelize.define('AuthToken', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  purpose: { type: DataTypes.ENUM('email_verification', 'password_reset'), allowNull: false },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  consumedAt: { type: DataTypes.DATE, field: 'consumed_at' },
}, {
  tableName: 'auth_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuthToken;
