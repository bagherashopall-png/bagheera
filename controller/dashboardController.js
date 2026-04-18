const Menu = require('../modal/menuModal');
const Shop = require('../modal/shopmanage');
const Category = require('../modal/category');
const Order = require('../modal/order');
const User = require('../modal/user');

exports.getDashboardStats = async (req, res) => {
  try {
    const pending = await Menu.countDocuments({ isApproved: 'pending' });
    const approved = await Menu.countDocuments({ isApproved: 'approved' });
    const rejected = await Menu.countDocuments({ isApproved: 'rejected' });
    const shops = await Shop.countDocuments();
    const category = await Category.countDocuments();
    const order = await Order.countDocuments();
    const user = await User.countDocuments();

    const orders = await Order.find({});


    // 💰 total sales (only valid orders)
    const validOrders = orders.filter(o => 
      !['rejected', 'cancelled'].includes(o.orderStatus)
    );

    const totalSales = validOrders.reduce((sum, o) => {
      return sum + (o.pricing?.grandTotal || 0);
    }, 0);

    
    res.json({
      success: true,
      data: { pending, approved, rejected, shops ,category,order,user,totalSales}
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getMenuByStatus = async (req, res) => {
  try {
    const { status } = req.params;    
    const menus = await Menu.find({ isApproved: status })
      .populate('shop')
      .populate('category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: menus
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMenuStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { isApproved: status },
      { new: true }
    );

    res.json({
      success: true,
      message: `Menu ${status}`,
      data: menu
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllShopsWithOwner = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('owner') // 🔥 important
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: shops
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSellerDashboardStats = async (req, res) => {
  try {
    const { shopID, status } = req.query;

    if (!shopID) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID required'
      });
    }

    let filter = { shop: shopID };

    // 🔥 status filter
    if (status) {
      filter.isApproved = status; // pending | approved | rejected
    }

    const menus = await Menu.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    const orders = await Order.find({shopID});

    const totalOrders = orders.length;

    // 💰 total sales (only valid orders)
    const validOrders = orders.filter(o => 
      !['rejected', 'cancelled'].includes(o.orderStatus)
    );

    const totalSales = validOrders.reduce((sum, o) => {
      return sum + (o.pricing?.grandTotal || 0);
    }, 0);

      const statusCounts = orders.reduce((acc, order) => {
      const status = order.orderStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      count: menus.length,
      data: menus,
       stats: {
        totalOrders,
        totalSales,
        statusCounts
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.cancelSellerMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // 🔥 only pending can cancel
    if (menu.isApproved !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending items can be cancelled'
      });
    }

    await Menu.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Menu item cancelled'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};