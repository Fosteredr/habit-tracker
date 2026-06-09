const mongoose = require('mongoose');

// Кешуємо підключення, щоб не відкривати нове на кожен запит
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI не знайдено у змінних середовища');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
