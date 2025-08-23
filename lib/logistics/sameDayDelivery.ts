// import { enhancedPersonalizationSystem } from '../personalization/enhancedUserProfile'

// Same-Day Delivery & Micro-Fulfillment System (Under 2 Hours)
export interface DeliveryZone {
  id: string
  name: string
  center: { lat: number; lng: number }
  radius: number // in meters
  deliveryTime: number // in minutes
  coverage: 'same-day' | 'next-day' | 'standard'
  activeDrivers: number
  maxCapacity: number
}

export interface SameDayDelivery {
  id: string
  orderId: string
  userId: string
  driverId: string
  status: 'pending' | 'accepted' | 'picking' | 'on-way' | 'delivered' | 'cancelled'
  pickupLocation: Location
  deliveryLocation: Location
  estimatedPickup: Date
  estimatedDelivery: Date
  actualPickup?: Date
  actualDelivery?: Date
  tracking: DeliveryTracking[]
  priority: 'standard' | 'express' | 'ultra' | 'vip'
  specialInstructions?: string
}

export interface Location {
  address: string
  coordinates: { lat: number; lng: number }
  type: 'warehouse' | 'store' | 'home' | 'office' | 'pickup-point'
  contactPerson?: string
  phone?: string
  accessNotes?: string
}

export interface DeliveryTracking {
  timestamp: Date
  status: string
  location?: { lat: number; lng: number }
  message: string
  driverNote?: string
}

export interface DriverAssignment {
  driverId: string
  orderId: string
  assignedAt: Date
  estimatedPickupTime: Date
  estimatedDeliveryTime: Date
  route: RoutePoint[]
  priority: number
  earnings: number
}

export interface RoutePoint {
  location: Location
  action: 'pickup' | 'delivery' | 'waypoint'
  estimatedTime: Date
  actualTime?: Date
  status: 'pending' | 'completed' | 'skipped'
}

export interface MicroFulfillmentCenter {
  id: string
  name: string
  location: Location
  capacity: number
  currentInventory: number
  supportedCategories: string[]
  activeOrders: number
  maxOrders: number
  lastRestocked: Date
  nextRestock: Date
}

export class SameDayDeliverySystem {
  private static instance: SameDayDeliverySystem
  private deliveryZones: Map<string, DeliveryZone> = new Map()
  private activeDeliveries: Map<string, SameDayDelivery> = new Map()
  private driverAssignments: Map<string, DriverAssignment> = new Map()
  private fulfillmentCenters: Map<string, MicroFulfillmentCenter> = new Map()

  static getInstance(): SameDayDeliverySystem {
    if (!SameDayDeliverySystem.instance) {
      SameDayDeliverySystem.instance = new SameDayDeliverySystem()
      SameDayDeliverySystem.instance.initializeSystem()
    }
    return SameDayDeliverySystem.instance
  }

  private initializeSystem() {
    // Initialize delivery zones
    const zones: DeliveryZone[] = [
      {
        id: 'zone-downtown',
        name: 'Downtown Core',
        center: { lat: 40.7589, lng: -73.9851 },
        radius: 2000,
        deliveryTime: 45, // 45 minutes for nearby deliveries
        coverage: 'same-day',
        activeDrivers: 25,
        maxCapacity: 100
      },
      {
        id: 'zone-midtown',
        name: 'Midtown',
        center: { lat: 40.7549, lng: -73.9840 },
        radius: 3000,
        deliveryTime: 75, // 75 minutes for medium distance
        coverage: 'same-day',
        activeDrivers: 20,
        maxCapacity: 80
      },
      {
        id: 'zone-uptown',
        name: 'Uptown',
        center: { lat: 40.7505, lng: -73.9934 },
        radius: 4000,
        deliveryTime: 120, // 2 hours for longer distances
        coverage: 'same-day',
        activeDrivers: 15,
        maxCapacity: 60
      }
    ]

    zones.forEach(zone => {
      this.deliveryZones.set(zone.id, zone)
    })

    // Initialize fulfillment centers
    const centers: MicroFulfillmentCenter[] = [
      {
        id: 'mfc-downtown',
        name: 'Downtown Micro-Fulfillment Center',
        location: {
          address: '123 Fashion Ave, New York, NY',
          coordinates: { lat: 40.7589, lng: -73.9851 },
          type: 'warehouse'
        },
        capacity: 10000,
        currentInventory: 7500,
        supportedCategories: ['streetwear', 'luxury', 'accessories'],
        activeOrders: 45,
        maxOrders: 200,
        lastRestocked: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextRestock: new Date(Date.now() + 6 * 60 * 60 * 1000)
      }
    ]

    centers.forEach(center => {
      this.fulfillmentCenters.set(center.id, center)
    })
  }

  // Check if same-day delivery is available for location (under 2 hours)
  async checkSameDayDeliveryAvailability(
    deliveryLocation: Location,
    orderItems: Record<string, unknown>[]
  ): Promise<{
    available: boolean
    estimatedTime: number
    zone?: DeliveryZone
    fulfillmentCenter?: MicroFulfillmentCenter
    price: number
  }> {
    // Find delivery zone
    const zone = this.findDeliveryZone(deliveryLocation.coordinates)
    if (!zone) {
      return {
        available: false,
        estimatedTime: 0,
        price: 0
      }
    }

    // Check if zone has capacity
    if (zone.activeDrivers === 0 || zone.activeDrivers >= zone.maxCapacity) {
      return {
        available: false,
        estimatedTime: 0,
        zone,
        price: 0
      }
    }

    // Find nearest fulfillment center
    const fulfillmentCenter = this.findNearestFulfillmentCenter(
      deliveryLocation.coordinates,
      orderItems
    )

    if (!fulfillmentCenter) {
      return {
        available: false,
        estimatedTime: 0,
        zone,
        price: 0
      }
    }

    // Calculate delivery time
    const distance = this.calculateDistance(
      fulfillmentCenter.location.coordinates,
      deliveryLocation.coordinates
    )
    const estimatedTime = Math.ceil(distance / 1000) + zone.deliveryTime

    // Calculate delivery price
    const basePrice = 9.99
    const distanceMultiplier = Math.max(1, distance / 1000)
    const urgencyMultiplier = 1.2 // Same-day delivery premium (vs standard shipping)
    const price = Math.round((basePrice * distanceMultiplier * urgencyMultiplier) * 100) / 100

    return {
      available: true,
      estimatedTime,
      zone,
      fulfillmentCenter,
      price
    }
  }

  // Create same-day delivery order
  async createSameDayDelivery(
    orderId: string,
    userId: string,
    pickupLocation: Location,
    deliveryLocation: Location,
    orderItems: Record<string, unknown>[],
    priority: 'standard' | 'express' | 'ultra' | 'vip' = 'standard'
  ): Promise<SameDayDelivery> {
    // Validate delivery availability
    const availability = await this.checkSameDayDeliveryAvailability(
      deliveryLocation,
      orderItems
    )

    if (!availability.available) {
      throw new Error('Same-day delivery not available for this location')
    }

    // Create delivery order
    const delivery: SameDayDelivery = {
      id: crypto.randomUUID(),
      orderId,
      userId,
      driverId: '', // Will be assigned
      status: 'pending',
      pickupLocation,
      deliveryLocation,
      estimatedPickup: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      estimatedDelivery: new Date(Date.now() + (availability.estimatedTime + 10) * 60 * 1000),
      tracking: [],
      priority,
      specialInstructions: ''
    }

          // Add initial tracking
      delivery.tracking.push({
        timestamp: new Date(),
        status: 'Order created',
        message: 'Same-day delivery order created and searching for driver'
      })

    this.activeDeliveries.set(delivery.id, delivery)

    // Assign driver
    await this.assignDriver(delivery)

    return delivery
  }

  // Assign driver to delivery
  private async assignDriver(delivery: SameDayDelivery): Promise<void> {
    const zone = this.findDeliveryZone(delivery.deliveryLocation.coordinates)
    if (!zone) return

    // Find available drivers in zone
    const availableDrivers = await this.findAvailableDrivers(zone.id)
    
    if (availableDrivers.length === 0) {
      // No drivers available, update status
      delivery.status = 'pending'
      delivery.tracking.push({
        timestamp: new Date(),
        status: 'No drivers available',
        message: 'Searching for available drivers in your area'
      })
      return
    }

    // Select best driver based on rating, proximity, and current load
    const selectedDriver = this.selectBestDriver(availableDrivers, delivery)
    
    // Create driver assignment
    const assignment: DriverAssignment = {
      driverId: selectedDriver.id as string,
      orderId: delivery.orderId,
      assignedAt: new Date(),
      estimatedPickupTime: delivery.estimatedPickup,
      estimatedDeliveryTime: delivery.estimatedDelivery,
      route: this.calculateRoute(delivery.pickupLocation, delivery.deliveryLocation),
      priority: this.calculatePriority(delivery.priority),
      earnings: this.calculateDriverEarnings(delivery)
    }

    this.driverAssignments.set(delivery.id, assignment)
    
    // Update delivery
    delivery.driverId = selectedDriver.id as string
    delivery.status = 'accepted'
    delivery.tracking.push({
      timestamp: new Date(),
      status: 'Driver assigned',
      message: `${selectedDriver.name} has been assigned to your delivery`
    })

    // Notify driver (would integrate with push notifications)
    this.notifyDriver(selectedDriver.id as string, delivery)
  }

  // Find available drivers in zone
  private async findAvailableDrivers(_zoneId: string): Promise<any[]> {
    // Mock implementation - would query driver database
    return [
      {
        id: 'driver1',
        name: 'Alex Johnson',
        rating: 4.8,
        currentLocation: { lat: 40.7589, lng: -73.9851 },
        currentOrders: 1,
        maxOrders: 3,
        vehicle: 'motorcycle',
        specialties: ['fashion', 'electronics']
      },
      {
        id: 'driver2',
        name: 'Sarah Chen',
        rating: 4.9,
        currentLocation: { lat: 40.7549, lng: -73.9840 },
        currentOrders: 0,
        maxOrders: 3,
        vehicle: 'bicycle',
        specialties: ['fashion', 'food']
      }
    ]
  }

  // Select best driver for delivery
  private selectBestDriver(drivers: Record<string, unknown>[], delivery: SameDayDelivery): Record<string, unknown> {
    // Score drivers based on multiple factors
    const scoredDrivers = drivers.map(driver => {
      let score = 0
      
      // Rating score (40% weight)
      score += (driver.rating as number) * 40
      
      // Proximity score (30% weight)
      const distance = this.calculateDistance(
        driver.currentLocation as { lat: number; lng: number },
        delivery.pickupLocation.coordinates
      )
      score += Math.max(0, 30 - (distance / 100)) * 30
      
      // Availability score (20% weight)
      const availability = ((driver.maxOrders as number) - (driver.currentOrders as number)) / (driver.maxOrders as number)
      score += availability * 20
      
      // Vehicle suitability score (10% weight)
      if (driver.vehicle === 'motorcycle') score += 10
      else if (driver.vehicle === 'bicycle') score += 8
      else score += 5
      
      return { ...driver, score }
    })

    // Return driver with highest score
    return scoredDrivers.sort((a, b) => (b.score as number) - (a.score as number))[0]
  }

  // Calculate delivery route
  private calculateRoute(pickup: Location, delivery: Location): RoutePoint[] {
    return [
      {
        location: pickup,
        action: 'pickup',
        estimatedTime: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending'
      },
      {
        location: delivery,
        action: 'delivery',
        estimatedTime: new Date(Date.now() + 60 * 60 * 1000),
        status: 'pending'
      }
    ]
  }

  // Calculate delivery priority
  private calculatePriority(priority: string): number {
    switch (priority) {
      case 'vip': return 100
      case 'ultra': return 80
      case 'express': return 60
      case 'standard': return 40
      default: return 40
    }
  }

  // Calculate driver earnings
  private calculateDriverEarnings(delivery: SameDayDelivery): number {
    const baseEarning = 8.99
    const distance = this.calculateDistance(
      delivery.pickupLocation.coordinates,
      delivery.deliveryLocation.coordinates
    )
    const distanceBonus = Math.max(0, (distance - 1000) / 1000) * 2
    const priorityBonus = delivery.priority === 'vip' ? 5 : 0
    
    return Math.round((baseEarning + distanceBonus + priorityBonus) * 100) / 100
  }

  // Update delivery status
  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    location?: { lat: number; lng: number },
    driverNote?: string
  ): Promise<void> {
    const delivery = this.activeDeliveries.get(deliveryId)
    if (!delivery) return

    delivery.status = status as any
    delivery.tracking.push({
      timestamp: new Date(),
      status,
      location,
      message: this.getStatusMessage(status),
      driverNote
    })

    // Update estimated times if needed
    if (status === 'picking') {
      delivery.actualPickup = new Date()
    } else if (status === 'delivered') {
      delivery.actualDelivery = new Date()
      // Mark delivery as complete
      this.completeDelivery(deliveryId)
    }
  }

  // Get status message
  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      'pending': 'Order is being processed',
      'accepted': 'Driver has accepted your delivery',
      'picking': 'Driver is picking up your order',
      'on-way': 'Driver is on the way to you',
      'delivered': 'Your order has been delivered!',
      'cancelled': 'Delivery has been cancelled'
    }
    
    return messages[status] || 'Status updated'
  }

  // Complete delivery
  private completeDelivery(deliveryId: string): void {
    const delivery = this.activeDeliveries.get(deliveryId)
    if (!delivery) return

    // Calculate actual delivery time
    const actualTime = delivery.actualDelivery!.getTime() - delivery.estimatedPickup.getTime()
    const minutes = Math.round(actualTime / (1000 * 60))

    // Add completion tracking
    delivery.tracking.push({
      timestamp: new Date(),
      status: 'Completed',
      message: `Delivery completed in ${minutes} minutes!`
    })

    // Remove from active deliveries
    this.activeDeliveries.delete(deliveryId)

    // Update driver assignment
    const assignment = this.driverAssignments.get(deliveryId)
    if (assignment) {
      this.driverAssignments.delete(deliveryId)
    }

    // Update zone capacity
    const zone = this.findDeliveryZone(delivery.deliveryLocation.coordinates)
    if (zone) {
      zone.activeDrivers = Math.max(0, zone.activeDrivers - 1)
    }
  }

  // Find delivery zone for coordinates
  private findDeliveryZone(coordinates: { lat: number; lng: number }): DeliveryZone | undefined {
    for (const zone of this.deliveryZones.values()) {
      const distance = this.calculateDistance(zone.center, coordinates)
      if (distance <= zone.radius) {
        return zone
      }
    }
    return undefined
  }

  // Find nearest fulfillment center
  private findNearestFulfillmentCenter(
    coordinates: { lat: number; lng: number },
    orderItems: Record<string, unknown>[]
  ): MicroFulfillmentCenter | undefined {
    let nearestCenter: MicroFulfillmentCenter | undefined
    let shortestDistance = Infinity

    for (const center of this.fulfillmentCenters.values()) {
      // Check if center supports order categories
      const supportsCategories = orderItems.some(item => 
        center.supportedCategories.includes(item.category as string)
      )
      
      if (!supportsCategories) continue

      const distance = this.calculateDistance(center.location.coordinates, coordinates)
      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestCenter = center
      }
    }

    return nearestCenter
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = coord1.lat * Math.PI / 180
    const φ2 = coord2.lat * Math.PI / 180
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180
    const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Notify driver (mock implementation)
  private notifyDriver(driverId: string, delivery: SameDayDelivery): void {
    console.log(`Notifying driver ${driverId} about delivery ${delivery.id}`)
    // Would integrate with push notifications, SMS, or in-app notifications
  }

  // Get delivery status
  getDeliveryStatus(deliveryId: string): SameDayDelivery | undefined {
    return this.activeDeliveries.get(deliveryId)
  }

  // Get user's active deliveries
  getUserDeliveries(userId: string): SameDayDelivery[] {
    return Array.from(this.activeDeliveries.values())
      .filter(delivery => delivery.userId === userId)
  }

  // Get driver's active deliveries
  getDriverDeliveries(driverId: string): SameDayDelivery[] {
    return Array.from(this.activeDeliveries.values())
      .filter(delivery => delivery.driverId === driverId)
  }

  // Get delivery zones
  getDeliveryZones(): DeliveryZone[] {
    return Array.from(this.deliveryZones.values())
  }

  // Get fulfillment centers
  getFulfillmentCenters(): MicroFulfillmentCenter[] {
    return Array.from(this.fulfillmentCenters.values())
  }
}

export const sameDayDeliverySystem = SameDayDeliverySystem.getInstance()
