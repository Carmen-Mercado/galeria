import express, { Request, Response } from 'express';
import { db, storage } from '../config/firebase';
import { Image, ImageResponse } from '../types/image';
import { Query, DocumentData } from 'firebase-admin/firestore';
import * as path from 'path';
import * as crypto from 'crypto';

const router = express.Router();

// Get images with filters
router.get('/', async (req: Request, res: Response) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { category, tags, startDate, endDate } = req.query;
    let query: Query<DocumentData> = db.collection('images');

    // Apply category filter
    if (category) {
      query = query.where('category', '==', category);
    }

    // Apply tags filter
    if (tags) {
      const tagArray = (tags as string).split(',');
      query = query.where('tags', 'array-contains-any', tagArray);
    }

    // Apply date range filter
    if (startDate && endDate) {
      query = query
        .where('uploadedAt', '>=', new Date(startDate as string))
        .where('uploadedAt', '<=', new Date(endDate as string));
    }

    const snapshot = await query.get();
    const images: Image[] = [];
    
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() } as Image);
    });

    const response: ImageResponse = {
      code: 'SUCCESS',
      status: 'Images retrieved successfully',
      data: images
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching images:', error);
    const response: ImageResponse = {
      code: 'ERROR',
      status: 'Failed to retrieve images',
      data: null
    };
    res.status(500).json(response);
  }
});

// Get specific image by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('images').doc(req.params.id).get();
    
    if (!doc.exists) {
      const response: ImageResponse = {
        code: 'NOT_FOUND',
        status: 'Image not found',
        data: null
      };
      return res.status(404).json(response);
    }

    const image = { id: doc.id, ...doc.data() } as Image;
    const response: ImageResponse = {
      code: 'SUCCESS',
      status: 'Image retrieved successfully',
      data: image
    };

    res.json(response);
  } catch (error) {
    const response: ImageResponse = {
      code: 'ERROR',
      status: 'Failed to retrieve image',
      data: null
    };
    res.status(500).json(response);
  }
});

// Upload new image
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, category, tags, file } = req.body;

    // Decode base64 file
    const fileBuffer = Buffer.from(file.data, 'base64');
    
    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const filePath = `images/${fileName}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileUpload = bucket.file(filePath);
    
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Get the public URL
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });

    // Create Firestore document
    const newImage: Image = {
      url,
      title,
      category,
      tags,
      uploadedAt: new Date(),
      storagePath: filePath
    };

    const docRef = await db.collection('images').add(newImage);
    
    const response: ImageResponse = {
      code: 'SUCCESS',
      status: 'Image uploaded successfully',
      data: { id: docRef.id, ...newImage }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error uploading image:', error);
    const response: ImageResponse = {
      code: 'ERROR',
      status: 'Failed to upload image',
      data: null
    };
    res.status(500).json(response);
  }
});

// Delete image
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('images').doc(req.params.id).get();
    
    if (!doc.exists) {
      const response: ImageResponse = {
        code: 'NOT_FOUND',
        status: 'Image not found',
        data: null
      };
      return res.status(404).json(response);
    }

    const imageData = doc.data() as Image;
    
    // Delete from Storage if storagePath exists
    if (imageData.storagePath) {
      const bucket = storage.bucket();
      await bucket.file(imageData.storagePath).delete();
    }

    // Delete from Firestore
    await db.collection('images').doc(req.params.id).delete();
    
    const response: ImageResponse = {
      code: 'SUCCESS',
      status: 'Image deleted successfully',
      data: null
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting image:', error);
    const response: ImageResponse = {
      code: 'ERROR',
      status: 'Failed to delete image',
      data: null
    };
    res.status(500).json(response);
  }
});

export default router; 