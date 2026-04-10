export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface UploadImage {
  asset_id: string;
  public_id: string;
  secure_url: string;
  created_at: string;
  bytes: number;
  format: string;
}
