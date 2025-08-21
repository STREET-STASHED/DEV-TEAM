// StreetStashed Type Definitions
// Core types for the application

export interface User {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  vehicle_info: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
  };
  current_location: {
    latitude: number;
    longitude: number;
  };
  is_available: boolean;
  current_order_id?: string;
  driver_tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  completed_orders: number;
  total_earnings: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  driver_id?: string;
  items: OrderItem[];
  pickup_address: Address;
  delivery_address: Address;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  
  // New fee structure fields
  distance_miles: number;
  eta_minutes: number;
  driver_payout_amount: number;
  delivery_fee_amount: number;
  platform_margin_amount: number;
  support_fee_buyer: number;
  support_fee_seller: number;
  
  // Legacy fields (for backward compatibility)
  item_total: number;
  support_fee_total: number;
  driver_payout: number;
  platform_margin: number;
  
  total_amount: number;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverStats {
  driver_id: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_distance_miles: number;
  total_earnings: number;
  average_rating: number;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export interface AvailableOrder {
  id: string;
  pickup_address: Address;
  delivery_address: Address;
  distance_miles: number;
  eta_minutes: number;
  driver_payout_amount: number;
  item_count: number;
  created_at: string;
}

export interface FeeTier {
  min_distance: number;
  max_distance: number;
  base_fee: number;
  per_mile_rate: number;
  driver_payout_percentage: number;
  platform_margin_percentage: number;
}

export interface CheckoutData {
  items: OrderItem[];
  pickupAddress: Address;
  deliveryAddress: Address;
  distanceMiles: number;
  etaMinutes: number;
  deliveryInstructions?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  deliveryFee: number;
  supportFee: number;
  total: number;
  distanceMiles: number;
  etaMinutes: number;
  driverPay: number;
  platformMargin: number;
}

// New fee calculation types
export interface FeeCalculation {
  delivery: {
    driverPay: number;
    platformMargin: number;
    totalCharge: number;
  };
  supportFee: {
    buyer: number;
    seller: number;
    total: number;
  };
  meta: {
    distanceMiles: number;
    etaMinutes: number;
    isWithinPilotRadius: boolean;
    appliedBonuses: string[];
    feeTierDescription: string;
  };
}

export interface DriverPayBreakdown {
  driver_id: string;
  order_id: string;
  base_pay: number;
  distance_pay: number;
  time_pay: number;
  bonus_pay: number;
  total_pay: number;
  platform_fee: number;
  driver_take_home: number;
  breakdown: {
    base: number;
    distance: number;
    time: number;
    bonus: number;
    platform_fee: number;
  };
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  seller_id: string;
  seller_name: string;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  vehicle_info: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
  };
  current_location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'available' | 'busy' | 'offline';
  rating: number;
  total_deliveries: number;
  total_earnings: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
