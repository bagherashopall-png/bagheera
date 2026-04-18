const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/count', dashboardController.getDashboardStats);
router.get('/getrecordBystatus/:status',dashboardController.getMenuByStatus);
router.get('/getAllShops',dashboardController.getAllShopsWithOwner);
router.put('/updateMenu/:id', dashboardController.updateMenuStatus);
router.get('/seller/getSellerRecord', dashboardController.getSellerDashboardStats);
router.delete('/seller/cancel/:id', dashboardController.cancelSellerMenu);

module.exports = router;