const express = require('express');
const router = express.Router();
const isloggedIn = require('../middlewares/isloggedIn');


router.get('/bar',isloggedIn.authMiddleware,);
router.get('/pie',isloggedIn.authMiddleware,);
router.get('/line',isloggedIn.authMiddleware,);
module.exports = router;