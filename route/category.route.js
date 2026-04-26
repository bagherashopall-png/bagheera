const express = require('express');
const router = express.Router();
const multer = require('multer');
const  categoryController  = require('../controller/categoryController');

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

// ✅ Routes
router.post('/add', upload.single('image'), categoryController.addCategory);

router.get('/allcategory', categoryController.getAllCategories);

router.put('/update/:id', upload.single('image'), categoryController.updateCategory);

router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;