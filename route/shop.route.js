const express = require('express');
const router = express.Router();
const shopController = require('../controller/shopcontroller');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'), false);
    }
    cb(null, true);
  }
});

router.post('/addShop',upload.single('image'), shopController.addShop);
router.get('/getShop', shopController.getShops);
router.put('/updateShop/:id', upload.single('image'),shopController.updateShop);
router.delete('/deleteShop/:id', shopController.deleteShop);

module.exports = router;