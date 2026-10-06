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
    onDelete: 'CASCADE',
  });

  await queryInterface.createTable('workout_templates', {
    id: id(),
    user_id: reference('users'),
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    routine_type: {
      type: DataTypes.ENUM('single', 'superset', 'circuit'),
      allowNull: false,
      defaultValue: 'single',
    },
  });

  await queryInterface.addConstraint('workout_templates', {
    fields: ['user_id', 'name'],
    type: 'unique',
    name: 'workout_templates_user_name_unique',
  });

  await queryInterface.createTable('workout_template_exercises', {
    id: id(),
    template_id: reference('workout_templates'),
    exercise_id: reference('exercises'),
    position: { type: DataTypes.INTEGER, allowNull: false },
    target_sets: { type: DataTypes.INTEGER, allowNull: false },
    target_reps: { type: DataTypes.INTEGER, allowNull: false },
    target_weight_kg: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
    rest_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 90 },
    grouping: {
      type: DataTypes.ENUM('main', 'paired', 'circuit'),
      allowNull: false,
      defaultValue: 'main',
    },
  });

  await queryInterface.addIndex('workout_template_exercises', ['template_id', 'position']);
}

module.exports = { up };
