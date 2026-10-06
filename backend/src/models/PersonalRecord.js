const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PersonalRecord = sequelize.define('PersonalRecord', {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  exerciseId: { type: DataTypes.INTEGER, allowNull: false, field: 'exercise_id' },
  estimated1rm: { type: DataTypes.DECIMAL(6, 2), allowNull: false, field: 'estimated_1rm' },
}, {
  tableName: 'personal_records',
  timestamps: true,
  createdAt: 'achieved_at',
  updatedAt: false,
});

module.exports = PersonalRecord;
