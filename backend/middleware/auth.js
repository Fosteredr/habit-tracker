const jwt = require('jsonwebtoken');

// Перевірка JWT токена перед доступом до захищених маршрутів
module.exports = function (req, res, next) {
  const token = req.headers.authorization; // Заголовок Authorization

  // Якщо токен не передано
  if (!token) {
    return res.status(401).json({
      message: 'Відмовлено в доступі. Авторизаційний токен відсутній.',
    });
  }

  // Перевіряємо наявність секрету для JWT
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET не знайдено');

    return res.status(500).json({
      message: 'Помилка конфігурації сервера',
    });
  }

  try {
    // Прибираємо префікс Bearer, якщо він є
    const cleanToken = token.startsWith('Bearer ')
      ? token.slice(7).trim()
      : token.trim();

    if (!cleanToken) {
      return res.status(401).json({
        message: 'Токен відсутній',
      });
    }

    // Перевіряємо токен
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // Додаємо дані користувача до req
    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT ERROR:', err.message);

    return res.status(401).json({
      message: 'Недійсний або прострочений токен безпеки.',
    });
  }
};
