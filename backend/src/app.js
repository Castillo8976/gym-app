require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutSessionRoutes = require('./routes/workoutSessionRoutes');
const routineRoutes = require('./routes/routineRoutes');
const leagueRoutes = require('./routes/leagueRoutes');

const app = express();

function parseCsvEnv(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const allowedOrigins = new Set(parseCsvEnv(process.env.CORS_ALLOWED_ORIGINS));

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('Origen no permitido por CORS');
    error.status = 403;
    return callback(error);
  },
}));
app.use(express.json());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  },
});

app.use('/api/auth', authRateLimiter, authRoutes);
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
    res.status(503).json({ ok: false, database: 'offline' });
  }
});

// Manejador de errores centralizado — todas las respuestas de error
// siguen el formato definido en 04-api-endpoints.md
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error({
      status,
      error: err.name || 'Error',
      message: err.message,
      stack: err.stack,
    });
  }
  res.status(status).json({
    error: true,
    message: status >= 500 ? 'Error interno del servidor' : err.message,
  });
});

module.exports = app;
