const mongoose = require('mongoose');

// Опис структури документа користувача у NoSQL базі даних
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Забороняє реєстрацію дублікатів пошт
  },
  passwordHash: { 
    type: String, 
    required: true // Тут зберігатиметься безпечний хеш пароля, а не чистий текст
  }
}, { 
  timestamps: true // Автоматично додає поля createdAt та updatedAt (час створення/оновлення)
});

module.exports = mongoose.model('User', UserSchema);
