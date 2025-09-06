'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, ShoppingBag, Play, Video, TrendingUp } from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  host: {
    id: string
    name: string
    avatar: string
    followers: number
    verified: boolean
  }
  thumbnail: string
  viewers: number
  duration: string
  isLive: boolean
  products: Product[]
  chat: ChatMessage[]
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
  featured: boolean
}

interface ChatMessage {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    verified: boolean
  }
  message: string
  timestamp: Date
  type: 'message' | 'purchase' | 'gift' | 'system'
}

interface SocialPost {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    verified: boolean
  }
  content: string
  images: string[]
  products: Product[]
  likes: number
  comments: number
  shares: number
  timestamp: Date
  isSponsored: boolean
}

export default function SocialCommerce() {
  const [activeTab, setActiveTab] = useState<'live' | 'posts' | 'trending'>('live')
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      title: '🔥 New Drop Alert: Limited Edition Sneakers!',
      host: {
        id: 'host1',
        name: 'SneakerHead Sarah',
        avatar: '/mock/avatar-1.jpg',
        followers: 12500,
        verified: true
      },
      thumbnail: '/mock/stream-1.jpg',
      viewers: 1247,
      duration: '2:34:15',
      isLive: true,
      products: [
        {
          id: 'prod1',
          name: 'Nike Air Jordan 1 Retro High OG',
          price: 299.99,
          originalPrice: 399.99,
          image: '/mock/sneakers-1.jpg',
          category: 'Sneakers',
          inStock: true,
          featured: true
        },
        {
          id: 'prod2',
          name: 'Supreme Box Logo Hoodie',
          price: 189.99,
          image: '/mock/hoodie-1.jpg',
          category: 'Streetwear',
          inStock: true,
          featured: false
        }
      ],
      chat: [
        {
          id: 'msg1',
          user: {
            id: 'user1',
            name: 'FashionFan123',
            avatar: '/mock/avatar-2.jpg',
            verified: false
          },
          message: 'Love these sneakers! 🔥',
          timestamp: new Date(Date.now() - 30000),
          type: 'message'
        },
        {
          id: 'msg2',
          user: {
            id: 'user2',
            name: 'StyleMaster',
            avatar: '/mock/avatar-3.jpg',
            verified: true
          },
          message: 'Just bought the Jordan 1s!',
          timestamp: new Date(Date.now() - 15000),
          type: 'purchase'
        }
      ]
    },
    {
      id: '2',
      title: 'Vintage Fashion Haul - Amazing Finds!',
      host: {
        id: 'host2',
        name: 'VintageVault',
        avatar: '/mock/avatar-4.jpg',
        followers: 8900,
        verified: true
      },
      thumbnail: '/mock/stream-2.jpg',
      viewers: 856,
      duration: '1:45:30',
      isLive: true,
      products: [
        {
          id: 'prod3',
          name: 'Vintage Denim Jacket',
          price: 145,
          image: '/mock/denim-jacket-1.jpg',
          category: 'Vintage',
          inStock: true,
          featured: true
        }
      ],
      chat: []
    }
  ]

  const socialPosts: SocialPost[] = [
    {
      id: 'post1',
      user: {
        id: 'user3',
        name: 'StreetStyleQueen',
        avatar: '/mock/avatar-5.jpg',
        verified: true
      },
      content: 'Just copped these amazing sneakers! Perfect for the weekend vibes 🎉 #StreetStyle #Sneakers #Fashion',
      images: ['/mock/post-1.jpg'],
      products: [
        {
          id: 'prod4',
          name: 'Adidas Yeezy Boost 350',
          price: 450,
          image: '/mock/sneakers-2.jpg',
          category: 'Sneakers',
          inStock: true,
          featured: false
        }
      ],
      likes: 1247,
      comments: 89,
      shares: 23,
      timestamp: new Date(Date.now() - 3600000),
      isSponsored: false
    },
    {
      id: 'post2',
      user: {
        id: 'user4',
        name: 'UrbanThreads',
        avatar: '/mock/avatar-6.jpg',
        verified: true
      },
      content: 'New collection dropping tomorrow! Don\'t miss out on these exclusive pieces 👕 #NewDrop #Streetwear',
      images: ['/mock/post-2.jpg', '/mock/post-3.jpg'],
      products: [
        {
          id: 'prod5',
          name: 'Limited Edition Hoodie',
          price: 89.99,
          image: '/mock/hoodie-2.jpg',
          category: 'Streetwear',
          inStock: true,
          featured: true
        }
      ],
      likes: 892,
      comments: 45,
      shares: 12,
      timestamp: new Date(Date.now() - 7200000),
      isSponsored: true
    }
  ]

  const trendingProducts: Product[] = [
    {
      id: 'trend1',
      name: 'Supreme x Nike Collab',
      price: 599.99,
      image: '/mock/trending-1.jpg',
      category: 'Sneakers',
      inStock: true,
      featured: true
    },
    {
      id: 'trend2',
      name: 'Vintage Band Tee',
      price: 75,
      image: '/mock/trending-2.jpg',
      category: 'Vintage',
      inStock: true,
      featured: false
    }
  ]

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedStream?.chat])

  const handleJoinStream = (stream: LiveStream) => {
    setSelectedStream(stream)
    setIsWatching(true)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedStream) return

    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      user: {
        id: 'currentUser',
        name: 'You',
        avatar: '/mock/avatar-current.jpg',
        verified: false
      },
      message: chatMessage,
      timestamp: new Date(),
      type: 'message'
    }

    selectedStream.chat.push(newMessage)
    setChatMessage('')
  }

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const formatViewers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🌟 Social Commerce</h1>
              <p className="text-ink-300">Shop, stream, and connect with the community</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Go Live</span>
              </button>
              <button className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors">
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-ink-900 border-b border-ink-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'live'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-ink-400 hover:text-white'
              }`}
            >
              🔴 Live Streams
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'posts'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-ink-400 hover:text-white'
              }`}
            >
              📱 Social Posts
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'trending'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-ink-400 hover:text-white'
              }`}
            >
              🔥 Trending
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Streams List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Live Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="bg-ink-900 rounded-lg overflow-hidden cursor-pointer hover:bg-ink-800 transition-colors"
                    onClick={() => handleJoinStream(stream)}
                  >
                    <div className="relative">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                        {formatViewers(stream.viewers)} watching
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                        {stream.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={stream.host.avatar}
                          alt={stream.host.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-white">{stream.host.name}</h3>
                          <p className="text-ink-400 text-sm">{formatViewers(stream.host.followers)} followers</p>
                        </div>
                        {stream.host.verified && (
                          <div className="bg-blue-500 text-white p-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-2">{stream.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-ink-400">
                        <span>{stream.products.length} products</span>
                        <span>•</span>
                        <span>{stream.chat.length} messages</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stream Viewer */}
            {selectedStream && isWatching && (
              <div className="lg:col-span-1">
                <div className="bg-ink-900 rounded-lg overflow-hidden">
                  {/* Video Player */}
                  <div className="relative">
                    <img
                      src={selectedStream.thumbnail}
                      alt={selectedStream.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <button className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-colors">
                        <Play className="w-8 h-8" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      LIVE
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                      {formatViewers(selectedStream.viewers)} watching
                    </div>
                  </div>

                  {/* Stream Info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={selectedStream.host.avatar}
                        alt={selectedStream.host.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-white">{selectedStream.host.name}</h3>
                        <p className="text-ink-400 text-sm">{formatViewers(selectedStream.host.followers)} followers</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-4">{selectedStream.title}</h4>

                    {/* Products */}
                    <div className="mb-4">
                      <h5 className="text-ink-300 font-semibold mb-2">Featured Products</h5>
                      <div className="space-y-2">
                        {selectedStream.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-3 p-2 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors"
                            onClick={() => handlePurchase(product)}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h6 className="text-white text-sm font-semibold">{product.name}</h6>
                              <p className="text-ink-400 text-xs">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">${product.price}</p>
                              {product.originalPrice && (
                                <p className="text-ink-400 text-xs line-through">${product.originalPrice}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat */}
                    <div className="border-t border-ink-700 pt-4">
                      <h5 className="text-ink-300 font-semibold mb-2">Live Chat</h5>
                      <div className="h-48 overflow-y-auto mb-3 space-y-2">
                        {selectedStream.chat.map((message) => (
                          <div key={message.id} className="flex items-start space-x-2">
                            <img
                              src={message.user.avatar}
                              alt={message.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white text-sm font-semibold">{message.user.name}</span>
                                {message.user.verified && (
                                  <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                <span className="text-ink-400 text-xs">
                                  {formatTimeAgo(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-ink-300 text-sm">{message.message}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-ink-400 focus:border-purple-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Social Posts</h2>
            {socialPosts.map((post) => (
              <div key={post.id} className="bg-ink-900 rounded-lg p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{post.user.name}</h3>
                      {post.user.verified && (
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {post.isSponsored && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">Sponsored</span>
                      )}
                    </div>
                    <p className="text-ink-400 text-sm">{formatTimeAgo(post.timestamp)}</p>
                  </div>
                </div>

                <p className="text-white mb-4">{post.content}</p>

                {post.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {post.products.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-ink-300 font-semibold mb-2">Featured Products</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {post.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-3 p-3 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors"
                          onClick={() => handlePurchase(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h5 className="text-white font-semibold">{product.name}</h5>
                            <p className="text-ink-400 text-sm">{product.category}</p>
                            <p className="text-white font-bold">${product.price}</p>
                          </div>
                          <ShoppingBag className="w-5 h-5 text-purple-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-ink-700">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 transition-colors ${
                        isLiked ? 'text-red-400' : 'text-ink-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-ink-400 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-ink-900 rounded-lg overflow-hidden cursor-pointer hover:bg-ink-800 transition-colors"
                  onClick={() => handlePurchase(product)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-ink-400 text-sm mb-2">{product.category}</p>
                    <p className="text-white font-bold text-lg">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Purchase Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-ink-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Purchase Product</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-ink-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h4 className="text-white font-semibold">{selectedProduct.name}</h4>
                <p className="text-ink-400 text-sm">{selectedProduct.category}</p>
                <p className="text-white font-bold text-lg">${selectedProduct.price}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Add to Cart
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
