const pool = require('../config/database');

class Competition {
  /**
   * Получить все соревнования с командами
   * @returns {Promise<Array>} Массив соревнований с командами
   */
  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.award,
        c.date_time,
        c.image_url,
        c.winner_team_id,
        GROUP_CONCAT(t.id ORDER BY t.name SEPARATOR ',') as team_ids,
        GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') as teams,
        GROUP_CONCAT(CASE WHEN t.id = c.winner_team_id THEN t.name END SEPARATOR ', ') as winner_team
       FROM competition c
       LEFT JOIN team_competitor tc ON c.id = tc.competition_id
       LEFT JOIN team t ON tc.team_id = t.id
       GROUP BY c.id, c.award, c.date_time, c.image_url, c.winner_team_id
       ORDER BY c.date_time DESC`
    );
    
    // Преобразуем строку команд в массив
    return rows.map(row => ({
      ...row,
      team_ids: row.team_ids ? row.team_ids.split(',').map(Number) : [],
      teams: row.teams ? row.teams.split(', ') : [],
      winner_team: row.winner_team || null,
      winner_team_id: row.winner_team_id || null
    }));
  }

  /**
   * Получить соревнование по ID с командами
   * @param {number} id - ID соревнования
   * @returns {Promise<Object|null>} Соревнование с командами или null
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.award,
        c.date_time,
        c.image_url,
        c.winner_team_id,
        GROUP_CONCAT(t.id ORDER BY t.id SEPARATOR ',') as team_ids,
        GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') as teams,
        GROUP_CONCAT(CASE WHEN t.id = c.winner_team_id THEN t.name END SEPARATOR ', ') as winner_team
       FROM competition c
       LEFT JOIN team_competitor tc ON c.id = tc.competition_id
       LEFT JOIN team t ON tc.team_id = t.id
       WHERE c.id = ?
       GROUP BY c.id, c.award, c.date_time, c.image_url, c.winner_team_id`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      ...row,
      team_ids: row.team_ids ? row.team_ids.split(',').map(Number) : [],
      teams: row.teams ? row.teams.split(', ') : [],
      winner_team: row.winner_team || null,
      winner_team_id: row.winner_team_id || null
    };
  }

  /**
   * Создать соревнование
   * @param {Object} competitionData - Данные соревнования
   * @param {number} competitionData.award - Призовой фонд
   * @param {string} competitionData.dateTime - Дата и время в формате YYYY-MM-DD HH:MM:SS
   * @param {string} competitionData.imageUrl - URL изображения
   * @returns {Promise<number>} ID созданного соревнования
   */
  static async create(competitionData) {
    const { award, dateTime, imageUrl } = competitionData;
    const [result] = await pool.execute(
      'INSERT INTO competition (award, date_time, image_url) VALUES (?, ?, ?)',
      [award, dateTime, imageUrl]
    );
    return result.insertId;
  }

  /**
   * Добавить команду к соревнованию
   * @param {number} competitionId - ID соревнования
   * @param {number} teamId - ID команды
   * @returns {Promise<boolean>} Успешность добавления
   */
  static async addTeam(competitionId, teamId) {
    // Проверяем, не добавлена ли уже команда
    const [existing] = await pool.execute(
      'SELECT * FROM team_competitor WHERE competition_id = ? AND team_id = ?',
      [competitionId, teamId]
    );
    
    if (existing.length > 0) {
      return false; // Команда уже добавлена
    }
    
    const [result] = await pool.execute(
      'INSERT INTO team_competitor (competition_id, team_id) VALUES (?, ?)',
      [competitionId, teamId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Удалить команду из соревнования
   * @param {number} competitionId - ID соревнования
   * @param {number} teamId - ID команды
   * @returns {Promise<boolean>} Успешность удаления
   */
  static async removeTeam(competitionId, teamId) {
    const [result] = await pool.execute(
      'DELETE FROM team_competitor WHERE competition_id = ? AND team_id = ?',
      [competitionId, teamId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Удалить соревнование
   * @param {number} id - ID соревнования
   * @returns {Promise<boolean>} Успешность удаления
   */
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM competition WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Получить все команды (для выбора при добавлении к соревнованию)
   * @returns {Promise<Array>} Массив всех команд
   */
  static async getAllTeams() {
    const [rows] = await pool.execute(
      'SELECT id, name FROM team ORDER BY name'
    );
    return rows;
  }

  /**
   * Установить победителя соревнования
   * @param {number} competitionId - ID соревнования
   * @param {number} teamId - ID команды-победителя
   * @returns {Promise<boolean>} Успешность установки
   */
  static async setWinner(competitionId, teamId) {
    try {
      // Проверяем, что команда участвует в соревновании
      const [existing] = await pool.execute(
        'SELECT * FROM team_competitor WHERE competition_id = ? AND team_id = ?',
        [competitionId, teamId]
      );
      
      if (existing.length === 0) {
        return false; // Команда не участвует в соревновании
      }
      
      const [result] = await pool.execute(
        'UPDATE competition SET winner_team_id = ? WHERE id = ?',
        [teamId, competitionId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Ошибка в setWinner:', error);
      throw error; // Пробрасываем ошибку для обработки в контроллере
    }
  }
}

module.exports = Competition;

