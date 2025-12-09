const express = require('express');
const router = express.Router();
const { getMyTeam, createTeam, deleteTeam } = require('../controllers/teamController');
const { requireAuth } = require('../middleware/auth');

// Все маршруты требуют авторизации
router.use(requireAuth);

// Получить команду текущего пользователя
router.get('/my-team', getMyTeam);

// Создать команду
router.post('/', createTeam);

// Удалить команду
router.delete('/my-team', deleteTeam);

module.exports = router;

