require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { DataTypes, QueryTypes } = require('sequelize');
const { sequelize } = require('./models');

const migrationsDirectory = path.join(__dirname, 'migrations');

function getMigrationFiles() {
  return fs.readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith('.js'))
    .sort();
}

async function ensureMigrationTable(queryInterface) {
  if (await queryInterface.tableExists('SequelizeMeta')) return;

  await queryInterface.createTable('SequelizeMeta', {
    name: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
  });
}

async function assertMigrationsApplied() {
  const queryInterface = sequelize.getQueryInterface();
  if (!(await queryInterface.tableExists('SequelizeMeta'))) {
    throw new Error('Falta el esquema. Ejecuta "npm run db:migrate" antes de iniciar el servidor.');
  }

  const applied = await sequelize.query('SELECT name FROM SequelizeMeta', { type: QueryTypes.SELECT });
  const appliedNames = new Set(applied.map((row) => row.name));
  const pending = getMigrationFiles().filter((fileName) => !appliedNames.has(fileName));
  if (pending.length > 0) {
    throw new Error(`Hay migraciones pendientes. Ejecuta "npm run db:migrate": ${pending.join(', ')}`);
  }
}

async function runMigrations() {
  const queryInterface = sequelize.getQueryInterface();
  await ensureMigrationTable(queryInterface);

  const applied = await sequelize.query('SELECT name FROM SequelizeMeta', { type: QueryTypes.SELECT });
  const appliedNames = new Set(applied.map((row) => row.name));

  for (const fileName of getMigrationFiles()) {
    if (appliedNames.has(fileName)) continue;

    const migration = require(path.join(migrationsDirectory, fileName));
    await migration.up(queryInterface, require('sequelize'));
    await queryInterface.bulkInsert('SequelizeMeta', [{ name: fileName }]);
    console.log(`Migración aplicada: ${fileName}`);
  }
}

if (require.main === module) {
  runMigrations()
    .catch((err) => {
      console.error('No se pudieron aplicar las migraciones:', err.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await sequelize.close();
    });
}

module.exports = { assertMigrationsApplied, runMigrations };