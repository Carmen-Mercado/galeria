import axios from 'axios';
import { cacheService } from './cache/cacheService';
import { Image } from '../types/image';

const API_URL = 'https://us-central1-galeria-b7e1d.cloudfunctions.net/api';

interface Filters {
  categories?: string[];
  tags?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

export const getImages = async (filters?: Filters) => {
  try {
    // Check cache first
    let cachedImages: Image[] | null = null;

    if (!filters) {
      cachedImages = cacheService.getImages();
    } else if (filters.categories?.length === 1) {
      cachedImages = cacheService.getCategoryImages(filters.categories[0]);
    } else if (filters.tags?.length === 1) {
      cachedImages = cacheService.getTagImages(filters.tags[0]);
    } else if (filters.startDate || filters.endDate) {
      cachedImages = cacheService.getDateRangeImages(filters.startDate || null, filters.endDate || null);
    }

    if (cachedImages) {
      return {
        code: 'SUCCESS',
        status: 'Images retrieved from cache',
        data: cachedImages
      };
    }

    // If not in cache or expired, fetch from API
    const params = new URLSearchParams();
    
    if (filters?.categories?.length) {
      params.append('category', filters.categories.join(','));
    }
    if (filters?.tags?.length) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }

    const url = `${API_URL}/images${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axios.get(url);

    // Cache the results
    if (response.data.code === 'SUCCESS') {
      const images = response.data.data as Image[];
      
      if (!filters) {
        cacheService.setImages(images);
      } else if (filters.categories?.length === 1) {
        cacheService.setCategoryImages(filters.categories[0], images);
      } else if (filters.tags?.length === 1) {
        cacheService.setTagImages(filters.tags[0], images);
      } else if (filters.startDate || filters.endDate) {
        cacheService.setDateRangeImages(filters.startDate || null, filters.endDate || null, images);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const uploadImage = async (formData: FormData) => {
  try {
    const file = formData.get('file') as File;
    const base64 = await convertFileToBase64(file);
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? JSON.parse(tagsString) : [];

    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      tags: tags,
      file: {
        name: file.name,
        type: file.type,
        data: base64,
      }
    };

    const response = await axios.post(`${API_URL}/images`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.code === 'SUCCESS') {
      // Clear cache when new image is added
      cacheService.clearCache();
    }

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const deleteImage = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/images/${id}`);
    
    if (response.data.code === 'SUCCESS') {
      // Remove image from cache
      cacheService.removeImage(id);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 