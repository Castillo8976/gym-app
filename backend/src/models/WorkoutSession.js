const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSession = sequelize.define('WorkoutSession', {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  sessionDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'session_date' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'workout_sessions',
  timestamps: false,
});

module.exports = WorkoutSession;
