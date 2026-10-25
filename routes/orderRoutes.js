const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/checkout', orderController.checkout);
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;
