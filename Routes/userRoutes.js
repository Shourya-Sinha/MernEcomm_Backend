const express = require('express');
const { register, login, getUser, forgotPassowrd, updateMe } = require('../Controller/userController');
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/forgot-password',getUser,forgotPassowrd);
router.post('/update-me',getUser, updateMe);

module.exports = router;