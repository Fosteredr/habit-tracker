const mongoose = require('mongoose');

// Схема запису рефлексії
const ReflectionSchema = new mongoose.Schema(
  {
    // Прив'язка до конкретного користувача
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Оцінка настрою від 1 до 5
    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Текст нотатки за день
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },

    // Дата у форматі YYYY-MM-DD
    date: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reflection', ReflectionSchema);
