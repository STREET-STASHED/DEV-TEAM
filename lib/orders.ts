// lib/orders.ts
// 🚀 StreetStashed Order Management System

import { Order, CheckoutData } from './types'
import { getDistanceAndEtaMeters } from './distance'
import { calculateFees } from './fees'

export class OrderService {
  // Create a new order
  static async createOrder(checkoutData: CheckoutData, buyerId: string, sellerId: string): Promise<Order> {
    try {
      // Calculate distance and ETA
      const distanceAndEta = await getDistanceAndEtaMeters(checkoutData.pickupAddress, checkoutData.deliveryAddress)
      
      // Calculate fees
      const fees = calculateFees({
        distanceMiles: distanceAndEta.distanceMiles,
        etaMinutes: distanceAndEta.minutes,
        merchSubtotal: checkoutData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      })

      // Create order object
      const order: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        buyer_id: buyerId,
        seller_id: sellerId,
        driver_id: undefined, // Will be assigned when driver accepts
        status: 'pending',
        items: checkoutData.items,
        pickup_address: checkoutData.pickupAddress,
        delivery_address: checkoutData.deliveryAddress,
        distance_miles: distanceAndEta.distanceMiles,
        eta_minutes: distanceAndEta.minutes,
        driver_payout_amount: fees.driverCompensation.driverPay,
        delivery_fee_amount: fees.stashedSupportFee.buyerShare,
        platform_margin_amount: fees.driverCompensation.platformMargin,
        support_fee_buyer: fees.stashedSupportFee.buyerShare,
        support_fee_seller: fees.stashedSupportFee.sellerShare,
        item_total: fees.meta.totalOrderAmount - fees.stashedSupportFee.total,
        support_fee_total: fees.stashedSupportFee.total,
        driver_payout: fees.driverCompensation.driverPay,
        platform_margin: fees.driverCompensation.platformMargin,
        total_amount: fees.meta.totalOrderAmount,
        delivery_instructions: checkoutData.deliveryInstructions || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In a real app, this would be saved to the database
      console.log('Order created:', order)
      
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      // For demo purposes, return null
      console.log(`Getting order ${orderId}`)
      return null
    } catch (error) {
      console.error('Error getting order:', error)
      throw error
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      // For demo purposes, just log the update
      console.log(`Order ${orderId} status updated to: ${status}`)
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Assign driver to order
  static async assignDriverToOrder(orderId: string, driverId: string): Promise<boolean> {
    try {
      // For demo purposes, just log the assignment
      console.log(`Driver ${driverId} assigned to order ${orderId}`)
      return true
    } catch (error) {
      console.error('Error assigning driver to order:', error)
      throw error
    }
  }

  // Get orders for buyer
  static async getBuyerOrders(buyerId: string): Promise<Order[]> {
    try {
      // For demo purposes, return empty array
      console.log(`Getting orders for buyer ${buyerId}`)
      return []
    } catch (error) {
      console.error('Error getting buyer orders:', error)
      throw error
    }
  }

  // Get orders for seller
  static async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      // For demo purposes, return empty array
      console.log(`Getting orders for seller ${sellerId}`)
      return []
    } catch (error) {
      console.error('Error getting seller orders:', error)
      throw error
    }
  }

  // Get available orders for drivers
  static async getAvailableOrders(): Promise<Order[]> {
    try {
      // For demo purposes, return empty array
      console.log('Getting available orders for drivers')
      return []
    } catch (error) {
      console.error('Error getting available orders:', error)
      throw error
    }
  }
}
