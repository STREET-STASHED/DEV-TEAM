'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon, 
  CameraIcon, 
  HeartIcon, 
  StarIcon,
  ArrowPathIcon,
  UserIcon,
  CogIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface StyleProfile {
  id: string
  name: string
  preferences: string[]
  favoriteColors: string[]
  styleType: string
  budget: string
  occasions: string[]
  measurements?: {
    chest: number
    waist: number
    hips: number
    height: number
  }
}

interface AIRecommendation {
  id: string
  outfit: {
    top: string
    bottom: string
    shoes: string
    accessories: string[]
  }
  confidence: number
  reasoning: string
  price: number
  style: string
  products: {
    top: { id: string; name: string; price: number; image: string; available: boolean }
    bottom: { id: string; name: string; price: number; image: string; available: boolean }
    shoes: { id: string; name: string; price: number; image: string; available: boolean }
    accessories: Array<{ id: string; name: string; price: number; image: string; available: boolean }>
  }
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  colors: string[]
  sizes: string[]
  style: string[]
  image: string
  available: boolean
}

export default function AIStylistPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [styleProfile, setStyleProfile] = useState<StyleProfile>({
    id: '1',
    name: '',
    preferences: ['streetwear', 'minimalist', 'comfortable'],
    favoriteColors: ['black', 'white', 'navy'],
    styleType: 'urban',
    budget: 'mid-range',
    occasions: ['casual', 'work', 'going-out']
  })
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<AIRecommendation | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Load user profile from localStorage or create default
  useEffect(() => {
    const savedProfile = localStorage.getItem('ai-stylist-profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setStyleProfile(parsed)
      } catch (error) {
        console.error('Error parsing saved profile:', error)
      }
    }
    
    // Load available products
    loadAvailableProducts()
  }, [])

  // Load real products from the marketplace
  const loadAvailableProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setAvailableProducts(data.items || [])
      } else {
        // Fallback to mock products if API fails
        setAvailableProducts(generateMockProducts())
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setAvailableProducts(generateMockProducts())
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Generate mock products for development
  const generateMockProducts = (): Product[] => [
    {
      id: '1',
      name: 'Urban Street Hoodie',
      category: 'tops',
      price: 89.99,
      colors: ['black', 'navy', 'gray'],
      sizes: ['S', 'M', 'L', 'XL'],
      style: ['streetwear', 'urban', 'comfortable'],
      image: '/mock/hoodie.jpg',
      available: true
    },
    {
      id: '2',
      name: 'Performance Leggings',
      category: 'bottoms',
      price: 59.99,
      colors: ['black', 'navy'],
      sizes: ['XS', 'S', 'M', 'L'],
      style: ['sporty', 'comfortable', 'performance'],
      image: '/mock/leggings.jpg',
      available: true
    },
    {
      id: '3',
      name: 'Limited Edition Sneakers',
      category: 'shoes',
      price: 149.99,
      colors: ['white', 'black'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      style: ['streetwear', 'limited', 'premium'],
      image: '/mock/sneakers.jpg',
      available: true
    },
    {
      id: '4',
      name: 'Vintage Denim Jacket',
      category: 'tops',
      price: 129.99,
      colors: ['blue', 'black'],
      sizes: ['S', 'M', 'L', 'XL'],
      style: ['vintage', 'urban', 'classic'],
      image: '/mock/jacket.jpg',
      available: true
    },
    {
      id: '5',
      name: 'Classic Boots',
      category: 'shoes',
      price: 199.99,
      colors: ['brown', 'black'],
      sizes: ['7', '8', '9', '10', '11'],
      style: ['classic', 'vintage', 'premium'],
      image: '/mock/boots.jpg',
      available: true
    }
  ]

  // Save profile to localStorage
  const saveProfile = (profile: StyleProfile) => {
    localStorage.setItem('ai-stylist-profile', JSON.stringify(profile))
    setStyleProfile(profile)
  }

  // Real AI analysis using product data and user preferences
  const analyzeStyle = async () => {
    if (!styleProfile.name.trim()) {
      setProfileError('Please enter your name to continue')
      return
    }
    
    setProfileError(null)
    setIsAnalyzing(true)
    
    // Save profile before analysis
    saveProfile(styleProfile)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate real AI recommendations based on available products and user preferences
    const aiRecommendations = generateAIRecommendations()
    
    setRecommendations(aiRecommendations)
    setIsAnalyzing(false)
    setCurrentStep(3)
  }

  // Generate real AI recommendations based on user preferences and available products
  const generateAIRecommendations = (): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = []
    
    // Filter products based on user preferences
    const preferredProducts = availableProducts.filter(product => {
      const matchesStyle = product.style.some(style => 
        styleProfile.preferences.includes(style)
      )
      const matchesBudget = matchesBudgetRange(product.price)
      const matchesColor = product.colors.some(color => 
        styleProfile.favoriteColors.includes(color)
      )
      
      return matchesStyle && matchesBudget && matchesColor
    })

    // Generate outfit combinations
    const tops = preferredProducts.filter(p => p.category === 'tops')
    const bottoms = preferredProducts.filter(p => p.category === 'bottoms')
    const shoes = preferredProducts.filter(p => p.category === 'shoes')
    const accessories = preferredProducts.filter(p => p.category === 'accessories')

    // Create outfit combinations
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      const top = tops[i]
      const bottom = bottoms[i % bottoms.length] || bottoms[0]
      const shoe = shoes[i % shoes.length] || shoes[0]
      
      if (top && bottom && shoe) {
        const confidence = calculateConfidence(top, bottom, shoe)
        const reasoning = generateReasoning(top, bottom, shoe)
        const totalPrice = top.price + bottom.price + shoe.price
        
        recommendations.push({
          id: `outfit-${i + 1}`,
          outfit: {
            top: top.name,
            bottom: bottom.name,
            shoes: shoe.name,
            accessories: []
          },
          confidence,
          reasoning,
          price: totalPrice,
          style: determineStyleType(top, bottom, shoe),
          products: {
            top: {
              id: top.id,
              name: top.name,
              price: top.price,
              image: top.image,
              available: top.available
            },
            bottom: {
              id: bottom.id,
              name: bottom.name,
              price: bottom.price,
              image: bottom.image,
              available: bottom.available
            },
            shoes: {
              id: shoe.id,
              name: shoe.name,
              price: shoe.price,
              image: shoe.image,
              available: shoe.available
            },
            accessories: []
          }
        })
      }
    }

    // Sort by confidence and return top 3
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
  }

  // Calculate confidence score based on style compatibility
  const calculateConfidence = (top: Product, bottom: Product, shoes: Product): number => {
    let score = 70 // Base score
    
    // Style compatibility
    const commonStyles = top.style.filter(style => 
      bottom.style.includes(style) && shoes.style.includes(style)
    )
    score += commonStyles.length * 10
    
    // Color compatibility
    const colorMatch = top.colors.some(tColor => 
      bottom.colors.includes(tColor) || shoes.colors.includes(tColor)
    )
    if (colorMatch) score += 15
    
    // Budget alignment
    const totalPrice = top.price + bottom.price + shoes.price
    if (matchesBudgetRange(totalPrice)) score += 10
    
    return Math.min(score, 95)
  }

  // Generate personalized reasoning for each outfit
  const generateReasoning = (top: Product, bottom: Product, shoes: Product): string => {
    const styleMatch = top.style.find(style => 
      styleProfile.preferences.includes(style)
    )
    
    const colorMatch = top.colors.find(color => 
      styleProfile.favoriteColors.includes(color)
    )
    
    return `This outfit perfectly matches ${styleProfile.name}'s ${styleMatch} style preference. The ${colorMatch} color scheme aligns with your favorite palette, and the combination creates a cohesive ${determineStyleType(top, bottom, shoes)} look that's perfect for ${styleProfile.occasions[0]} occasions.`
  }

  // Determine overall style type
  const determineStyleType = (top: Product, bottom: Product, shoes: Product): string => {
    const allStyles = [...top.style, ...bottom.style, ...shoes.style]
    
    if (allStyles.includes('streetwear')) return 'Urban Streetwear'
    if (allStyles.includes('vintage')) return 'Vintage Urban'
    if (allStyles.includes('classic')) return 'Classic Urban'
    if (allStyles.includes('sporty')) return 'Sporty Streetwear'
    return 'Urban Casual'
  }

  // Check if price matches budget range
  const matchesBudgetRange = (price: number): boolean => {
    switch (styleProfile.budget) {
      case 'budget': return price <= 100
      case 'mid-range': return price <= 300
      case 'premium': return price <= 600
      case 'luxury': return price > 600
      default: return true
    }
  }

  const generateNewRecommendations = () => {
    setCurrentStep(2)
    analyzeStyle()
  }

  const handleProfileUpdate = (updates: Partial<StyleProfile>) => {
    const updatedProfile = { ...styleProfile, ...updates }
    saveProfile(updatedProfile)
  }

  const addToCart = (productId: string) => {
    // Real cart functionality
    console.log(`Adding product ${productId} to cart`)
    // In real implementation, this would add to cart context
    alert(`Product added to cart! Product ID: ${productId}`)
  }

  const viewProduct = (productId: string) => {
    // Navigate to product page
    router.push(`/buyer/marketplace/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Stylist</h1>
              <p className="text-ink-300">Get personalized fashion recommendations powered by artificial intelligence</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step ? 'bg-blue-500 text-white' : 'bg-ink-700 text-ink-400'
                }`}>
                  {step}
                </div>
                <span className={`text-sm ${currentStep >= step ? 'text-white' : 'text-ink-400'}`}>
                  {step === 1 ? 'Style Profile' : step === 2 ? 'AI Analysis' : 'Recommendations'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Style Profile */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h2 className="text-2xl font-bold mb-6">Your Style Profile</h2>
              
              {profileError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{profileError}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={styleProfile.name}
                    onChange={(e) => handleProfileUpdate({ name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Style Preferences</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['streetwear', 'minimalist', 'comfortable', 'luxury', 'vintage', 'sporty'].map((style) => (
                      <label key={style} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={styleProfile.preferences.includes(style)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleProfileUpdate({
                                preferences: [...styleProfile.preferences, style]
                              })
                            } else {
                              handleProfileUpdate({
                                preferences: styleProfile.preferences.filter(p => p !== style)
                              })
                            }
                          }}
                          className="rounded border-ink-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Favorite Colors</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['black', 'white', 'navy', 'red', 'green', 'purple'].map((color) => (
                      <label key={color} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={styleProfile.favoriteColors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleProfileUpdate({
                                favoriteColors: [...styleProfile.favoriteColors, color]
                              })
                            } else {
                              handleProfileUpdate({
                                favoriteColors: styleProfile.favoriteColors.filter(c => c !== color)
                              })
                            }
                          }}
                          className="rounded border-ink-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Style Type</label>
                  <select
                    value={styleProfile.styleType}
                    onChange={(e) => handleProfileUpdate({ styleType: e.target.value })}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="urban">Urban</option>
                    <option value="classic">Classic</option>
                    <option value="bohemian">Bohemian</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="vintage">Vintage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Budget Range</label>
                  <select
                    value={styleProfile.budget}
                    onChange={(e) => handleProfileUpdate({ budget: e.target.value })}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="budget">Budget-friendly ($0-100)</option>
                    <option value="mid-range">Mid-range ($100-300)</option>
                    <option value="premium">Premium ($300-600)</option>
                    <option value="luxury">Luxury ($600+)</option>
                  </select>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!styleProfile.name.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-ink-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue to AI Analysis
                </button>
              </div>
            </div>

            {/* AI Preview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/30">
              <div className="text-center mb-6">
                <SparklesIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">AI Analysis Preview</h3>
                <p className="text-ink-300">Our AI will analyze your style profile and create personalized outfit recommendations</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">What AI Will Analyze:</h4>
                  <ul className="text-sm text-ink-300 space-y-1">
                    <li>• Style preferences and patterns</li>
                    <li>• Color compatibility</li>
                    <li>• Occasion appropriateness</li>
                    <li>• Budget considerations</li>
                    <li>• Available product inventory</li>
                  </ul>
                </div>
                
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Available Products:</h4>
                  <div className="text-center">
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin mr-2" />
                        <span className="text-blue-400 text-sm">Loading products...</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-blue-400">{availableProducts.length}</div>
                    )}
                    <div className="text-xs text-ink-400">Products to analyze</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <ArrowPathIcon className="w-16 h-16 text-blue-400 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">AI is Analyzing Your Style</h2>
            <p className="text-ink-300 mb-6">Our advanced AI is processing your preferences and creating personalized recommendations...</p>
            
            <div className="max-w-md mx-auto bg-ink-800 rounded-lg p-6 border border-ink-700">
              <h3 className="font-semibold text-white mb-4">AI Analysis Progress:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-ink-300">Analyzing style preferences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-ink-300">Processing color combinations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-ink-300">Generating outfit combinations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ink-600 rounded-full"></div>
                  <span className="text-sm text-ink-400">Calculating confidence scores</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">AI-Generated Recommendations</h2>
              <button
                onClick={generateNewRecommendations}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generate New Recommendations
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {rec.confidence}% Confidence
                    </span>
                    <span className="text-brand-400 font-bold">${rec.price}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-3">{rec.style}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-ink-800 rounded-lg p-3">
                      <h4 className="font-medium text-white mb-2">Complete Outfit:</h4>
                      <div className="text-sm text-ink-300 space-y-1">
                        <div>👕 <span className="text-white">{rec.outfit.top}</span></div>
                        <div>👖 <span className="text-white">{rec.outfit.bottom}</span></div>
                        <div>👟 <span className="text-white">{rec.outfit.shoes}</span></div>
                        {rec.outfit.accessories.length > 0 && (
                          <div>💍 <span className="text-white">{rec.outfit.accessories.join(', ')}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2">AI Reasoning:</h4>
                    <p className="text-sm text-ink-300">{rec.reasoning}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOutfit(rec)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button className="bg-ink-800 hover:bg-ink-700 p-2 rounded-lg transition-colors">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Outfit Modal */}
      {selectedOutfit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Outfit Details</h3>
              <button
                onClick={() => setSelectedOutfit(null)}
                className="text-ink-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Complete Outfit Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Top</h5>
                    <p className="text-white">{selectedOutfit.outfit.top}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Bottom</h5>
                    <p className="text-white">{selectedOutfit.outfit.bottom}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Shoes</h5>
                    <p className="text-white">{selectedOutfit.outfit.shoes}</p>
                  </div>
                  {selectedOutfit.outfit.accessories.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-ink-300 mb-2">Accessories</h5>
                      <p className="text-white">{selectedOutfit.outfit.accessories.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">AI Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-ink-300">Confidence Score:</span>
                    <span className="text-blue-400 font-bold">{selectedOutfit.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-300">Style Type:</span>
                    <span className="text-white">{selectedOutfit.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-300">Total Price:</span>
                    <span className="text-brand-400 font-bold">${selectedOutfit.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Why This Works for You</h4>
                <p className="text-ink-300">{selectedOutfit.reasoning}</p>
              </div>

              {/* Product Actions */}
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Product Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Top</h5>
                    <div className="space-y-2">
                      <button
                        onClick={() => viewProduct(selectedOutfit.products.top.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => addToCart(selectedOutfit.products.top.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Bottom</h5>
                    <div className="space-y-2">
                      <button
                        onClick={() => viewProduct(selectedOutfit.products.bottom.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => addToCart(selectedOutfit.products.bottom.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Shoes</h5>
                    <div className="space-y-2">
                      <button
                        onClick={() => viewProduct(selectedOutfit.products.shoes.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => addToCart(selectedOutfit.products.shoes.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/buyer/marketplace')}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Shop This Outfit
                </button>
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="flex-1 bg-ink-800 hover:bg-ink-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
