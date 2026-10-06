const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MuscleGroup = sequelize.define('MuscleGroup', {
  name: { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName: 'muscle_groups',
  timestamps: false,
});

module.exports = MuscleGroup;
