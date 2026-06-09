const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('../utils/db');

const router = express.Router();

// CORS для auth-роутів
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

router.use(cors(corsOptions));

// Явні preflight-обробники
router.options('/login', cors(corsOptions));
router.options('/register', cors(corsOptions));
router.options('/ping', cors(corsOptions));

// Тестовий маршрут
router.get('/ping', (req, res) => {
  console.log('PING /api/auth/ping');
  res.json({ ok: true, service: 'auth' });
});

// Реєстрація
router.post('/register', cors(corsOptions), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    console.log('REGISTER ATTEMPT:', email);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Будь ласка, заповніть усі обов’язкові поля.',
      });
    }

    await connectDB();

    const candidate = await User.findOne({ email });
    if (candidate) {
      return res.status(400).json({
        message: 'Користувач з такою електронною поштою вже існує.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      message: 'Користувача успішно зареєстровано в системі.',
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({
      message: 'Внутрішня помилка сервера при реєстрації.',
      error: err.message,
    });
  }
});

// Вхід
router.post('/login', cors(corsOptions), async (req, res) => {
  try {
    // Спочатку оголошуємо змінні
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    // Лог для перевірки, чи запит дійшов сюди
    console.log('LOGIN ATTEMPT:', email);
    console.log('BODY:', req.body);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

    if (!email || !password) {
      return res.status(400).json({
        message: 'Будь ласка, введіть email та пароль.',
      });
    }

    await connectDB();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Помилка конфігурації сервера',
        error: 'JWT_SECRET не знайдено',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Неправильний email або пароль.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Неправильний email або пароль.',
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({
      message: 'Внутрішня помилка сервера при вході.',
      error: err.message,
    });
  }
});

module.exports = router;
