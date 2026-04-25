const Shop = require('../modal/shopmanage');
const imagePath = "/uploads/shops/";

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

    // const openTime = extractTime(req.body.openTime);
    //const closeTime = extractTime(req.body.closeTime);

    const imageUrl = imagePath+`${req.file.filename}`;

    const newshopCat = new Shop({
      shopName,
      place, owner, openTime, closeTime, address,isActive,
      image: imageUrl
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

// UPDATE
exports.updateShop = async (req, res) => {
  await Shop.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Updated'
  });
};

// DELETE
exports.deleteShop = async (req, res) => {
  await Shop.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Deleted'
  });
};

function extractTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`; // ✅ 24hr format
}
