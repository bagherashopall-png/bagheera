const Shop = require('../modal/shopmanage');
const imagePath = "/uploads/shops/";
const uploadToFirebase = require('../util/firebaseUpload');
const deleteFromFirebase = require('../util/firebaseDelete');

// CREATE
exports.addShop = async (req, res) => {
  try {
    const { shopName, place, openTime, closeTime, address,owner, isActive } = req.body;

    if (!shopName || !place || !owner || !openTime || !closeTime || !address || !isActive ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory'
      });
    }

    const result = await uploadToFirebase(req.file, 'shop');

    const newshopCat = new Shop({
      shopName,
      place, owner, openTime, closeTime, address,isActive,
      image: result.url 
    });

    await newshopCat.save();

    res.status(201).json({
      success: true,
      message: 'Shop Added',
      data: newshopCat
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// GET
exports.getShops = async (req, res) => {
  const shops = await Shop.find()
    .populate('owner', 'name userId') // 🔥 join user
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: shops
  });
  
};


exports.updateShop = async (req, res) => {
  try {
    const { name } = req.body;

    const existingShop = await Shop.findById(req.params.id);

    if (!existingShop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    let updateData = { name };

    // 🔥 image update
    if (req.file) {
      const result = await uploadToFirebase(req.file, 'shop');

      if (existingShop.image) {
        await deleteFromFirebase(existingShop.image);
      }
      updateData.image = result.url;
    }

    const updated = await Shop.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Updated",
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

// DELETE
exports.deleteShop = async (req, res) => {
   try {
    const category = await Shop.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    await deleteFromFirebase(category.image);

    // delete DB record
    await Shop.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting",
      error: error.message
    });
  }
}
  
function extractTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`; // ✅ 24hr format
}
