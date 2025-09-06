'use client'

import {
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface StyleProfile {
  name: string
  age: number
  gender: string
  occasion: string
  stylePreferences: string[]
  colors: string[]
  sizes: string[]
  budget: number
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

const defaultStyleProfile: StyleProfile = {
  name: '',
  age: 25,
  gender: '',
  occasion: '',
  stylePreferences: [],
  colors: [],
  sizes: [],
  budget: 500
}

export default function AIStylistPage() {
  console.log('AI Stylist: Component rendering...')
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
  const [favoriteOutfits, setFavoriteOutfits] = useState<Outfit[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [sharedOutfits, setSharedOutfits] = useState<Outfit[]>([])
  const [communityLikes, setCommunityLikes] = useState<{ [key: string]: number }>({})
  const [userComments, setUserComments] = useState<{ [key: string]: string[] }>({})

  // Set client-side flag
  useEffect(() => {
    console.log('AI Stylist: Setting client flag...')
    setIsClient(true)
  }, [])

  // Load available products for recommendations
  const loadAvailableProducts = useCallback(async () => {
    console.log('AI Stylist: Starting to load products...')
    setIsLoadingProducts(true)

    // Always set fallback products immediately
    const fallbackProducts = [
      {
        id: 'prod-1',
        name: 'Urban Street Hoodie',
        price: 89.99,
        image: '/mock/hoodie-1.jpg',
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
        image: '/mock/denim-jacket-1.jpg',
        category: 'Clothing',
        colors: ['Blue', 'Light Blue'],
        sizes: ['M', 'L', 'XL'],
        rating: 4.6,
        store: 'Retro Fashion Hub'
      },
      {
        id: 'prod-3',
        name: 'Street Style Sneakers',
        price: 120,
        image: '/mock/sneakers-1.jpg',
        category: 'Footwear',
        colors: ['White', 'Black'],
        sizes: ['7', '8', '9', '10'],
        rating: 4.9,
        store: 'Sneaker Paradise'
      },
      {
        id: 'prod-4',
        name: 'Leather Belt',
        price: 45,
        image: '/mock/belt-1.jpg',
        category: 'Accessories',
        colors: ['Brown', 'Black'],
        sizes: ['S', 'M', 'L'],
        rating: 4.5,
        store: 'Accessory World'
      },
      {
        id: 'prod-5',
        name: 'Silver Ring',
        price: 89,
        image: '/mock/ring-1.jpg',
        category: 'Jewelry',
        colors: ['Silver'],
        sizes: ['7', '8', '9'],
        rating: 4.7,
        store: 'Jewelry Box'
      }
    ]

    setAvailableProducts(fallbackProducts)

    try {
      console.log('AI Stylist: Fetching from /api/items...')
      const response = await fetch('/api/items?limit=20')
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          console.log('AI Stylist: Using API data')
          setAvailableProducts(data.items)
        } else {
          console.log('AI Stylist: API returned no items, using fallback')
        }
      } else {
        console.log('AI Stylist: API request failed, using fallback')
      }
    } catch (error) {
      console.error('AI Stylist: Error loading products:', error)
      console.log('AI Stylist: Using fallback products')
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Load products on mount
  useEffect(() => {
    console.log('AI Stylist: Loading products...')
    loadAvailableProducts()
  }, [loadAvailableProducts])

  // Load saved profile and favorites from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load profile
        const saved = localStorage.getItem('ai-stylist-profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          setStyleProfile({ ...defaultStyleProfile, ...parsed })
        }

        // Load favorites
        const savedFavorites = localStorage.getItem('ai-stylist-favorites')
        if (savedFavorites) {
          setFavoriteOutfits(JSON.parse(savedFavorites))
        }
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }, [])

  // Generate intelligent outfit recommendations based on profile
  const generateMockRecommendations = useCallback((profile: StyleProfile): Outfit[] => {
    if (availableProducts.length === 0) return []

    const outfits: Outfit[] = []
    const occasions = ['Casual', 'Business', 'Evening', 'Sporty', 'Street Style']
    const styles = ['Modern', 'Vintage', 'Minimalist', 'Bold', 'Classic']

    // Filter products by user preferences
    const filteredProducts = availableProducts.filter(product => {
      // Check if product matches user's color preferences
      const colorMatch = profile.colors.length === 0 ||
        product.colors.some(color => profile.colors.includes(color))

      // Check if product matches user's size preferences
      const sizeMatch = profile.sizes.length === 0 ||
        product.sizes.some(size => profile.sizes.includes(size))

      // Check if product is within budget
      const budgetMatch = product.price <= profile.budget

      return colorMatch && sizeMatch && budgetMatch
    })

    // Create 5 different outfit combinations
    for (let i = 0; i < 5; i++) {
      const occasion = profile.occasion || occasions[i % occasions.length]
      const style = profile.stylePreferences.length > 0
        ? profile.stylePreferences[i % profile.stylePreferences.length]
        : styles[i % styles.length]

      let outfitItems: Product[] = []

      // Create intelligent outfit combinations based on occasion and style
      switch (occasion) {
        case 'Casual':
          // Casual outfit: Comfortable, everyday wear
          const casualTops = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('hoodie') || p.name.toLowerCase().includes('sweatshirt') || p.name.toLowerCase().includes('t-shirt'))
          )
          const casualBottoms = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('leggings') || p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('pants'))
          )
          const casualShoes = filteredProducts.filter(p =>
            p.category === 'Footwear' &&
            (p.name.toLowerCase().includes('sneakers') || p.name.toLowerCase().includes('trainers'))
          )

          if (casualTops.length > 0) outfitItems.push(casualTops[Math.floor(Math.random() * casualTops.length)])
          if (casualBottoms.length > 0) outfitItems.push(casualBottoms[Math.floor(Math.random() * casualBottoms.length)])
          if (casualShoes.length > 0) outfitItems.push(casualShoes[Math.floor(Math.random() * casualBottoms.length)])
          break

        case 'Business':
          // Business outfit: Professional, polished look
          const businessTops = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('blazer') || p.name.toLowerCase().includes('shirt'))
          )
          const businessAccessories = filteredProducts.filter(p =>
            ['Watches', 'Accessories'].includes(p.category) &&
            (p.name.toLowerCase().includes('watch') || p.name.toLowerCase().includes('belt') || p.name.toLowerCase().includes('bag'))
          )

          if (businessTops.length > 0) outfitItems.push(businessTops[Math.floor(Math.random() * businessTops.length)])
          if (businessAccessories.length > 0) outfitItems.push(businessAccessories[Math.floor(Math.random() * businessAccessories.length)])
          break

        case 'Evening':
          // Evening outfit: Dressy, elegant items
          const eveningClothing = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('dress') || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('blazer'))
          )
          const eveningJewelry = filteredProducts.filter(p =>
            p.category === 'Jewelry' &&
            (p.name.toLowerCase().includes('ring') || p.name.toLowerCase().includes('necklace') || p.name.toLowerCase().includes('earrings'))
          )

          if (eveningClothing.length > 0) outfitItems.push(eveningClothing[Math.floor(Math.random() * eveningClothing.length)])
          if (eveningJewelry.length > 0) outfitItems.push(eveningJewelry[Math.floor(Math.random() * eveningJewelry.length)])
          break

        case 'Sporty':
          // Sporty outfit: Athletic, performance wear
          const sportyTops = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('hoodie') || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('tank'))
          )
          const sportyBottoms = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('leggings') || p.name.toLowerCase().includes('shorts') || p.name.toLowerCase().includes('pants'))
          )
          const sportyShoes = filteredProducts.filter(p =>
            p.category === 'Footwear' &&
            (p.name.toLowerCase().includes('sneakers') || p.name.toLowerCase().includes('trainers') || p.name.toLowerCase().includes('running'))
          )

          if (sportyTops.length > 0) outfitItems.push(sportyTops[Math.floor(Math.random() * sportyTops.length)])
          if (sportyBottoms.length > 0) outfitItems.push(sportyBottoms[Math.floor(Math.random() * sportyBottoms.length)])
          if (sportyShoes.length > 0) outfitItems.push(sportyShoes[Math.floor(Math.random() * sportyShoes.length)])
          break

        case 'Street Style':
          // Street style outfit: Urban, trendy look
          const streetTops = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('hoodie') || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('sweatshirt'))
          )
          const streetBottoms = filteredProducts.filter(p =>
            p.category === 'Clothing' &&
            (p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('pants') || p.name.toLowerCase().includes('shorts'))
          )
          const streetShoes = filteredProducts.filter(p =>
            p.category === 'Footwear' &&
            (p.name.toLowerCase().includes('sneakers') || p.name.toLowerCase().includes('boots'))
          )

          if (streetTops.length > 0) outfitItems.push(streetTops[Math.floor(Math.random() * streetTops.length)])
          if (streetBottoms.length > 0) outfitItems.push(streetBottoms[Math.floor(Math.random() * streetBottoms.length)])
          if (streetShoes.length > 0) outfitItems.push(streetShoes[Math.floor(Math.random() * streetShoes.length)])
          break

        default:
          // Default: balanced mix of categories
          const categories = ['Clothing', 'Footwear', 'Accessories', 'Jewelry']
          categories.forEach(category => {
            const categoryProducts = filteredProducts.filter(p => p.category === category)
            if (categoryProducts.length > 0) {
              outfitItems.push(categoryProducts[Math.floor(Math.random() * categoryProducts.length)])
            }
          })
      }

      // Ensure we have at least 2 items for a complete outfit
      if (outfitItems.length < 2) {
        const remainingProducts = filteredProducts.filter(p => !outfitItems.find(item => item.id === p.id))
        const additionalItems = remainingProducts.slice(0, 3 - outfitItems.length)
        outfitItems.push(...additionalItems)
      }

      if (outfitItems.length > 0) {
        const totalPrice = outfitItems.reduce((sum, item) => sum + item.price, 0)

        // Calculate confidence based on how well the outfit matches preferences
        let confidence = 0.7 // Base confidence

        // Boost confidence if colors match
        const colorMatches = outfitItems.filter(item =>
          item.colors.some(color => profile.colors.includes(color))
        ).length
        confidence += (colorMatches / outfitItems.length) * 0.2

        // Boost confidence if sizes match
        const sizeMatches = outfitItems.filter(item =>
          item.sizes.some(size => profile.sizes.includes(size))
        ).length
        confidence += (sizeMatches / outfitItems.length) * 0.1

        // Create descriptive outfit names
        const outfitName = `${occasion} ${style} Look`

        outfits.push({
          id: `outfit-${i + 1}`,
          name: outfitName,
          items: outfitItems,
          totalPrice,
          occasion,
          style,
          confidence: Math.min(confidence, 0.95) // Cap at 95%
        })
      }
    }

    return outfits
  }, [availableProducts])

  // Save profile to localStorage
  const saveProfile = (profile: StyleProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-stylist-profile', JSON.stringify(profile))
    }
  }

    // Toggle favorite outfit
  const toggleFavorite = (outfit: Outfit) => {
    const isFavorite = favoriteOutfits.some(fav => fav.id === outfit.id)
    let newFavorites: Outfit[]

    if (isFavorite) {
      newFavorites = favoriteOutfits.filter(fav => fav.id !== outfit.id)
    } else {
      newFavorites = [...favoriteOutfits, outfit]
    }

    setFavoriteOutfits(newFavorites)

    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-stylist-favorites', JSON.stringify(newFavorites))
    }
  }

  // Share outfit to community
  const shareOutfit = (outfit: Outfit) => {
    const isShared = sharedOutfits.some(shared => shared.id === outfit.id)

    if (!isShared) {
      const newShared = [...sharedOutfits, outfit]
      setSharedOutfits(newShared)

      // Initialize community engagement
      setCommunityLikes(prev => ({ ...prev, [outfit.id]: 0 }))
      setUserComments(prev => ({ ...prev, [outfit.id]: [] }))

      if (typeof window !== 'undefined') {
        localStorage.setItem('ai-stylist-shared', JSON.stringify(newShared))
        localStorage.setItem('ai-stylist-likes', JSON.stringify({ ...communityLikes, [outfit.id]: 0 }))
        localStorage.setItem('ai-stylist-comments', JSON.stringify({ ...userComments, [outfit.id]: [] }))
      }

      alert(`Outfit "${outfit.name}" shared to community!`)
    } else {
      alert('This outfit is already shared!')
    }
  }

  // Like community outfit
  const likeOutfit = (outfitId: string) => {
    setCommunityLikes(prev => {
      const newLikes = { ...prev, [outfitId]: (prev[outfitId] || 0) + 1 }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai-stylist-likes', JSON.stringify(newLikes))
      }
      return newLikes
    })
  }

  // Add comment to community outfit
  const addComment = (outfitId: string, comment: string) => {
    if (comment.trim()) {
      setUserComments(prev => {
        const newComments = { ...prev, [outfitId]: [...(prev[outfitId] || []), comment] }
        if (typeof window !== 'undefined') {
          localStorage.setItem('ai-stylist-comments', JSON.stringify(newComments))
        }
        return newComments
      })
    }
  }

  // Start style analysis
  const startAnalysis = async () => {
    if (!styleProfile.name || !styleProfile.gender || !styleProfile.occasion) {
      setProfileError('Please fill in all required fields: Name, Gender, and Occasion')
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
      setProfileError('Style analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Start over
  const startOver = () => {
    setCurrentStep(1)
    setRecommendations([])
    setSelectedOutfit(null)
    setSuccessMessage(null)
    setProfileError(null)
  }

  // Add outfit to cart
  const addToCart = (outfit: Outfit) => {
    // In a real app, this would add to cart
    alert(`Added ${outfit.name} to cart! Total: $${outfit.totalPrice.toFixed(2)}`)
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

  // Show loading state only briefly
  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">AI Personal Stylist</h1>
              <p className="text-xl text-ink-300">Initializing...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Style Profile Form */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
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

              {/* Style Profile Form */}
              <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Tell Us About Your Style</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={styleProfile.name}
                      onChange={(e) => setStyleProfile({ ...styleProfile, name: e.target.value })}
                      className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:border-brand-400 focus:outline-none transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <input
                      type="number"
                      value={styleProfile.age}
                      onChange={(e) => setStyleProfile({ ...styleProfile, age: parseInt(e.target.value) || 25 })}
                      className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:border-brand-400 focus:outline-none transition-colors"
                      placeholder="25"
                      min="13"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gender *</label>
                    <select
                      value={styleProfile.gender}
                      onChange={(e) => setStyleProfile({ ...styleProfile, gender: e.target.value })}
                      className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-white focus:border-brand-400 focus:outline-none transition-colors"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Occasion *</label>
                    <select
                      value={styleProfile.occasion}
                      onChange={(e) => setStyleProfile({ ...styleProfile, occasion: e.target.value })}
                      className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-white focus:border-brand-400 focus:outline-none transition-colors"
                    >
                      <option value="">Select occasion</option>
                      <option value="Casual">Casual</option>
                      <option value="Business">Business</option>
                      <option value="Evening">Evening</option>
                      <option value="Sporty">Sporty</option>
                      <option value="Street Style">Street Style</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Style Preferences</label>
                    <div className="space-y-2">
                      {['Modern', 'Vintage', 'Minimalist', 'Bold', 'Classic'].map((preference) => (
                        <label key={preference} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={styleProfile.stylePreferences.includes(preference)}
                            onChange={(e) => handleStylePreferenceChange(preference, e.target.checked)}
                            className="w-4 h-4 text-brand-400 bg-ink-800 border-ink-600 rounded focus:ring-brand-400 focus:ring-2"
                          />
                          <span className="text-sm">{preference}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Favorite Colors</label>
                    <div className="space-y-2">
                      {['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Pink', 'Brown', 'Gray'].map((color) => (
                        <label key={color} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={styleProfile.colors.includes(color)}
                            onChange={(e) => handleColorChange(color, e.target.checked)}
                            className="w-4 h-4 text-brand-400 bg-ink-800 border-ink-600 rounded focus:ring-brand-400 focus:ring-2"
                          />
                          <span className="text-sm">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Preferred Sizes</label>
                    <div className="space-y-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <label key={size} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={styleProfile.sizes.includes(size)}
                            onChange={(e) => handleSizeChange(size, e.target.checked)}
                            className="w-4 h-4 text-brand-400 bg-ink-800 border-ink-600 rounded focus:ring-brand-400 focus:ring-2"
                          />
                          <span className="text-sm">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Range</label>
                    <select
                      value={styleProfile.budget}
                      onChange={(e) => setStyleProfile({ ...styleProfile, budget: parseInt(e.target.value) })}
                      className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-white focus:border-brand-400 focus:outline-none transition-colors"
                    >
                      <option value={200}>Under $200</option>
                      <option value={500}>Under $500</option>
                      <option value={1000}>Under $1000</option>
                      <option value={2000}>Under $2000</option>
                      <option value={5000}>No limit</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mx-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Analyzing Your Style...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-6 h-6" />
                        <span>Start Style Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recommendations */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Navigation Tabs */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={() => {
                    setShowFavorites(false)
                    setShowSocial(false)
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    !showFavorites && !showSocial
                      ? 'bg-brand-600 text-ink-black'
                      : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                  }`}
                >
                  Recommendations
                </button>
                <button
                  onClick={() => setShowFavorites(true)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    showFavorites
                      ? 'bg-brand-600 text-ink-black'
                      : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                  }`}
                >
                  Favorites ({favoriteOutfits.length})
                </button>
                <button
                  onClick={() => setShowSocial(true)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    showSocial
                      ? 'bg-brand-600 text-ink-black'
                      : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                  }`}
                >
                  Community ({sharedOutfits.length})
                </button>
              </div>

              {/* Recommendations Tab */}
              {!showFavorites && !showSocial && recommendations.length > 0 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Your Personalized Style Recommendations</h2>
                    <p className="text-ink-300 text-lg">Based on your preferences, here are some perfect outfit combinations:</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {recommendations.map((outfit) => (
                      <div key={outfit.id} className="bg-ink-900 rounded-2xl p-6 border border-ink-700 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">{outfit.name}</h3>
                          <button
                            onClick={() => toggleFavorite(outfit)}
                            className={`p-2 rounded-lg transition-colors ${
                              favoriteOutfits.some(fav => fav.id === outfit.id)
                                ? 'text-red-400 bg-red-900/20'
                                : 'text-ink-400 hover:text-red-400 hover:bg-red-900/20'
                            }`}
                            title={favoriteOutfits.some(fav => fav.id === outfit.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <StarIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <span className="text-sm text-ink-400">
                            {outfit.occasion} • {outfit.style} Style • Confidence: {Math.round(outfit.confidence * 100)}%
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                          {outfit.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg">
                              <div className="w-12 h-12 bg-ink-700 rounded-lg overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <p className="text-xs text-ink-400">{item.store}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-brand-400 text-sm">${item.price}</p>
                              </div>
                            </div>
                          ))}
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
                    ))}
                  </div>
                </div>
              )}

                            {/* Favorites Tab */}
              {showFavorites && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Your Favorite Outfits</h2>
                    <p className="text-ink-300 text-lg">Outfits you&apos;ve saved for later</p>
                  </div>

                  {favoriteOutfits.length === 0 ? (
                    <div className="text-center py-12">
                      <StarIcon className="w-16 h-16 text-ink-600 mx-auto mb-4" />
                      <p className="text-ink-400 text-lg">No favorite outfits yet</p>
                      <p className="text-ink-500">Start getting recommendations to save your favorites!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {favoriteOutfits.map((outfit) => (
                        <div key={outfit.id} className="bg-ink-900 rounded-2xl p-6 border border-ink-700 shadow-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{outfit.name}</h3>
                            <button
                              onClick={() => toggleFavorite(outfit)}
                              className="p-2 rounded-lg text-red-400 bg-red-900/20 hover:bg-red-900/30 transition-colors"
                              title="Remove from favorites"
                            >
                              <StarIcon className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-ink-400">
                              {outfit.occasion} • {outfit.style} Style • Confidence: {Math.round(outfit.confidence * 100)}%
                            </span>
                          </div>

                          {/* Items */}
                          <div className="space-y-2 mb-4">
                            {outfit.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg">
                                <div className="w-12 h-12 bg-ink-700 rounded-lg overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  <p className="text-xs text-ink-400">{item.store}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-brand-400 text-sm">${item.price}</p>
                                </div>
                              </div>
                            ))}
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

                            <button
                              onClick={() => shareOutfit(outfit)}
                              className="w-full text-ink-300 hover:text-brand-400 hover:bg-ink-800/50 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              Share to Community
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Community Tab */}
              {showSocial && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Style Community</h2>
                    <p className="text-ink-300 text-lg">Discover and share amazing outfit combinations</p>
                  </div>

                  {sharedOutfits.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">👥</span>
                      </div>
                      <p className="text-ink-400 text-lg">No shared outfits yet</p>
                      <p className="text-ink-500">Share your favorite outfits to start building the community!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {sharedOutfits.map((outfit) => (
                        <div key={outfit.id} className="bg-ink-900 rounded-2xl p-6 border border-ink-700 shadow-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{outfit.name}</h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => likeOutfit(outfit.id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                                title="Like this outfit"
                              >
                                <span className="text-sm">❤️ {communityLikes[outfit.id] || 0}</span>
                              </button>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-ink-400">
                              {outfit.occasion} • {outfit.style} Style • Confidence: {Math.round(outfit.confidence * 100)}%
                            </span>
                          </div>

                          {/* Items */}
                          <div className="space-y-2 mb-4">
                            {outfit.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg">
                                <div className="w-12 h-12 bg-ink-700 rounded-lg overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  <p className="text-xs text-ink-400">{item.store}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-brand-400 text-sm">${item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Community Engagement */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-ink-400">Community Rating:</span>
                              <span className="text-brand-400 font-medium">
                                {((communityLikes[outfit.id] || 0) / Math.max(sharedOutfits.length, 1) * 5).toFixed(1)}/5.0
                              </span>
                            </div>

                            {/* Comments Section */}
                            <div className="border-t border-ink-700 pt-3">
                              <h4 className="text-sm font-medium text-ink-300 mb-2">Comments</h4>
                              <div className="space-y-2 max-h-24 overflow-y-auto">
                                {(userComments[outfit.id] || []).map((comment, index) => (
                                  <div key={index} className="text-xs text-ink-400 bg-ink-800 p-2 rounded">
                                    {comment}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-white placeholder-ink-400 focus:border-brand-400 focus:outline-none"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addComment(outfit.id, e.currentTarget.value)
                                      e.currentTarget.value = ''
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 mt-4">
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
                      ))}
                    </div>
                  )}
                </div>
              )}

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
