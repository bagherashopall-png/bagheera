const admin = require('firebase-admin');

let bucket;

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.warn('⚠️ Firebase ENV not found');
} else {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
	 storageBucket: process.env.FIREBASE_STORAGE_BUCKET 
  });
    bucket = admin.storage().bucket();
}

module.exports = { admin, bucket };