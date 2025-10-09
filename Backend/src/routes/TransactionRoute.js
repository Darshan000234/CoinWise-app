const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');
const isloggedIn = require('../middlewares/isloggedIn');
const multer = require('multer');
const storage = multer.memoryStorage(); // ✅ store in memory, not on disk
const upload = multer({ storage });

router.get('/',isloggedIn.authMiddleware,TransactionController.TransactionData);
router.get('/Category',isloggedIn.authMiddleware,TransactionController.CategoryTransaction);
router.post('/add',isloggedIn.authMiddleware,TransactionController.TransactionAdd);
router.post('/delete',isloggedIn.authMiddleware,TransactionController.TransactionDelete);
router.post('/update',isloggedIn.authMiddleware,TransactionController.TransactionEdit);
router.get('/category',isloggedIn.authMiddleware,TransactionController.CategoryTransaction);
router.post('/uploads',isloggedIn.authMiddleware,upload.single("file"),TransactionController.FileTransaction)

module.exports = router;