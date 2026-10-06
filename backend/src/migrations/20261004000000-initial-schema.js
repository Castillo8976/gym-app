async function up(queryInterface, Sequelize) {
  const { DataTypes } = Sequelize;
  const id = () => ({
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  });
  const reference = (table) => ({
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: table, key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  });

  await queryInterface.createTable('users', {
    id: id(),
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: true },
    bodyweight_kg: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  await queryInterface.createTable('muscle_groups', {
    id: id(),
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  });

  await queryInterface.createTable('exercises', {
    id: id(),
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    muscle_group_id: reference('muscle_groups'),
    is_anchor: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });

  await queryInterface.createTable('strength_standards', {
    id: id(),
    exercise_id: reference('exercises'),
    gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
    rank_level: {
      type: DataTypes.ENUM('bronce', 'plata', 'oro', 'platino', 'diamante'),
      allowNull: false,
    },
    bodyweight_ratio: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
  });
  await queryInterface.addConstraint('strength_standards', {
    fields: ['exercise_id', 'gender', 'rank_level'],
    type: 'unique',
    name: 'strength_standards_exercise_gender_rank_unique',
  });

  await queryInterface.createTable('workout_sessions', {
    id: id(),
    user_id: reference('users'),
    session_date: { type: DataTypes.DATEONLY, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
  });

  await queryInterface.createTable('workout_sets', {
    id: id(),
    session_id: reference('workout_sessions'),
    exercise_id: reference('exercises'),
    weight_kg: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    reps: { type: DataTypes.INTEGER, allowNull: false },
    set_order: { type: DataTypes.INTEGER, allowNull: false },
  });

  await queryInterface.createTable('personal_records', {
    id: id(),
    user_id: reference('users'),
    exercise_id: reference('exercises'),
    estimated_1rm: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    achieved_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  await queryInterface.createTable('user_ranks', {
    id: id(),
    user_id: reference('users'),
    muscle_group_id: reference('muscle_groups'),
    current_rank: {
      type: DataTypes.ENUM('bronce', 'plata', 'oro', 'platino', 'diamante'),
      allowNull: false,
      defaultValue: 'bronce',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
  await queryInterface.addConstraint('user_ranks', {
    fields: ['user_id', 'muscle_group_id'],
    type: 'unique',
    name: 'user_ranks_user_group_unique',
  });

  await queryInterface.createTable('leagues', {
    id: id(),
    name: { type: DataTypes.STRING(100), allowNull: false },
    season_start: { type: DataTypes.DATEONLY, allowNull: false },
    season_end: { type: DataTypes.DATEONLY, allowNull: false },
  });

  await queryInterface.createTable('league_members', {
    id: id(),
    league_id: reference('leagues'),
    user_id: reference('users'),
    total_volume_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  });
  await queryInterface.addConstraint('league_members', {
    fields: ['league_id', 'user_id'],
    type: 'unique',
    name: 'league_members_league_user_unique',
  });
}

module.exports = { up };