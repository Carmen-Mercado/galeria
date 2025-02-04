export interface Image {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  uploadedAt: Date;
  storagePath?: string;
} 