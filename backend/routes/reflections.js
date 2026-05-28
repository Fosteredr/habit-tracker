const express = require('express');
const router = express.Router();
const Reflection = require('../models/Reflection');
const auth = require('../middleware/auth');

// Аналітика ставиться вище, щоб маршрут не перекривався /
router.get('/analytics', auth, async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // Дату тримаємо у форматі YYYY-MM-DD
    const sinceStr = since.toLocaleDateString('sv-SE');

    const data = await Reflection.find({
      userId: req.user.id,
      date: { $gte: sinceStr },
    }).sort({ date: 1 });

    res.json(
      data.map((item) => ({
        date: item.date,
        moodScore: item.moodScore,
      }))
    );
  } catch (err) {
    res.status(500).json({
      message: 'Помилка генерації аналітики',
      error: err.message,
    });
  }
});

// Отримати всі рефлексії поточного користувача
router.get('/', auth, async (req, res) => {
  try {
    const reflections = await Reflection.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reflections);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка отримання записів рефлексії',
      error: err.message,
    });
  }
});

// Додати або оновити запис за день
router.post('/', auth, async (req, res) => {
  try {
    const moodScore = Number(req.body.moodScore);
    const note = String(req.body.note || '').trim();
    const date = String(req.body.date || '').trim();

    if (Number.isNaN(moodScore) || moodScore < 1 || moodScore > 5 || !date) {
      return res.status(400).json({
        message: 'Оцінка настрою та дата є обов’язковими',
      });
    }

    const normalizedDate = date.slice(0, 10);

    let reflection = await Reflection.findOne({
      userId: req.user.id,
      date: normalizedDate,
    });

    if (reflection) {
      reflection.moodScore = moodScore;
      reflection.note = note;
    } else {
      reflection = new Reflection({
        userId: req.user.id,
        moodScore,
        note,
        date: normalizedDate,
      });
    }

    const savedReflection = await reflection.save();
    res.status(200).json(savedReflection);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка збереження рефлексії',
      error: err.message,
    });
  }
});

module.exports = router;
