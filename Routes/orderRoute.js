const express = require('express');
const router = express.Router();
const { getUser } = require('../Controller/userController');
const { createOrder, getAllOrder } = require('../Controller/orderController');

router.post('/create-order', getUser, createOrder);
router.get('/getAll-Orders', getUser, getAllOrder);

module.exports = router;