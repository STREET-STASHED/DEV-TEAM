'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StreetStashedLogo } from '@/components/StreetStashedLogo';
import AIMonitoringDashboard from '@/components/admin/AIMonitoringDashboard';

interface Metrics {
  totalUsers: number;
  totalOrders: number;
  totalDisputes: number;
  activeDisputes: number;
  totalRevenue: number;
}

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  status: string;
  created_at: string;
  orders: {
    id: string;
    total: number;
    status: string;
    created_at: string;
  };
  profiles: {
    full_name: string;
  };
}

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  total: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface User {
  id: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'orders' | 'users' | 'monitoring'>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAction, setSelectedAction] = useState<{
    type: string;
    targetId: string;
    data?: Record<string, unknown>;
  } | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'overview') {
        const response = await fetch('/api/admin?metric=overview');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } else if (activeTab === 'disputes') {
        const response = await fetch('/api/admin?metric=disputes');
        if (!response.ok) throw new Error('Failed to fetch disputes');
        const data = await response.json();
        setDisputes(data.disputes || []);
      } else if (activeTab === 'orders') {
        const response = await fetch('/api/admin?metric=orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin?metric=users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdminAction = async () => {
    if (!selectedAction) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction.type,
          target_id: selectedAction.targetId,
          data: selectedAction.data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform action');
      }

      // Refresh data and close modal
      setSelectedAction(null);
      fetchData();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      escalated: 'bg-purple-100 text-purple-800',
      pending: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'Chart' },
    { id: 'disputes', name: 'Disputes', icon: 'Warning' },
    { id: 'orders', name: 'Orders', icon: 'Package' },
    { id: 'users', name: 'Users', icon: 'Users' },
    { id: 'monitoring', name: 'AI Monitor', icon: 'AI' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <StreetStashedLogo size="md" variant="dark" showText={false} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-sm text-gray-600">Platform Administration</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'disputes' | 'orders' | 'users' | 'monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">Users</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{metrics.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">Orders</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{metrics.totalOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Disputes</dt>
                    <dd className="text-lg font-medium text-gray-900">{metrics.activeDisputes}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">${metrics.totalRevenue || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Disputes</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {disputes.map((dispute) => (
              <li key={dispute.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900">
                          Order #{dispute.order_id.slice(0, 8)}
                        </p>
                        {getStatusBadge(dispute.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(dispute.created_at)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Reason:</span> {dispute.reason}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Order Total:</span> ${dispute.orders.total}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {dispute.status === 'open' && (
                      <button
                        onClick={() => setSelectedAction({
                          type: 'escalate_dispute',
                          targetId: dispute.id
                        })}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Orders</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Total:</span> ${order.total}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Buyer:</span> {order.profiles.full_name}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Unnamed User'}
                        </p>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                        {user.is_verified && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">ID:</span> {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">AI Production Monitoring</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring and AI-powered insights for production sustainability
            </p>
          </div>
          <div className="p-6">
            <AIMonitoringDashboard />
          </div>
        </div>
      )}

      {/* Action Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to {selectedAction.type.replace('_', ' ')} this item?
              </p>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminAction}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
