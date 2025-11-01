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
router.get('/getdata',isloggedIn.authMiddleware,UserController.Data);
router.get('/logout',isloggedIn.authMiddleware,UserController.logout);
router.get('/settings',isloggedIn.authMiddleware,UserController.getProfile);
router.post('/settings_update/:section',isloggedIn.authMiddleware,UserController.updateProfile);

module.exports = router;