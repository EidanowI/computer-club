const Competition = require('../models/Competition');

/**
 * Получить все соревнования
 * GET /api/competitions
 */
const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.getAll();
    res.json({ competitions });
  } catch (error) {
    console.error('Ошибка при получении соревнований:', error);
    res.status(500).json({ error: 'Ошибка при получении соревнований' });
  }
};

/**
 * Получить соревнование по ID
 * GET /api/competitions/:id
 */
const getCompetitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findById(parseInt(id));
    
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }
    
    res.json({ competition });
  } catch (error) {
    console.error('Ошибка при получении соревнования:', error);
    res.status(500).json({ error: 'Ошибка при получении соревнования' });
  }
};

/**
 * Создать соревнование (только для админа)
 * POST /api/competitions
 */
const createCompetition = async (req, res) => {
  try {
    const { award, dateTime, imageUrl } = req.body;

    // Валидация
    if (!award || award <= 0) {
      return res.status(400).json({ error: 'Призовой фонд должен быть больше 0' });
    }

    if (!dateTime) {
      return res.status(400).json({ error: 'Дата и время обязательны' });
    }

    // Проверка формата даты
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!dateRegex.test(dateTime)) {
      return res.status(400).json({ error: 'Неверный формат даты и времени. Используйте YYYY-MM-DD HH:MM:SS' });
    }

    const competitionId = await Competition.create({
      award: parseFloat(award),
      dateTime,
      imageUrl: imageUrl || null
    });

    const competition = await Competition.findById(competitionId);

    res.status(201).json({
      message: 'Соревнование успешно создано',
      competition
    });
  } catch (error) {
    console.error('Ошибка при создании соревнования:', error);
    res.status(500).json({ error: 'Ошибка при создании соревнования' });
  }
};

/**
 * Добавить команду к соревнованию (только для админа)
 * POST /api/competitions/:id/teams
 */
const addTeamToCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'ID команды обязателен' });
    }

    // Проверяем существование соревнования
    const competition = await Competition.findById(parseInt(id));
    if (!competition) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }

    const success = await Competition.addTeam(parseInt(id), parseInt(teamId));
    
    if (!success) {
      return res.status(400).json({ error: 'Команда уже добавлена к этому соревнованию' });
    }

    const updatedCompetition = await Competition.findById(parseInt(id));

    res.json({
      message: 'Команда успешно добавлена',
      competition: updatedCompetition
    });
  } catch (error) {
    console.error('Ошибка при добавлении команды:', error);
    res.status(500).json({ error: 'Ошибка при добавлении команды' });
  }
};

/**
 * Удалить команду из соревнования (только для админа)
 * DELETE /api/competitions/:id/teams/:teamId
 */
const removeTeamFromCompetition = async (req, res) => {
  try {
    const { id, teamId } = req.params;

    const success = await Competition.removeTeam(parseInt(id), parseInt(teamId));
    
    if (!success) {
      return res.status(404).json({ error: 'Команда не найдена в этом соревновании' });
    }

    const updatedCompetition = await Competition.findById(parseInt(id));

    res.json({
      message: 'Команда успешно удалена',
      competition: updatedCompetition
    });
  } catch (error) {
    console.error('Ошибка при удалении команды:', error);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
};

/**
 * Получить все команды (для выбора при добавлении к соревнованию)
 * GET /api/competitions/teams
 */
const getAllTeams = async (req, res) => {
  try {
    const teams = await Competition.getAllTeams();
    res.json({ teams });
  } catch (error) {
    console.error('Ошибка при получении команд:', error);
    res.status(500).json({ error: 'Ошибка при получении команд' });
  }
};

/**
 * Удалить соревнование (только для админа)
 * DELETE /api/competitions/:id
 */
const deleteCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Competition.delete(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ error: 'Соревнование не найдено' });
    }

    res.json({ message: 'Соревнование успешно удалено' });
  } catch (error) {
    console.error('Ошибка при удалении соревнования:', error);
    res.status(500).json({ error: 'Ошибка при удалении соревнования' });
  }
};

module.exports = {
  getAllCompetitions,
  getCompetitionById,
  createCompetition,
  addTeamToCompetition,
  removeTeamFromCompetition,
  getAllTeams,
  deleteCompetition
};

