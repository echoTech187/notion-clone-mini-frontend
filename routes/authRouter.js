const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const middleware = require('../middleware/middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', middleware.protect, authController.me);
router.get('/logout', middleware.protect, authController.logout);

module.exports = router;