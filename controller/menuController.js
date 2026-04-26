const Menu = require('../modal/menuModal');
const imagePath = "/uploads/menu/";
const uploadToFirebase = require('../util/firebaseUpload');
const deleteFromFirebase = require('../util/firebaseDelete');

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
	
    let imageUrl = '';
    if (req.file) {
      imageUrl = imagePath+`${req.file.filename}`;
    }
	
	const result = await uploadToFirebase(req.file, 'menu');

    const menu = new Menu({
      shop: shopId,          // ✅ IMPORTANT (match schema)
      category,
      itemName,
      price,
      minQty,
      qty,
      isActive,
      image: result.url,

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
    const existingMenu = await Menu.findById(req.params.id);

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }

    let updateData = { ...req.body };

    // 🔥 image update
    if (req.file) {
      // 1. Upload new image
      const result = await uploadToFirebase(req.file, 'menu');

      // 2. Delete old image
      if (existingMenu.image) {
        await deleteFromFirebase(existingMenu.image);
      }

      // 3. Set new image
      updateData.image = result.url;
    }

    // 🔥 seller edit → re-approval
    if (req.body.type === 'seller') {
      updateData.isApproved = 'pending';
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Menu Updated',
      data: updatedMenu
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
	  
	 const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "menu not found"
      });
    }
    await deleteFromFirebase(menu.image);
    
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