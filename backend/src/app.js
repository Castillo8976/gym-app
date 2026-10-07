require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutSessionRoutes = require('./routes/workoutSessionRoutes');
const routineRoutes = require('./routes/routineRoutes');
const leagueRoutes = require('./routes/leagueRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-sessions', workoutSessionRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/leagues', leagueRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'offline', message: error.message });
  }
});

// Manejador de errores centralizado — todas las respuestas de error
// siguen el formato definido en 04-api-endpoints.md
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error({ status, error: err.name || 'Error' });
  res.status(status).json({
    error: true,
    message: status >= 500 ? 'Error interno del servidor' : err.message,
  });
});

module.exports = app;
