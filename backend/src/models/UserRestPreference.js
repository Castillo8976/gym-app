const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRestPreference = sequelize.define('UserRestPreference', {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  defaultRestSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 90, field: 'default_rest_seconds' },
  defaultWarmupRestSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60, field: 'default_warmup_rest_seconds' },
}, {
  tableName: 'user_rest_preferences',
  timestamps: false,
});

module.exports = UserRestPreference;
