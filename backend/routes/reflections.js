// backend/routes/reflections.js
const express = require('express');
const router = express.Router();
const Reflection = require('../models/Reflection');
const auth = require('../middleware/auth');

// 1. Спеціальний аналітичний маршрут для графіків (GET /api/reflections/analytics)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Отримуємо записи рефлексії користувача за останні 30 днів
    const data = await Reflection.find({ userId: req.user.id })
      .sort({ date: 1 })
      .limit(30);
      
    // Повертаємо масив оцінок настрою у хронологічному порядку для побудови графіків
    res.json(data.map(item => ({ date: item.date, moodScore: item.moodScore })));
  } catch (err) {
    res.status(500).json({ message: 'Помилка генерації аналітики', error: err.message });
  }
});

// 2. Отримати всі рефлексії поточного користувача (GET /api/reflections)
router.get('/', auth, async (req, res) => {
  try {
    const reflections = await Reflection.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reflections);
  } catch (err) {
    res.status(500).json({ message: 'Помилка отримання записів рефлексії', error: err.message });
  }
});

// 3. Додати або оновити запис рефлексії за конкретний день (POST /api/reflections)
router.post('/', auth, async (req, res) => {
  try {
    const { moodScore, note, date } = req.body;

    if if (moodScore === undefined || !date) {
      return res.status(400).json({ message: 'Оцінка настрою та дата є обов’язковими' });
    }

    // Шукаємо, чи є вже запис на цей день, щоб оновити його, або створити новий (Upsert)
    let reflection = await Reflection.findOne({ userId: req.user.id, date });

    if (reflection) {
      reflection.moodScore = moodScore;
      reflection.note = note;
    } else {
      reflection = new Reflection({
        userId: req.user.id,
        moodScore,
        note,
        date
      });
    }

    const savedReflection = await reflection.save();
    res.status(200).json(savedReflection);
  } catch (err) {
    res.status(500).json({ message: 'Помилка збереження рефлексії', error: err.message });
  }
});

module.exports = router;
