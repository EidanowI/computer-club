const pool = require('../config/database');

class Team {
  /**
   * Получить команду пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object|null>} Команда пользователя или null
   */
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM team WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Получить команду по имени
   * @param {string} name - Название команды
   * @returns {Promise<Object|null>} Команда или null
   */
  static async findByName(name) {
    const [rows] = await pool.execute(
      'SELECT * FROM team WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  }

  /**
   * Создать команду
   * @param {Object} teamData - Данные команды
   * @param {string} teamData.name - Название команды
   * @param {number} teamData.userId - ID пользователя
   * @returns {Promise<number>} ID созданной команды
   */
  static async create(teamData) {
    const { name, userId } = teamData;
    const [result] = await pool.execute(
      'INSERT INTO team (name, user_id) VALUES (?, ?)',
      [name, userId]
    );
    return result.insertId;
  }

  /**
   * Удалить команду
   * @param {number} teamId - ID команды
   * @returns {Promise<boolean>} Успешность удаления
   */
  static async delete(teamId) {
    const [result] = await pool.execute(
      'DELETE FROM team WHERE id = ?',
      [teamId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Team;

