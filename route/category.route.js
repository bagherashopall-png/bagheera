const express = require('express');
const router = express.Router();
const multer = require('multer');
const  categoryController  = require('../controller/categoryController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/category');
  },
  filename: (req, file, cb) => {
      const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  }
});
const upload = multer({
  storage: multer.memoryStorage() // 👈 IMPORTANT
});

// ✅ Route with multer
router.post('/add', upload.single('image'), categoryController.addCategory);

router.get('/allcategory', categoryController.getAllCategories);

router.put('/update/:id', upload.single('image'), categoryController.updateCategory);

router.delete('/delete/:id',categoryController.deleteCategory);

module.exports = router;

