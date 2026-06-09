const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./utils/db');

const app = express();

// Базові мідлвари
app.use(cors());
app.use(express.json());

// Маршрути API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reflections', require('./routes/reflections'));

// Базова перевірка працездатності
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

// Локальний запуск
async function start() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    if (require.main === module) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Сервер успішно запущено на порту ${PORT}`);
      });
    }
  } catch (err) {
    console.error('SERVER STARTUP ERROR:', err.message);

    if (require.main === module) {
      process.exit(1);
    }
  }
}

start();

module.exports = app;
