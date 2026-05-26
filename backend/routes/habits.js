// backend/routes/habits.js
const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth'); // Захисний мідлвар

// 1. Отримати всі звички поточного користувача (GET /api/habits)
// Мідлвар auth автоматично визначає req.user.id з JWT токена
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Помилка отримання звичок', error: err.message });
  }
});

// 2. Створити нову звичку (POST /api/habits)
router.post('/', auth, async (req, res) => {
  try {
    const { title, frequency } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Назва звички обов’язкова' });
    }

    const newHabit = new Habit({
      userId: req.user.id,
      title,
      frequency
    });

    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(500).json({ message: 'Помилка створення звички', error: err.message });
  }
});

// 3. Відмітити виконання звички або скасувати відмітку (POST /api/habits/:id/toggle)
// Передаємо у тілі запиту конкретну дату у форматі YYYY-MM-DD
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: 'Дата не вказана' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: 'Звичку не знайдено' });
    }

    // Перевіряємо, чи вже є ця дата у масиві виконаних днів
    const index = habit.history.indexOf(date);
    if (index === -1) {
      // Якщо дати немає — додаємо її (відмічаємо виконання)
      habit.history.push(date);
    } else {
      // Якщо дата вже була — видаляємо її (скасовуємо відмітку у разі помилки)
      habit.history.splice(index, 1);
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Помилка оновлення статусу звички', error: err.message });
  }
});

// 4. Видалити звичку (DELETE /api/habits/:id)
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: 'Звичку не знайдено або доступ заборонено' });
    }
    res.json({ message: 'Звичку успішно видалено' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка видалення звички', error: err.message });
  }
});

module.exports = router;
