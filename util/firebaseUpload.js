const { bucket } = require('../config/firebase');

const uploadToFirebase = (file, folder = 'common') => {
  return new Promise((resolve, reject) => {
    if (!file) return reject('No file provided');
    if (!bucket) return reject('Firebase bucket not initialized');

    const fileName = Date.now() + '-' + file.originalname;
    const fileUpload = bucket.file(`${folder}/${fileName}`);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    stream.on('error', (err) => {
      reject(err.message);
    });

    stream.on('finish', async () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
      resolve({ url, fileName });
    });

    stream.end(file.buffer);
  });
};

module.exports = uploadToFirebase;
