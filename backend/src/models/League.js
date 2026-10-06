const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const League = sequelize.define('League', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  seasonStart: { type: DataTypes.DATEONLY, allowNull: false, field: 'season_start' },
  seasonEnd: { type: DataTypes.DATEONLY, allowNull: false, field: 'season_end' },
}, {
  tableName: 'leagues',
  timestamps: false,
});

module.exports = League;
