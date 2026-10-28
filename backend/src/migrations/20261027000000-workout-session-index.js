async function up(queryInterface) {
  await queryInterface.addIndex('workout_sessions', ['user_id', 'session_date'], {
    name: 'workout_sessions_user_session_date_idx',
  });
}

async function down(queryInterface) {
  await queryInterface.removeIndex('workout_sessions', 'workout_sessions_user_session_date_idx');
}

module.exports = { up, down };
