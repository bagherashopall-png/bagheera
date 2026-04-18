const Order = require('../modal/order');
const Shop = require('../modal/shopmanage');
const userModel = require('../modal/userAccess');
const sendNotification = require('../util/sendNotification');

exports.placeOrder = async (req, res) => {
  try {
    const payload = req.body;

    // 🔥 validation (basic)
    if (!payload.userId || !payload.items || payload.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data'
      });
    }

    // ✅ create order
    const newOrder = new Order({
      ...payload,
      orderId: payload.orderId || 'ORD-' + Date.now()
    });

    await newOrder.save();

    await notifyNewOrder(newOrder);

    // ⏳ fake delay (for UI feel)
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder
      });
    }, 2000); // 2 sec delay

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.updateOrder = async (req, res) => {
  try {

    const { orderId, status, actionBy, cancelReason } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'OrderId and status required'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const currentStatus = order.orderStatus;

    // 🔐 ROLE CHECK
    const role = actionBy?.role; // 👈 IMPORTANT (send from frontend)

    const rolePermissions = {
      admin: ['placed', 'accepted', 'prepared', 'dispatched', 'delivered', 'rejected'],
      seller: ['accepted', 'prepared', 'rejected'],
      delivery: ['dispatched', 'delivered', 'rejected']
    };

    if (!rolePermissions[role]?.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `Role ${role} not allowed to perform this action`
      });
    }

    // 🔒 STATUS FLOW VALIDATION
    if (status === 'accepted' && currentStatus !== 'placed') {
      return res.status(400).json({ message: 'Only placed order can be accepted' });
    }

    if (status === 'prepared' && currentStatus !== 'accepted') {
      return res.status(400).json({ message: 'Order must be accepted first' });
    }

    if (status === 'dispatched' && currentStatus !== 'prepared') {
      return res.status(400).json({ message: 'Order must be prepared first' });
    }

    if (status === 'delivered' && currentStatus !== 'dispatched') {
      return res.status(400).json({ message: 'Order must be dispatched first' });
    }

    if (status === 'rejected' && currentStatus === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // ✅ Update
    order.orderStatus = status;
    if (cancelReason) {
      order.cancelReason = cancelReason;
    }

    // ✅ Save action log
    if (!order.statusHistory) order.statusHistory = [];

    order.statusHistory.push({
      status,
      actionBy,
      time: new Date()
    });

    order.lastActionBy = actionBy;

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


exports.getAllOrderList = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate({
        path: 'shopID',
        model: Shop, // 👈 VERY IMPORTANT in your case
        select: 'shopName address place image',
        populate: {
          path: 'owner',          // 👈 from shop schema
          model: userModel,          // 👈 your user model name
          select: 'name contact'   // 👈 only required fields
        }
      })
      .sort({ createdAt: -1 });

    // 🔥 Transform for frontend (no UI change needed)
    const formattedOrders = orders.map(order => {
      const shop = order.shopID;
      const owner = shop?.owner;
      return {
        ...order._doc,
        shopName: shop?.shopName || order.shopName,
        shopAddress: shop
          ? `${shop.address || ''}, ${shop.place || ''}`
          : '',
        shopImage: shop?.image,
        shopOwnerName: owner?.name,
        shopPhone: owner?.contact
      };
    });

    res.json({
      success: true,
      data: formattedOrders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.getAllSellerOrder = async (req, res) => {
  try {
    const order = await Order.find({ shopID: req.query.shopID }).sort({ createdAt: -1 });;
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// POST /order/feedback/:orderId
exports.addFeedback = async (req, res) => {
  try {

    const orderId = req.params.id;
    const { rating, review } = req.body;

    // 🔍 1. Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ❌ 2. Allow only delivered orders
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Feedback allowed only after delivery'
      });
    }

    // ❌ 3. Prevent duplicate feedback
    if (order.feedback && order.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted'
      });
    }

    // ❌ 4. Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // ✅ 5. Save feedback
    order.feedback = {
      rating,
      review,
      createdAt: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Feedback saved successfully',
      data: order.feedback
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST /order/cancel/:orderId
exports.cancel = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason, userId } = req.body;


    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ❌ Already cancelled / delivered
    if (['cancelled', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // ❌ Check if already prepared or beyond
    const blockedStatuses = ['prepared', 'dispatched', 'delivered'];

    if (blockedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order already prepared, cannot cancel'
      });
    }

    // ✅ Cancel allowed
    order.orderStatus = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';

    // ✅ Add to timeline
    order.statusHistory.push({
      status: 'cancelled',
      actionBy: {
        personID: userId,
        name: 'User',
        role: 'user',
      },
      time: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getUserOrder = async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

async function notifyNewOrder(order) {

  const seller = await userModel.findById(order.shopID);
  const deliveryGuys = await userModel.find({ role: 'delivery' });

  // 🟢 Seller
  if (seller?.fcmToken) {
    await sendNotification(
      seller.fcmToken,
      '🛒 New Order',
      `Order #${order.orderId} received`
    );
  }

  // 🟡 Delivery
  for (let d of deliveryGuys) {
    if (d.fcmToken) {
      await sendNotification(
        d.fcmToken,
        '📦 New Delivery',
        `Pickup from ${order.shopName}`
      );
    }
  }
}