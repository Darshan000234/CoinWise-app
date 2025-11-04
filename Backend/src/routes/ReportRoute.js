const express = require('express');
const router = express.Router();
const isloggedIn = require('../middlewares/isloggedIn');
const ReportController = require('../controllers/ReportController');


router.get('/bar',isloggedIn.authMiddleware,ReportController.bar);
router.get('/pie',isloggedIn.authMiddleware,ReportController.pie);
router.get('/line',isloggedIn.authMiddleware,ReportController.line);
router.get('/data',isloggedIn.authMiddleware,ReportController.data);
router.get('/generate/:id',isloggedIn.authMiddleware,ReportController.generate);
router.post('/save',isloggedIn.authMiddleware,ReportController.save);
router.get('/download/:id', isloggedIn.authMiddleware, ReportController.download);

module.exports = router;