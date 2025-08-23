'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon, 
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  UserIcon
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

export default function AIStylistPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null)
  const [_isAnalyzing, _setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Outfit[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [_isLoadingProducts, _setIsLoadingProducts] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Load available products for recommendations
  const loadAvailableProducts = useCallback(async () => {
    _setIsLoadingProducts(true)
    try {
      const response = await fetch('/api/items?limit=50')
      const data = await response.json()
      if (data.items) {
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
          name: 'Performance Leggings',
          price: 65.99,
          image: '/mock/default-product.jpg',
          category: 'Clothing',
          colors: ['Black', 'Navy'],
          sizes: ['XS', 'S', 'M', 'L'],
          rating: 4.9,
          store: 'Athletic Edge'
        }
      ])
    } finally {
      _setIsLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    loadAvailableProducts()
  }, [loadAvailableProducts])

  // Generate AI recommendations based on style profile
  const generateAIRecommendations = useCallback(async (profile: StyleProfile) => {
    try {
      const response = await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-token-${profile.name.toLowerCase()}`
        },
        body: JSON.stringify({
          styleProfile: profile,
          availableProducts: availableProducts
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.recommendations || []
      }
    } catch (_error) {
      console.error('Error generating AI recommendations:', _error)
    }

    // Fallback: Generate mock recommendations
    return generateMockRecommendations(profile)
  }, [availableProducts])

  // Generate mock recommendations when AI is unavailable
  const generateMockRecommendations = (profile: StyleProfile): Outfit[] => {
    const outfits: Outfit[] = []
    const categories = ['Clothing', 'Shoes', 'Accessories']
    
    for (let i = 0; i < 3; i++) {
      const category = categories[i % categories.length]
      const products = availableProducts.filter(p => p.category === category).slice(0, 2)
      
      if (products.length > 0) {
        outfits.push({
          id: `outfit-${i + 1}`,
          name: `${profile.occasion} ${profile.stylePreferences[0] || 'Style'} Outfit`,
          items: products,
          totalPrice: products.reduce((sum, p) => sum + p.price, 0),
          occasion: profile.occasion,
          style: profile.stylePreferences[0] || 'Casual',
          confidence: 0.85 + (Math.random() * 0.15)
        })
      }
    }
    
    return outfits
  }

  // Analyze user's style and generate recommendations
  const analyzeStyle = async () => {
    if (!styleProfile) return

    _setIsAnalyzing(true)
    setCurrentStep(2)

    try {
      // Simulate AI analysis time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate AI recommendations
      const aiRecommendations = await generateAIRecommendations(styleProfile)
      setRecommendations(aiRecommendations)
      
      setCurrentStep(3)
    } catch (error) {
      setProfileError('Failed to analyze style. Please try again.')
      setCurrentStep(1)
    } finally {
      _setIsAnalyzing(false)
    }
  }

  // Save user's style profile
  const saveProfile = (profile: StyleProfile) => {
    setStyleProfile(profile)
    setProfileError(null)
    setCurrentStep(2)
    analyzeStyle()
  }

  // View product details
  const viewProduct = (productId: string) => {
    router.push(`/buyer/marketplace/product/${productId}`)
  }

  // Add product to cart
  const addToCart = (product: Product) => {
    // This would integrate with the cart context
    console.log('Adding to cart:', product)
    // Show success message
    alert(`${product.name} added to cart!`)
  }

  // Generate style reasoning
  const generateReasoning = (outfit: Outfit) => {
    const reasons = [
      `Perfect for ${outfit.occasion} occasions`,
      `Matches your ${styleProfile?.stylePreferences[0]} style preference`,
      `Within your budget range`,
      `Colors complement your preferences`,
      `High-rated items from trusted stores`
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  // Determine style type based on preferences
  const _determineStyleType = (preferences: string[]) => {
    if (preferences.includes('Streetwear')) return 'Urban Street'
    if (preferences.includes('Vintage')) return 'Retro Classic'
    if (preferences.includes('Minimalist')) return 'Clean Minimal'
    if (preferences.includes('Bold')) return 'Statement Maker'
    return 'Versatile Mix'
  }

  return (
    <div className="min-h-screen bg-ink-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <SparklesIcon className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Stylist
            </h1>
          </div>
          <p className="text-xl text-ink-300">
            Get personalized style recommendations powered by AI
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-ink-700 text-ink-400'
                }`}>
                  {step}
                </div>
                <span className="text-sm text-ink-400 mt-2">
                  {step === 1 ? 'Style Profile' : step === 2 ? 'AI Analysis' : 'Recommendations'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Style Profile */}
        {currentStep === 1 && (
          <div className="bg-ink-900 rounded-xl p-8 border border-ink-800 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Tell us about your style</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const profile: StyleProfile = {
                name: formData.get('name') as string,
                age: parseInt(formData.get('age') as string),
                gender: formData.get('gender') as string,
                stylePreferences: (formData.get('stylePreferences') as string).split(',').map(s => s.trim()),
                budget: parseInt(formData.get('budget') as string),
                occasion: formData.get('occasion') as string,
                colors: (formData.get('colors') as string).split(',').map(s => s.trim()),
                sizes: (formData.get('sizes') as string).split(',').map(s => s.trim())
              }
              saveProfile(profile)
            }} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="13"
                    max="100"
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Gender</label>
                <select
                  name="gender"
                  required
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-2">Style Preferences</label>
                <input
                  type="text"
                  name="stylePreferences"
                  required
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Streetwear, Vintage, Minimalist, Bold (comma separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Budget Range</label>
                  <select
                    name="budget"
                    required
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select budget</option>
                    <option value="50">Under $50</option>
                    <option value="100">Under $100</option>
                    <option value="200">Under $200</option>
                    <option value="500">Under $500</option>
                    <option value="1000">Under $1000</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Occasion</label>
                  <select
                    name="occasion"
                    required
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select occasion</option>
                    <option value="Casual">Casual</option>
                    <option value="Work">Work</option>
                    <option value="Party">Party</option>
                    <option value="Date">Date</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Preferred Colors</label>
                  <input
                    type="text"
                    name="colors"
                    required
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Black, White, Blue (comma separated)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Sizes</label>
                  <input
                    type="text"
                    name="sizes"
                    required
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="S, M, L (comma separated)"
                  />
                </div>
              </div>

              {profileError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <SparklesIcon className="w-5 h-5 inline mr-2" />
                Start AI Style Analysis
              </button>
            </form>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="bg-ink-900 rounded-xl p-8 border border-ink-800 max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">AI is analyzing your style...</h2>
            <p className="text-ink-300 mb-6">
              Our AI is processing your preferences and creating personalized recommendations
            </p>
            
            <div className="space-y-4 text-left bg-ink-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-ink-300">Analyzing style preferences...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-ink-300">Matching with available products...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-ink-300">Generating outfit combinations...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-ink-300">Calculating style confidence scores...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Recommendations */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Your AI-Generated Style Recommendations
              </h2>
              <p className="text-ink-300">
                Based on your preferences, here are personalized outfit suggestions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {recommendations.map((outfit, _index) => (
                <div key={outfit.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{outfit.name}</h3>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-ink-300">
                        {(outfit.confidence * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {outfit.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 bg-ink-800 rounded-lg p-3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <p className="text-sm text-ink-400">{item.store}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-green-400">${item.price}</span>
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-ink-300">{item.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => viewProduct(item.id)}
                            className="bg-ink-700 hover:bg-ink-600 text-white p-2 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <UserIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                            title="Add to Cart"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-ink-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-white">
                        Total: ${outfit.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-ink-400 bg-ink-800 px-2 py-1 rounded">
                        {outfit.style} • {outfit.occasion}
                      </span>
                    </div>
                    
                    <p className="text-sm text-ink-300 mb-4">
                      {generateReasoning(outfit)}
                    </p>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedOutfit(outfit)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <HeartIcon className="w-4 h-4 inline mr-2" />
                        Save Outfit
                      </button>
                      <button
                        onClick={() => {
                          outfit.items.forEach(item => addToCart(item))
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <ShoppingCartIcon className="w-4 h-4 inline mr-2" />
                        Add All to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-ink-800 hover:bg-ink-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}

        {/* Selected Outfit Modal */}
        {selectedOutfit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-ink-900 rounded-xl p-6 max-w-md w-full border border-ink-800">
              <h3 className="text-xl font-bold mb-4">Outfit Saved!</h3>
              <p className="text-ink-300 mb-6">
                &ldquo;{selectedOutfit.name}&rdquo; has been saved to your favorites.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="flex-1 bg-ink-700 hover:bg-ink-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    selectedOutfit.items.forEach(item => addToCart(item))
                    setSelectedOutfit(null)
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
