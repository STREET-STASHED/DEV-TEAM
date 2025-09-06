'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Package, RefreshCw, CheckCircle, Clock, Camera, Upload, X, FileText, CreditCard, Truck } from 'lucide-react'

interface ReturnItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  reason: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  refundAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  createdAt: string
  processedAt?: string
}

interface ReturnRequest {
  id: string
  orderId: string
  items: ReturnItem[]
  reason: string
  refundMethod: 'original' | 'store_credit' | 'exchange'
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  totalRefund: number
  createdAt: string
  trackingNumber?: string
}

interface ReturnExchangeSystemProps {
  orderId?: string
  onReturnCreated?: (_returnRequest: ReturnRequest) => void
  onExchangeCreated?: (_exchangeRequest: ReturnRequest) => void
}

export default function ReturnExchangeSystem({
  orderId,
  onReturnCreated,
  onExchangeCreated
}: ReturnExchangeSystemProps) {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>(orderId || '')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [returnReason, setReturnReason] = useState('')
  const [returnMethod, setReturnMethod] = useState<'return' | 'exchange'>('return')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [_uploadedImages, _setUploadedImages] = useState<string[]>([])

  // Mock data
  const mockReturnRequests: ReturnRequest[] = [
    {
      id: 'RET-001',
      orderId: 'ORD-12345',
      items: [
        {
          id: 'ITEM-001',
          orderId: 'ORD-12345',
          productId: 'PROD-001',
          productName: 'Nike Air Jordan 1 Retro High',
          productImage: '/api/placeholder/80/80',
          quantity: 1,
          reason: 'Size too small',
          condition: 'new',
          refundAmount: 150.00,
          status: 'approved',
          createdAt: '2024-01-15T10:30:00Z',
          processedAt: '2024-01-16T14:20:00Z'
        }
      ],
      reason: 'Size too small',
      refundMethod: 'original',
      status: 'approved',
      totalRefund: 150.00,
      createdAt: '2024-01-15T10:30:00Z',
      trackingNumber: 'TRK-789456123'
    }
  ]

  const mockOrders = [
    {
      id: 'ORD-12345',
      date: '2024-01-10',
      total: 299.99,
      status: 'delivered',
      items: [
        {
          id: 'ITEM-001',
          productId: 'PROD-001',
          name: 'Nike Air Jordan 1 Retro High',
          image: '/api/placeholder/80/80',
          size: 'US 9',
          price: 150.00,
          quantity: 1
        },
        {
          id: 'ITEM-002',
          productId: 'PROD-002',
          name: 'Supreme Box Logo Hoodie',
          image: '/api/placeholder/80/80',
          size: 'M',
          price: 149.99,
          quantity: 1
        }
      ]
    }
  ]

  const returnReasons = [
    'Size too small',
    'Size too large',
    'Wrong item received',
    'Item damaged',
    'Not as described',
    'Changed mind',
    'Quality issues',
    'Other'
  ]

  const _conditionOptions = [
    { value: 'new', label: 'New with tags', description: 'Unworn, original packaging' },
    { value: 'like_new', label: 'Like new', description: 'Worn once or twice, excellent condition' },
    { value: 'good', label: 'Good', description: 'Some signs of wear, still wearable' },
    { value: 'fair', label: 'Fair', description: 'Visible wear, functional' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may have defects' }
  ]

  useEffect(() => {
    setReturnRequests(mockReturnRequests)
  }, [mockReturnRequests])

  // Handle return creation
  const handleCreateReturn = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReturn: ReturnRequest = {
        id: `RET-${Date.now()}`,
        orderId: selectedOrder,
        items: selectedItems.map(itemId => {
          const order = mockOrders.find(o => o.id === selectedOrder)
          const item = order?.items.find(i => i.id === itemId)
          return {
            id: itemId,
            orderId: selectedOrder,
            productId: item?.productId || '',
            productName: item?.name || '',
            productImage: item?.image || '',
            quantity: item?.quantity || 1,
            reason: returnReason,
            condition: 'new',
            refundAmount: item?.price || 0,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }),
        reason: returnReason,
        refundMethod: 'original',
        status: 'pending',
        totalRefund: selectedItems.reduce((total, itemId) => {
          const order = mockOrders.find(o => o.id === selectedOrder)
          const item = order?.items.find(i => i.id === itemId)
          return total + (item?.price || 0)
        }, 0),
        createdAt: new Date().toISOString()
      }
      
      setReturnRequests(prev => [newReturn, ...prev])
      onReturnCreated?.(newReturn)
      setStep(1)
      setSelectedItems([])
      setReturnReason('')
    } catch (error) {
      console.error('Failed to create return:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle exchange creation
  const handleCreateExchange = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newExchange: ReturnRequest = {
        id: `EXC-${Date.now()}`,
        orderId: selectedOrder,
        items: selectedItems.map(itemId => {
          const order = mockOrders.find(o => o.id === selectedOrder)
          const item = order?.items.find(i => i.id === itemId)
          return {
            id: itemId,
            orderId: selectedOrder,
            productId: item?.productId || '',
            productName: item?.name || '',
            productImage: item?.image || '',
            quantity: item?.quantity || 1,
            reason: returnReason,
            condition: 'new',
            refundAmount: item?.price || 0,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }),
        reason: returnReason,
        refundMethod: 'exchange',
        status: 'pending',
        totalRefund: 0,
        createdAt: new Date().toISOString()
      }
      
      setReturnRequests(prev => [newExchange, ...prev])
      onExchangeCreated?.(newExchange)
      setStep(1)
      setSelectedItems([])
      setReturnReason('')
    } catch (error) {
      console.error('Failed to create exchange:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-400', icon: Clock, bg: 'bg-yellow-500/20' }
      case 'approved':
        return { color: 'text-green-400', icon: CheckCircle, bg: 'bg-green-500/20' }
      case 'rejected':
        return { color: 'text-red-400', icon: X, bg: 'bg-red-500/20' }
      case 'processing':
        return { color: 'text-blue-400', icon: RefreshCw, bg: 'bg-blue-500/20' }
      case 'completed':
        return { color: 'text-green-400', icon: CheckCircle, bg: 'bg-green-500/20' }
      default:
        return { color: 'text-gray-400', icon: Clock, bg: 'bg-gray-500/20' }
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-ink-900 rounded-2xl border border-ink-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Returns & Exchanges</h2>
              <p className="text-ink-400">Manage your returns and exchanges</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep(1)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>New Return</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        {step > 1 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-purple-500 text-white' : 'bg-ink-700 text-ink-400'
              }`}>
                1
              </div>
              <span className="text-ink-400 text-sm">Select Items</span>
            </div>
            <div className="w-8 h-px bg-ink-700"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-purple-500 text-white' : 'bg-ink-700 text-ink-400'
              }`}>
                2
              </div>
              <span className="text-ink-400 text-sm">Reason & Details</span>
            </div>
            <div className="w-8 h-px bg-ink-700"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-purple-500 text-white' : 'bg-ink-700 text-ink-400'
              }`}>
                3
              </div>
              <span className="text-ink-400 text-sm">Review & Submit</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Order Selection */}
            <div className="bg-ink-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Order</h3>
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedOrder === order.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-ink-700 hover:border-ink-600'
                    }`}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Order #{order.id}</div>
                        <div className="text-ink-400 text-sm">
                          {formatDate(order.date)} • ${order.total}
                        </div>
                      </div>
                      <div className="text-ink-400 text-sm capitalize">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Selection */}
            {selectedOrder && (
              <div className="bg-ink-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select Items to Return</h3>
                <div className="space-y-3">
                  {mockOrders.find(o => o.id === selectedOrder)?.items.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedItems.includes(item.id)
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-ink-700 hover:border-ink-600'
                      }`}
                      onClick={() => {
                        setSelectedItems(prev =>
                          prev.includes(item.id)
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        )
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-ink-400 text-sm">
                            Size: {item.size} • Qty: {item.quantity} • ${item.price}
                          </div>
                        </div>
                        <div className="text-white font-semibold">${item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedOrder && selectedItems.length > 0 && (
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Return Method */}
            <div className="bg-ink-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Return Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setReturnMethod('return')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    returnMethod === 'return'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-ink-700 hover:border-ink-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                    <div>
                      <div className="text-white font-medium">Return for Refund</div>
                      <div className="text-ink-400 text-sm">Get money back to original payment method</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setReturnMethod('exchange')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    returnMethod === 'exchange'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-ink-700 hover:border-ink-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-6 h-6 text-purple-500" />
                    <div>
                      <div className="text-white font-medium">Exchange</div>
                      <div className="text-ink-400 text-sm">Exchange for different size or item</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Return Reason */}
            <div className="bg-ink-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reason for Return</h3>
              <div className="grid grid-cols-2 gap-3">
                {returnReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReturnReason(reason)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      returnReason === reason
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-ink-700 hover:border-ink-600'
                    }`}
                  >
                    <span className="text-white text-sm">{reason}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-ink-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Photos (Optional)</h3>
              <div className="border-2 border-dashed border-ink-700 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-ink-400 mx-auto mb-4" />
                <p className="text-ink-400 mb-4">Upload photos to help us process your return faster</p>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Files
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!returnReason}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="bg-ink-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Review Your Request</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-ink-400 text-sm">Order:</span>
                  <span className="text-white ml-2">#{selectedOrder}</span>
                </div>
                <div>
                  <span className="text-ink-400 text-sm">Method:</span>
                  <span className="text-white ml-2 capitalize">{returnMethod}</span>
                </div>
                <div>
                  <span className="text-ink-400 text-sm">Reason:</span>
                  <span className="text-white ml-2">{returnReason}</span>
                </div>
                <div>
                  <span className="text-ink-400 text-sm">Items:</span>
                  <span className="text-white ml-2">{selectedItems.length} item(s)</span>
                </div>
                {returnMethod === 'return' && (
                  <div>
                    <span className="text-ink-400 text-sm">Estimated Refund:</span>
                    <span className="text-white ml-2">
                      ${selectedItems.reduce((total, itemId) => {
                        const order = mockOrders.find(o => o.id === selectedOrder)
                        const item = order?.items.find(i => i.id === itemId)
                        return total + (item?.price || 0)
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={returnMethod === 'return' ? handleCreateReturn : handleCreateExchange}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Submit {returnMethod === 'return' ? 'Return' : 'Exchange'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Return History */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Return History</h3>
          <div className="space-y-4">
            {returnRequests.map((request) => (
              <div key={request.id} className="bg-ink-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-white font-medium">
                        {request.id} - Order #{request.orderId}
                      </div>
                      <div className="text-ink-400 text-sm">
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    getStatusInfo(request.status).bg
                  } ${getStatusInfo(request.status).color}`}>
                    {request.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-ink-400 text-sm">Method:</span>
                    <div className="text-white capitalize">{request.refundMethod}</div>
                  </div>
                  <div>
                    <span className="text-ink-400 text-sm">Items:</span>
                    <div className="text-white">{request.items.length}</div>
                  </div>
                  <div>
                    <span className="text-ink-400 text-sm">Total:</span>
                    <div className="text-white">${request.totalRefund.toFixed(2)}</div>
                  </div>
                </div>

                {request.trackingNumber && (
                  <div className="flex items-center space-x-2 text-ink-400 text-sm">
                    <Truck className="w-4 h-4" />
                    <span>Tracking: {request.trackingNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}