const bcrypt = require('bcrypt');
const User = require('../models/User');

// Регистрация
const register = async (req, res) => {
  try {
    const { login, password, phone, name } = req.body;

    // Валидация
    if (!login || !password || !phone || !name) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверка существования пользователя
    const existingUser = await User.findByLogin(login);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание пользователя
    const userId = await User.create({
      login,
      passwordHash,
      phone,
      name
    });

    // Автоматический вход после регистрации
    req.session.userId = userId;
    req.session.userLogin = login;

    const user = await User.findById(userId);
    const admin = await User.isAdmin(userId);

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        phone: user.phone,
        isAdmin: !!admin
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Вход
const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Валидация
    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    // Поиск пользователя
    const user = await User.findByLogin(login);
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Проверка пароля
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Создание сессии
    req.session.userId = user.id;
    req.session.userLogin = user.login;

    // Проверка прав администратора
    const admin = await User.isAdmin(user.id);

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        phone: user.phone,
        isAdmin: !!admin
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

// Выход
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен успешно' });
  });
};

// Получение текущего пользователя
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.json({ user: null });
    }

    const admin = await User.isAdmin(user.id);

    res.json({
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        phone: user.phone,
        isAdmin: !!admin
      }
    });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};


