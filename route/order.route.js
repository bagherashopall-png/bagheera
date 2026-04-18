const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const order = require('../modal/order');

router.post('/placeOrder',orderController.placeOrder);
router.get('/getAllOrder',orderController.getAllOrderList);
router.get('/getAllSellerOrder',orderController.getAllSellerOrder);
router.post('/updateOrder',orderController.updateOrder);
router.get('/getUserAnyOrder/:id',orderController.getOrder);
router.post('/feedback/:id',orderController.addFeedback);
router.put('/cancel/:id', orderController.cancel);
router.get('/userOrder/:id',orderController.getUserOrder);


module.exports = router;