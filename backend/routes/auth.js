// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Ендпоінт реєстрації нового користувача (POST /api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Перевіряємо, чи заповнені всі поля
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі обов’язкові поля.' });
    }

    // Перевіряємо, чи немає користувача з такою поштою в БД
    const candidate = await User.findOne({ email });
    if (candidate) {
      return res.status(400).json({ message: 'Користувач з такою електронною поштою вже існує.' });
    }

    // Хешуємо пароль (створюємо безпечний "відбиток" замість чистого тексту)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Зберігаємо нового користувача в MongoDB
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: 'Користувача успішно зареєстровано в системі.' });
  } catch (err) {
    res.status(500).json({ message: 'Внутрішня помилка сервера при реєстрації.', error: err.message });
  }
});

// 2. Ендпоінт входу в систему (POST /api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Будь ласка, введіть email та пароль.' });
    }

    // Шукаємо користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неправильний email або пароль.' });
    }

    // Порівнюємо введений пароль із захешованим у базі даних
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неправильний email або пароль.' });
    }

    // Створюємо JWT токен терміном дії на 7 днів, куди зашиваємо унікальний id користувача
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Повертаємо React-клієнту токен та базові дані користувача
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Внутрішня помилка сервера при вході.', error: err.message });
  }
});

module.exports = router;
