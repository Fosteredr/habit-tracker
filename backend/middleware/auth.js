const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: 'Відмовлено в доступі. Авторизаційний токен відсутній.'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET не знайдено');

    return res.status(500).json({
      message: 'Помилка конфігурації сервера'
    });
  }

  try {

    const cleanToken = token.startsWith('Bearer ')
      ? token.slice(7).trim()
      : token;

    if (!cleanToken) {
      return res.status(401).json({
        message: 'Токен відсутній'
      });
    }

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    console.error('JWT ERROR:', err.message);

    res.status(401).json({
      message: 'Недійсний або прострочений токен безпеки.'
    });
  }
};
