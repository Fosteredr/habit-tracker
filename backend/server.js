const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Простий CORS без кастомних перевірок origin
// Це найстабільніший варіант для перевірки, чи проблема саме в CORS
app.use(cors());

// JSON-body parser
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));

// Базовий маршрут для перевірки працездатності
app.get('/', (req, res) => {
  res.json({ message: 'API сервера системи самоменеджменту працює.' });
});

// Єдиний обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Внутрішня помилка сервера',
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habit_tracker_db';

// Підключення до MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Успішне підключення до MongoDB'))
  .catch((err) => console.error('Помилка підключення до бази даних:', err));

// Локальний запуск, але не на Vercel runtime
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
  });
}

module.exports = app;
