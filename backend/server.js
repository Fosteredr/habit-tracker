const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Логер усіх запитів
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Простий CORS для діагностики
app.use(cors());

// JSON body parser
app.use(express.json());

// Маршрути API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));

// Базовий маршрут
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

module.exports = app;
