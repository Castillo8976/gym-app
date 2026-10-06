const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StrengthStandard = sequelize.define('StrengthStandard', {
  exerciseId: { type: DataTypes.INTEGER, allowNull: false, field: 'exercise_id' },
  gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
  rankLevel: {
    type: DataTypes.ENUM('bronce', 'plata', 'oro', 'platino', 'diamante'),
    allowNull: false,
    field: 'rank_level',
  },
  bodyweightRatio: { type: DataTypes.DECIMAL(4, 2), allowNull: false, field: 'bodyweight_ratio' },
}, {
  tableName: 'strength_standards',
  timestamps: false,
});

module.exports = StrengthStandard;
