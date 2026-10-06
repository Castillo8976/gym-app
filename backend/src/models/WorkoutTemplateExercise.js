const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutTemplateExercise = sequelize.define('WorkoutTemplateExercise', {
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'template_id',
  },
  exerciseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'exercise_id',
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetSets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target_sets',
  },
  targetReps: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target_reps',
  },
  targetWeightKg: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    field: 'target_weight_kg',
    defaultValue: 0,
  },
  restSeconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 90,
    field: 'rest_seconds',
  },
  grouping: {
    type: DataTypes.ENUM('main', 'paired', 'circuit'),
    allowNull: false,
    defaultValue: 'main',
  },
}, {
  tableName: 'workout_template_exercises',
  timestamps: false,
});

module.exports = WorkoutTemplateExercise;
