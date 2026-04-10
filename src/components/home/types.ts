export interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface GalleryImage {
  asset_id: string;
  secure_url: string;
  public_id: string;
  created_at: string;
  width: number;
  height: number;
}
