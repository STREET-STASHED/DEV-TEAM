/**
 * Real-Time Inventory Management System
 * Handles inventory sync, stock alerts, and automated reordering
 */

export interface InventoryItem {
  id: string
  productId: string
  sellerId: string
  sku: string
  name: string
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderPoint: number
  reorderQuantity: number
  cost: number
  sellingPrice: number
  lastUpdated: Date
  status: 'active' | 'inactive' | 'discontinued'
  variants: InventoryVariant[]
}

export interface InventoryVariant {
  id: string
  size: string
  color: string
  material: string
  stock: number
  reserved: number
  available: number
}

export interface StockAlert {
  id: string
  productId: string
  sellerId: string
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_needed'
  currentStock: number
  threshold: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface ReorderSuggestion {
  id: string
  productId: string
  sellerId: string
  suggestedQuantity: number
  reason: string
  confidence: number
  estimatedCost: number
  estimatedArrival: Date
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export class RealTimeInventoryManager {
  private static instance: RealTimeInventoryManager
  private inventoryCache: Map<string, InventoryItem> = new Map()
  private stockAlerts: Map<string, StockAlert> = new Map()
  private reorderSuggestions: Map<string, ReorderSuggestion> = new Map()
  private updateCallbacks: Set<(_item: InventoryItem) => void> = new Set()

  static getInstance(): RealTimeInventoryManager {
    if (!RealTimeInventoryManager.instance) {
      RealTimeInventoryManager.instance = new RealTimeInventoryManager()
    }
    return RealTimeInventoryManager.instance
  }

  // Real-time inventory sync
  async syncInventory(productId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const currentItem = this.inventoryCache.get(productId)
      if (!currentItem) {
        throw new Error(`Product ${productId} not found in inventory`)
      }

      const updatedItem: InventoryItem = {
        ...currentItem,
        ...updates,
        lastUpdated: new Date(),
        availableStock: (updates.currentStock || currentItem.currentStock) - (updates.reservedStock || currentItem.reservedStock)
      }

      // Update cache
      this.inventoryCache.set(productId, updatedItem)

      // Check for stock alerts
      await this.checkStockAlerts(updatedItem)

      // Generate reorder suggestions
      await this.generateReorderSuggestions(updatedItem)

      // Notify subscribers
      this.updateCallbacks.forEach(callback => callback(updatedItem))

      return updatedItem
    } catch (error) {
      console.error('Error syncing inventory:', error)
      throw error
    }
  }

  // Check stock levels and generate alerts
  private async checkStockAlerts(item: InventoryItem): Promise<void> {
    const alerts: StockAlert[] = []

    // Low stock alert
    if (item.availableStock <= item.reorderPoint && item.availableStock > 0) {
      alerts.push({
        id: `alert-${item.productId}-${Date.now()}`,
        productId: item.productId,
        sellerId: item.sellerId,
        alertType: 'low_stock',
        currentStock: item.availableStock,
        threshold: item.reorderPoint,
        priority: item.availableStock <= item.reorderPoint * 0.5 ? 'critical' : 'high',
        message: `Low stock alert: ${item.name} has ${item.availableStock} units remaining`,
        createdAt: new Date(),
        resolved: false
      })
    }

    // Out of stock alert
    if (item.availableStock <= 0) {
      alerts.push({
        id: `alert-${item.productId}-${Date.now()}`,
        productId: item.productId,
        sellerId: item.sellerId,
        alertType: 'out_of_stock',
        currentStock: item.availableStock,
        threshold: 0,
        priority: 'critical',
        message: `Out of stock: ${item.name} is no longer available`,
        createdAt: new Date(),
        resolved: false
      })
    }

    // Overstock alert
    if (item.availableStock > item.reorderPoint * 3) {
      alerts.push({
        id: `alert-${item.productId}-${Date.now()}`,
        productId: item.productId,
        sellerId: item.sellerId,
        alertType: 'overstock',
        currentStock: item.availableStock,
        threshold: item.reorderPoint * 3,
        priority: 'medium',
        message: `Overstock alert: ${item.name} has ${item.availableStock} units (${item.reorderPoint * 3}+ threshold)`,
        createdAt: new Date(),
        resolved: false
      })
    }

    // Store alerts
    alerts.forEach(alert => {
      this.stockAlerts.set(alert.id, alert)
    })
  }

  // Generate reorder suggestions based on sales velocity and stock levels
  private async generateReorderSuggestions(item: InventoryItem): Promise<void> {
    if (item.availableStock > item.reorderPoint) return

    // Calculate sales velocity (units sold per day)
    const salesVelocity = await this.calculateSalesVelocity(item.productId)
    const daysUntilStockout = item.availableStock / salesVelocity
    const leadTime = 7 // Average supplier lead time in days

    if (daysUntilStockout <= leadTime) {
      const suggestedQuantity = Math.ceil(salesVelocity * (leadTime + 14)) // 2 weeks buffer
      
      const suggestion: ReorderSuggestion = {
        id: `reorder-${item.productId}-${Date.now()}`,
        productId: item.productId,
        sellerId: item.sellerId,
        suggestedQuantity,
        reason: `Based on sales velocity of ${salesVelocity.toFixed(1)} units/day and ${daysUntilStockout.toFixed(1)} days until stockout`,
        confidence: Math.min(0.95, salesVelocity > 0 ? 0.8 : 0.3),
        estimatedCost: suggestedQuantity * item.cost,
        estimatedArrival: new Date(Date.now() + leadTime * 24 * 60 * 60 * 1000),
        urgency: daysUntilStockout <= 3 ? 'critical' : daysUntilStockout <= 7 ? 'high' : 'medium'
      }

      this.reorderSuggestions.set(suggestion.id, suggestion)
    }
  }

  // Calculate sales velocity for a product
  private async calculateSalesVelocity(_productId: string): Promise<number> {
    // This would typically query the database for recent sales
    // For now, return a mock value based on product performance
    const mockVelocity = Math.random() * 5 + 1 // 1-6 units per day
    return mockVelocity
  }

  // Reserve stock for an order
  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const item = this.inventoryCache.get(productId)
    if (!item) return false

    if (item.availableStock < quantity) return false

    item.reservedStock += quantity
    item.availableStock -= quantity
    item.lastUpdated = new Date()

    this.inventoryCache.set(productId, item)
    this.updateCallbacks.forEach(callback => callback(item))

    return true
  }

  // Release reserved stock
  async releaseStock(productId: string, quantity: number): Promise<void> {
    const item = this.inventoryCache.get(productId)
    if (!item) return

    item.reservedStock = Math.max(0, item.reservedStock - quantity)
    item.availableStock += quantity
    item.lastUpdated = new Date()

    this.inventoryCache.set(productId, item)
    this.updateCallbacks.forEach(callback => callback(item))
  }

  // Get inventory status for a seller
  getSellerInventory(sellerId: string): InventoryItem[] {
    return Array.from(this.inventoryCache.values())
      .filter(item => item.sellerId === sellerId)
  }

  // Get stock alerts for a seller
  getSellerAlerts(sellerId: string): StockAlert[] {
    return Array.from(this.stockAlerts.values())
      .filter(alert => alert.sellerId === sellerId && !alert.resolved)
  }

  // Get reorder suggestions for a seller
  getSellerReorderSuggestions(sellerId: string): ReorderSuggestion[] {
    return Array.from(this.reorderSuggestions.values())
      .filter(suggestion => suggestion.sellerId === sellerId)
  }

  // Subscribe to inventory updates
  subscribeToUpdates(callback: (_item: InventoryItem) => void): () => void {
    this.updateCallbacks.add(callback)
    return () => this.updateCallbacks.delete(callback)
  }

  // Bulk update inventory
  async bulkUpdateInventory(updates: Array<{ productId: string; updates: Partial<InventoryItem> }>): Promise<void> {
    const promises = updates.map(({ productId, updates }) => 
      this.syncInventory(productId, updates)
    )
    await Promise.all(promises)
  }

  // Get inventory analytics
  getInventoryAnalytics(sellerId: string): {
    totalProducts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    turnoverRate: number
  } {
    const items = this.getSellerInventory(sellerId)
    
    return {
      totalProducts: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.availableStock * item.cost), 0),
      lowStockCount: items.filter(item => item.availableStock <= item.reorderPoint && item.availableStock > 0).length,
      outOfStockCount: items.filter(item => item.availableStock <= 0).length,
      turnoverRate: items.reduce((sum, item) => sum + (item.availableStock / Math.max(1, item.reorderPoint)), 0) / items.length
    }
  }
}
