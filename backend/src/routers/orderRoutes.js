const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Получить занятые устройства (доступно всем авторизованным)
router.get('/busy-devices', requireAuth, orderController.getBusyDevices);

// Получить информацию о тарифе устройства
router.get('/device-tarif/:deviceId', requireAuth, orderController.getDeviceTarif);

// Получить все заказы текущего пользователя
router.get('/my-orders', requireAuth, orderController.getMyOrders);

// Получить все заказы за дату (только для администратора)
router.get('/by-date', requireAuth, requireAdmin, orderController.getOrdersByDate);

// Создать заказ (требует авторизации)
router.post('/', requireAuth, orderController.createOrder);

module.exports = router;

