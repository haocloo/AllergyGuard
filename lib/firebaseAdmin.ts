import admin from 'firebase-admin';

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
    throw new Error('FIREBASE_ADMIN_CREDENTIALS environment variable is not set.');
  }
  // Parse the service account JSON string stored in the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminFirestore = admin.firestore(); 