'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/hooks/useSupabase'
import { Heart, MessageCircle, Share2, Eye, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SocialPost {
  id: string
  user_id: string
  type: 'outfit' | 'review' | 'challenge' | 'haul' | 'styling'
  content: string
  images: string[]
  product_ids: string[]
  likes: number
  shares: number
  comments: number
  views: number
  created_at: string
  tags: string[]
  viral_score: number
  username: string
  display_name: string
  avatar: string
}

export default function SocialFeed({ type = 'trending', limit = 10 }:{ type?: string, limit?: number }) {
  const { session } = useSession()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [interacting, setInteracting] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type,
        limit: limit.toString()
      })
      
      if (type === 'feed' && session?.user?.id) {
        params.append('userId', session.user.id)
      }

      const response = await fetch(`/api/social/posts?${params}`)
      const data = await response.json()
      
      if (data.posts) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [type, limit, session?.user?.id])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleInteraction = async (postId: string, interactionType: 'like' | 'share' | 'view' | 'comment', platform?: string) => {
    if (!session?.user) return

    try {
      setInteracting(postId)
      
      const response = await fetch('/api/social/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          interactionType,
          platform
        })
      })

      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: interactionType === 'like' ? post.likes + 1 : post.likes,
              shares: interactionType === 'share' ? post.shares + 1 : post.shares,
              comments: interactionType === 'comment' ? post.comments + 1 : post.comments,
              views: interactionType === 'view' ? post.views + 1 : post.views
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error('Error recording interaction:', error)
    } finally {
      setInteracting(null)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outfit': return '👕'
      case 'review': return '⭐'
      case 'challenge': return '🏆'
      case 'haul': return '🛍️'
      case 'styling': return '💄'
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="ml-3 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {type === 'trending' ? '🔥 Trending' : '📱 Your Feed'}
        </h2>
        <Badge variant="secondary" className="bg-yellow-500 text-black">
          {posts.length} posts
        </Badge>
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-4">
              {type === 'trending' 
                ? 'Be the first to create viral content!' 
                : 'Follow some users to see their posts in your feed'
              }
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.avatar} alt={post.display_name} />
                  <AvatarFallback className="bg-yellow-500 text-black">
                    {post.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">{post.display_name}</h3>
                    {post.viral_score > 50 && (
                      <Badge variant="secondary" className="bg-yellow-500 text-black text-xs">
                        🔥 Viral
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>@{post.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      {getTypeIcon(post.type)} {post.type}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {post.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/mock/default-product.jpg'
                          }}
                        />
                        {index === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold">+{post.images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Content */}
                <p className="text-white leading-relaxed">{post.content}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-blue-400 border-blue-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      {post.shares.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-yellow-500 text-black text-xs">
                      Score: {post.viral_score}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleInteraction(post.id, 'like')}
                      disabled={interacting === post.id}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                      onClick={() => handleInteraction(post.id, 'comment')}
                      disabled={interacting === post.id}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Comment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-green-500 hover:bg-green-500/10"
                      onClick={() => handleInteraction(post.id, 'share', 'internal')}
                      disabled={interacting === post.id}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  
                  {post.product_ids && post.product_ids.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Shop Products
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
