import { Image } from '../../types/image';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface ImageCache {
  allImages: CacheEntry<Image[]>;
  categoryImages: { [category: string]: CacheEntry<Image[]> };
  tagImages: { [tag: string]: CacheEntry<Image[]> };
  dateRangeImages: { [key: string]: CacheEntry<Image[]> };
}

const CACHE_KEY = 'image_gallery_cache';
const DEFAULT_EXPIRATION = 5 * 60 * 1000; // 5 minutes

export class CacheService {
  private cache: ImageCache;

  constructor() {
    this.cache = this.loadCache();
  }

  private loadCache(): ImageCache {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {
      allImages: { data: [], timestamp: 0, expiresIn: DEFAULT_EXPIRATION },
      categoryImages: {},
      tagImages: {},
      dateRangeImages: {},
    };
  }

  private saveCache(): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }

  private generateDateRangeKey(startDate: Date | null, endDate: Date | null): string {
    return `${startDate?.toISOString() || 'null'}_${endDate?.toISOString() || 'null'}`;
  }

  getImages(): Image[] | null {
    const entry = this.cache.allImages;
    if (!entry || this.isExpired(entry)) return null;
    return entry.data;
  }

  getCategoryImages(category: string): Image[] | null {
    const entry = this.cache.categoryImages[category];
    if (!entry || this.isExpired(entry)) return null;
    return entry.data;
  }

  getTagImages(tag: string): Image[] | null {
    const entry = this.cache.tagImages[tag];
    if (!entry || this.isExpired(entry)) return null;
    return entry.data;
  }

  getDateRangeImages(startDate: Date | null, endDate: Date | null): Image[] | null {
    const key = this.generateDateRangeKey(startDate, endDate);
    const entry = this.cache.dateRangeImages[key];
    if (!entry || this.isExpired(entry)) return null;
    return entry.data;
  }

  setImages(images: Image[], expiresIn: number = DEFAULT_EXPIRATION): void {
    this.cache.allImages = {
      data: images,
      timestamp: Date.now(),
      expiresIn,
    };
    this.saveCache();
  }

  setCategoryImages(category: string, images: Image[], expiresIn: number = DEFAULT_EXPIRATION): void {
    this.cache.categoryImages[category] = {
      data: images,
      timestamp: Date.now(),
      expiresIn,
    };
    this.saveCache();
  }

  setTagImages(tag: string, images: Image[], expiresIn: number = DEFAULT_EXPIRATION): void {
    this.cache.tagImages[tag] = {
      data: images,
      timestamp: Date.now(),
      expiresIn,
    };
    this.saveCache();
  }

  setDateRangeImages(startDate: Date | null, endDate: Date | null, images: Image[], expiresIn: number = DEFAULT_EXPIRATION): void {
    const key = this.generateDateRangeKey(startDate, endDate);
    this.cache.dateRangeImages[key] = {
      data: images,
      timestamp: Date.now(),
      expiresIn,
    };
    this.saveCache();
  }

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    this.cache = this.loadCache();
  }

  updateImage(updatedImage: Image): void {
    // Update image in all cache entries
    Object.values(this.cache).forEach(cacheGroup => {
      if (Array.isArray(cacheGroup.data)) {
        const index = cacheGroup.data.findIndex((img: Image) => img.id === updatedImage.id);
        if (index !== -1) {
          cacheGroup.data[index] = updatedImage;
        }
      }
    });
    this.saveCache();
  }

  removeImage(imageId: string): void {
    // Remove image from all cache entries
    Object.values(this.cache).forEach(cacheGroup => {
      if (Array.isArray(cacheGroup.data)) {
        cacheGroup.data = cacheGroup.data.filter((img: Image) => img.id !== imageId);
      }
    });
    this.saveCache();
  }
}

export const cacheService = new CacheService(); 