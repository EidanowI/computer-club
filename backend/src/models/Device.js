const pool = require('../config/database');

class Device {
  /**
   * Найти устройство по ID
   * @param {number} id - ID устройства
   * @returns {Promise<Object|null>} Устройство с информацией об арене и тарифе
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.id, d.arena_id, d.number, d.description,
              a.id as arena_id, a.tarif_id, a.isVip, a.isPrivate,
              t.id as tarif_id, t.minute_cost
       FROM device d
       INNER JOIN arena a ON d.arena_id = a.id
       INNER JOIN tarif t ON a.tarif_id = t.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Получить информацию о тарифе устройства
   * @param {number} deviceId - ID устройства
   * @returns {Promise<Object|null>} Информация о тарифе (tarif_id, minute_cost)
   */
  static async getTarifInfo(deviceId) {
    const [rows] = await pool.execute(
      `SELECT t.id as tarif_id, t.minute_cost
       FROM device d
       INNER JOIN arena a ON d.arena_id = a.id
       INNER JOIN tarif t ON a.tarif_id = t.id
       WHERE d.id = ?`,
      [deviceId]
    );
    return rows[0] || null;
  }
}

module.exports = Device;

