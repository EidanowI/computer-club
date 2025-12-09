const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/update-phone', requireAuth, authController.updatePhone);
router.delete('/delete-profile', requireAuth, authController.deleteProfile);

module.exports = router;


