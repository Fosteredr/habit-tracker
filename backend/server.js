const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Базові мідлвари
app.use(express.json());

// Дозволені origin-адреси
const allowedOrigins = [
  'http://localhost:5173', // локальна розробка
  process.env.FRONTEND_URL, // frontend у Vercel
].filter(Boolean);

// Налаштування CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Дозволяємо запити без origin (наприклад, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

// CORS має бути ДО маршрутів
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Маршрути API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));

// Перевірка працездатності сервера
app.get('/', (req, res) => {
  res.json({ message: 'API сервера системи самоменеджменту працює.' });
});

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Внутрішня помилка сервера',
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habit_tracker_db';

// Підключення до MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Успішне підключення до MongoDB'))
  .catch((err) => console.error('Помилка підключення до бази даних:', err));

// Локальний запуск
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
  });
}

module.exports = app;
