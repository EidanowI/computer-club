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
}

module.exports = User;


