const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');
const isloggedIn = require('../middlewares/isloggedIn');

router.get('/',isloggedIn.authMiddleware,TransactionController.TransactionData);

module.exports = router;