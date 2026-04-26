const imagePath = "/uploads/category/";
const Category = require('../modal/category');
const { bucket } = require('../config/firebase'); // 👈 your file path

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
	
    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name and Image are required"
      });
    }

    const fileName = Date.now() + '-' + req.file.originalname;
	

    const file = bucket.file(`category/${fileName}`);
	
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });
	
	
    stream.on('error', (err) => {
		console.log('err.message',err.message);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    });

    stream.on('finish', async () => {
      // ✅ Generate public URL (NO makePublic needed)
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/category/${fileName}`;

      const newCategory = new Category({
        name,
        image: imageUrl
      });

      await newCategory.save();

      res.status(201).json({
        success: true,
        message: "Category added successfully",
        data: newCategory
      });
    });

    stream.end(req.file.buffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = { name };
    if (req.file) {
      const image = imagePath+`${req.file.filename}`;
      updateData.image = image;
    }
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating",
      error: error.message
    });
  }
};

// DELETE /category/delete/:id
exports.deleteCategory = async (req, res) => {
  try {

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting",
      error: error.message
    });
  }
};