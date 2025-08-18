export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  category?: string;
  delivery_tier?: string;
}
