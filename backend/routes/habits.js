const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Отримати всі звички поточного користувача
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка отримання звичок',
      error: err.message,
    });
  }
});

// Створити нову звичку
router.post('/', auth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const frequency = String(req.body.frequency || 'щоденно').trim();

    if (!title) {
      return res.status(400).json({
        message: 'Назва звички обов’язкова',
      });
    }

    const newHabit = new Habit({
      userId: req.user.id,
      title,
      frequency,
      history: [],
    });

    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка створення звички',
      error: err.message,
    });
  }
});

// Оновити звичку
router.put('/:id', auth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const frequency = String(req.body.frequency || 'щоденно').trim();

    if (!title) {
      return res.status(400).json({
        message: 'Назва звички обов’язкова',
      });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, frequency },
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({
        message: 'Звичку не знайдено',
      });
    }

    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка оновлення звички',
      error: err.message,
    });
  }
});

// Відмітити або скасувати виконання
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const date = String(req.body.date || '').trim();

    if (!date) {
      return res.status(400).json({
        message: 'Дата не вказана',
      });
    }

    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Звичку не знайдено',
      });
    }

    // Гарантуємо, що history завжди масив
    habit.history = Array.isArray(habit.history) ? habit.history : [];

    const index = habit.history.indexOf(date);

    if (index === -1) {
      habit.history.push(date);
    } else {
      habit.history.splice(index, 1);
    }

    await habit.save();

    res.json(habit);
  } catch (err) {
    res.status(500).json({
      message: 'Помилка оновлення статусу звички',
      error: err.message,
    });
  }
});

// Видалити звичку
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Звичку не знайдено або доступ заборонено',
      });
    }

    res.json({ message: 'Звичку успішно видалено' });
  } catch (err) {
    res.status(500).json({
      message: 'Помилка видалення звички',
      error: err.message,
    });
  }
});

module.exports = router;
