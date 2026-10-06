const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRank = sequelize.define('UserRank', {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  muscleGroupId: { type: DataTypes.INTEGER, allowNull: false, field: 'muscle_group_id' },
  currentRank: {
    type: DataTypes.ENUM('bronce', 'plata', 'oro', 'platino', 'diamante'),
    allowNull: false,
    defaultValue: 'bronce',
    field: 'current_rank',
  },
}, {
  tableName: 'user_ranks',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = UserRank;
