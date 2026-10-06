const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutTemplate = sequelize.define('WorkoutTemplate', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  routineType: {
    type: DataTypes.ENUM('single', 'superset', 'circuit'),
    allowNull: false,
    defaultValue: 'single',
    field: 'routine_type',
  },
}, {
  tableName: 'workout_templates',
  timestamps: false,
});

module.exports = WorkoutTemplate;
