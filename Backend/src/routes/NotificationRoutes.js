const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

router.post('/addNotification', NotificationController.addNotification);
router.get('/deleteNotification', NotificationController.deleteNotification);

module.exports = router;