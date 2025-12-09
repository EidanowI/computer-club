const Team = require('../models/Team');

/**
 * Получить команду текущего пользователя
 * GET /api/teams/my-team
 */
const getMyTeam = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const team = await Team.findByUserId(userId);

    if (!team) {
      return res.json({ team: null });
    }

    res.json({ team });
  } catch (error) {
    console.error('Ошибка при получении команды:', error);
    res.status(500).json({ error: 'Ошибка при получении команды' });
  }
};

/**
 * Создать команду
 * POST /api/teams
 */
const createTeam = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const { name } = req.body;

    // Валидация
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название команды обязательно' });
    }

    // Проверка длины названия (максимум 10 символов)
    if (name.length > 10) {
      return res.status(400).json({ error: 'Название команды не должно превышать 10 символов' });
    }

    // Проверка, есть ли уже команда у пользователя
    const existingTeam = await Team.findByUserId(userId);
    if (existingTeam) {
      return res.status(400).json({ error: 'У вас уже есть команда' });
    }

    // Проверка уникальности названия
    const teamWithSameName = await Team.findByName(name.trim());
    if (teamWithSameName) {
      return res.status(400).json({ error: 'Команда с таким названием уже существует' });
    }

    // Создание команды
    const teamId = await Team.create({
      name: name.trim(),
      userId
    });

    const team = await Team.findByUserId(userId);

    res.status(201).json({ 
      message: 'Команда успешно создана',
      team 
    });
  } catch (error) {
    console.error('Ошибка при создании команды:', error);
    res.status(500).json({ error: 'Ошибка при создании команды' });
  }
};

/**
 * Удалить команду
 * DELETE /api/teams/my-team
 */
const deleteTeam = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const team = await Team.findByUserId(userId);

    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    await Team.delete(team.id);

    res.json({ message: 'Команда успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении команды:', error);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
};

module.exports = {
  getMyTeam,
  createTeam,
  deleteTeam
};

