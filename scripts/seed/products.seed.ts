#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

// Mock product data structure
interface MockProduct {
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
  blurDataURLs: string[]
  sizes: string[]
  colors: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isTrending: boolean
  tags: string[]
  created_at: string
}

// Store data
const stores = [
  {
    id: 'store-1',
    name: 'Urban Threads Collective',
    description: 'Premium streetwear and urban fashion from local designers',
    rating: 4.8,
    reviewCount: 1247,
    deliveryTime: '45-75 min',
    minOrder: 25,
    categories: ['clothing', 'shoes', 'accessories'],
    image: '/images/mock/streetwear/hoodie-01.webp',
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
    image: '/images/mock/sneakers/sneakers-01.webp',
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
    image: '/images/mock/jewelry/jewelry-01.webp',
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
    image: '/images/mock/streetwear/streetwear-01.webp',
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
    image: '/images/mock/streetwear/streetwear-02.webp',
    location: 'Fitness District',
    isVerified: true
  }
]

// Product names and descriptions by category
const productData = {
  sneakers: {
    names: [
      'Air Jordan Retro High OG', 'Nike Air Force 1 Low', 'Adidas Yeezy Boost 350',
      'Converse Chuck Taylor All Star', 'Vans Old Skool', 'New Balance 574',
      'Nike Dunk Low', 'Adidas Ultraboost', 'Jordan 1 Mid', 'Nike Air Max 90',
      'Yeezy 700 V3', 'Nike SB Dunk', 'Adidas NMD', 'Jordan 4 Retro',
      'Nike Air Jordan 6', 'Adidas Stan Smith', 'Nike Blazer Mid',
      'Jordan 11 Retro', 'Nike Air Jordan 3', 'Adidas Gazelle',
      'Nike Air Jordan 5', 'Yeezy 500', 'Nike Air Jordan 12',
      'Adidas Superstar'
    ],
    descriptions: [
      'Classic retro basketball sneakers with premium materials',
      'Timeless street style with superior comfort',
      'Innovative design meets urban fashion',
      'Iconic canvas sneakers for everyday wear',
      'Skate-inspired design with classic side stripe',
      'Comfortable lifestyle sneakers with heritage appeal',
      'Basketball-inspired street style',
      'Revolutionary running technology for street wear',
      'Mid-top basketball heritage with modern comfort',
      'Air cushioning technology for ultimate comfort',
      'Futuristic design with innovative materials',
      'Skateboarding heritage meets street fashion',
      'Revolutionary running technology for lifestyle',
      'Basketball heritage with premium materials',
      'Classic basketball design with modern comfort',
      'Timeless tennis-inspired street style',
      'Basketball heritage meets skate culture',
      'Basketball excellence with premium materials',
      'Basketball heritage with innovative comfort',
      'Classic tennis heritage for street style',
      'Basketball heritage with innovative design',
      'Futuristic design with premium comfort',
      'Basketball heritage with luxury materials',
      'Iconic tennis heritage for street culture'
    ],
    subcategories: ['basketball', 'lifestyle', 'running', 'skate', 'retro', 'premium']
  },
  streetwear: {
    names: [
      'Oversized Street Hoodie', 'Vintage Denim Jacket', 'Cargo Pants',
      'Bomber Jacket', 'Track Suit Set', 'Oversized T-Shirt',
      'Street Style Sweatpants', 'Urban Windbreaker', 'Street Fashion Blazer',
      'Urban Cargo Shorts', 'Street Style Cardigan', 'Urban Bomber Vest',
      'Street Fashion Shirt', 'Urban Track Jacket', 'Street Style Sweater',
      'Urban Cargo Joggers', 'Street Fashion Blouse', 'Urban Track Pants',
      'Street Style Jacket', 'Urban Bomber Jacket', 'Street Fashion Dress',
      'Urban Cargo Vest', 'Street Style Top', 'Urban Track Vest',
      'Street Fashion Pants'
    ],
    descriptions: [
      'Premium cotton blend with street art graphics',
      'Authentic vintage denim with distressed details',
      'Functional cargo design with street style',
      'Classic bomber silhouette with urban edge',
      'Co-ordinated set for ultimate street style',
      'Oversized fit with bold street graphics',
      'Comfortable sweatpants with street aesthetic',
      'Lightweight protection with urban style',
      'Sophisticated street style with urban edge',
      'Functional shorts with street fashion appeal',
      'Layered street style with urban comfort',
      'Lightweight vest with bomber aesthetics',
      'Street fashion with urban sophistication',
      'Athletic heritage with street style',
      'Cozy street style with urban comfort',
      'Functional joggers with street fashion',
      'Elegant street style with urban appeal',
      'Athletic comfort with street aesthetics',
      'Versatile street style with urban edge',
      'Classic bomber with street fashion',
      'Street style elegance with urban comfort',
      'Functional vest with street aesthetics',
      'Street fashion with urban sophistication',
      'Lightweight vest with street style',
      'Street fashion pants with urban comfort'
    ],
    subcategories: ['hoodies', 'jackets', 'pants', 'tops', 'sets', 'accessories']
  },
  jewelry: {
    names: [
      'Gold Chain Necklace', 'Diamond Pendant', 'Sterling Silver Ring',
      'Luxury Bracelet', 'Gold Hoop Earrings', 'Diamond Studs',
      'Gold Cuban Link Chain', 'Luxury Watch', 'Gold Ring',
      'Diamond Necklace', 'Gold Bracelet', 'Silver Chain',
      'Luxury Pendant', 'Gold Earrings', 'Diamond Ring',
      'Gold Necklace', 'Luxury Bracelet', 'Silver Ring',
      'Gold Pendant', 'Diamond Earrings', 'Luxury Chain',
      'Gold Studs', 'Silver Necklace', 'Diamond Bracelet',
      'Gold Chain', 'Luxury Ring'
    ],
    descriptions: [
      'Premium 14k gold chain with urban style',
      'Genuine diamond pendant with luxury appeal',
      'Handcrafted sterling silver with unique design',
      'Premium gold bracelet with urban aesthetics',
      'Classic gold hoops with street style',
      'Genuine diamond studs with luxury comfort',
      'Cuban link chain with urban heritage',
      'Swiss-made luxury timepiece with premium craftsmanship',
      'Premium gold ring with urban design',
      'Genuine diamond necklace with luxury appeal',
      'Premium gold bracelet with urban style',
      'Sterling silver chain with street aesthetics',
      'Luxury pendant with urban sophistication',
      'Premium gold earrings with street style',
      'Genuine diamond ring with luxury design',
      'Premium gold necklace with urban appeal',
      'Luxury bracelet with street aesthetics',
      'Sterling silver ring with urban design',
      'Premium gold pendant with street style',
      'Genuine diamond earrings with luxury appeal',
      'Luxury chain with urban aesthetics',
      'Premium gold studs with street style',
      'Sterling silver necklace with urban appeal',
      'Genuine diamond bracelet with luxury design',
      'Premium gold chain with urban style',
      'Luxury ring with street aesthetics'
    ],
    subcategories: ['necklaces', 'rings', 'earrings', 'bracelets', 'watches', 'pendants']
  },
  'stylist-bundles': {
    names: [
      'Urban Street Bundle', 'Street Style Ensemble', 'Urban Fashion Set',
      'Streetwear Coordination', 'Urban Lifestyle Bundle', 'Street Fashion Pack',
      'Urban Style Collection', 'Streetwear Essentials', 'Urban Fashion Bundle',
      'Street Style Set', 'Urban Lifestyle Pack', 'Street Fashion Bundle',
      'Urban Style Pack', 'Streetwear Collection', 'Urban Fashion Set',
      'Street Style Bundle', 'Urban Lifestyle Set', 'Street Fashion Pack',
      'Urban Style Bundle', 'Streetwear Pack', 'Urban Fashion Collection',
      'Street Style Collection', 'Urban Lifestyle Bundle', 'Street Fashion Set',
      'Urban Style Collection', 'Streetwear Bundle'
    ],
    descriptions: [
      'Complete street style outfit with urban edge',
      'Co-ordinated ensemble for ultimate street fashion',
      'Curated fashion set with urban sophistication',
      'Perfectly matched streetwear coordination',
      'Lifestyle bundle with urban comfort and style',
      'Complete street fashion pack with urban appeal',
      'Urban style collection with street aesthetics',
      'Essential streetwear pieces for urban lifestyle',
      'Complete fashion bundle with urban edge',
      'Perfectly styled street set with urban comfort',
      'Lifestyle pack with street fashion appeal',
      'Complete fashion bundle with urban style',
      'Urban style pack with street aesthetics',
      'Curated streetwear collection with urban edge',
      'Complete fashion set with street style',
      'Urban lifestyle set with fashion appeal',
      'Complete street fashion pack with urban style',
      'Urban style bundle with street aesthetics',
      'Complete streetwear pack with urban edge',
      'Curated fashion collection with street style',
      'Perfect street style collection with urban appeal',
      'Complete lifestyle bundle with street fashion',
      'Urban style collection with street appeal',
      'Complete streetwear bundle with urban style'
    ],
    subcategories: ['outfits', 'ensembles', 'sets', 'collections', 'bundles', 'packs']
  }
}

// Generate mock products
function generateMockProducts(): MockProduct[] {
  const products: MockProduct[] = []
  let productId = 1

  // Load manifest to get image data
  const manifestPath = path.join(process.cwd(), 'public/images/mock/manifest.json')
  let manifest: any = { images: [] }

  try {
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    }
  } catch (_error) {
    console.warn('⚠️  Could not load manifest, using fallback images')
  }

  // Generate products for each category
  for (const [category, data] of Object.entries(productData)) {
    const categoryImages = manifest.images?.filter((img: any) => img.category === category) || []

    for (let i = 0; i < 24; i++) {
      const name = data.names[i]
      const description = data.descriptions[i]
      const subcategory = data.subcategories[i % data.subcategories.length]

      // Select store based on category
      let storeId = 'store-1'
      let storeName = 'Urban Threads Collective'

      if (category === 'sneakers') {
        storeId = 'store-2'
        storeName = 'Sneaker Haven'
      } else if (category === 'jewelry') {
        storeId = 'store-3'
        storeName = 'Luxe Jewelry Co.'
      } else if (category === 'stylist-bundles') {
        storeId = 'store-4'
        storeName = 'Vintage Vault'
      }

      // Get images for this product
      const productImages = categoryImages.slice(i * 2, (i + 1) * 2)
      const images = productImages.length > 0
        ? productImages.map((img: any) => img.path)
        : [`/images/mock/${category}/${category}-${(i + 1).toString().padStart(2, '0')}.webp`]

      const blurDataURLs = productImages.length > 0
        ? productImages.map((img: any) => img.blurDataURL)
        : ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=']

      // Generate pricing
      let price = 0
      let originalPrice: number | undefined

      if (category === 'sneakers') {
        price = Math.floor(Math.random() * 200) + 100 // $100-$300
        if (Math.random() > 0.7) {
          originalPrice = Math.floor(price * 1.3)
        }
      } else if (category === 'streetwear') {
        price = Math.floor(Math.random() * 80) + 40 // $40-$120
        if (Math.random() > 0.6) {
          originalPrice = Math.floor(price * 1.25)
        }
      } else if (category === 'jewelry') {
        price = Math.floor(Math.random() * 500) + 200 // $200-$700
        if (Math.random() > 0.8) {
          originalPrice = Math.floor(price * 1.4)
        }
      } else if (category === 'stylist-bundles') {
        price = Math.floor(Math.random() * 150) + 80 // $80-$230
        if (Math.random() > 0.5) {
          originalPrice = Math.floor(price * 1.2)
        }
      }

      const product: MockProduct = {
        id: `prod-${productId.toString().padStart(3, '0')}`,
        name,
        description,
        price,
        originalPrice,
        category,
        subcategory,
        storeId,
        storeName,
        images,
        blurDataURLs,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Navy', 'Gray'],
        rating: Math.floor(Math.random() * 15) / 10 + 4.0, // 4.0-5.5
        reviewCount: Math.floor(Math.random() * 500) + 50,
        inStock: Math.random() > 0.1,
        isTrending: Math.random() > 0.7,
        tags: [category, subcategory, 'streetwear', 'urban', 'fashion'],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      products.push(product)
      productId++
    }
  }

  return products
}

// Generate categories
function generateCategories() {
  return [
    {
      id: 'sneakers',
      name: 'Sneakers',
      icon: '👟',
      description: 'Premium sneakers and athletic footwear',
      productCount: 24,
      image: '/images/mock/sneakers/sneakers-01.webp'
    },
    {
      id: 'streetwear',
      name: 'Streetwear',
      icon: '👕',
      description: 'Urban fashion and street style',
      productCount: 24,
      image: '/images/mock/streetwear/streetwear-01.webp'
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      icon: '💍',
      description: 'Luxury jewelry and accessories',
      productCount: 24,
      image: '/images/mock/jewelry/jewelry-01.webp'
    },
    {
      id: 'stylist-bundles',
      name: 'Stylist Bundles',
      icon: '👗',
      description: 'Complete outfit coordination',
      productCount: 24,
      image: '/images/mock/stylist-bundles/streetwear-outfit-01.webp'
    }
  ]
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting product seed generation...')

    // Generate mock data
    const products = generateMockProducts()
    const categories = generateCategories()

    console.log(`📊 Generated ${products.length} products`)
    console.log(`📊 Generated ${categories.length} categories`)

    // Create output directory
    const outputDir = path.join(process.cwd(), 'scripts/seed/output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save products
    const productsPath = path.join(outputDir, 'products.json')
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))
    console.log(`✅ Products saved to: ${productsPath}`)

    // Save categories
    const categoriesPath = path.join(outputDir, 'categories.json')
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2))
    console.log(`✅ Categories saved to: ${categoriesPath}`)

    // Save stores
    const storesPath = path.join(outputDir, 'stores.json')
    fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2))
    console.log(`✅ Stores saved to: ${storesPath}`)

    // Create mock data file for the app
    const mockDataPath = path.join(process.cwd(), 'lib/mockData.ts')
    const mockDataContent = `// Auto-generated mock data
export const mockProducts = ${JSON.stringify(products, null, 2)}

export const mockCategories = ${JSON.stringify(categories, null, 2)}

export const mockStores = ${JSON.stringify(stores, null, 2)}

// Types
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
  blurDataURLs: string[]
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
`

    fs.writeFileSync(mockDataPath, mockDataContent)
    console.log(`✅ Mock data updated: ${mockDataPath}`)

    console.log('\n🎉 Product seed generation complete!')
    console.log('📁 Files saved to: scripts/seed/output/')
    console.log('📋 Mock data updated: lib/mockData.ts')
    console.log('\n💡 Next steps:')
    console.log('1. Restart your dev server')
    console.log('2. Check the marketplace and homepage!')
    console.log('3. All products now have diverse images!')

  } catch (error) {
    console.error('❌ Error generating product seeds:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { generateCategories, generateMockProducts, generateMockProducts as generateProducts }

