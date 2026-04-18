const Menu = require('../modal/menuModal');
const imagePath = "/uploads/menu/";

exports.addMenu = async (req, res) => {
  try {

    let shopId = '';

    // 🔥 seller vs admin logic
    if (req.body.type === 'seller') {
      shopId = req.body.shopID;
    } else {
      shopId = req.body.shop;
    }

    const { category, itemName, price, minQty, qty, isActive } = req.body;

    // ✅ validation
    if (!shopId || !category || !itemName || !price) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory'
      });
    }

    // ✅ safe image
    let imageUrl = '';
    if (req.file) {
      imageUrl = imagePath+`${req.file.filename}`;
    }

    // 🔥 create menu
    const menu = new Menu({
      shop: shopId,          // ✅ IMPORTANT (match schema)
      category,
      itemName,
      price,
      minQty,
      qty,
      isActive,
      image: imageUrl,

      // 🔥 seller approval logic
      isApproved: req.body.type === 'seller' ? 'pending' : 'approved'
    });

    await menu.save();

    res.status(201).json({
      success: true,
      message: req.body.type === 'seller'
        ? 'Menu sent for approval'
        : 'Menu Item Added',
      data: menu
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
// GET


exports.getMenu = async (req, res) => {
  try {
    let filter = {};
    // 🔥 seller logic
    if (req.query.type === 'seller') {
      const shopId = req.query.shopID;
      filter.shop = shopId;
    }
    const menu = await Menu.find(filter)
      .populate('shop', 'shopName')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: menu
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    let updateData = req.body;
    // 🔥 image update
    if (req.file) {
      updateData.image = imagePath+`${req.file.filename}`;
    }
    // 🔥 seller edit → re-approval
    if (req.body.type === 'seller') {
      updateData.isApproved = 'pending';
    }
    await Menu.findByIdAndUpdate(req.params.id, updateData);
    res.json({
      success: true,
      message: 'Menu Updated'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {

    await Menu.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Menu Deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};