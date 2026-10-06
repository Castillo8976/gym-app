const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeagueMember = sequelize.define('LeagueMember', {
  leagueId: { type: DataTypes.INTEGER, allowNull: false, field: 'league_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  totalVolumeKg: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'total_volume_kg' },
}, {
  tableName: 'league_members',
  timestamps: false,
});

module.exports = LeagueMember;
