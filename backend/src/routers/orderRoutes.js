const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

// Получить занятые устройства (доступно всем авторизованным)
router.get('/busy-devices', requireAuth, orderController.getBusyDevices);

// Получить информацию о тарифе устройства
router.get('/device-tarif/:deviceId', requireAuth, orderController.getDeviceTarif);

// Создать заказ (требует авторизации)
router.post('/', requireAuth, orderController.createOrder);

module.exports = router;

