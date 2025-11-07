const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/BudgetController');
const isloggedIn = require('../middlewares/isloggedIn');

router.get('/data',isloggedIn.authMiddleware,BudgetController.BudgetData);
router.post('/add',isloggedIn.authMiddleware,BudgetController.AddBudget);
router.post('/update',isloggedIn.authMiddleware,BudgetController.UpdateBudget);
router.post('/delete',isloggedIn.authMiddleware,BudgetController.DeleteBudget);
module.exports = router; 