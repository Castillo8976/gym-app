const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSet = sequelize.define('WorkoutSet', {
  sessionId: { type: DataTypes.INTEGER, allowNull: false, field: 'session_id' },
  exerciseId: { type: DataTypes.INTEGER, allowNull: false, field: 'exercise_id' },
  weightKg: { type: DataTypes.DECIMAL(6, 2), allowNull: false, field: 'weight_kg' },
  reps: { type: DataTypes.INTEGER, allowNull: false },
  setOrder: { type: DataTypes.INTEGER, allowNull: false, field: 'set_order' },
  setType: {
    type: DataTypes.ENUM('warmup', 'normal', 'failure', 'drop_set'),
    allowNull: false,
    defaultValue: 'normal',
    field: 'set_type',
  },
  restSeconds: { type: DataTypes.INTEGER, allowNull: true, field: 'rest_seconds' },
  actualRestSeconds: { type: DataTypes.INTEGER, allowNull: true, field: 'actual_rest_seconds' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'workout_sets',
  timestamps: false,
});

module.exports = WorkoutSet;
