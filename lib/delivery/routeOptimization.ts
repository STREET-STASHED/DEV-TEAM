/**
 * Route Optimization System for Delivery
 * Handles driver assignment, route planning, and real-time tracking
 */

export interface DeliveryLocation {
  id: string
  address: string
  coordinates: { lat: number; lng: number }
  contact: {
    name: string
    phone: string
  }
  instructions?: string
  timeWindow?: {
    start: Date
    end: Date
  }
  priority: 'standard' | 'express' | 'urgent'
}

export interface Driver {
  id: string
  name: string
  phone: string
  currentLocation: { lat: number; lng: number }
  status: 'available' | 'busy' | 'offline'
  capacity: number
  currentLoad: number
  vehicleType: 'bike' | 'scooter' | 'car' | 'van'
  rating: number
  lastActive: Date
  deliveryZone: string[]
}

export interface DeliveryRoute {
  id: string
  driverId: string
  orders: string[]
  waypoints: DeliveryLocation[]
  estimatedDuration: number // in minutes
  estimatedDistance: number // in miles
  startTime: Date
  endTime: Date
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  realTimeUpdates: RouteUpdate[]
}

export interface RouteUpdate {
  id: string
  routeId: string
  driverId: string
  location: { lat: number; lng: number }
  status: 'started' | 'picking_up' | 'delivering' | 'completed' | 'delayed'
  timestamp: Date
  estimatedArrival?: Date
  message?: string
}

export interface OptimizationResult {
  route: DeliveryRoute
  efficiency: number // 0-1 score
  cost: number
  timeSavings: number // minutes saved vs naive routing
  fuelSavings: number // estimated fuel savings
}

export class RouteOptimizationEngine {
  private static instance: RouteOptimizationEngine
  private drivers: Map<string, Driver> = new Map()
  private routes: Map<string, DeliveryRoute> = new Map()
  private realTimeUpdates: Map<string, RouteUpdate[]> = new Map()

  static getInstance(): RouteOptimizationEngine {
    if (!RouteOptimizationEngine.instance) {
      RouteOptimizationEngine.instance = new RouteOptimizationEngine()
    }
    return RouteOptimizationEngine.instance
  }

  // Optimize delivery routes for multiple orders
  async optimizeRoutes(orders: Array<{
    id: string
    pickup: DeliveryLocation
    delivery: DeliveryLocation
    priority: 'standard' | 'express' | 'urgent'
    weight: number
    volume: number
  }>): Promise<OptimizationResult[]> {
    try {
      const availableDrivers = this.getAvailableDrivers()
      if (availableDrivers.length === 0) {
        throw new Error('No available drivers')
      }

      const results: OptimizationResult[] = []

      // Group orders by priority and zone
      const groupedOrders = this.groupOrdersByPriorityAndZone(orders)
      
      for (const [_priority, zoneOrders] of groupedOrders) {
        const drivers = this.filterDriversByZone(availableDrivers, zoneOrders)
        
        for (const driver of drivers) {
          const driverOrders = this.assignOrdersToDriver(driver, zoneOrders)
          if (driverOrders.length > 0) {
            const route = await this.createOptimizedRoute(driver, driverOrders)
            const efficiency = this.calculateRouteEfficiency(route)
            const cost = this.calculateRouteCost(route)
            const timeSavings = this.calculateTimeSavings(route)
            const fuelSavings = this.calculateFuelSavings(route)

            results.push({
              route,
              efficiency,
              cost,
              timeSavings,
              fuelSavings
            })

            // Remove assigned orders from available orders
            driverOrders.forEach(order => {
              const index = orders.findIndex(o => o.id === order.id)
              if (index > -1) orders.splice(index, 1)
            })
          }
        }
      }

      return results.sort((a, b) => b.efficiency - a.efficiency)
    } catch (error) {
      console.error('Error optimizing routes:', error)
      throw error
    }
  }

  // Create optimized route for a driver and orders
  private async createOptimizedRoute(driver: Driver, orders: Array<{
    id: string
    pickup: DeliveryLocation
    delivery: DeliveryLocation
    priority: 'standard' | 'express' | 'urgent'
    weight: number
    volume: number
  }>): Promise<DeliveryRoute> {
    const waypoints: DeliveryLocation[] = []
    const orderIds: string[] = []

    // Add pickup locations first (closest to driver)
    const pickupLocations = orders.map(order => order.pickup)
    const sortedPickups = this.sortLocationsByDistance(driver.currentLocation, pickupLocations)
    
    sortedPickups.forEach(pickup => {
      waypoints.push(pickup)
      const order = orders.find(o => o.pickup.id === pickup.id)
      if (order) orderIds.push(order.id)
    })

    // Add delivery locations (optimized route)
    const deliveryLocations = orders.map(order => order.delivery)
    const sortedDeliveries = this.optimizeDeliverySequence(waypoints[waypoints.length - 1], deliveryLocations)
    
    sortedDeliveries.forEach(delivery => {
      waypoints.push(delivery)
    })

    const route: DeliveryRoute = {
      id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      driverId: driver.id,
      orders: orderIds,
      waypoints,
      estimatedDuration: this.calculateRouteDuration(waypoints),
      estimatedDistance: this.calculateRouteDistance(waypoints),
      startTime: new Date(),
      endTime: new Date(Date.now() + this.calculateRouteDuration(waypoints) * 60000),
      status: 'planned',
      realTimeUpdates: []
    }

    this.routes.set(route.id, route)
    return route
  }

  // Sort locations by distance from a starting point
  private sortLocationsByDistance(start: { lat: number; lng: number }, locations: DeliveryLocation[]): DeliveryLocation[] {
    return locations.sort((a, b) => {
      const distanceA = this.calculateDistance(start, a.coordinates)
      const distanceB = this.calculateDistance(start, b.coordinates)
      return distanceA - distanceB
    })
  }

  // Optimize delivery sequence using nearest neighbor algorithm
  private optimizeDeliverySequence(start: DeliveryLocation, deliveries: DeliveryLocation[]): DeliveryLocation[] {
    if (deliveries.length === 0) return []

    const optimized: DeliveryLocation[] = []
    const remaining = [...deliveries]
    let current = start

    while (remaining.length > 0) {
      const nearest = this.findNearestLocation(current, remaining)
      optimized.push(nearest)
      remaining.splice(remaining.indexOf(nearest), 1)
      current = nearest
    }

    return optimized
  }

  // Find nearest location from current position
  private findNearestLocation(current: DeliveryLocation, locations: DeliveryLocation[]): DeliveryLocation {
    let nearest = locations[0]
    let minDistance = this.calculateDistance(current.coordinates, nearest.coordinates)

    for (let i = 1; i < locations.length; i++) {
      const distance = this.calculateDistance(current.coordinates, locations[i].coordinates)
      if (distance < minDistance) {
        nearest = locations[i]
        minDistance = distance
      }
    }

    return nearest
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat)
    const dLng = this.toRadians(point2.lng - point1.lng)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Calculate route duration in minutes
  private calculateRouteDuration(waypoints: DeliveryLocation[]): number {
    let totalDuration = 0
    const averageSpeed = 25 // mph in city traffic

    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.calculateDistance(waypoints[i].coordinates, waypoints[i + 1].coordinates)
      const travelTime = (distance / averageSpeed) * 60 // convert to minutes
      const serviceTime = 5 // minutes per stop
      totalDuration += travelTime + serviceTime
    }

    return Math.ceil(totalDuration)
  }

  // Calculate route distance in miles
  private calculateRouteDistance(waypoints: DeliveryLocation[]): number {
    let totalDistance = 0

    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i].coordinates, waypoints[i + 1].coordinates)
    }

    return Math.round(totalDistance * 100) / 100
  }

  // Group orders by priority and delivery zone
  private groupOrdersByPriorityAndZone(orders: Array<{
    id: string
    pickup: DeliveryLocation
    delivery: DeliveryLocation
    priority: 'standard' | 'express' | 'urgent'
    weight: number
    volume: number
  }>): Map<string, typeof orders> {
    const groups = new Map<string, typeof orders>()

    orders.forEach(order => {
      const key = `${order.priority}-${this.getDeliveryZone(order.delivery.coordinates)}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(order)
    })

    return groups
  }

  // Get delivery zone for coordinates
  private getDeliveryZone(coordinates: { lat: number; lng: number }): string {
    // Simplified zone calculation - in production, this would use actual zone boundaries
    const lat = coordinates.lat
    const lng = coordinates.lng
    
    if (lat > 40.5 && lng > -80.0) return 'north'
    if (lat < 40.4 && lng > -80.0) return 'south'
    if (lng < -80.0) return 'west'
    return 'east'
  }

  // Filter drivers by zone
  private filterDriversByZone(drivers: Driver[], orders: Array<{
    id: string
    pickup: DeliveryLocation
    delivery: DeliveryLocation
    priority: 'standard' | 'express' | 'urgent'
    weight: number
    volume: number
  }>): Driver[] {
    const zones = new Set(orders.map(order => this.getDeliveryZone(order.delivery.coordinates)))
    
    return drivers.filter(driver => 
      driver.status === 'available' && 
      driver.deliveryZone.some(zone => zones.has(zone))
    )
  }

  // Assign orders to driver based on capacity and location
  private assignOrdersToDriver(driver: Driver, orders: Array<{
    id: string
    pickup: DeliveryLocation
    delivery: DeliveryLocation
    priority: 'standard' | 'express' | 'urgent'
    weight: number
    volume: number
  }>): Array<typeof orders[0]> {
    const assigned: typeof orders = []
    let currentLoad = driver.currentLoad
    let currentVolume = 0

    // Sort orders by priority and distance
    const sortedOrders = orders.sort((a, b) => {
      const priorityWeight = { urgent: 3, express: 2, standard: 1 }
      const aPriority = priorityWeight[a.priority]
      const bPriority = priorityWeight[b.priority]
      
      if (aPriority !== bPriority) return bPriority - aPriority
      
      const aDistance = this.calculateDistance(driver.currentLocation, a.pickup.coordinates)
      const bDistance = this.calculateDistance(driver.currentLocation, b.pickup.coordinates)
      return aDistance - bDistance
    })

    for (const order of sortedOrders) {
      if (currentLoad + order.weight <= driver.capacity && currentVolume + order.volume <= 10) {
        assigned.push(order)
        currentLoad += order.weight
        currentVolume += order.volume
      }
    }

    return assigned
  }

  // Calculate route efficiency (0-1 score)
  private calculateRouteEfficiency(route: DeliveryRoute): number {
    const maxPossibleEfficiency = 1.0
    const distanceEfficiency = Math.max(0, 1 - (route.estimatedDistance / 50)) // Penalty for long routes
    const timeEfficiency = Math.max(0, 1 - (route.estimatedDuration / 240)) // Penalty for long routes
    const loadEfficiency = route.orders.length / 10 // Reward for more orders per route
    
    return Math.min(maxPossibleEfficiency, (distanceEfficiency + timeEfficiency + loadEfficiency) / 3)
  }

  // Calculate route cost
  private calculateRouteCost(route: DeliveryRoute): number {
    const baseCost = 5.00 // Base delivery cost
    const distanceCost = route.estimatedDistance * 0.50 // $0.50 per mile
    const timeCost = route.estimatedDuration * 0.10 // $0.10 per minute
    const orderCost = route.orders.length * 2.00 // $2.00 per order
    
    return baseCost + distanceCost + timeCost + orderCost
  }

  // Calculate time savings vs naive routing
  private calculateTimeSavings(route: DeliveryRoute): number {
    // Compare optimized route vs straight-line distance routing
    const naiveDistance = this.calculateNaiveRouteDistance(route.waypoints)
    const optimizedDistance = route.estimatedDistance
    const timeSavings = (naiveDistance - optimizedDistance) / 25 * 60 // Convert to minutes
    return Math.max(0, timeSavings)
  }

  // Calculate fuel savings
  private calculateFuelSavings(route: DeliveryRoute): number {
    const mpg = 25 // Average fuel efficiency
    const fuelPrice = 3.50 // Per gallon
    const savings = this.calculateTimeSavings(route) / 60 * mpg * fuelPrice
    return Math.max(0, savings)
  }

  // Calculate naive route distance (straight line)
  private calculateNaiveRouteDistance(waypoints: DeliveryLocation[]): number {
    let totalDistance = 0
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i].coordinates, waypoints[i + 1].coordinates)
    }
    return totalDistance
  }

  // Get available drivers
  private getAvailableDrivers(): Driver[] {
    return Array.from(this.drivers.values())
      .filter(driver => driver.status === 'available')
  }

  // Update driver location in real-time
  updateDriverLocation(driverId: string, location: { lat: number; lng: number }): void {
    const driver = this.drivers.get(driverId)
    if (driver) {
      driver.currentLocation = location
      driver.lastActive = new Date()
      this.drivers.set(driverId, driver)
    }
  }

  // Add real-time route update
  addRouteUpdate(routeId: string, update: Omit<RouteUpdate, 'id' | 'routeId' | 'timestamp'>): void {
    const routeUpdate: RouteUpdate = {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      routeId,
      ...update,
      timestamp: new Date()
    }

    const route = this.routes.get(routeId)
    if (route) {
      route.realTimeUpdates.push(routeUpdate)
      this.routes.set(routeId, route)
    }

    if (!this.realTimeUpdates.has(routeId)) {
      this.realTimeUpdates.set(routeId, [])
    }
    this.realTimeUpdates.get(routeId)!.push(routeUpdate)
  }

  // Get route updates
  getRouteUpdates(routeId: string): RouteUpdate[] {
    return this.realTimeUpdates.get(routeId) || []
  }

  // Get driver performance metrics
  getDriverPerformance(driverId: string): {
    totalDeliveries: number
    averageRating: number
    onTimeRate: number
    totalDistance: number
    efficiency: number
  } {
    const driverRoutes = Array.from(this.routes.values())
      .filter(route => route.driverId === driverId)

    const totalDeliveries = driverRoutes.reduce((sum, route) => sum + route.orders.length, 0)
    const totalDistance = driverRoutes.reduce((sum, route) => sum + route.estimatedDistance, 0)
    const completedRoutes = driverRoutes.filter(route => route.status === 'completed')
    const onTimeRate = completedRoutes.length / Math.max(1, driverRoutes.length)

    return {
      totalDeliveries,
      averageRating: 4.5, // Mock data - would come from reviews
      onTimeRate,
      totalDistance,
      efficiency: onTimeRate * 0.8 + (totalDeliveries / 100) * 0.2
    }
  }
}
