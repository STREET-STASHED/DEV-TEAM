'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/lib/types';

interface OrderPageSellerProps {
  sellerId: string;
}

export function OrderPageSeller({ sellerId }: OrderPageSellerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock orders data for demo - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          buyer_id: 'demo-buyer-123',
          seller_id: sellerId,
          driver_id: 'demo-driver-456',
          items: [
            {
              id: 'item-1',
              product_id: 'prod-1',
              name: 'Premium Streetwear Hoodie',
              price: 89.99,
              quantity: 1,
              image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'
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
          item_total: 89.99,
          support_fee_total: 2.40,
          driver_payout: 11.10,
          platform_margin: 1.00,
          total_amount: 103.49,
          delivery_instructions: 'Please ring doorbell and leave at front door',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'order-2',
          buyer_id: 'demo-buyer-456',
          seller_id: sellerId,
          driver_id: undefined,
          items: [
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
            street: '789 Pine St',
            city: 'Pittsburgh',
            state: 'PA',
            zip_code: '15213'
          },
          status: 'pending',
          distance_miles: 12.3,
          eta_minutes: 35,
          driver_payout_amount: 13.38,
          delivery_fee_amount: 14.38,
          platform_margin_amount: 1.00,
          support_fee_buyer: 1.50,
          support_fee_seller: 1.50,
          item_total: 149.99,
          support_fee_total: 3.00,
          driver_payout: 13.38,
          platform_margin: 1.00,
          total_amount: 167.37,
          delivery_instructions: '',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setOrders(mockOrders);
    } catch {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'accepted': return 'text-blue-400 bg-blue-400/10';
      case 'picked_up': return 'text-orange-400 bg-orange-400/10';
      case 'delivered': return 'text-success-400 bg-success-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-ink-400 bg-ink-400/10';
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const getFinancialSummary = () => {
    const completedOrders = orders.filter(order => order.status === 'delivered');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.item_total, 0);
    const totalSupportFees = completedOrders.reduce((sum, order) => sum + order.support_fee_seller, 0);
    const netRevenue = totalRevenue - totalSupportFees;

    return { totalRevenue, totalSupportFees, netRevenue, completedOrders: completedOrders.length };
  };

  if (isLoading) {
    return (
      <div className="bg-ink-900 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ Error</div>
            <div className="text-ink-300">{error}</div>
            <button 
              onClick={loadOrders}
              className="mt-3 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const financialSummary = getFinancialSummary();

  return (
    <div className="bg-ink-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seller Dashboard</h1>
          <p className="text-ink-400">Manage your orders and track earnings</p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
            <div className="text-ink-400 text-sm mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
            <div className="text-ink-400 text-sm mb-1">Completed Orders</div>
            <div className="text-2xl font-bold text-success-400">{financialSummary.completedOrders}</div>
          </div>
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
            <div className="text-ink-400 text-sm mb-1">Gross Revenue</div>
            <div className="text-2xl font-bold text-brand-400">${financialSummary.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
            <div className="text-ink-400 text-sm mb-1">Net Revenue</div>
            <div className="text-2xl font-bold text-white">${financialSummary.netRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 mb-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Orders</h2>
            <div className="flex space-x-2">
              {['all', 'pending', 'accepted', 'picked_up', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-brand-600 text-ink-black'
                      : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-ink-400">No orders found with the selected status</div>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-ink-700/50 border border-ink-600 rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Order Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">Order #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-ink-300 text-sm">
                          <span className="font-medium">Buyer:</span> {order.buyer_id}
                        </div>
                        <div className="text-ink-300 text-sm">
                          <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        {order.driver_id && (
                          <div className="text-ink-300 text-sm">
                            <span className="font-medium">Driver:</span> {order.driver_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-ink-300 font-medium mb-2">Items</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            <div className="text-white">{item.name}</div>
                            <div className="text-ink-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div>
                      <h4 className="text-ink-300 font-medium mb-2">Financial</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-400">Items:</span>
                          <span className="text-white">${order.item_total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Support Fee:</span>
                          <span className="text-red-400">-${order.support_fee_seller.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-ink-600 pt-1">
                          <div className="flex justify-between font-medium">
                            <span className="text-ink-300">Net:</span>
                            <span className="text-brand-400">${(order.item_total - order.support_fee_seller).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="mt-4 pt-4 border-t border-ink-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-ink-400">Pickup:</span>
                        <div className="text-ink-300 mt-1">{formatAddress(order.pickup_address)}</div>
                      </div>
                      <div>
                        <span className="text-ink-400">Delivery:</span>
                        <div className="text-ink-300 mt-1">{formatAddress(order.delivery_address)}</div>
                      </div>
                      <div>
                        <span className="text-ink-400">Distance:</span>
                        <div className="text-ink-300 mt-1">{order.distance_miles.toFixed(1)} miles</div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Pay Info */}
                  <div className="mt-4 pt-4 border-t border-ink-600">
                    <div className="bg-ink-600/30 rounded-lg p-3">
                      <h4 className="text-ink-300 font-medium mb-2">Driver Compensation</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-ink-400">Driver Pay:</span>
                          <div className="text-brand-400 font-medium">${order.driver_payout_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-ink-400">Platform Margin:</span>
                          <div className="text-ink-400">${order.platform_margin_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-ink-400">Delivery Fee:</span>
                          <div className="text-white font-medium">${order.delivery_fee_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-ink-400">Distance:</span>
                          <div className="text-ink-300">{order.distance_miles.toFixed(1)} mi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Fee Explanation */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white mb-3">About Stashed Support Fees</h3>
          <div className="text-ink-300 text-sm space-y-2">
            <p>
              The Stashed Support Fee is a small percentage of your merchandise total that helps cover platform costs, 
              including payment processing, customer support, and operational expenses.
            </p>
            <p>
              <span className="text-brand-400 font-medium">Current Rate:</span> 0.5% of merchandise total
            </p>
            <p>
              <span className="text-brand-400 font-medium">Example:</span> For a $100 order, the support fee is $0.50
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
