const { bucket } = require('../config/firebase');

const deleteFromFirebase = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    if (!bucket) throw new Error('Firebase bucket not initialized');

    // extract file path from URL
    const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = decodeURIComponent(fileUrl.replace(baseUrl, ''));

    // delete file
    await bucket.file(filePath).delete();

    return true;
  } catch (error) {
    console.log('Firebase delete error:', error.message);
    return false; // don’t break app flow
  }
};

module.exports = deleteFromFirebase;