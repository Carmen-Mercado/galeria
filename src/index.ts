import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import { initializeFirebase } from './config/firebase';
import imagesRouter from './routes/images';

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

// Simple CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

// Images routes
app.use('/images', imagesRouter);

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
export const api = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB',
    minInstances: 0,
    maxInstances: 10,
    ingressSettings: "ALLOW_ALL"
  })
  .https.onRequest((req, res) => {
    // Set CORS headers for function
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    return app(req, res);
  }); 