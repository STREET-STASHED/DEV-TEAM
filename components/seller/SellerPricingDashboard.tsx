'use client'

import { useState, useMemo } from 'react'
import { 
  calculateSellerMetrics,
  getDistancePricingImpact
} from '@/lib/sellerPricing'

interface Product {
  id: string
  name: string
  basePrice: number
  suggestedPrice: number
  supportFee: number
  category: string
}

interface SellerPricingDashboardProps {
  products: Product[]
}

export function SellerPricingDashboard({ products }: SellerPricingDashboardProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDistanceAnalysis, setShowDistanceAnalysis] = useState(false)

  // Calculate overall metrics
  const metrics = useMemo(() => {
    return calculateSellerMetrics(products.map(p => ({
      basePrice: p.basePrice,
      suggestedPrice: p.suggestedPrice,
      supportFee: p.supportFee
    })))
  }, [products])

  // Calculate distance impact for selected product
  const distanceAnalysis = useMemo(() => {
    if (!selectedProduct) return []
    return getDistancePricingImpact(selectedProduct.basePrice, 12) // Assume 12% markup
  }, [selectedProduct])

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized'
      if (!acc[category]) acc[category] = []
      acc[category].push(product)
      return acc
    }, {} as Record<string, Product[]>)
    
    return Object.entries(grouped).map(([category, products]) => ({
      category,
      products,
      totalValue: products.reduce((sum, p) => sum + p.suggestedPrice, 0),
      avgProfitMargin: products.reduce((sum, p) => {
        const profit = p.suggestedPrice - p.basePrice - p.supportFee
        return sum + (profit / p.suggestedPrice) * 100
      }, 0) / products.length
    }))
  }, [products])

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-400 mb-1">Total Inventory Value</h3>
          <p className="text-2xl font-bold text-white">${metrics.totalSuggestedValue.toFixed(2)}</p>
          <p className="text-xs text-ink-400">Base: ${metrics.totalBaseValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-400 mb-1">Total Markup</h3>
          <p className="text-2xl font-bold text-brand-400">${metrics.totalMarkup.toFixed(2)}</p>
          <p className="text-xs text-ink-400">{metrics.averageMarkupPercentage.toFixed(1)}% avg</p>
        </div>
        
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-400 mb-1">Support Fees</h3>
          <p className="text-2xl font-bold text-ink-300">${metrics.totalSupportFees.toFixed(2)}</p>
          <p className="text-xs text-ink-400">Total deductions</p>
        </div>
        
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-400 mb-1">Estimated Profit</h3>
          <p className="text-2xl font-bold text-brand-400">${metrics.estimatedProfit.toFixed(2)}</p>
          <p className="text-xs text-ink-400">{metrics.averageProfitMargin.toFixed(1)}% margin</p>
        </div>
      </div>

      {/* Products by Category */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Products by Category</h3>
        
        <div className="space-y-4">
          {productsByCategory.map(({ category, products, totalValue, avgProfitMargin }) => (
            <div key={category} className="border border-ink-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-white capitalize">{category}</h4>
                <div className="text-sm text-ink-400">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-xs text-ink-400">Total Value:</span>
                  <div className="text-white font-medium">${totalValue.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-xs text-ink-400">Avg Profit Margin:</span>
                  <div className="text-brand-400 font-medium">{avgProfitMargin.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-xs text-ink-400">Avg Support Fee:</span>
                  <div className="text-ink-300">
                    ${(products.reduce((sum, p) => sum + p.supportFee, 0) / products.length).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {products.map((product) => {
                  const profit = product.suggestedPrice - product.basePrice - product.supportFee
                  const profitMargin = (profit / product.suggestedPrice) * 100
                  
                  return (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-ink-700/30 rounded cursor-pointer hover:bg-ink-700/50 transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{product.name}</div>
                        <div className="text-xs text-ink-400">
                          ${product.basePrice} → ${product.suggestedPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-brand-400 font-medium">${profit.toFixed(2)}</div>
                        <div className="text-xs text-ink-400">{profitMargin.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Analysis */}
      {selectedProduct && (
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Product Analysis: {selectedProduct.name}</h3>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-ink-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Details */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">Pricing Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-400">Base Price:</span>
                  <span className="text-white">${selectedProduct.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Suggested Price:</span>
                  <span className="text-white">${selectedProduct.suggestedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Markup:</span>
                  <span className="text-ink-300">${(selectedProduct.suggestedPrice - selectedProduct.basePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Support Fee:</span>
                  <span className="text-ink-300">${selectedProduct.supportFee}</span>
                </div>
                <div className="flex justify-between border-t border-ink-600 pt-2">
                  <span className="text-ink-400">Net Profit:</span>
                  <span className="text-brand-400 font-medium">
                    ${(selectedProduct.suggestedPrice - selectedProduct.basePrice - selectedProduct.supportFee).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Profit Margin:</span>
                  <span className="text-brand-400 font-medium">
                    {(((selectedProduct.suggestedPrice - selectedProduct.basePrice - selectedProduct.supportFee) / selectedProduct.suggestedPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Distance Impact */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-white">Distance Impact</h4>
                <button
                  onClick={() => setShowDistanceAnalysis(!showDistanceAnalysis)}
                  className="text-sm text-brand-400 hover:text-brand-300"
                >
                  {showDistanceAnalysis ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showDistanceAnalysis ? (
                <div className="space-y-2 text-sm">
                  {distanceAnalysis.map(({ distance, pricing }) => (
                    <div key={distance} className="flex justify-between p-2 bg-ink-700/30 rounded">
                      <span className="text-ink-300">{distance} miles</span>
                      <span className="text-brand-400">${pricing.estimatedProfit.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                               <div className="text-sm text-ink-400">
                 Click &quot;Show Details&quot; to see how delivery distance affects your profit margin.
               </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tips */}
      <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pricing Optimization Tips</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-2">For Better Profit Margins</h4>
            <ul className="space-y-2 text-sm text-ink-300">
              <li>• Consider 12-18% markup for most products</li>
              <li>• Premium items can support 20-25% markup</li>
              <li>• Bundle items to reduce per-item support fees</li>
              <li>• Monitor distance-based fee variations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-white mb-2">Support Fee Insights</h4>
            <ul className="space-y-2 text-sm text-ink-300">
              <li>• Fees scale with delivery distance</li>
              <li>• Higher cart values reduce fee percentage</li>
              <li>• Night deliveries have additional bonuses</li>
              <li>• Long-distance orders require buyer consent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
