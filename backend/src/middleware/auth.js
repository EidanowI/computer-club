const User = require('../models/User');

// Middleware для проверки авторизации
const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  next();
};

// Middleware для проверки прав администратора
const requireAdmin = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const admin = await User.isAdmin(req.session.userId);
  if (!admin) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};


