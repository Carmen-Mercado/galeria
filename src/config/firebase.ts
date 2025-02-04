import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // For production deployment
      if (process.env.NODE_ENV === 'production') {
        const config = functions.config();
        
        const serviceAccount = {
          projectId: config.app?.project_id || process.env.APP_PROJECT_ID,
          clientEmail: config.app?.client_email || process.env.APP_CLIENT_EMAIL,
          privateKey: (config.app?.private_key || process.env.APP_PRIVATE_KEY)?.replace(/\\n/g, '\n')
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          storageBucket: `${serviceAccount.projectId}.appspot.com`
        });
      } else {
        // For local development
        const serviceAccount = {
          projectId: process.env.APP_PROJECT_ID,
          clientEmail: process.env.APP_CLIENT_EMAIL,
          privateKey: process.env.APP_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          storageBucket: `${process.env.APP_PROJECT_ID}.appspot.com`
        });
      }

      db = admin.firestore();
      storage = admin.storage();
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  } else {
    db = admin.firestore();
    storage = admin.storage();
  }
  return { admin, db, storage };
};

export { db, storage }; 