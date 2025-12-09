const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // URL вашего Vite dev сервера
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // В production установите true при использовании HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Простой маршрут для тестирования
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Импорт маршрутов
const authRoutes = require('./routers/authRoutes');
app.use('/api/auth', authRoutes);

const orderRoutes = require('./routers/orderRoutes');
app.use('/api/orders', orderRoutes);

const teamRoutes = require('./routers/teamRoutes');
app.use('/api/teams', teamRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});