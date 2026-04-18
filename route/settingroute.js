const express = require('express');
const router = express.Router();
const controller = require('../controller/settingcontroller');

router.get('/admin/settings', controller.getSettings);
router.post('/admin/settings', controller.saveSettings);
router.post('/seller/settings',controller.updateShopStatus);
router.get('/seller/settings',controller.getSellerSettings);

module.exports = router;