async function up(queryInterface, Sequelize) {
  const { DataTypes } = Sequelize;
  await queryInterface.addColumn('users', 'email_verified_at', { type: DataTypes.DATE, allowNull: true });
  await queryInterface.createTable('refresh_tokens', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
    replaced_by_token_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });
  await queryInterface.createTable('auth_tokens', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    purpose: { type: DataTypes.ENUM('email_verification', 'password_reset'), allowNull: false },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    consumed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });
  await queryInterface.addIndex('auth_tokens', ['user_id', 'purpose']);
}

module.exports = { up };
