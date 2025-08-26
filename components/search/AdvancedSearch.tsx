'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, Filter, Camera, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchFilters {
  category: string
  priceRange: [number, number]
  brand: string
  size: string
  color: string
  condition: string
  sortBy: string
  inStock: boolean
  trending: boolean
  onSale: boolean
}

interface VisualSearchResult {
  id: string
  name: string
  image: string
  confidence: number
  price: number
  category: string
}

export default function AdvancedSearch() {
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showVisualSearch, setShowVisualSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [visualResults, setVisualResults] = useState<VisualSearchResult[]>([])
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    priceRange: [0, 1000],
    brand: '',
    size: '',
    color: '',
    condition: '',
    sortBy: 'relevance',
    inStock: true,
    trending: false,
    onSale: false
  })

  // Categories for filtering
  const categories = [
    'Sneakers', 'Streetwear', 'Accessories', 'Jewelry', 
    'Watches', 'Vintage', 'Activewear', 'Formal'
  ]

  // Brands for filtering
  const brands = [
    'Nike', 'Adidas', 'Supreme', 'Off-White', 'Palace', 
    'Bape', 'Yeezy', 'Jordan', 'Vintage', 'Custom'
  ]

  // Sizes for filtering
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11', '12']

  // Colors for filtering
  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
    'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi'
  ]

  // Conditions for filtering
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Vintage']

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'trending', label: 'Trending' },
    { value: 'rating', label: 'Highest Rated' }
  ]

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const suggestions = [
        `${searchQuery} sneakers`,
        `${searchQuery} streetwear`,
        `${searchQuery} vintage`,
        `${searchQuery} limited edition`,
        `${searchQuery} on sale`
      ]
      setSuggestions(suggestions)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  // Handle search submission
  const handleSearch = useCallback((query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setIsSearching(true)

    // Add to search history
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    // Build search URL with filters
    const params = new URLSearchParams()
    params.set('search', searchTerm)
    
    if (filters.category) params.set('category', filters.category)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.size) params.set('size', filters.size)
    if (filters.color) params.set('color', filters.color)
    if (filters.condition) params.set('condition', filters.condition)
    if (filters.sortBy) params.set('sort', filters.sortBy)
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString())
    if (filters.priceRange[1] < 1000) params.set('maxPrice', filters.priceRange[1].toString())
    if (filters.inStock) params.set('inStock', 'true')
    if (filters.trending) params.set('trending', 'true')
    if (filters.onSale) params.set('onSale', 'true')

    // Navigate to marketplace with search params
    router.push(`/buyer/marketplace?${params.toString()}`)
    
    setIsSearching(false)
  }, [searchQuery, filters, searchHistory, router])

  // Handle visual search
  const handleVisualSearch = useCallback(async (_file: File) => {
    setIsSearching(true)
    setShowVisualSearch(false)

    try {
      // Simulate visual search API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock visual search results
      const mockResults: VisualSearchResult[] = [
        {
          id: '1',
          name: 'Similar Nike Air Jordan 1',
          image: '/mock/sneakers-1.jpg',
          confidence: 0.89,
          price: 299.99,
          category: 'Sneakers'
        },
        {
          id: '2',
          name: 'Vintage Denim Jacket',
          image: '/mock/denim-jacket-1.jpg',
          confidence: 0.76,
          price: 145,
          category: 'Streetwear'
        },
        {
          id: '3',
          name: 'Urban Street Hoodie',
          image: '/mock/hoodie-1.jpg',
          confidence: 0.72,
          price: 89.99,
          category: 'Streetwear'
        }
      ]
      
      setVisualResults(mockResults)
    } catch (error) {
      console.error('Visual search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      brand: '',
      size: '',
      color: '',
      condition: '',
      sortBy: 'relevance',
      inStock: true,
      trending: false,
      onSale: false
    })
  }

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== false && 
    (Array.isArray(value) ? value[0] !== 0 || value[1] !== 1000 : true)
  ).length

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-ink-800 rounded-full border border-ink-700 focus-within:border-purple-500 transition-colors">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for sneakers, clothing, accessories..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-ink-400 px-12 py-4 text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-2 pr-4">
            {/* Visual Search Button */}
            <button
              onClick={() => setShowVisualSearch(!showVisualSearch)}
              className="p-2 text-ink-400 hover:text-purple-400 transition-colors"
              title="Visual Search"
            >
              <Camera className="w-5 h-5" />
            </button>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-colors ${
                activeFilterCount > 0 
                  ? 'bg-purple-500 text-white' 
                  : 'text-ink-400 hover:text-purple-400'
              }`}
              title="Filters"
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-ink-900 border border-ink-700 rounded-lg mt-2 z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion)
                  handleSearch(suggestion)
                }}
                className="w-full text-left px-4 py-3 hover:bg-ink-800 text-white flex items-center space-x-2"
              >
                <Search className="w-4 h-4 text-ink-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search History */}
        {searchQuery === '' && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-ink-900 border border-ink-700 rounded-lg mt-2 z-50">
            <div className="px-4 py-2 text-ink-400 text-sm font-semibold">Recent Searches</div>
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(term)
                  handleSearch(term)
                }}
                className="w-full text-left px-4 py-2 hover:bg-ink-800 text-white flex items-center justify-between"
              >
                <span>{term}</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-ink-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Visual Search</h3>
              <button
                onClick={() => setShowVisualSearch(false)}
                className="text-ink-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-ink-700 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-ink-400 mx-auto mb-4" />
              <p className="text-ink-300 mb-4">
                Upload an image to find similar items
              </p>
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
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full cursor-pointer transition-colors"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Visual Search Results */}
      {visualResults.length > 0 && (
        <div className="mt-6 bg-ink-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Visual Search Results</h3>
            <button
              onClick={() => setVisualResults([])}
              className="text-ink-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visualResults.map((result) => (
              <div
                key={result.id}
                className="bg-ink-800 rounded-lg p-4 cursor-pointer hover:bg-ink-700 transition-colors"
                onClick={() => router.push(`/buyer/marketplace?search=${result.name}`)}
              >
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-white font-semibold text-sm mb-1">{result.name}</h4>
                <p className="text-purple-400 text-sm mb-2">{result.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">${result.price}</span>
                  <span className="text-green-400 text-sm">
                    {Math.round(result.confidence * 100)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 bg-ink-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Advanced Filters</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="text-ink-400 hover:text-white text-sm"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-ink-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Size
              </label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Color
              </label>
              <select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                <option value="">All Colors</option>
                {colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6">
            <label className="block text-ink-300 text-sm font-medium mb-2">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-ink-300 text-sm">In Stock</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.trending}
                onChange={(e) => handleFilterChange('trending', e.target.checked)}
                className="rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-ink-300 text-sm">Trending</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                className="rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-ink-300 text-sm">On Sale</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                handleSearch()
                setShowFilters(false)
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
