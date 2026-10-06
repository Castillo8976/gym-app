const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  muscleGroupId: { type: DataTypes.INTEGER, allowNull: false, field: 'muscle_group_id' },
  isAnchor: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_anchor' },
}, {
  tableName: 'exercises',
  timestamps: false,
});

module.exports = Exercise;
