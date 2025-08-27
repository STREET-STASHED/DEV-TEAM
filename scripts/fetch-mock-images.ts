#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Mock image data structure
interface MockImage {
  path: string
  blurDataURL: string
  category: string
  name: string
}

// Categories and their search terms
const categories = {
  sneakers: [
    'sneakers', 'jordan', 'nike', 'adidas', 'yeezy', 'converse', 'vans', 'new-balance',
    'air-force', 'dunks', 'chunky-sneakers', 'platform-sneakers', 'retro-sneakers'
  ],
  streetwear: [
    'hoodie', 'streetwear', 'urban-fashion', 'oversized-tshirt', 'cargo-pants', 'denim-jacket',
    'bomber-jacket', 'track-suit', 'street-style', 'urban-outfit', 'street-fashion'
  ],
  jewelry: [
    'gold-chain', 'jewelry', 'necklace', 'ring', 'bracelet', 'earrings', 'luxury-jewelry',
    'street-jewelry', 'hip-hop-jewelry', 'urban-accessories', 'street-style-jewelry'
  ],
  'stylist-bundles': [
    'streetwear-outfit', 'urban-fashion-look', 'street-style-ensemble', 'fashion-bundle',
    'outfit-inspiration', 'streetwear-coordination', 'urban-style-combination'
  ]
}

// Hero image search terms
const heroTerms = [
  'streetwear-lifestyle', 'urban-fashion', 'street-style', 'urban-lifestyle'
]

// Generate blur data URL (simplified version)
function generateBlurDataURL(): string {
  // This is a minimal blur data URL for Next.js
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
}

// Create mock images for each category
async function createMockImages(): Promise<MockImage[]> {
  const images: MockImage[] = []

  // Create 24 images per category
  for (const [category, searchTerms] of Object.entries(categories)) {
    for (let i = 1; i <= 24; i++) {
      const searchTerm = searchTerms[i % searchTerms.length]
      const imageName = `${searchTerm}-${i.toString().padStart(2, '0')}.webp`
      const imagePath = `/images/mock/${category}/${imageName}`

      images.push({
        path: imagePath,
        blurDataURL: generateBlurDataURL(),
        category,
        name: imageName
      })
    }
  }

  // Create 4 hero images
  for (let i = 1; i <= 4; i++) {
    const heroTerm = heroTerms[i % heroTerms.length]
    const imageName = `${heroTerm}-${i.toString().padStart(2, '0')}.webp`
    const imagePath = `/images/mock/hero/${imageName}`

    images.push({
      path: imagePath,
      blurDataURL: generateBlurDataURL(),
      category: 'hero',
      name: imageName
    })
  }

  return images
}

// Generate placeholder images using sharp
async function generatePlaceholderImages(images: MockImage[]): Promise<void> {
  console.log('🖼️  Generating placeholder images...')

  for (const image of images) {
    const fullPath = path.join(process.cwd(), 'public', image.path)
    const dir = path.dirname(fullPath)

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Generate different placeholder images based on category
    let placeholderImage: Buffer

    switch (image.category) {
      case 'sneakers':
        placeholderImage = await sharp({
          create: {
            width: 1600,
            height: 1600,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="1600" fill="#2d2d2d"/>
            <text x="800" y="800" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">👟</text>
            <text x="800" y="950" font-family="Arial" font-size="60" fill="#fbbf24" text-anchor="middle">Sneakers</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
        break

      case 'streetwear':
        placeholderImage = await sharp({
          create: {
            width: 1600,
            height: 1600,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="1600" fill="#2d2d2d"/>
            <text x="800" y="800" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">👕</text>
            <text x="800" y="950" font-family="Arial" font-size="60" fill="#fbbf24" text-anchor="middle">Streetwear</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
        break

      case 'jewelry':
        placeholderImage = await sharp({
          create: {
            width: 1600,
            height: 1600,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="1600" fill="#2d2d2d"/>
            <text x="800" y="800" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">💍</text>
            <text x="800" y="950" font-family="Arial" font-size="60" fill="#fbbf24" text-anchor="middle">Jewelry</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
        break

      case 'stylist-bundles':
        placeholderImage = await sharp({
          create: {
            width: 1600,
            height: 1600,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="1600" fill="#2d2d2d"/>
            <text x="800" y="800" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">👗</text>
            <text x="800" y="950" font-family="Arial" font-size="60" fill="#fbbf24" text-anchor="middle">Stylist Bundle</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
        break

      case 'hero':
        placeholderImage = await sharp({
          create: {
            width: 2400,
            height: 1000,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="2400" height="1000" xmlns="http://www.w3.org/2000/svg">
            <rect width="2400" height="1000" fill="#2d2d2d"/>
            <text x="1200" y="500" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">🔥</text>
            <text x="1200" y="650" font-family="Arial" font-size="80" fill="#fbbf24" text-anchor="middle">StreetStashed</text>
            <text x="1200" y="750" font-family="Arial" font-size="40" fill="#fbbf24" text-anchor="middle">Urban Fashion Lifestyle</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
        break

      default:
        placeholderImage = await sharp({
          create: {
            width: 1600,
            height: 1600,
            channels: 3,
            background: { r: 45, g: 45, b: 45 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="1600" fill="#2d2d2d"/>
            <text x="800" y="800" font-family="Arial" font-size="120" fill="#fbbf24" text-anchor="middle" dy=".3em">🛍️</text>
            <text x="800" y="950" font-family="Arial" font-size="60" fill="#fbbf24" text-anchor="middle">Product</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .webp({ quality: 80 })
        .toBuffer()
    }

    // Write the image
    fs.writeFileSync(fullPath, placeholderImage)
    console.log(`✅ Generated: ${image.path}`)
  }
}

// Generate manifest.json
async function generateManifest(images: MockImage[]): Promise<void> {
  console.log('📝 Generating manifest.json...')

  const manifest = {
    images,
    categories: Object.keys(categories),
    totalImages: images.length,
    generatedAt: new Date().toISOString()
  }

  const manifestPath = path.join(process.cwd(), 'public/images/mock/manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`✅ Manifest saved to: ${manifestPath}`)
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting mock image generation...')

    // Create mock images data
    const images = await createMockImages()
    console.log(`📊 Created ${images.length} mock image entries`)

    // Generate placeholder images
    await generatePlaceholderImages(images)

    // Generate manifest
    await generateManifest(images)

    console.log('🎉 Mock image generation complete!')
    console.log('📁 Images saved to: public/images/mock/')
    console.log('📋 Manifest saved to: public/images/mock/manifest.json')
    console.log('\n💡 Next steps:')
    console.log('1. Run: pnpm db:seed:products')
    console.log('2. Restart your dev server')
    console.log('3. Check the marketplace and homepage!')

  } catch (error) {
    console.error('❌ Error generating mock images:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { createMockImages, generateManifest, generatePlaceholderImages }

