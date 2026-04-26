const { bucket } = require('../config/firebase');
const compressImage = require('./imageCompress');

const uploadToFirebase = async (file, folder = 'common') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) return reject('No file provided');

      // 🔥 compress image before upload
      const compressed = await compressImage(file);

      const fileName = Date.now() + '-' + file.originalname;

      const fileUpload = bucket.file(`${folder}/${fileName}`);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: compressed.mimetype
        }
      });

      stream.on('error', (err) => reject(err.message));

      stream.on('finish', async () => {
		 
		 await fileUpload.makePublic();

        const url = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
        resolve({ url, fileName });
      });

      stream.end(compressed.buffer);

    } catch (err) {
      reject(err.message);
    }
  });
};

module.exports = uploadToFirebase;
