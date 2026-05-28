const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Базові мідлвари
app.use(cors());
app.use(express.json());

// Підключення маршрутів API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));

// Перевірка доступності сервера
app.get('/', (req, res) => {
  res.json({ message: 'API сервера системи самоменеджменту працює.' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habit_tracker_db';

// Підключення до MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Успішне підключення до MongoDB'))
  .catch((err) => console.error('Помилка підключення до бази даних:', err));

// Єдиний обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Внутрішня помилка сервера',
    error: err.message,
  });
});

// Локальний запуск
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
  });
}

module.exports = app;
