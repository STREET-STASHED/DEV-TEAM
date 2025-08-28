'use client';

import { getDriverPayBreakdown } from '@/lib/fees';
import { Order } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

interface OrderPageBuyerProps {
  orderId: string;
  buyerId: string;
}

export function OrderPageBuyer({ orderId, buyerId }: OrderPageBuyerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock order data for demo - replace with actual API call
      const mockOrder: Order = {
        id: orderId,
        buyer_id: buyerId,
        seller_id: 'demo-seller-123',
        driver_id: 'demo-driver-456',
        items: [
          {
            id: 'item-1',
            product_id: 'prod-1',
            name: 'Premium Streetwear Hoodie',
            price: 89.99,
            quantity: 1,
            image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'
          },
          {
            id: 'item-2',
            product_id: 'prod-2',
            name: 'Limited Edition Sneakers',
            price: 149.99,
            quantity: 1,
            image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
          }
        ],
        pickup_address: {
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zip_code: '90210'
        },
        delivery_address: {
          street: '456 Oak Ave',
          city: 'Pittsburgh',
          state: 'PA',
          zip_code: '15222'
        },
        status: 'accepted',
        distance_miles: 8.5,
        eta_minutes: 25,
        driver_payout_amount: 11.10,
        delivery_fee_amount: 12.10,
        platform_margin_amount: 1.00,
        support_fee_buyer: 1.20,
        support_fee_seller: 1.20,
        item_total: 239.98,
        support_fee_total: 2.40,
        driver_payout: 11.10,
        platform_margin: 1.00,
        total_amount: 253.48,
        delivery_instructions: 'Please ring doorbell and leave at front door',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setOrder(mockOrder);
    } catch {
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, buyerId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-blue-400';
      case 'picked_up': return 'text-orange-400';
      case 'delivered': return 'text-success-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-ink-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'picked_up': return '📦';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatAddress = (address: { street: string; city: string; state: string; zip_code: string }) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  const getCurrentHour = (): number => {
    return new Date().getHours();
  };

  if (isLoading) {
    return (
      <div className="bg-ink-900 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-ink-800 rounded w-1/3"></div>
            <div className="h-4 bg-ink-800 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-ink-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-ink-900 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ Error</div>
            <div className="text-ink-300">{error || 'Order not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = getDriverPayBreakdown(order.distance_miles, getCurrentHour());

  return (
    <div className="bg-ink-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
          <p className="text-ink-400">Order #{order.id}</p>
        </div>

        {/* Order Status */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Order Status</h2>
            <div className={`text-lg font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-400">{order.distance_miles.toFixed(1)}</div>
              <div className="text-ink-400 text-sm">Miles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-400">{order.eta_minutes}</div>
              <div className="text-ink-400 text-sm">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">${order.total_amount.toFixed(2)}</div>
              <div className="text-ink-400 text-sm">Total</div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
          <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-ink-700/50 rounded-lg">
                <div className="w-16 h-16 bg-ink-600 rounded-lg flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{item.name}</h3>
                  <p className="text-ink-400 text-sm">Qty: {item.quantity}</p>
                </div>
                <span className="text-brand-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
          <h2 className="text-xl font-semibold text-white mb-4">Delivery Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-brand-400 font-medium mb-2">Pickup Location</h3>
              <p className="text-ink-300">{formatAddress(order.pickup_address)}</p>
            </div>
            <div>
              <h3 className="text-brand-400 font-medium mb-2">Delivery Location</h3>
              <p className="text-ink-300">{formatAddress(order.delivery_address)}</p>
            </div>
          </div>

          {order.delivery_instructions && (
            <div className="mt-4 p-3 bg-ink-700/50 rounded-lg">
              <h4 className="text-ink-300 font-medium mb-1">Delivery Instructions</h4>
              <p className="text-ink-400 text-sm">{order.delivery_instructions}</p>
            </div>
          )}
        </div>

        {/* Fee Breakdown */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
          <h2 className="text-xl font-semibold text-white mb-4">Fee Breakdown</h2>

          <div className="space-y-4">
            {/* Items Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-ink-300">Items Subtotal</span>
              <span className="text-white font-medium">${order.item_total.toFixed(2)}</span>
            </div>

            {/* Delivery Fee Breakdown */}
            <div className="bg-ink-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Delivery Fee</span>
                <span className="text-white font-medium">${order.delivery_fee_amount.toFixed(2)}</span>
              </div>

              <div className="text-sm text-ink-400 space-y-1">
                <div className="flex justify-between">
                  <span>Driver Pay:</span>
                  <span>${order.driver_payout_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Margin:</span>
                  <span>${order.platform_margin_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Driver Pay Breakdown */}
              <div className="mt-3 p-2 bg-ink-600/50 rounded text-xs">
                <div className="text-brand-400 font-medium mb-1">Driver Pay Breakdown:</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-ink-300">
                  <div>Base: ${breakdown.base.toFixed(2)}</div>
                  <div>Mileage: ${breakdown.mileage.toFixed(2)}</div>
                  <div>Bonuses: ${breakdown.bonuses.toFixed(2)}</div>
                  <div className="text-brand-400 font-medium">Total: ${breakdown.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Stashed Support Fee */}
            <div className="flex justify-between items-center">
              <span className="text-ink-300">Stashed Support Fee</span>
              <span className="text-ink-400 font-medium">${order.support_fee_buyer.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="border-t border-ink-600 pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-brand-400">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {order.driver_id && (
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
            <h2 className="text-xl font-semibold text-white mb-4">Driver Information</h2>

            <div className="bg-ink-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-ink-black font-bold text-lg">D</span>
                </div>
                <div>
                  <div className="text-white font-medium">Driver Assigned</div>
                  <div className="text-ink-400 text-sm">Driver ID: {order.driver_id}</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-brand-400 font-medium">
                  Expected Payout: ${order.driver_payout_amount.toFixed(2)}
                </div>
                <div className="text-ink-400 text-sm mt-1">
                  Based on {order.distance_miles.toFixed(1)} miles delivery
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
          <h2 className="text-xl font-semibold text-white mb-4">Order Timeline</h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-success-400 rounded-full"></div>
              <div>
                <div className="text-white font-medium">Order Placed</div>
                <div className="text-ink-400 text-sm">{new Date(order.created_at).toLocaleString()}</div>
              </div>
            </div>

            {order.status !== 'pending' && (
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">Driver Assigned</div>
                  <div className="text-ink-400 text-sm">Driver accepted your order</div>
                </div>
              </div>
            )}

            {order.status === 'picked_up' && (
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">Order Picked Up</div>
                  <div className="text-ink-400 text-sm">Driver has picked up your order</div>
                </div>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-success-400 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">Order Delivered</div>
                  <div className="text-ink-400 text-sm">Your order has been delivered</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
