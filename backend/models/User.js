const mongoose = require('mongoose');

// Схема користувача
const UserSchema = new mongoose.Schema(
  {
    // Ім'я користувача
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Електронна пошта, унікальна для кожного акаунта
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },

    // Хеш пароля, а не відкритий пароль
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Додає createdAt та updatedAt
  }
);

module.exports = mongoose.model('User', UserSchema);
