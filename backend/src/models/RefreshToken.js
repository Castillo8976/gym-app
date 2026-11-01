const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
  replacedByTokenId: { type: DataTypes.INTEGER, field: 'replaced_by_token_id' },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = RefreshToken;
