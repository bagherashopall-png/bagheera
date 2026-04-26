const sharp = require('sharp');

const compressImage = async (file) => {
  try {
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 800 }) // 👈 resize (optional but recommended)
      .jpeg({ quality: 70 })  // 👈 compress quality (0–100)
      .toBuffer();

    return {
      buffer: compressedBuffer,
      mimetype: 'image/jpeg'
    };
  } catch (error) {
    throw new Error('Image compression failed');
  }
};

module.exports = compressImage;