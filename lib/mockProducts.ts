export type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

export interface Store {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const mockProducts = [
  {
    id: 'PROD-001',
    name: 'StreetStashed Hoodie',
    type: 'product',
    price: '$70',
    image: '/images/mock-hoodie.jpg',
  },
  {
    id: 'BUNDLE-001',
    name: 'Weekend Fit Bundle',
    type: 'bundle',
    price: '$150',
    image: '/images/mock-bundle.jpg',
  },
  {
    id: 'PROD-002',
    name: 'Culture Kicks',
    type: 'product',
    price: '$110',
    image: '/images/mock-sneakers.jpg',
  },
];

export const stores: Store[] = [
  { id: 'store1', name: 'Mock Store 1' },
  { id: 'store2', name: 'Mock Store 2' },
  { id: 'store3', name: 'Mock Store 3' },
];

export const products: Record<string, Product[]> = {
  store1: [
    { id: 'p1', name: 'T-Shirt', price: 19.99, image: 'https://via.placeholder.com/150' },
    { id: 'p2', name: 'Snapback Hat', price: 24.99, image: 'https://via.placeholder.com/150' },
    { id: 'p3', name: 'Hoodie', price: 49.99, image: 'https://via.placeholder.com/150' },
  ],
  store2: [
    { id: 'p4', name: 'Sneakers', price: 79.99, image: 'https://via.placeholder.com/150' },
    { id: 'p5', name: 'Graphic Socks', price: 9.99, image: 'https://via.placeholder.com/150' },
    { id: 'p6', name: 'Dad Hat', price: 22.5, image: 'https://via.placeholder.com/150' },
  ],
  store3: [
    { id: 'p7', name: 'Leather Jacket', price: 199.99, image: 'https://via.placeholder.com/150' },
    { id: 'p8', name: 'Denim Jeans', price: 59.99, image: 'https://via.placeholder.com/150' },
    { id: 'p9', name: 'Aviator Sunglasses', price: 129.99, image: 'https://via.placeholder.com/150' },
  ],
};
