const sequelize = require('../config/database');
const User = require('./User');
const MuscleGroup = require('./MuscleGroup');
const Exercise = require('./Exercise');
const StrengthStandard = require('./StrengthStandard');
const WorkoutSession = require('./WorkoutSession');
const WorkoutSet = require('./WorkoutSet');
const PersonalRecord = require('./PersonalRecord');
const UserRank = require('./UserRank');
const UserRestPreference = require('./UserRestPreference');
const ExercisePlateConfig = require('./ExercisePlateConfig');
const WorkoutTemplate = require('./WorkoutTemplate');
const WorkoutTemplateExercise = require('./WorkoutTemplateExercise');
const League = require('./League');
const LeagueMember = require('./LeagueMember');

// Relaciones — reflejan las FOREIGN KEY del esquema en 03-modelo-de-datos.md

MuscleGroup.hasMany(Exercise, { foreignKey: 'muscleGroupId' });
Exercise.belongsTo(MuscleGroup, { foreignKey: 'muscleGroupId' });

Exercise.hasMany(StrengthStandard, { foreignKey: 'exerciseId' });
StrengthStandard.belongsTo(Exercise, { foreignKey: 'exerciseId' });

User.hasMany(WorkoutSession, { foreignKey: 'userId' });
WorkoutSession.belongsTo(User, { foreignKey: 'userId' });

WorkoutSession.hasMany(WorkoutSet, { foreignKey: 'sessionId' });
WorkoutSet.belongsTo(WorkoutSession, { foreignKey: 'sessionId' });

Exercise.hasMany(WorkoutSet, { foreignKey: 'exerciseId' });
WorkoutSet.belongsTo(Exercise, { foreignKey: 'exerciseId' });

User.hasMany(PersonalRecord, { foreignKey: 'userId' });
PersonalRecord.belongsTo(User, { foreignKey: 'userId' });

Exercise.hasMany(PersonalRecord, { foreignKey: 'exerciseId' });
PersonalRecord.belongsTo(Exercise, { foreignKey: 'exerciseId' });

User.hasMany(UserRank, { foreignKey: 'userId' });
UserRank.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserRestPreference, { foreignKey: 'userId' });
UserRestPreference.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ExercisePlateConfig, { foreignKey: 'userId' });
ExercisePlateConfig.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WorkoutTemplate, { foreignKey: 'userId' });
WorkoutTemplate.belongsTo(User, { foreignKey: 'userId' });

WorkoutTemplate.hasMany(WorkoutTemplateExercise, { foreignKey: 'templateId' });
WorkoutTemplateExercise.belongsTo(WorkoutTemplate, { foreignKey: 'templateId' });

Exercise.hasMany(WorkoutTemplateExercise, { foreignKey: 'exerciseId' });
WorkoutTemplateExercise.belongsTo(Exercise, { foreignKey: 'exerciseId' });

MuscleGroup.hasMany(UserRank, { foreignKey: 'muscleGroupId' });
UserRank.belongsTo(MuscleGroup, { foreignKey: 'muscleGroupId' });

League.hasMany(LeagueMember, { foreignKey: 'leagueId' });
LeagueMember.belongsTo(League, { foreignKey: 'leagueId' });

User.hasMany(LeagueMember, { foreignKey: 'userId' });
LeagueMember.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  MuscleGroup,
  Exercise,
  StrengthStandard,
  WorkoutSession,
  WorkoutSet,
  PersonalRecord,
  UserRank,
  UserRestPreference,
  ExercisePlateConfig,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  League,
  LeagueMember,
};
