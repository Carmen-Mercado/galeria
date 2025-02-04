import axios from 'axios';

const API_URL = 'https://us-central1-galeria-b7e1d.cloudfunctions.net/api';

interface Filters {
  categories?: string[];
  tags?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

export const getImages = async (filters?: Filters) => {
  try {
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
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const uploadImage = async (formData: FormData) => {
  try {
    // Convert file to base64
    const file = formData.get('file') as File;
    const base64 = await convertFileToBase64(file);

    // Parse tags from JSON string
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? JSON.parse(tagsString) : [];

    // Create payload
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
        // Remove data:image/jpeg;base64, prefix
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
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 