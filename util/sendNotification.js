const admin = require('../config/firebase');

const sendNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token
    };

    await admin.messaging().send(message);
  } catch (err) {
    console.log('Notification error:', err);
  }
};

module.exports = sendNotification;