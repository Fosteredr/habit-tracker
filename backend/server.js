const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Мідлвари для обробки форматів даних
app.use(cors());
app.use(express.json());

// Підключення модулів маршрутизації API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));


// Параметри підключення до NoSQL бази даних MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habit_tracker_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Успішне підключення до MongoDB (NoSQL БД)'))
  .catch(err => console.error('Помилка підключення до бази даних:', err));

// Базовий тестовий маршрут для перевірки працездатності сервера
app.get('/', (req, res) => {
  res.json({ message: 'API сервера систем самоменеджменту працює в штатному режимі.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});
