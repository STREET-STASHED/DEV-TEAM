// 🖼️ Placeholder Image Generator for Mock Data
// This creates simple colored rectangles as placeholders for products and stores

// Generate a simple colored rectangle as SVG
function generatePlaceholderSVG(width, height, color, text) {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
            fill="white" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `
}

// Product category placeholders
const productPlaceholders = {
  clothing: generatePlaceholderSVG(400, 400, '#3B82F6', '👕 Clothing'),
  shoes: generatePlaceholderSVG(400, 400, '#10B981', '👟 Shoes'),
  jewelry: generatePlaceholderSVG(400, 400, '#F59E0B', '💍 Jewelry'),
  accessories: generatePlaceholderSVG(400, 400, '#8B5CF6', '👜 Accessories'),
  watches: generatePlaceholderSVG(400, 400, '#EF4444', '⌚ Watches')
}

// Store placeholders
const storePlaceholders = {
  'urban-threads': generatePlaceholderSVG(300, 200, '#1F2937', '🏪 Urban Threads'),
  'sneaker-haven': generatePlaceholderSVG(300, 200, '#059669', '🏪 Sneaker Haven'),
  'luxe-jewelry': generatePlaceholderSVG(300, 200, '#D97706', '🏪 Luxe Jewelry'),
  'vintage-vault': generatePlaceholderSVG(300, 200, '#7C3AED', '🏪 Vintage Vault'),
  'athletic-edge': generatePlaceholderSVG(300, 200, '#DC2626', '🏪 Athletic Edge')
}

// Category placeholders
const categoryPlaceholders = {
  'clothing-category': generatePlaceholderSVG(300, 200, '#3B82F6', '👕 Clothing'),
  'shoes-category': generatePlaceholderSVG(300, 200, '#10B981', '👟 Shoes'),
  'jewelry-category': generatePlaceholderSVG(300, 200, '#F59E0B', '💍 Jewelry'),
  'accessories-category': generatePlaceholderSVG(300, 200, '#8B5CF6', '👜 Accessories'),
  'watches-category': generatePlaceholderSVG(300, 200, '#EF4444', '⌚ Watches')
}

// Product placeholders
const productImagePlaceholders = {
  'hoodie-1': generatePlaceholderSVG(400, 400, '#1E40AF', '👕 Hoodie'),
  'hoodie-2': generatePlaceholderSVG(400, 400, '#1E40AF', '👕 Hoodie'),
  'denim-jacket-1': generatePlaceholderSVG(400, 400, '#1E3A8A', '👕 Denim Jacket'),
  'leggings-1': generatePlaceholderSVG(400, 400, '#7C2D12', '👕 Leggings'),
  'leggings-2': generatePlaceholderSVG(400, 400, '#7C2D12', '👕 Leggings'),
  'sneakers-1': generatePlaceholderSVG(400, 400, '#065F46', '👟 Sneakers'),
  'sneakers-2': generatePlaceholderSVG(400, 400, '#065F46', '👟 Sneakers'),
  'sneakers-3': generatePlaceholderSVG(400, 400, '#065F46', '👟 Sneakers'),
  'boots-1': generatePlaceholderSVG(400, 400, '#92400E', '👟 Boots'),
  'boots-2': generatePlaceholderSVG(400, 400, '#92400E', '👟 Boots'),
  'necklace-1': generatePlaceholderSVG(400, 400, '#D97706', '💍 Necklace'),
  'necklace-2': generatePlaceholderSVG(400, 400, '#D97706', '💍 Necklace'),
  'ring-1': generatePlaceholderSVG(400, 400, '#9CA3AF', '💍 Ring'),
  'belt-1': generatePlaceholderSVG(400, 400, '#92400E', '👜 Belt'),
  'belt-2': generatePlaceholderSVG(400, 400, '#92400E', '👜 Belt'),
  'bag-1': generatePlaceholderSVG(400, 400, '#7C3AED', '👜 Bag'),
  'bag-2': generatePlaceholderSVG(400, 400, '#7C3AED', '👜 Bag'),
  'watch-1': generatePlaceholderSVG(400, 400, '#DC2626', '⌚ Watch'),
  'watch-2': generatePlaceholderSVG(400, 400, '#DC2626', '⌚ Watch')
}

// Export all placeholders
export {
  productPlaceholders,
  storePlaceholders,
  categoryPlaceholders,
  productImagePlaceholders,
  generatePlaceholderSVG
}

// For Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    productPlaceholders,
    storePlaceholders,
    categoryPlaceholders,
    productImagePlaceholders,
    generatePlaceholderSVG
  }
}
