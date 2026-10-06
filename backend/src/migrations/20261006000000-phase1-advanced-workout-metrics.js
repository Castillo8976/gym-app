async function up(queryInterface, Sequelize) {
  const { DataTypes } = Sequelize;

  await queryInterface.addColumn('workout_sets', 'set_type', {
    type: DataTypes.ENUM('warmup', 'normal', 'failure', 'drop_set'),
    allowNull: false,
    defaultValue: 'normal',
  }).catch(() => undefined);

  await queryInterface.addColumn('workout_sets', 'rest_seconds', {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  }).catch(() => undefined);

  await queryInterface.addColumn('workout_sets', 'actual_rest_seconds', {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  }).catch(() => undefined);

  await queryInterface.addColumn('workout_sets', 'notes', {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  }).catch(() => undefined);

  await queryInterface.createTable('user_rest_preferences', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    default_rest_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 90 },
    default_warmup_rest_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
  });

  await queryInterface.addConstraint('user_rest_preferences', {
    fields: ['user_id'],
    type: 'unique',
    name: 'user_rest_preferences_user_unique',
  }).catch(() => undefined);

  await queryInterface.createTable('exercise_plate_config', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    plate_kg: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  });

  await queryInterface.addConstraint('exercise_plate_config', {
    fields: ['user_id', 'plate_kg'],
    type: 'unique',
    name: 'exercise_plate_config_user_plate_unique',
  }).catch(() => undefined);
}

module.exports = { up };
