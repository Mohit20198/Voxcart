import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

let serviceAccount;
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountEnv) {
  try {
    serviceAccount = JSON.parse(serviceAccountEnv);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is valid JSON.');
  }
}

try {
  if (!getApps().length) {
    initializeApp({
      credential: serviceAccount 
        ? cert(serviceAccount)
        : applicationDefault(),
      projectId: serviceAccount ? serviceAccount.project_id : undefined
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

const db = getFirestore();

export { db };
