import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

let serviceAccount;
let serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountEnv) {
  try {
    if (serviceAccountEnv.trim().startsWith("'") && serviceAccountEnv.trim().endsWith("'")) {
      serviceAccountEnv = serviceAccountEnv.trim().slice(1, -1);
    }
    
    // Check if it looks like JSON
    if (serviceAccountEnv.trim().startsWith('{')) {
      // Sometimes newlines are double escaped by hosting platforms
      const sanitized = serviceAccountEnv.replace(/\\\\n/g, '\\n');
      serviceAccount = JSON.parse(sanitized);
    } else {
      // Assume it's base64 encoded
      const decoded = Buffer.from(serviceAccountEnv, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    }
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is valid JSON or base64 encoded JSON.', error);
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
