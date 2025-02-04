import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // For production deployment
      if (process.env.NODE_ENV === 'production') {
        // Get config from Firebase Functions config
        const config = functions.config();
        
        const serviceAccount = {
          projectId: config.app?.project_id || process.env.APP_PROJECT_ID,
          clientEmail: config.app?.client_email || process.env.APP_CLIENT_EMAIL,
          privateKey: (config.app?.private_key || process.env.APP_PRIVATE_KEY)?.replace(/\\n/g, '\n')
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        });
      } else {
        // For local development
        const serviceAccount = {
          projectId: process.env.APP_PROJECT_ID,
          clientEmail: process.env.APP_CLIENT_EMAIL,
          privateKey: process.env.APP_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        });
      }

      db = admin.firestore();
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  } else {
    db = admin.firestore();
  }
  return { admin, db };
};

export { db }; 