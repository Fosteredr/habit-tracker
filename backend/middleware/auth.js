// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Отримуємо токен із заголовка HTTP-запиту
  const token = req.header('Authorization');

  // Перевіряємо, чи взагалі є токен
  if (!token) {
    return res.status(401).json({ message: 'Відмовлено в доступі. Авторизаційний токен відсутній.' });
  }

  try {
    // Якщо токен надіслано у форматі "Bearer <токен>", відсікаємо префікс
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trim() : token;
    
    // Декодуємо та верифікуємо токен за допомогою нашого секретного ключа з .env
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Додаємо дані користувача з токена (його id) до об'єкта запиту req
    req.user = decoded;
    
    // Передаємо керування наступній функції (контролеру маршруту)
    next();
  } catch (err) {
    res.status(401).json({ message: 'Недійсний або прострочений токен безпеки.' });
  }
};
