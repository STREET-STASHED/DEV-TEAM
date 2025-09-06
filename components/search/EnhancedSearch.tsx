'use client'

import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface SearchFilters {
  query: string
  category: string
  brand: string
  size: string[]
  color: string[]
  condition: string[]
  priceRange: [number, number]
  material: string[]
  availability: 'in_stock' | 'low_stock' | 'all'
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'popularity'
  location?: string
  deliveryTime?: 'same_day' | 'next_day' | 'standard'
}

export interface SearchResult {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  size: string[]
  color: string[]
  condition: string
  material: string
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
  seller: {
    id: string
    name: string
    rating: number
    location: string
  }
  delivery: {
    estimatedTime: string
    sameDayAvailable: boolean
    freeShipping: boolean
  }
  tags: string[]
}

interface EnhancedSearchProps {
  onSearch: (_filters: SearchFilters) => void
  onClear: () => void
  initialFilters?: Partial<SearchFilters>
  results?: SearchResult[]
  loading?: boolean
}

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy', 'Beige', 'Cream']
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const MATERIALS = ['Cotton', 'Polyester', 'Denim', 'Leather', 'Wool', 'Silk', 'Linen', 'Rayon', 'Spandex', 'Cashmere']
const BRANDS = ['Nike', 'Adidas', 'Supreme', 'Off-White', 'Balenciaga', 'Gucci', 'Louis Vuitton', 'Chanel', 'Prada', 'Versace']
const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear', 'Activewear', 'Lingerie', 'Swimwear']

export default function EnhancedSearch({ 
  onSearch, 
  onClear, 
  initialFilters = {}, 
  results = [], 
  loading: _loading = false 
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    brand: 'all',
    size: [],
    color: [],
    condition: [],
    priceRange: [0, 1000],
    material: [],
    availability: 'all',
    sortBy: 'relevance',
    ...initialFilters
  })

  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  // Search suggestions based on query
  useEffect(() => {
    if (filters.query.length > 2) {
      const suggestions = [
        ...BRANDS.filter(brand => brand.toLowerCase().includes(filters.query.toLowerCase())),
        ...CATEGORIES.filter(category => category.toLowerCase().includes(filters.query.toLowerCase())),
        ...MATERIALS.filter(material => material.toLowerCase().includes(filters.query.toLowerCase()))
      ].slice(0, 5)
      setSearchSuggestions(suggestions)
    } else {
      setSearchSuggestions([])
    }
  }, [filters.query])

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const handleSizeToggle = useCallback((size: string) => {
    setFilters(prev => ({
      ...prev,
      size: prev.size.includes(size) 
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }))
  }, [])

  const handleColorToggle = useCallback((color: string) => {
    setFilters(prev => ({
      ...prev,
      color: prev.color.includes(color) 
        ? prev.color.filter(c => c !== color)
        : [...prev.color, color]
    }))
  }, [])

  const handleConditionToggle = useCallback((condition: string) => {
    setFilters(prev => ({
      ...prev,
      condition: prev.condition.includes(condition) 
        ? prev.condition.filter(c => c !== condition)
        : [...prev.condition, condition]
    }))
  }, [])

  const handleMaterialToggle = useCallback((material: string) => {
    setFilters(prev => ({
      ...prev,
      material: prev.material.includes(material) 
        ? prev.material.filter(m => m !== material)
        : [...prev.material, material]
    }))
  }, [])

  const handleSearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleClear = useCallback(() => {
    setFilters({
      query: '',
      category: 'all',
      brand: 'all',
      size: [],
      color: [],
      condition: [],
      priceRange: [0, 1000],
      material: [],
      availability: 'all',
      sortBy: 'relevance'
    })
    onClear()
  }, [onClear])

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.brand !== 'all') count++
    if (filters.size.length > 0) count++
    if (filters.color.length > 0) count++
    if (filters.condition.length > 0) count++
    if (filters.material.length > 0) count++
    if (filters.availability !== 'all') count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    return count
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for clothing, brands, styles..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleFilterChange('query', suggestion)
                      handleSearch()
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Brands</option>
                {BRANDS.map(brand => (
                  <option key={brand} value={brand.toLowerCase()}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.size.includes(size)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.color.includes(color)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(condition => (
                <button
                  key={condition}
                  onClick={() => handleConditionToggle(condition)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.condition.includes(condition)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Material Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map(material => (
                <button
                  key={material}
                  onClick={() => handleMaterialToggle(material)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.material.includes(material)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {results.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Found {results.length} results
          {getActiveFiltersCount() > 0 && (
            <span className="ml-2">
              with {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>
      )}
    </div>
  )
}
