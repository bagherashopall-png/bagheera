const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');
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

router.post('/addmenu', upload.single('image'), menuController.addMenu);
router.get('/getMenuList', menuController.getMenu);
router.put('/updateMenu/:id', upload.single('image'), menuController.updateMenu);
router.delete('/deleteMenu/:id', menuController.deleteMenu);

module.exports = router;