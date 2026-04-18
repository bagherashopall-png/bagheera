const express = require('express');
const router = express.Router();
const shopController = require('../controller/shopcontroller');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/shops/');
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  }
});
const upload = multer({ storage });

router.post('/addShop',upload.single('image'), shopController.addShop);
router.get('/getShop', shopController.getShops);
router.put('/updateShop/:id', upload.single('image'),shopController.updateShop);
router.delete('/deleteShop/:id', shopController.deleteShop);

module.exports = router;