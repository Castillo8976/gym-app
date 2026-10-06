require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { assertMigrationsApplied } = require('./migrate');

const PORT = process.env.PORT || 3000;
const EXAMPLE_JWT_SECRET = 'reemplaza_esto_por_un_secreto_aleatorio_de_al_menos_32_caracteres';

function assertSecurityConfiguration() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === EXAMPLE_JWT_SECRET) {
    throw new Error('Configura JWT_SECRET con un valor aleatorio de al menos 32 caracteres.');
  }
}

async function start() {
  try {
    assertSecurityConfiguration();
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    await assertMigrationsApplied();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

start();
