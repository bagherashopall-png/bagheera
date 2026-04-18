const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menu/');
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  }
});
const upload = multer({ storage });

router.post('/addmenu', upload.single('image'), menuController.addMenu);
router.get('/getMenuList', menuController.getMenu);
router.put('/updateMenu/:id', upload.single('image'), menuController.updateMenu);
router.delete('/deleteMenu/:id', menuController.deleteMenu);

module.exports = router;