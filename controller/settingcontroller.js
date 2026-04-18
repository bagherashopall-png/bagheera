const Settings = require('../modal/setting');
const Shop = require('../modal/shopmanage');

// 🔥 GET SETTINGS
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.find({ type: 'admin' });

    // if not exists → create default
    if (!settings) {
      settings = await Settings.create({ type: 'admin' });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// 🔥 SAVE / UPDATE SETTINGS
exports.saveSettings = async (req, res) => {
  try {
    const {
      defaultMargin,
      deliveryCharge,
      freeDeliveryAbove,
      appActive
    } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { type: 'admin' },
      {
        defaultMargin,
        deliveryCharge,
        freeDeliveryAbove,
        appActive
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Settings Saved',
      data: settings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// 🔥 SELLER TOGGLE (ALLOW / DISABLE ORDER)
exports.updateShopStatus = async (req, res) => {
  try {
    const { shopID, isActive } = req.body;

    if (!shopID) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID required'
      });
    }

    const shop = await Shop.findByIdAndUpdate(
      shopID,
      { isActive },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Shop status updated',
      data: shop
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getSellerSettings = async(req,res) => {
  
 try {
    
  const { shopID } = req.query;

    let settings = await Shop.find({ _id: shopID });
    
    res.json({
      success: true,
      data: settings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
