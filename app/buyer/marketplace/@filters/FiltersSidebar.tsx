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
    <div className="bg-ink-900 rounded-3xl shadow-card border border-ink-800 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-ink-400 hover:text-brand-400 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink-300">Search</h3>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 bg-ink-800 border border-ink-700 rounded-xl text-white placeholder-ink-400 focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-brand-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink-300">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 text-brand-500 bg-ink-800 border-ink-600 focus:ring-brand-400 focus:ring-2"
                />
                <span className="text-sm text-ink-200 hover:text-white transition-colors duration-200">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink-300">Price Range</h3>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.label} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value={range.label}
                  checked={selectedPriceRange === range.label}
                  onChange={() => handlePriceChange(range.label)}
                  className="w-4 h-4 text-brand-500 bg-ink-800 border-ink-600 focus:ring-brand-400 focus:ring-2"
                />
                <span className="text-sm text-ink-200 hover:text-white transition-colors duration-200">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink-300">Brands</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 text-brand-500 bg-ink-800 border-ink-600 rounded focus:ring-brand-400 focus:ring-2"
                />
                <span className="text-sm text-ink-200 hover:text-white transition-colors duration-200">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
