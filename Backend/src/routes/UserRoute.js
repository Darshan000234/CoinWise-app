const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const isloggedIn = require('../middlewares/isloggedIn');

router.post('/signUp',UserController.signUp);
router.post('/login',UserController.login);
router.post('/googleAuth',UserController.googleAuth);
router.get('/validate-session', isloggedIn.authMiddleware, (req, res) => {
  res.json({
    isValid: true,
    user: req.user
  });
});
router.get('/logout',isloggedIn.authMiddleware,UserController.logout)
module.exports = router;