export interface Image {
  id?: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  uploadedAt: Date;
  storagePath?: string;
}

export interface ImageResponse {
  code: string;
  status: string;
  data: Image | Image[] | null;
} 