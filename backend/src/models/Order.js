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
}

module.exports = Order;

