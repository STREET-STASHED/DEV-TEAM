'use client'

import { useState } from 'react'
import { addToCart } from '@/app/actions/cart'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  category: string
  stock: number
  created_at: string
  seller: {
    username: string
    full_name: string
  }
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddToCart = async () => {
    setIsAdding(true)
    setMessage('')

    try {
      const result = await addToCart(product.id, quantity)
      
      if (result.success) {
        setMessage('Added to cart!')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(result.error || 'Failed to add to cart')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to add to cart')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Category</h4>
            <p className="text-sm text-gray-900">{product.category}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Stock</h4>
            <p className="text-sm text-gray-900">{product.stock} available</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Seller</h4>
          <Link 
            href={`/stores/${product.seller_id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <span>{product.seller.full_name}</span>
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* Add to Cart Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding to cart...
              </div>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </button>

          {message && (
            <div className={`text-center p-3 rounded-lg ${
              message.includes('Added') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
