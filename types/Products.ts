export interface Product {
  id: string;
  name: string;
  price: number;
  /** Preferred key used across the app and DB */
  image_url?: string;
  /** Temporary alias kept to avoid breaking older code */
  image?: string;
}
