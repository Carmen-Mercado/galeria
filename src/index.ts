import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import { initializeFirebase } from './config/firebase';

// Load environment variables first
dotenv.config();

try {
  // Initialize Firebase Admin
  initializeFirebase();
  console.log('Firebase initialization successful');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start server in development, not when deployed as Firebase Function
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.APP_PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Firebase Functions
export const api = functions.https.onRequest(app); 