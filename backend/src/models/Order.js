const pool = require('../config/database');

class Order {
  /**
   * Получить список занятых устройств на указанную дату и время
   * @param {string} date - Дата в формате YYYY-MM-DD
   * @param {string} timeFrom - Время начала в формате HH:MM
   * @param {string} timeTo - Время окончания в формате HH:MM
   * @returns {Promise<Array>} Массив ID занятых устройств
   */
  static async getBusyDevices(date, timeFrom, timeTo) {
    try {
      // Преобразуем время в минуты для удобства сравнения
      const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
      const [toHours, toMinutes] = timeTo.split(':').map(Number);
      const requestedFromMinutes = fromHours * 60 + fromMinutes;
      const requestedToMinutes = toHours * 60 + toMinutes;

      // Получаем все заказы на указанную дату
      const [orders] = await pool.execute(
        'SELECT id, time, minute_count, device_id FROM order_tb WHERE date = ?',
        [date]
      );

      const busyDeviceIds = [];

      for (const order of orders) {
        // Преобразуем время заказа в минуты
        const [orderHours, orderMinutes] = order.time.split(':').map(Number);
        const orderStartMinutes = orderHours * 60 + orderMinutes;
        const orderEndMinutes = orderStartMinutes + order.minute_count;

        // Проверяем пересечение временных интервалов
        // Заказ пересекается, если:
        // - начало запрошенного времени < конец заказа И
        // - конец запрошенного времени > начало заказа
        if (requestedFromMinutes < orderEndMinutes && requestedToMinutes > orderStartMinutes) {
          busyDeviceIds.push(order.device_id);
        }
      }

      return [...new Set(busyDeviceIds)]; // Убираем дубликаты
    } catch (error) {
      console.error('Ошибка при получении занятых устройств:', error);
      throw error;
    }
  }

  /**
   * Создать новый заказ
   * @param {Object} orderData - Данные заказа
   * @returns {Promise<number>} ID созданного заказа
   */
  static async create(orderData) {
    const { minuteCount, date, time, userId, tarifId, deviceId } = orderData;
    const [result] = await pool.execute(
      'INSERT INTO order_tb (minute_count, date, time, user_id, tarif_id, device_id) VALUES (?, ?, ?, ?, ?, ?)',
      [minuteCount, date, time, userId, tarifId, deviceId]
    );
    return result.insertId;
  }

  /**
   * Получить все заказы пользователя с информацией об устройстве и тарифе
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} Массив заказов
   */
  static async getUserOrders(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        o.id,
        o.date,
        o.time,
        o.minute_count,
        d.description,
        t.minute_cost,
        (o.minute_count * t.minute_cost) as total_cost
       FROM order_tb o
       INNER JOIN device d ON o.device_id = d.id
       INNER JOIN tarif t ON o.tarif_id = t.id
       WHERE o.user_id = ?
       ORDER BY o.date DESC, o.time DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Получить все заказы за указанную дату с информацией о пользователе, устройстве и тарифе
   * @param {string} date - Дата в формате YYYY-MM-DD
   * @returns {Promise<Array>} Массив заказов с информацией о пользователе
   */
  static async getOrdersByDate(date) {
    const [rows] = await pool.execute(
      `SELECT 
        o.id,
        o.date,
        o.time,
        o.minute_count,
        u.login as user_login,
        u.name as user_name,
        d.description,
        t.minute_cost,
        (o.minute_count * t.minute_cost) as total_cost
       FROM order_tb o
       INNER JOIN user u ON o.user_id = u.id
       INNER JOIN device d ON o.device_id = d.id
       INNER JOIN tarif t ON o.tarif_id = t.id
       WHERE o.date = ?
       ORDER BY o.time ASC`,
      [date]
    );
    return rows;
  }
}

module.exports = Order;

