'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDriverPayBreakdown, getAppliedBonuses } from '@/lib/fees';
import { AvailableOrder, Address } from '@/lib/types';

interface OrderPageDriverProps {
  driverId: string;
}

export function OrderPageDriver({ driverId }: OrderPageDriverProps) {
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<AvailableOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for demo - replace with actual API call
      const mockOrders: AvailableOrder[] = [
        {
          id: 'order-1',
          pickup_address: {
            street: '123 Main St',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15201'
          },
          delivery_address: {
            street: '456 Oak Ave',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15222'
          },
          distance_miles: 2.5,
          eta_minutes: 12,
          driver_payout_amount: 7.50,
          item_count: 3,
          created_at: new Date().toISOString()
        },
        {
          id: 'order-2',
          pickup_address: {
            street: '789 Pine St',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15213'
          },
          delivery_address: {
            street: '321 Elm St',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15217'
          },
          distance_miles: 8.2,
          eta_minutes: 28,
          driver_payout_amount: 10.92,
          item_count: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'order-3',
          pickup_address: {
            street: '654 Maple Dr',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15206'
          },
          delivery_address: {
            street: '987 Cedar Ln',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15224'
          },
          distance_miles: 15.7,
          eta_minutes: 45,
          driver_payout_amount: 15.42,
          item_count: 5,
          created_at: new Date().toISOString()
        }
      ];

      setAvailableOrders(mockOrders);
    } catch {
      setError('Failed to load available orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableOrders();
  }, [loadAvailableOrders]);

  const acceptOrder = async (order: AvailableOrder) => {
    try {
      // Mock order acceptance - replace with actual API call
      setCurrentOrder(order);
      setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
      
      // In production, this would update the order status in the database
      console.log(`Driver ${driverId} accepted order ${order.id}`);
    } catch {
      setError('Failed to accept order');
    }
  };

  const updateOrderStatus = async (status: 'picked_up' | 'delivered') => {
    if (!currentOrder) return;
    
    try {
      // Mock status update - replace with actual API call
      console.log(`Order ${currentOrder.id} status updated to: ${status}`);
      
      if (status === 'delivered') {
        setCurrentOrder(null);
        // In production, this would complete the order and update driver stats
      }
    } catch {
      setError('Failed to update order status');
    }
  };

  const formatAddress = (address: Address): string => {
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

  if (error) {
    return (
      <div className="bg-ink-900 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="text-red-400 text-lg mb-2">Error</div>
            <div className="text-ink-300 mb-4">{error}</div>
            <button 
              onClick={loadAvailableOrders}
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Driver Dashboard</h1>
          <p className="text-ink-400">Accept orders and manage deliveries</p>
        </div>

        {/* Current Order */}
        {currentOrder && (
          <div className="mb-8 bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
            <h2 className="text-xl font-semibold text-white mb-4">Current Delivery</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-brand-400 font-medium mb-2">Pickup Location</h3>
                <p className="text-ink-300">{formatAddress(currentOrder.pickup_address)}</p>
              </div>
              <div>
                <h3 className="text-brand-400 font-medium mb-2">Delivery Location</h3>
                <p className="text-ink-300">{formatAddress(currentOrder.delivery_address)}</p>
              </div>
            </div>

            {/* Driver Pay Breakdown */}
            <div className="bg-ink-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Expected Payout</h3>
              
              {(() => {
                const breakdown = getDriverPayBreakdown(currentOrder.distance_miles, getCurrentHour());
                const bonuses = getAppliedBonuses(currentOrder.distance_miles, getCurrentHour());
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-ink-300">
                      <span>Base Pay:</span>
                      <span>${breakdown.base.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-ink-300">
                      <span>Mileage ({currentOrder.distance_miles.toFixed(1)} mi):</span>
                      <span>${breakdown.mileage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-ink-300">
                      <span>Bonuses:</span>
                      <span>${breakdown.bonuses.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-ink-600 pt-2">
                      <div className="flex justify-between text-lg font-bold text-brand-400">
                        <span>Total Payout:</span>
                        <span>${breakdown.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {bonuses.length > 0 && (
                      <div className="mt-3 text-sm text-brand-400">
                        {bonuses.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{currentOrder.distance_miles.toFixed(1)}</div>
                <div className="text-ink-400 text-sm">Miles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{currentOrder.eta_minutes}</div>
                <div className="text-ink-400 text-sm">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{currentOrder.item_count}</div>
                <div className="text-ink-400 text-sm">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-400">${currentOrder.driver_payout_amount.toFixed(2)}</div>
                <div className="text-ink-400 text-sm">Payout</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => updateOrderStatus('picked_up')}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Mark as Picked Up
              </button>
              <button
                onClick={() => updateOrderStatus('delivered')}
                className="bg-success-600 hover:bg-success-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        )}

        {/* Available Orders */}
        {availableOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Available Orders</h2>
            <div className="space-y-4">
              {availableOrders.map((order) => {
                const breakdown = getDriverPayBreakdown(order.distance_miles, getCurrentHour());
                const bonuses = getAppliedBonuses(order.distance_miles, getCurrentHour());
                
                return (
                  <div key={order.id} className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card hover:shadow-hover transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <h3 className="text-white font-medium mb-2">Pickup</h3>
                        <p className="text-ink-300 text-sm">{formatAddress(order.pickup_address)}</p>
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-2">Delivery</h3>
                        <p className="text-ink-300 text-sm">{formatAddress(order.delivery_address)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-400 mb-1">
                          ${breakdown.total.toFixed(2)}
                        </div>
                        <div className="text-ink-400 text-sm">
                          {order.distance_miles.toFixed(1)} mi • ~{order.eta_minutes} min
                        </div>
                        <div className="text-ink-400 text-sm">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Driver Pay Details */}
                    <div className="bg-ink-700/50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-ink-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Base:</span>
                          <span>${breakdown.base.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mileage:</span>
                          <span>${breakdown.mileage.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bonuses:</span>
                          <span>${breakdown.bonuses.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {bonuses.length > 0 && (
                        <div className="mt-2 text-xs text-brand-400">
                          {bonuses.join(', ')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => acceptOrder(order)}
                      className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Orders Available */}
        {availableOrders.length === 0 && !currentOrder && (
          <div className="text-center py-12">
            <div className="text-ink-400 text-lg mb-2">No orders available</div>
            <div className="text-ink-500 text-sm">Check back later for new delivery opportunities</div>
          </div>
        )}
      </div>
    </div>
  );
}
