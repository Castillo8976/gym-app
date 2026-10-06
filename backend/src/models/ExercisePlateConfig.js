const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExercisePlateConfig = sequelize.define('ExercisePlateConfig', {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  plateKg: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'plate_kg' },
}, {
  tableName: 'exercise_plate_config',
  timestamps: false,
});

module.exports = ExercisePlateConfig;
