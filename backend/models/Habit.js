const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  // Зв'язок "один-до-багатьох" (1:M) із колекцією користувачів через ObjectId (Ref)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true // Назва звички (наприклад, "Ранкова медитація")
  },
  frequency: { 
    type: String, 
    default: 'щоденно' 
  },
  // Масив рядків, де зберігатимуться дати виконання у форматі YYYY-MM-DD
  history: [{ 
    type: String 
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Habit', HabitSchema);
