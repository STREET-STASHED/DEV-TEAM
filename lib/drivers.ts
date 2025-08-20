// lib/drivers.ts
// 🚀 StreetStashed Driver Management System

import { Driver, DriverStats, DriverPayBreakdown } from './types'

// Mock driver data for demo purposes
const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    user_id: 'user-driver-1',
    full_name: 'Alex Johnson',
    username: 'alex_driver',
    email: 'alex@streetstashed.com',
    phone: '+1-555-0101',
    vehicle_info: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      color: 'Silver',
      license_plate: 'ABC-123'
    },
    current_location: {
      lat: 40.4406,
      lng: -79.9959,
      address: 'Pittsburgh, PA'
    },
    status: 'available',
    rating: 4.8,
    total_deliveries: 127,
    total_earnings: 2847.50,
    is_verified: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:22:00Z'
  },
  {
    id: 'driver-2',
    user_id: 'user-driver-2',
    full_name: 'Sarah Chen',
    username: 'sarah_driver',
    email: 'sarah@streetstashed.com',
    phone: '+1-555-0102',
    vehicle_info: {
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      color: 'Blue',
      license_plate: 'XYZ-789'
    },
    current_location: {
      lat: 40.4406,
      lng: -79.9959,
      address: 'Pittsburgh, PA'
    },
    status: 'busy',
    rating: 4.9,
    total_deliveries: 203,
    total_earnings: 4123.75,
    is_verified: true,
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  }
]

const mockDriverStats: DriverStats[] = [
  {
    driver_id: 'driver-1',
    total_orders: 127,
    completed_orders: 125,
    cancelled_orders: 2,
    total_distance_miles: 847.3,
    total_earnings: 2847.50,
    average_rating: 4.8,
    total_hours: 156.5,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:22:00Z'
  },
  {
    driver_id: 'driver-2',
    total_orders: 203,
    completed_orders: 200,
    cancelled_orders: 3,
    total_distance_miles: 1247.8,
    total_earnings: 4123.75,
    average_rating: 4.9,
    total_hours: 234.2,
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  }
]

export class DriverService {
  // Get all available drivers
  static async getAvailableDrivers(): Promise<Driver[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return mockDrivers.filter(driver => driver.status === 'available')
  }

  // Get driver by ID
  static async getDriverById(driverId: string): Promise<Driver | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return mockDrivers.find(driver => driver.id === driverId) || null
  }

  // Get driver stats
  static async getDriverStats(driverId: string): Promise<DriverStats | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockDriverStats.find(stats => stats.driver_id === driverId) || null
  }

  // Update driver status
  static async updateDriverStatus(driverId: string, status: 'available' | 'busy' | 'offline'): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const driver = mockDrivers.find(d => d.id === driverId)
    if (driver) {
      driver.status = status
      driver.updated_at = new Date().toISOString()
      return true
    }
    return false
  }

  // Update driver location
  static async updateDriverLocation(driverId: string, location: { lat: number; lng: number; address: string }): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const driver = mockDrivers.find(d => d.id === driverId)
    if (driver) {
      driver.current_location = location
      driver.updated_at = new Date().toISOString()
      return true
    }
    return false
  }

  // Assign driver to order
  static async assignDriverToOrder(driverId: string, _orderId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const driver = mockDrivers.find(d => d.id === driverId)
    if (driver && driver.status === 'available') {
      driver.status = 'busy'
      driver.updated_at = new Date().toISOString()
      return true
    }
    return false
  }

  // Get driver pay breakdown
  static async getDriverPayBreakdown(driverId: string, _orderId: string): Promise<DriverPayBreakdown | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const driver = mockDrivers.find(d => d.id === driverId)
    if (!driver) return null

    // Mock pay breakdown
    return {
      driver_id: driverId,
      order_id: _orderId,
      base_pay: 6.00,
      distance_pay: 4.20, // 6 miles * $0.70
      time_pay: 2.50,
      bonus_pay: 0.00,
      total_pay: 12.70,
      platform_fee: 3.81, // 30% of total
      driver_take_home: 8.89, // 70% of total
      breakdown: {
        base: 6.00,
        distance: 4.20,
        time: 2.50,
        bonus: 0.00,
        platform_fee: 3.81
      },
      created_at: new Date().toISOString()
    }
  }

  // Get nearby drivers
  static async getNearbyDrivers(_location: { lat: number; lng: number }, _radiusMiles: number = 10): Promise<Driver[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock nearby drivers calculation
    return mockDrivers.filter(driver => driver.status === 'available')
  }

  // Get driver earnings history
  static async getDriverEarningsHistory(_driverId: string, _startDate?: string, _endDate?: string): Promise<Array<{
    date: string
    orders: number
    distance: number
    earnings: number
    platform_fee: number
    take_home: number
  }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Mock earnings history
    return [
      {
        date: '2024-01-20',
        orders: 8,
        distance: 45.2,
        earnings: 156.80,
        platform_fee: 47.04,
        take_home: 109.76
      },
      {
        date: '2024-01-19',
        orders: 6,
        distance: 38.7,
        earnings: 134.20,
        platform_fee: 40.26,
        take_home: 93.94
      }
    ]
  }

  // Get driver performance metrics
  static async getDriverPerformanceMetrics(driverId: string): Promise<{
    total_orders: number
    completion_rate: number
    average_rating: number
    total_earnings: number
    average_delivery_time: number
    customer_satisfaction: number
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const stats = mockDriverStats.find(s => s.driver_id === driverId)
    if (!stats) {
      throw new Error('Driver stats not found')
    }

    return {
      total_orders: stats.total_orders,
      completion_rate: (stats.completed_orders / stats.total_orders) * 100,
      average_rating: stats.average_rating,
      total_earnings: stats.total_earnings,
      average_delivery_time: 45, // minutes
      customer_satisfaction: 92 // percentage
    }
  }
}
