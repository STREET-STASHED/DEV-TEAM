'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  'All',
  'Sneakers',
  'Streetwear',
  'Accessories',
  'Vintage',
  'Limited Edition'
]

const priceRanges = [
  { label: 'All Prices', min: 0, max: null },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: null }
]

const brands = [
  'Nike',
  'Adidas',
  'Jordan',
  'Supreme',
  'Palace',
  'Off-White',
  'Yeezy',
  'Bape'
]

export function FiltersSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get('price') || 'All Prices')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const updateFilters = (newSearch?: string, newCategory?: string, newPrice?: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (newSearch !== undefined) {
      if (newSearch) {
        params.set('search', newSearch)
      } else {
        params.delete('search')
      }
    }
    
    if (newCategory !== undefined) {
      if (newCategory !== 'All') {
        params.set('category', newCategory)
      } else {
        params.delete('category')
      }
    }
    
    if (newPrice !== undefined) {
      if (newPrice !== 'All Prices') {
        params.set('price', newPrice)
      } else {
        params.delete('price')
      }
    }
    
    router.push(`/buyer/marketplace?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters(searchTerm)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateFilters(undefined, category)
  }

  const handlePriceChange = (price: string) => {
    setSelectedPriceRange(price)
    updateFilters(undefined, undefined, price)
  }

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedPriceRange('All Prices')
    setSelectedBrands([])
    router.push('/buyer/marketplace')
  }

  return (
    <div className="filters-premium">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
        >
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Search</h3>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="search-premium">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 bg-transparent border-none outline-none text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                selectedCategory === category
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-neutral-300 group-hover:border-primary-400'
              }`}>
                {selectedCategory === category && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <span className={`text-sm transition-colors duration-200 ${
                selectedCategory === category
                  ? 'text-primary-600 font-medium'
                  : 'text-neutral-700 group-hover:text-neutral-900'
              }`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="price"
                value={range.label}
                checked={selectedPriceRange === range.label}
                onChange={() => handlePriceChange(range.label)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                selectedPriceRange === range.label
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-neutral-300 group-hover:border-primary-400'
              }`}>
                {selectedPriceRange === range.label && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <span className={`text-sm transition-colors duration-200 ${
                selectedPriceRange === range.label
                  ? 'text-primary-600 font-medium'
                  : 'text-neutral-700 group-hover:text-neutral-900'
              }`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Brands</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 transition-all duration-200 ${
                selectedBrands.includes(brand)
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-neutral-300 group-hover:border-primary-400'
              }`}>
                {selectedBrands.includes(brand) && (
                  <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-sm transition-colors duration-200 ${
                selectedBrands.includes(brand)
                  ? 'text-primary-600 font-medium'
                  : 'text-neutral-700 group-hover:text-neutral-900'
              }`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Sort By</h3>
        <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-sm">
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name A-Z</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  )
}
