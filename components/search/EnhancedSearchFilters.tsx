'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Search, Camera, X, SlidersHorizontal, Star, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface _EnhancedSearchFilters {
  // Basic filters
  category: string
  brand: string
  size: string
  color: string
  condition: string
  priceRange: [number, number]
  
  // Advanced filters
  rating: number
  availability: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  sellerRating: number
  shippingSpeed: 'all' | 'same_day' | 'next_day' | 'standard'
  location: 'all' | 'local' | 'national'
  
  // Sorting and display
  sortBy: string
  viewMode: 'grid' | 'list'
  
  // Quick filters
  inStock: boolean
  trending: boolean
  onSale: boolean
  newArrivals: boolean
  verified: boolean
  freeShipping: boolean
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'trending' | 'category' | 'brand'
  count?: number
}

export default function EnhancedSearchFilters() {
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showVisualSearch, setShowVisualSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  
  const [filters, setFilters] = useState<{
    category: string
    brand: string
    size: string
    color: string
    condition: string
    priceRange: { min: number; max: number }
    rating: number
    availability: string
    sellerRating: number
    shippingSpeed: string
    location: string
    sortBy: string
    viewMode: string
    inStock: boolean
    trending: boolean
    onSale: boolean
    newArrivals: boolean
    verified: boolean
    freeShipping: boolean
  }>({
    category: '',
    brand: '',
    size: '',
    color: '',
    condition: '',
    priceRange: { min: 0, max: 2000 },
    rating: 0,
    availability: 'all',
    sellerRating: 0,
    shippingSpeed: 'all',
    location: 'all',
    sortBy: 'relevance',
    viewMode: 'grid',
    inStock: true,
    trending: false,
    onSale: false,
    newArrivals: false,
    verified: false,
    freeShipping: false
  })

  // Enhanced categories with subcategories
  const categories = useMemo(() => [
    { value: 'sneakers', label: 'Sneakers', subcategories: ['jordan', 'nike', 'adidas', 'yeezy', 'vintage'] },
    { value: 'streetwear', label: 'Streetwear', subcategories: ['hoodies', 'tees', 'jackets', 'pants', 'shorts'] },
    { value: 'accessories', label: 'Accessories', subcategories: ['bags', 'hats', 'belts', 'jewelry', 'watches'] },
    { value: 'vintage', label: 'Vintage', subcategories: ['90s', '80s', '70s', 'designer', 'streetwear'] },
    { value: 'limited_edition', label: 'Limited Edition', subcategories: ['collabs', 'drops', 'exclusives', 'rares'] }
  ], [])

  // Enhanced brands with popularity scores
  const brands = useMemo(() => [
    { value: 'nike', label: 'Nike', popularity: 95 },
    { value: 'adidas', label: 'Adidas', popularity: 90 },
    { value: 'jordan', label: 'Jordan', popularity: 88 },
    { value: 'supreme', label: 'Supreme', popularity: 85 },
    { value: 'off_white', label: 'Off-White', popularity: 80 },
    { value: 'palace', label: 'Palace', popularity: 75 },
    { value: 'bape', label: 'Bape', popularity: 70 },
    { value: 'yeezy', label: 'Yeezy', popularity: 85 },
    { value: 'travis_scott', label: 'Travis Scott', popularity: 78 },
    { value: 'fear_of_god', label: 'Fear of God', popularity: 72 }
  ], [])

  // Enhanced sizes with category-specific options
  const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    sneakers: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14'],
    accessories: ['One Size', 'S', 'M', 'L', 'XL'],
    watches: ['38mm', '40mm', '42mm', '44mm', '46mm']
  }

  const colors = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'red', label: 'Red', hex: '#FF0000' },
    { value: 'blue', label: 'Blue', hex: '#0000FF' },
    { value: 'green', label: 'Green', hex: '#008000' },
    { value: 'yellow', label: 'Yellow', hex: '#FFFF00' },
    { value: 'purple', label: 'Purple', hex: '#800080' },
    { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
    { value: 'orange', label: 'Orange', hex: '#FFA500' },
    { value: 'brown', label: 'Brown', hex: '#A52A2A' },
    { value: 'gray', label: 'Gray', hex: '#808080' },
    { value: 'multi', label: 'Multi-Color', hex: '#FFD700' }
  ]

  const conditions = [
    { value: 'new', label: 'New', description: 'Never worn, with tags' },
    { value: 'like_new', label: 'Like New', description: 'Minimal wear, excellent condition' },
    { value: 'good', label: 'Good', description: 'Light wear, good condition' },
    { value: 'fair', label: 'Fair', description: 'Moderate wear, fair condition' },
    { value: 'vintage', label: 'Vintage', description: 'Authentic vintage piece' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Search },
    { value: 'price_low', label: 'Price: Low to High', icon: DollarSign },
    { value: 'price_high', label: 'Price: High to Low', icon: DollarSign },
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'popularity', label: 'Most Popular', icon: TrendingUp }
  ]

  // Load search history and trending searches
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }

    // Mock trending searches
    setTrendingSearches([
      'Jordan 1 Chicago',
      'Supreme Box Logo',
      'Yeezy 350',
      'Vintage Nike',
      'Off-White Air Max'
    ])
  }, [])

  // Generate smart suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const smartSuggestions: SearchSuggestion[] = []
      
      // Recent searches
      const recentMatches = searchHistory
        .filter(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(term => ({ id: `recent-${term}`, text: term, type: 'recent' as const }))
      
      // Trending searches
      const trendingMatches = trendingSearches
        .filter(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2)
        .map(term => ({ id: `trending-${term}`, text: term, type: 'trending' as const }))
      
      // Category suggestions
      const categoryMatches = categories
        .filter(cat => cat.label.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2)
        .map(cat => ({ id: `category-${cat.value}`, text: cat.label, type: 'category' as const }))
      
      // Brand suggestions
      const brandMatches = brands
        .filter(brand => brand.label.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2)
        .map(brand => ({ id: `brand-${brand.value}`, text: brand.label, type: 'brand' as const }))
      
      smartSuggestions.push(...recentMatches, ...trendingMatches, ...categoryMatches, ...brandMatches)
      setSuggestions(smartSuggestions)
    } else {
      setSuggestions([])
    }
  }, [searchQuery, searchHistory, trendingSearches, brands, categories])

  // Handle search submission
  const handleSearch = useCallback((query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setIsSearching(true)

    // Add to search history
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    // Build comprehensive search URL
    const params = new URLSearchParams()
    params.set('search', searchTerm)
    
    // Basic filters
    if (filters.category) params.set('category', filters.category)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.size) params.set('size', filters.size)
    if (filters.color) params.set('color', filters.color)
    if (filters.condition) params.set('condition', filters.condition)
    
    // Price range
    if (filters.priceRange.min > 0) params.set('minPrice', filters.priceRange.min.toString())
    if (filters.priceRange.max < 2000) params.set('maxPrice', filters.priceRange.max.toString())
    
    // Advanced filters
    if (filters.rating > 0) params.set('rating', filters.rating.toString())
    if (filters.availability !== 'all') params.set('availability', filters.availability)
    if (filters.sellerRating > 0) params.set('sellerRating', filters.sellerRating.toString())
    if (filters.shippingSpeed !== 'all') params.set('shipping', filters.shippingSpeed)
    if (filters.location !== 'all') params.set('location', filters.location)
    
    // Sorting and display
    if (filters.sortBy) params.set('sort', filters.sortBy)
    if (filters.viewMode) params.set('view', filters.viewMode)
    
    // Quick filters
    if (filters.inStock) params.set('inStock', 'true')
    if (filters.trending) params.set('trending', 'true')
    if (filters.onSale) params.set('onSale', 'true')
    if (filters.newArrivals) params.set('newArrivals', 'true')
    if (filters.verified) params.set('verified', 'true')
    if (filters.freeShipping) params.set('freeShipping', 'true')

    router.push(`/buyer/marketplace?${params.toString()}`)
    setIsSearching(false)
  }, [searchQuery, filters, searchHistory, router])

  // Handle visual search
  const handleVisualSearch = useCallback(async (file: File) => {
    setIsSearching(true)
    setShowVisualSearch(false)

    try {
      // Simulate visual search API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock visual search results with confidence scores
      const _mockResults = [
        {
          id: '1',
          name: 'Nike Air Jordan 1 Retro High',
          image: '/mock/sneakers-1.jpg',
          confidence: 0.92,
          price: 299.99,
          category: 'Sneakers',
          brand: 'Jordan',
          color: 'Red/White/Black'
        },
        {
          id: '2',
          name: 'Supreme Box Logo Hoodie',
          image: '/mock/hoodie-1.jpg',
          confidence: 0.87,
          price: 450,
          category: 'Streetwear',
          brand: 'Supreme',
          color: 'Red'
        },
        {
          id: '3',
          name: 'Vintage Nike Air Max 90',
          image: '/mock/sneakers-2.jpg',
          confidence: 0.78,
          price: 180,
          category: 'Sneakers',
          brand: 'Nike',
          color: 'White/Blue'
        }
      ]
      
      // Navigate to results with visual search context
      const params = new URLSearchParams()
      params.set('visualSearch', 'true')
      params.set('imageFile', file.name)
      router.push(`/buyer/marketplace?${params.toString()}`)
    } catch (error) {
      console.error('Visual search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [router])

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      size: '',
      color: '',
      condition: '',
      priceRange: { min: 0, max: 2000 },
      rating: 0,
      availability: 'all',
      sellerRating: 0,
      shippingSpeed: 'all',
      location: 'all',
      sortBy: 'relevance',
      viewMode: 'grid',
      inStock: true,
      trending: false,
      onSale: false,
      newArrivals: false,
      verified: false,
      freeShipping: false
    })
  }

  // Get active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return (value as { min: number; max: number }).min !== 0 || (value as { min: number; max: number }).max !== 2000
    if (key === 'viewMode') return false // Don't count view mode
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0
    return value !== '' && value !== 'all'
  }).length

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-ink-800 rounded-2xl border border-ink-700 focus-within:border-purple-500 transition-all duration-200 shadow-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for sneakers, streetwear, accessories..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-ink-400 px-12 py-4 text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-2 pr-4">
            {/* Visual Search Button */}
            <button
              onClick={() => setShowVisualSearch(!showVisualSearch)}
              className="p-3 text-ink-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-ink-700"
              title="Visual Search"
            >
              <Camera className="w-5 h-5" />
            </button>
            
            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeFilterCount > 0 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-ink-400 hover:text-purple-400 hover:bg-ink-700'
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Smart Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-ink-900 border border-ink-700 rounded-xl mt-2 z-50 shadow-2xl">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setSearchQuery(suggestion.text)
                  handleSearch(suggestion.text)
                }}
                className="w-full text-left px-4 py-3 hover:bg-ink-800 text-white flex items-center space-x-3 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  suggestion.type === 'recent' ? 'bg-blue-400' :
                  suggestion.type === 'trending' ? 'bg-orange-400' :
                  suggestion.type === 'category' ? 'bg-green-400' :
                  'bg-purple-400'
                }`} />
                <span className="flex-1">{suggestion.text}</span>
                {suggestion.count && (
                  <span className="text-ink-400 text-sm">{suggestion.count} results</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search History */}
        {searchQuery === '' && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-ink-900 border border-ink-700 rounded-xl mt-2 z-50 shadow-2xl">
            <div className="px-4 py-2 text-ink-400 text-sm font-semibold border-b border-ink-700">Recent Searches</div>
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(term)
                  handleSearch(term)
                }}
                className="w-full text-left px-4 py-3 hover:bg-ink-800 text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-ink-400" />
                  <span>{term}</span>
                </span>
                <X 
                  className="w-4 h-4 text-ink-400 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    const newHistory = searchHistory.filter((_, i) => i !== index)
                    setSearchHistory(newHistory)
                    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Visual Search Modal */}
      {showVisualSearch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-ink-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-ink-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-xl">Visual Search</h3>
              <button
                onClick={() => setShowVisualSearch(false)}
                className="text-ink-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-ink-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
              <Camera className="w-16 h-16 text-ink-400 mx-auto mb-4" />
              <p className="text-ink-300 mb-2 text-lg">Upload an image to find similar items</p>
              <p className="text-ink-400 text-sm mb-6">Supports JPG, PNG, and WebP formats</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleVisualSearch(file)
                }}
                className="hidden"
                id="visual-search-input"
              />
              <label
                htmlFor="visual-search-input"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl cursor-pointer transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Advanced Filters */}
      {showFilters && (
        <div className="mt-6 bg-ink-900 rounded-2xl p-8 border border-ink-700 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-xl">Advanced Filters</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="text-ink-400 hover:text-white text-sm font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-ink-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Size
              </label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">All Sizes</option>
                {sizeOptions.clothing.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleFilterChange('color', filters.color === color.value ? '' : color.value)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      filters.color === color.value 
                        ? 'border-purple-500 ring-2 ring-purple-500/20' 
                        : 'border-ink-600 hover:border-ink-500'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>{condition.label}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Minimum Rating: {filters.rating > 0 ? `${filters.rating}+` : 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>Any</span>
                <span>5★</span>
              </div>
            </div>

            {/* Seller Rating Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Seller Rating: {filters.sellerRating > 0 ? `${filters.sellerRating}+` : 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.sellerRating}
                onChange={(e) => handleFilterChange('sellerRating', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>Any</span>
                <span>5★</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-8">
            <label className="block text-ink-300 text-sm font-medium mb-4">
              Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { min: parseInt(e.target.value), max: filters.priceRange.max })}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { min: filters.priceRange.min, max: parseInt(e.target.value) })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-8">
            <h4 className="text-ink-300 text-sm font-medium mb-4">Quick Filters</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'inStock', label: 'In Stock', icon: '✓' },
                { key: 'trending', label: 'Trending', icon: '🔥' },
                { key: 'onSale', label: 'On Sale', icon: '💰' },
                { key: 'newArrivals', label: 'New Arrivals', icon: '✨' },
                { key: 'verified', label: 'Verified', icon: '✓' },
                { key: 'freeShipping', label: 'Free Shipping', icon: '🚚' }
              ].map((filter) => (
                <label key={filter.key} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-ink-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters[filter.key as keyof typeof filters] as boolean}
                    onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                    className="w-4 h-4 rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-ink-300 text-sm flex items-center space-x-1">
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                handleSearch()
                setShowFilters(false)
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Apply Filters ({activeFilterCount})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
