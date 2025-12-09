const pool = require('../config/database');

class User {
  static async findByLogin(login) {
    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE login = ?',
      [login]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, login, phone, name FROM user WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(userData) {
    const { login, passwordHash, phone, name } = userData;
    const [result] = await pool.execute(
      'INSERT INTO user (login, password_hash, phone, name) VALUES (?, ?, ?, ?)',
      [login, passwordHash, phone, name]
    );
    return result.insertId;
  }

  static async isAdmin(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM admin WHERE user_id = ?',
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Обновить номер телефона пользователя
   * @param {number} userId - ID пользователя
   * @param {string} phone - Новый номер телефона
   * @returns {Promise<boolean>} Успешность обновления
   */
  static async updatePhone(userId, phone) {
    const [result] = await pool.execute(
      'UPDATE user SET phone = ? WHERE id = ?',
      [phone, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Удалить пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<boolean>} Успешность удаления
   */
  static async delete(userId) {
    const [result] = await pool.execute(
      'DELETE FROM user WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;


