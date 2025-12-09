const Order = require('../models/Order');
const Device = require('../models/Device');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * Получить список занятых устройств на указанную дату и время
 * GET /api/orders/busy-devices?date=YYYY-MM-DD&timeFrom=HH:MM&timeTo=HH:MM
 */
const getBusyDevices = async (req, res) => {
  try {
    const { date, timeFrom, timeTo } = req.query;

    // Валидация параметров
    if (!date || !timeFrom || !timeTo) {
      return res.status(400).json({ 
        error: 'Необходимо указать дату (date), время начала (timeFrom) и время окончания (timeTo)' 
      });
    }

    // Проверка формата даты
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }

    // Проверка формата времени
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(timeFrom) || !timeRegex.test(timeTo)) {
      return res.status(400).json({ error: 'Неверный формат времени. Используйте HH:MM' });
    }

    // Получаем список занятых устройств
    const busyDeviceIds = await Order.getBusyDevices(date, timeFrom, timeTo);

    res.json({
      busyDeviceIds: busyDeviceIds
    });
  } catch (error) {
    console.error('Ошибка при получении занятых устройств:', error);
    res.status(500).json({ error: 'Ошибка при получении занятых устройств' });
  }
};

/**
 * Создать новый заказ
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const { minuteCount, date, time, tarifId, deviceId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    // Валидация
    if (!minuteCount || !date || !time || !tarifId || !deviceId) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверяем, не занято ли устройство
    const [timeFromHours, timeFromMinutes] = time.split(':').map(Number);
    const timeToMinutes = timeFromHours * 60 + timeFromMinutes + minuteCount;
    const timeToHours = Math.floor(timeToMinutes / 60);
    const timeToMins = timeToMinutes % 60;
    const timeTo = `${String(timeToHours).padStart(2, '0')}:${String(timeToMins).padStart(2, '0')}`;

    const busyDeviceIds = await Order.getBusyDevices(date, time, timeTo);
    if (busyDeviceIds.includes(deviceId)) {
      return res.status(400).json({ error: 'Устройство уже занято в указанное время' });
    }

    // Создаем заказ
    const orderId = await Order.create({
      minuteCount,
      date,
      time,
      userId,
      tarifId,
      deviceId
    });

    res.status(201).json({
      message: 'Заказ успешно создан',
      orderId: orderId
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
};

/**
 * Получить информацию о тарифе устройства
 * GET /api/orders/device-tarif/:deviceId
 */
const getDeviceTarif = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'Необходимо указать ID устройства' });
    }

    const tarifInfo = await Device.getTarifInfo(parseInt(deviceId));

    if (!tarifInfo) {
      return res.status(404).json({ error: 'Устройство не найдено' });
    }

    res.json({
      tarifId: tarifInfo.tarif_id,
      minuteCost: parseFloat(tarifInfo.minute_cost)
    });
  } catch (error) {
    console.error('Ошибка при получении информации о тарифе:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о тарифе' });
  }
};

/**
 * Получить все заказы текущего пользователя
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const orders = await Order.getUserOrders(userId);

    res.json({
      orders: orders
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
};

/**
 * Получить все заказы за указанную дату (только для администратора)
 * GET /api/orders/by-date?date=YYYY-MM-DD
 */
const getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Необходимо указать дату' });
    }

    // Проверка формата даты
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }

    const orders = await Order.getOrdersByDate(date);
    
    // Вычисляем общую сумму
    const totalSum = orders.reduce((sum, order) => {
      return sum + parseFloat(order.total_cost);
    }, 0);

    res.json({
      orders: orders,
      totalSum: totalSum.toFixed(2)
    });
  } catch (error) {
    console.error('Ошибка при получении заказов за дату:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов за дату' });
  }
};

module.exports = {
  getBusyDevices,
  createOrder,
  getDeviceTarif,
  getMyOrders,
  getOrdersByDate
};

