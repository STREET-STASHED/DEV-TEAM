'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { Filter, Search, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SearchResult {
  id: string
  name: string
  category: string
  price: number
  image_url: string
  relevance_score: number
  tags: string[]
  seller_rating: number
  condition: string
}

interface FilterOption {
  id: string
  label: string
  value: string
  count: number
}

interface SearchFilters {
  category: string[]
  priceRange: { min: number; max: number }
  condition: string[]
  sellerRating: number
  tags: string[]
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'
}

interface SmartSearchProps {
  onSearch: (_query: string, _filters: SearchFilters) => void
  onResultSelect: (_result: SearchResult) => void
  placeholder?: string
  className?: string
}

export default function SmartSearch({
  onSearch,
  onResultSelect,
  placeholder = "Search for streetwear, sneakers, accessories...",
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    priceRange: { min: 0, max: 1000 },
    condition: [],
    sellerRating: 0,
    tags: [],
    sortBy: 'relevance'
  })
  const [categories, setCategories] = useState<FilterOption[]>([])
  const [conditions, setConditions] = useState<FilterOption[]>([])
  const [showResults, setShowResults] = useState(false)

  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load filter options
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Perform search with AI-powered relevance
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true)
    try {
      // In a real app, this would be an API call with AI relevance scoring
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setSuggestions(data.suggestions || [])
      } else {
        // Fallback to mock data
        const mockResults = generateMockResults(searchQuery)
        setResults(mockResults)
        setSuggestions(generateMockSuggestions(searchQuery))
      }
    } catch (error) {
      console.error('Search error:', error)
      // Use mock data as fallback
      const mockResults = generateMockResults(searchQuery)
      setResults(mockResults)
      setSuggestions(generateMockSuggestions(searchQuery))
    } finally {
      setIsSearching(false)
      setShowResults(true)
    }
  }, [])

  // Handle search query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
      setSuggestions([])
    }
  }, [debouncedQuery, performSearch])

  // Handle clicks outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load available filter options
  const loadFilterOptions = async () => {
    try {
      // In a real app, this would fetch from API
      const mockCategories: FilterOption[] = [
        { id: 'sneakers', label: 'Sneakers', value: 'sneakers', count: 156 },
        { id: 'hoodies', label: 'Hoodies', value: 'hoodies', count: 89 },
        { id: 'jackets', label: 'Jackets', value: 'jackets', count: 67 },
        { id: 'pants', label: 'Pants', value: 'pants', count: 123 },
        { id: 'accessories', label: 'Accessories', value: 'accessories', count: 234 }
      ]

      const mockConditions: FilterOption[] = [
        { id: 'new', label: 'New', value: 'new', count: 89 },
        { id: 'like-new', label: 'Like New', value: 'like-new', count: 156 },
        { id: 'good', label: 'Good', value: 'good', count: 234 },
        { id: 'fair', label: 'Fair', value: 'fair', count: 67 }
      ]

      setCategories(mockCategories)
      setConditions(mockConditions)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Generate mock search results
  const generateMockResults = (searchQuery: string): SearchResult[] => {
    const mockProducts = [
      { id: '1', name: 'Nike Air Jordan 1 Retro High OG', category: 'sneakers', price: 299, image_url: '/mock/sneaker1.jpg', relevance_score: 0.95, tags: ['limited-edition', 'streetwear'], seller_rating: 4.8, condition: 'new' },
      { id: '2', name: 'Supreme Box Logo Hoodie', category: 'hoodies', price: 199, image_url: '/mock/hoodie1.jpg', relevance_score: 0.92, tags: ['streetwear', 'limited-edition'], seller_rating: 4.9, condition: 'like-new' },
      { id: '3', name: 'Adidas Yeezy Boost 350 V2', category: 'sneakers', price: 399, image_url: '/mock/sneaker2.jpg', relevance_score: 0.88, tags: ['streetwear'], seller_rating: 4.7, condition: 'good' },
      { id: '4', name: 'Off-White Industrial Belt', category: 'accessories', price: 89, image_url: '/mock/belt1.jpg', relevance_score: 0.85, tags: ['luxury', 'streetwear'], seller_rating: 4.6, condition: 'new' }
    ]

    // Filter and sort by relevance
    return mockProducts
      .filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 10)
  }

  // Generate mock suggestions
  const generateMockSuggestions = (searchQuery: string): string[] => {
    const suggestions = [
      `${searchQuery} sneakers`,
      `${searchQuery} hoodies`,
      `${searchQuery} streetwear`,
      `${searchQuery} limited edition`,
      `${searchQuery} vintage`
    ]
    return suggestions.slice(0, 5)
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query, filters)
      setShowResults(false)
    }
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    onResultSelect(result)
    setShowResults(false)
    setQuery('')
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    setShowResults(false)
  }

  // Update filters
  const updateFilter = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: { min: 0, max: 1000 },
      condition: [],
      sellerRating: 0,
      tags: [],
      sortBy: 'relevance'
    })
  }

  // Apply filters and search
  const applyFilters = () => {
    if (query.trim()) {
      onSearch(query, filters)
      setShowResults(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 bg-ink-800 border border-ink-700 rounded-lg text-ink-100 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            onFocus={() => setShowResults(true)}
          />

          {/* AI Indicator */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-colors ${
              showFilters ? 'bg-brand-500 text-white' : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Search
        </button>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-800 border border-ink-700 rounded-lg p-6 z-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink-100">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-ink-400 hover:text-ink-300 underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Categories</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('category', [...filters.category, category.value])
                        } else {
                          updateFilter('category', filters.category.filter(c => c !== category.value))
                        }
                      }}
                      className="rounded border-ink-600 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-ink-400">{category.label} ({category.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Price Range</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded text-ink-100 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded text-ink-100 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Condition</label>
              <div className="space-y-2">
                {conditions.map(condition => (
                  <label key={condition.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.condition.includes(condition.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('condition', [...filters.condition, condition.value])
                        } else {
                          updateFilter('condition', filters.condition.filter(c => c !== condition.value))
                        }
                      }}
                      className="rounded border-ink-600 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-ink-400">{condition.label} ({condition.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seller Rating */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Minimum Seller Rating</label>
              <select
                value={filters.sellerRating}
                onChange={(e) => updateFilter('sellerRating', Number(e.target.value))}
                className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded text-ink-100 text-sm"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])}
                className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded text-ink-100 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={applyFilters}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Results & Suggestions */}
      {showResults && (results.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-800 border border-ink-700 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-ink-300 mb-3">Search Results</h4>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-ink-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={result.image_url}
                      alt={result.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-100 truncate">
                        {result.name}
                      </div>
                      <div className="text-xs text-ink-400">
                        {result.category} • ${result.price} • {result.condition}
                      </div>
                    </div>
                    <div className="text-xs text-brand-400">
                      {Math.round(result.relevance_score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-t border-ink-700">
              <h4 className="text-sm font-medium text-ink-300 mb-3">Suggestions</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-ink-700 cursor-pointer transition-colors"
                  >
                    <Search className="w-4 h-4 text-ink-400" />
                    <span className="text-sm text-ink-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-800 border border-ink-700 rounded-lg p-4 z-40">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
            <span className="text-sm text-ink-400">Searching...</span>
          </div>
        </div>
      )}
    </div>
  )
}
