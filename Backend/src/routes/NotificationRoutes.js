const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const isloggedIn = require('../middlewares/isloggedIn');

router.get('/addNotification',isloggedIn.authMiddleware,NotificationController.GetNotification);
router.get('/deleteNotification',isloggedIn.authMiddleware,NotificationController.deleteNotification);

module.exports = router;