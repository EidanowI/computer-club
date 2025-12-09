const express = require('express');
const router = express.Router();
const {
  getAllCompetitions,
  getCompetitionById,
  createCompetition,
  addTeamToCompetition,
  removeTeamFromCompetition,
  getAllTeams,
  deleteCompetition,
  setWinner
} = require('../controllers/competitionController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Публичные маршруты (доступны всем)
// Важно: более специфичные маршруты должны быть перед параметрическими
router.get('/teams', getAllTeams); // Для выбора команд при добавлении
router.get('/', getAllCompetitions);

// Маршруты, требующие авторизации
router.get('/:id', requireAuth, getCompetitionById);

// Маршруты только для админа
router.post('/', requireAuth, requireAdmin, createCompetition);
router.post('/:id/teams', requireAuth, requireAdmin, addTeamToCompetition);
router.delete('/:id/teams/:teamId', requireAuth, requireAdmin, removeTeamFromCompetition);
router.put('/:id/winner', requireAuth, requireAdmin, setWinner);
router.delete('/:id', requireAuth, requireAdmin, deleteCompetition);

module.exports = router;

