const mongoose = require('mongoose');

const ReflectionSchema = new mongoose.Schema({
  // Зв'язок із конкретним користувачем (1:M)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  moodScore: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 // Числова шкала емоційного стану від 1 (жахливо) до 5 (чудово)
  },
  note: { 
    type: String, 
    default: '' // Текстове поле щоденника рефлексії
  },
  date: { 
    type: String, 
    required: true // Конкретний день рефлексії у форматі YYYY-MM-DD
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Reflection', ReflectionSchema);
