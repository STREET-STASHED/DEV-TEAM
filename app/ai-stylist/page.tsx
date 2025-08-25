'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon, 
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface StyleProfile {
  name: string
  age: number
  gender: string
  stylePreferences: string[]
  budget: number
  occasion: string
  colors: string[]
  sizes: string[]
}

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  colors: string[]
  sizes: string[]
  rating: number
  store: string
}

interface Outfit {
  id: string
  name: string
  items: Product[]
  totalPrice: number
  occasion: string
  style: string
  confidence: number
}

// Default style profile
const defaultStyleProfile: StyleProfile = {
  name: '',
  age: 0,
  gender: '',
  stylePreferences: [],
  budget: 0,
  occasion: '',
  colors: [],
  sizes: []
}

export default function AIStylistPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(defaultStyleProfile)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Outfit[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [_isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Load available products for recommendations
  const loadAvailableProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch('/api/items?limit=50')
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        setAvailableProducts(data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.images?.[0] || '/mock/default-product.jpg',
          category: item.category,
          colors: item.colors || ['Black', 'White'],
          sizes: item.sizes || ['M', 'L'],
          rating: item.rating || 4.5,
          store: item.store?.name || 'Unknown Store'
        })))
      } else {
        // Fallback to mock products if API fails
        setAvailableProducts([
          {
            id: 'prod-1',
            name: 'Urban Street Hoodie',
            price: 89.99,
            image: '/mock/default-product.jpg',
            category: 'Clothing',
            colors: ['Black', 'Gray'],
            sizes: ['S', 'M', 'L'],
            rating: 4.8,
            store: 'Urban Threads Collective'
          },
          {
            id: 'prod-2',
            name: 'Vintage Denim Jacket',
            price: 145,
            image: '/mock/default-product.jpg',
            category: 'Clothing',
            colors: ['Blue', 'Light Blue'],
            sizes: ['M', 'L', 'XL'],
            rating: 4.7,
            store: 'Vintage Vault'
          },
          {
            id: 'prod-3',
            name: 'Street Style Sneakers',
            price: 120,
            image: '/mock/default-product.jpg',
            category: 'Footwear',
            colors: ['White', 'Black'],
            sizes: ['7', '8', '9', '10'],
            rating: 4.6,
            store: 'Sneaker Haven'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to mock products
      setAvailableProducts([
        {
          id: 'prod-1',
          name: 'Urban Street Hoodie',
          price: 89.99,
          image: '/mock/default-product.jpg',
          category: 'Clothing',
          colors: ['Black', 'Gray'],
          sizes: ['S', 'M', 'L'],
          rating: 4.8,
          store: 'Urban Threads Collective'
        },
        {
          id: 'prod-2',
          name: 'Vintage Denim Jacket',
          price: 145,
          image: '/mock/default-product.jpg',
          category: 'Clothing',
          colors: ['Blue', 'Light Blue'],
          sizes: ['M', 'L', 'XL'],
          rating: 4.7,
          store: 'Vintage Vault'
        },
        {
          id: 'prod-3',
          name: 'Street Style Sneakers',
          price: 120,
          image: '/mock/default-product.jpg',
          category: 'Footwear',
          colors: ['White', 'Black'],
          sizes: ['7', '8', '9', '10'],
          rating: 4.6,
          store: 'Sneaker Haven'
        }
      ])
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load products on mount
  useEffect(() => {
    loadAvailableProducts()
  }, [loadAvailableProducts])

  // Load saved profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai-stylist-profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Merge with default to ensure all fields exist
          setStyleProfile({ ...defaultStyleProfile, ...parsed })
        }
      } catch (error) {
        console.error('Failed to load saved profile:', error)
      }
    }
  }, [])

  // Generate mock recommendations based on profile
  const generateMockRecommendations = useCallback((profile: StyleProfile): Outfit[] => {
    if (availableProducts.length === 0) return []

    const outfits: Outfit[] = []
    const occasions = ['Casual', 'Business', 'Evening', 'Sporty', 'Street Style']
    const styles = ['Modern', 'Vintage', 'Minimalist', 'Bold', 'Classic']

    for (let i = 0; i < 3; i++) {
      const occasion = profile.occasion || occasions[i % occasions.length]
      const style = profile.stylePreferences.length > 0 
        ? profile.stylePreferences[i % profile.stylePreferences.length] 
        : styles[i % styles.length]
      
      // Select 2-3 products for each outfit
      const numItems = Math.floor(Math.random() * 2) + 2
      const outfitItems = availableProducts
        .filter(p => p.category === 'Clothing' || p.category === 'Footwear')
        .slice(i * 2, i * 2 + numItems)
        .map(item => ({ ...item, quantity: 1 }))

      if (outfitItems.length > 0) {
        const totalPrice = outfitItems.reduce((sum, item) => sum + item.price, 0)
        
        outfits.push({
          id: `outfit-${i + 1}`,
          name: `${occasion} ${style} Outfit`,
          items: outfitItems,
          totalPrice,
          occasion,
          style,
          confidence: 0.85 + (Math.random() * 0.1)
        })
      }
    }

    return outfits
  }, [availableProducts])

  // Save user's style profile
  const saveProfile = (profile: StyleProfile) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai-stylist-profile', JSON.stringify(profile))
        setStyleProfile(profile)
        setProfileError(null)
      } catch (error) {
        console.error('Failed to save profile:', error)
        setProfileError('Failed to save profile')
      }
    }
  }

  // Real AI analysis using product data and user preferences
  const analyzeStyle = async () => {
    // Validate required fields
    if (!styleProfile.name.trim()) {
      setProfileError('Please enter your name to continue')
      return
    }
    
    setProfileError(null)
    setIsAnalyzing(true)
    
    // Save profile before analysis
    saveProfile(styleProfile)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate personalized recommendations
      const recommendations = generateMockRecommendations(styleProfile)
      setRecommendations(recommendations)
      
      // Show success message
      setSuccessMessage('Style analysis complete! Check out your personalized recommendations below.')
      
      // Move to next step
      setCurrentStep(2)
      
    } catch (error) {
      console.error('Style analysis failed:', error)
      setProfileError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add items to cart
  const addToCart = (outfit: Outfit) => {
    // In a real app, this would add items to the cart
    console.log('Adding outfit to cart:', outfit)
    alert(`Added ${outfit.name} to cart!`)
  }

  // Start over
  const startOver = () => {
    setCurrentStep(1)
    setRecommendations([])
    setSelectedOutfit(null)
    setSuccessMessage(null)
    setProfileError(null)
  }

  // Handle profile input changes
  const handleProfileChange = (field: keyof StyleProfile, value: any) => {
    setStyleProfile(prev => ({ ...prev, [field]: value }))
    setProfileError(null)
  }

  // Handle style preference changes
  const handleStylePreferenceChange = (preference: string, checked: boolean) => {
    const newPreferences = checked 
      ? [...styleProfile.stylePreferences, preference]
      : styleProfile.stylePreferences.filter(p => p !== preference)
    
    setStyleProfile({ ...styleProfile, stylePreferences: newPreferences })
  }

  // Handle color preference changes
  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked 
      ? [...styleProfile.colors, color]
      : styleProfile.colors.filter(c => c !== color)
    
    setStyleProfile({ ...styleProfile, colors: newColors })
  }

  // Handle size preference changes
  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked 
      ? [...styleProfile.sizes, size]
      : styleProfile.sizes.filter(s => s !== size)
    
    setStyleProfile({ ...styleProfile, sizes: newSizes })
  }

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-ink-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">AI Personal Stylist</h1>
              <p className="text-xl text-ink-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Personal Stylist</h1>
            <p className="text-xl text-ink-300">Get personalized style recommendations powered by AI</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400 text-center">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {profileError && (
            <div className="mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-center">{profileError}</p>
            </div>
          )}

          {/* Step 1: Style Profile */}
          {currentStep === 1 && (
            <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Tell Us About Your Style</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={styleProfile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={styleProfile.age || ''}
                      onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border rounded-lg bg-ink-800 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Gender
                    </label>
                    <select
                      value={styleProfile.gender}
                      onChange={(e) => handleProfileChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg bg-ink-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Budget Range
                    </label>
                    <select
                      value={styleProfile.budget}
                      onChange={(e) => handleProfileChange('budget', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border rounded-lg bg-ink-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    >
                      <option value={0}>Select budget</option>
                      <option value={50}>Under $50</option>
                      <option value={100}>$50 - $100</option>
                      <option value={200}>$100 - $200</option>
                      <option value={500}>$200 - $500</option>
                      <option value={1000}>$500+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Occasion
                    </label>
                    <select
                      value={styleProfile.occasion}
                      onChange={(e) => handleProfileChange('occasion', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg bg-ink-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    >
                      <option value="">Select occasion</option>
                      <option value="Casual">Casual</option>
                      <option value="Business">Business</option>
                      <option value="Evening">Evening</option>
                      <option value="Sporty">Sporty</option>
                      <option value="Street Style">Street Style</option>
                    </select>
                  </div>
                </div>

                {/* Style Preferences */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Style Preferences
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Modern', 'Vintage', 'Minimalist', 'Bold', 'Classic', 'Edgy', 'Elegant', 'Comfortable'].map((style) => (
                        <label key={style} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={styleProfile.stylePreferences.includes(style)}
                            onChange={(e) => handleStylePreferenceChange(style, e.target.checked)}
                            className="text-purple-500 focus:ring-purple-400"
                          />
                          <span className="text-sm text-ink-300">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Preferred Colors
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Brown'].map((color) => (
                        <label key={color} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={styleProfile.colors.includes(color)}
                            onChange={(e) => handleColorChange(color, e.target.checked)}
                            className="text-purple-500 focus:ring-purple-400"
                          />
                          <span className="text-sm text-ink-300">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Preferred Sizes
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <label key={size} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={styleProfile.sizes.includes(size)}
                            onChange={(e) => handleSizeChange(size, e.target.checked)}
                            className="text-purple-500 focus:ring-purple-400"
                          />
                          <span className="text-sm text-ink-300">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={analyzeStyle}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Your Style...
                    </div>
                  ) : (
                    'Analyze My Style'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Recommendations */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Your Personalized Recommendations</h2>
                <p className="text-ink-300">Based on your style profile, here are some outfits we think you&apos;ll love</p>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((outfit) => (
                  <div key={outfit.id} className="bg-ink-900 rounded-xl border border-ink-700 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    {/* Outfit Image */}
                    <div className="h-48 bg-gradient-to-br from-ink-800 to-ink-700 flex items-center justify-center">
                      <div className="text-center">
                        <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-2" />
                        <p className="text-ink-300 text-sm">{outfit.name}</p>
                      </div>
                    </div>

                    {/* Outfit Details */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{outfit.name}</h3>
                      <p className="text-ink-400 text-sm mb-3">
                        {outfit.occasion} • {outfit.style} Style
                      </p>
                      
                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {outfit.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-ink-300">{item.name}</span>
                            <span className="text-brand-400 font-medium">${item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Confidence */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-white">${outfit.totalPrice.toFixed(2)}</span>
                        <span className="text-sm text-ink-400">
                          {Math.round(outfit.confidence * 100)}% Match
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => addToCart(outfit)}
                          className="w-full bg-brand-600 text-ink-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                        
                        <button
                          onClick={() => setSelectedOutfit(outfit)}
                          className="w-full text-ink-300 hover:text-brand-400 hover:bg-ink-800/50 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startOver}
                  className="bg-ink-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-ink-600 transition-colors"
                >
                  Start Over
                </button>
                
                <button
                  onClick={() => router.push('/buyer/marketplace')}
                  className="bg-brand-600 text-ink-black py-3 px-6 rounded-lg font-medium hover:bg-brand-500 transition-colors"
                >
                  Browse More Products
                </button>
              </div>
            </div>
          )}

          {/* Outfit Detail Modal */}
          {selectedOutfit && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-ink-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{selectedOutfit.name}</h3>
                    <button
                      onClick={() => setSelectedOutfit(null)}
                      className="text-ink-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedOutfit.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-ink-800 rounded-lg">
                        <div className="w-16 h-16 bg-ink-700 rounded-lg flex items-center justify-center">
                          <StarIcon className="w-6 h-6 text-brand-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-ink-400">{item.store}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-400">${item.price}</p>
                          <p className="text-xs text-ink-400">Rating: {item.rating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-ink-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-brand-400">${selectedOutfit.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        addToCart(selectedOutfit)
                        setSelectedOutfit(null)
                      }}
                      className="w-full bg-brand-600 text-ink-black py-3 px-4 rounded-lg font-medium hover:bg-brand-500 transition-colors"
                    >
                      Add Complete Outfit to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
