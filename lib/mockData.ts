// Comprehensive Mock Data for StreetStashed
// Fashion marketplace with stores, products, and categories

export interface MockStore {
  id: string
  name: string
  description: string
  rating: number
  reviewCount: number
  deliveryTime: string
  minOrder: number
  categories: string[]
  image: string
  location: string
  isVerified: boolean
}

export interface MockProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory: string
  storeId: string
  storeName: string
  images: string[]
  sizes: string[]
  colors: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isTrending: boolean
  tags: string[]
  created_at: string
}

export interface MockCategory {
  id: string
  name: string
  icon: string
  description: string
  productCount: number
  image: string
}

// Mock Stores
export const mockStores: MockStore[] = [
  {
    id: 'store-1',
    name: 'Urban Threads Collective',
    description: 'Premium streetwear and urban fashion from local designers',
    rating: 4.8,
    reviewCount: 1247,
    deliveryTime: '45-75 min',
    minOrder: 25,
    categories: ['clothing', 'shoes', 'accessories'],
    image: '/mock/default-product.jpg',
    location: 'Downtown District',
    isVerified: true
  },
  {
    id: 'store-2',
    name: 'Sneaker Haven',
    description: 'Exclusive sneakers and athletic wear from top brands',
    rating: 4.9,
    reviewCount: 892,
    deliveryTime: '30-60 min',
    minOrder: 50,
    categories: ['shoes', 'clothing'],
    image: '/mock/default-product.jpg',
    location: 'Sports District',
    isVerified: true
  },
  {
    id: 'store-3',
    name: 'Luxe Jewelry Co.',
    description: 'Handcrafted jewelry and luxury accessories',
    rating: 4.7,
    reviewCount: 567,
    deliveryTime: '60-90 min',
    minOrder: 75,
    categories: ['jewelry', 'accessories'],
    image: '/mock/default-product.jpg',
    location: 'Fashion Quarter',
    isVerified: true
  },
  {
    id: 'store-4',
    name: 'Vintage Vault',
    description: 'Curated vintage clothing and retro accessories',
    rating: 4.6,
    reviewCount: 423,
    deliveryTime: '45-75 min',
    minOrder: 30,
    categories: ['clothing', 'accessories'],
    image: '/mock/default-product.jpg',
    location: 'Arts District',
    isVerified: false
  },
  {
    id: 'store-5',
    name: 'Athletic Edge',
    description: 'Performance sportswear and fitness gear',
    rating: 4.8,
    reviewCount: 756,
    deliveryTime: '30-60 min',
    minOrder: 40,
    categories: ['clothing', 'shoes', 'accessories'],
    image: '/mock/default-product.jpg',
    location: 'Fitness District',
    isVerified: true
  }
]

// Mock Categories
export const mockCategories: MockCategory[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    icon: 'Clothing',
    description: 'Trendy streetwear and urban fashion',
    productCount: 156,
    image: '/mock/default-product.jpg'
  },
  {
    id: 'shoes',
    name: 'Shoes',
    icon: 'Shoes',
    description: 'Sneakers, boots, and casual footwear',
    productCount: 89,
    image: '/mock/default-product.jpg'
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: 'Jewelry',
    description: 'Necklaces, rings, and luxury accessories',
    productCount: 67,
    image: '/mock/default-product.jpg'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: 'Accessories',
    description: 'Bags, belts, hats, and more',
    productCount: 94,
    image: '/mock/default-product.jpg'
  },
  {
    id: 'watches',
    name: 'Watches',
    icon: 'Watches',
    description: 'Luxury timepieces and smartwatches',
    productCount: 34,
    image: '/mock/default-product.jpg'
  }
]

// Mock Products
export const mockProducts: MockProduct[] = [
      // Clothing
  {
    id: 'prod-1',
    name: 'Urban Street Hoodie',
    description: 'Premium cotton blend hoodie with street art graphics',
    price: 89.99,
    originalPrice: 129.99,
    category: 'clothing',
    subcategory: 'hoodies',
    storeId: 'store-1',
    storeName: 'Urban Threads Collective',
    images: ['/mock/hoodie-1.jpg', '/mock/hoodie-2.jpg', '/mock/hoodie-3.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray'],
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    isTrending: true,
    tags: ['hoodie', 'streetwear', 'cotton', 'graphics'],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'Vintage Denim Jacket',
    description: 'Authentic vintage denim jacket with distressed details',
    price: 145.00,
    category: 'clothing',
    subcategory: 'jackets',
    storeId: 'store-4',
    storeName: 'Vintage Vault',
    images: ['/mock/denim-jacket-1.jpg', '/mock/denim-jacket-2.jpg'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Blue'],
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    isTrending: false,
    tags: ['vintage', 'denim', 'jacket', 'distressed'],
    created_at: '2023-10-26T14:30:00Z'
  },
  {
    id: 'prod-3',
    name: 'Performance Leggings',
    description: 'High-performance athletic leggings with moisture-wicking technology',
    price: 65.99,
    category: 'clothing',
    subcategory: 'activewear',
    storeId: 'store-5',
    storeName: 'Athletic Edge',
    images: ['/mock/leggings-1.jpg', '/mock/leggings-2.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray', 'Pink'],
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    isTrending: true,
    tags: ['leggings', 'athletic', 'performance', 'moisture-wicking'],
    created_at: '2023-10-25T09:15:00Z'
  },
  
      // Shoes
  {
    id: 'prod-4',
    name: 'Limited Edition Sneakers',
    description: 'Exclusive collaboration sneakers with premium materials',
    price: 299.99,
    originalPrice: 399.99,
    category: 'shoes',
    subcategory: 'sneakers',
    storeId: 'store-2',
    storeName: 'Sneaker Haven',
    images: ['/mock/sneakers-1.jpg', '/mock/sneakers-2.jpg'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White/Black', 'Red/White'],
    rating: 4.9,
    reviewCount: 567,
    inStock: true,
    isTrending: true,
    tags: ['sneakers', 'limited edition', 'collaboration', 'premium'],
    created_at: '2023-10-24T11:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Classic Boots',
    description: 'Timeless leather boots perfect for any occasion',
    price: 189.99,
    category: 'shoes',
    subcategory: 'boots',
    storeId: 'store-1',
    storeName: 'Urban Threads Collective',
    images: ['/mock/boots-1.jpg', '/mock/boots-2.jpg'],
    sizes: ['8', '9', '10', '11'],
    colors: ['Brown', 'Black'],
    rating: 4.6,
    reviewCount: 123,
    inStock: true,
    isTrending: false,
    tags: ['boots', 'leather', 'classic', 'timeless'],
    created_at: '2023-10-23T16:45:00Z'
  },
  
      // Jewelry
  {
    id: 'prod-6',
    name: 'Diamond Pendant Necklace',
    description: 'Elegant 14k gold necklace with genuine diamond pendant',
    price: 899.99,
    originalPrice: 1299.99,
    category: 'jewelry',
    subcategory: 'necklaces',
    storeId: 'store-3',
    storeName: 'Luxe Jewelry Co.',
    images: ['/mock/necklace-1.jpg', '/mock/necklace-2.jpg'],
    sizes: ['16"', '18"', '20"'],
    colors: ['Yellow Gold', 'White Gold'],
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    isTrending: true,
    tags: ['necklace', 'diamond', 'gold', 'luxury'],
    created_at: '2023-10-22T10:30:00Z'
  },
  {
    id: 'prod-7',
    name: 'Sterling Silver Ring',
    description: 'Handcrafted sterling silver ring with unique design',
    price: 145.00,
    category: 'jewelry',
    subcategory: 'rings',
    storeId: 'store-3',
    storeName: 'Luxe Jewelry Co.',
    images: ['/mock/ring-1.jpg', '/mock/ring-2.jpg'],
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Silver'],
    rating: 4.7,
    reviewCount: 67,
    inStock: true,
    isTrending: false,
    tags: ['ring', 'sterling silver', 'handcrafted', 'unique'],
    created_at: '2023-10-21T15:15:00Z'
  },
  
      // Accessories
  {
    id: 'prod-8',
    name: 'Premium Leather Belt',
    description: 'Handcrafted full-grain leather belt with brass buckle',
    price: 89.99,
    category: 'accessories',
    subcategory: 'belts',
    storeId: 'store-1',
    storeName: 'Urban Threads Collective',
    images: ['/mock/default-product.jpg'],
    sizes: ['32"', '34"', '36"', '38"', '40"'],
    colors: ['Brown', 'Black', 'Tan'],
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    isTrending: true,
    tags: ['belt', 'leather', 'handcrafted', 'brass buckle'],
    created_at: '2023-10-20T09:00:00Z'
  },
  {
    id: 'prod-9',
    name: 'Designer Crossbody Bag',
    description: 'Stylish crossbody bag with multiple compartments',
    price: 165.00,
    category: 'accessories',
    subcategory: 'bags',
    storeId: 'store-4',
    storeName: 'Vintage Vault',
    images: ['/mock/default-product.jpg'],
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Navy'],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    isTrending: false,
    tags: ['bag', 'crossbody', 'designer', 'multi-compartment'],
    created_at: '2023-10-19T11:30:00Z'
  },
  
      // Watches
  {
    id: 'prod-10',
    name: 'Luxury Automatic Watch',
    description: 'Swiss-made automatic watch with premium craftsmanship',
    price: 1299.99,
    originalPrice: 1899.99,
    category: 'watches',
    subcategory: 'automatic',
    storeId: 'store-3',
    storeName: 'Luxe Jewelry Co.',
    images: ['/mock/default-product.jpg'],
    sizes: ['42mm'],
    colors: ['Silver/Black', 'Gold/White'],
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    isTrending: true,
    tags: ['watch', 'automatic', 'swiss-made', 'luxury'],
    created_at: '2023-10-18T14:00:00Z'
  }
]

// Featured Products for Homepage
export const featuredProducts = mockProducts.filter(p => p.isTrending).slice(0, 6)

// Featured Stores for Homepage
export const featuredStores = mockStores.filter(s => s.isVerified).slice(0, 4)

// 🔍 Search and Filter Functions
export const searchProducts = (query: string): MockProduct[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    product.storeName.toLowerCase().includes(lowercaseQuery)
  )
}

export const filterProductsByCategory = (category: string): MockProduct[] => {
  return mockProducts.filter(product => product.category === category)
}

export const filterProductsByStore = (storeId: string): MockProduct[] => {
  return mockProducts.filter(product => product.storeId === storeId)
}

export const getProductById = (id: string): MockProduct | undefined => {
  return mockProducts.find(product => product.id === id)
}

export const getStoreById = (id: string): MockStore | undefined => {
  return mockStores.find(store => store.id === id)
}
