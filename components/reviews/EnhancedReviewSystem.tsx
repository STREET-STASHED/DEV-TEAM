'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag, Camera, Send, CheckCircle } from 'lucide-react'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userVerified: boolean
  rating: number
  title: string
  comment: string
  images: string[]
  helpful: number
  notHelpful: number
  verifiedPurchase: boolean
  purchaseDate: string
  size: string
  color: string
  createdAt: string
  updatedAt: string
  helpfulVotes: string[]
  reportCount: number
  isReported: boolean
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  verifiedPurchaseRate: number
  recentTrend: 'up' | 'down' | 'stable'
}

interface EnhancedReviewSystemProps {
  productId: string
  productName: string
  productImage: string
  onReviewSubmit?: (_review: Partial<Review>) => void
  onReviewUpdate?: (_reviewId: string, _review: Partial<Review>) => void
  onReviewDelete?: (_reviewId: string) => void
  onReviewReport?: (_reviewId: string, _reason: string) => void
}

export default function EnhancedReviewSystem({
  productId,
  productName: _productName,
  productImage: _productImage,
  onReviewSubmit,
  onReviewUpdate: _onReviewUpdate,
  onReviewDelete: _onReviewDelete,
  onReviewReport
}: EnhancedReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [_showFilters, _setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'>('newest')
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'with_images' | '5_star' | '4_star' | '3_star' | '2_star' | '1_star'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    size: '',
    color: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data
  const mockReviews: Review[] = useMemo(() => [
    {
      id: '1',
      userId: 'user1',
      userName: 'SneakerHead23',
      userAvatar: '/mock/avatar1.jpg',
      userVerified: true,
      rating: 5,
      title: 'Perfect fit and amazing quality!',
      comment: 'These are exactly what I was looking for. The quality is outstanding and they fit perfectly. Shipping was fast and the seller was very responsive.',
      images: ['/mock/review1-1.jpg', '/mock/review1-2.jpg'],
      helpful: 12,
      notHelpful: 1,
      verifiedPurchase: true,
      purchaseDate: '2024-01-15',
      size: '10',
      color: 'Red/White/Black',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      helpfulVotes: [],
      reportCount: 0,
      isReported: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'FashionLover99',
      userAvatar: '/mock/avatar2.jpg',
      userVerified: false,
      rating: 4,
      title: 'Great shoes, minor sizing issue',
      comment: 'Love the design and quality, but they run a bit small. I usually wear size 10 but had to go with 10.5. Otherwise perfect!',
      images: [],
      helpful: 8,
      notHelpful: 2,
      verifiedPurchase: true,
      purchaseDate: '2024-01-10',
      size: '10.5',
      color: 'Red/White/Black',
      createdAt: '2024-01-18T14:20:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
      helpfulVotes: [],
      reportCount: 0,
      isReported: false
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'CollectorPro',
      userAvatar: '/mock/avatar3.jpg',
      userVerified: true,
      rating: 5,
      title: 'Authentic and in perfect condition',
      comment: 'As a collector, I can confirm these are 100% authentic. The condition is exactly as described and the seller was very professional.',
      images: ['/mock/review3-1.jpg'],
      helpful: 15,
      notHelpful: 0,
      verifiedPurchase: true,
      purchaseDate: '2024-01-05',
      size: '9',
      color: 'Red/White/Black',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      helpfulVotes: [],
      reportCount: 0,
      isReported: false
    }
  ], [])

  const mockStats: ReviewStats = useMemo(() => ({
    averageRating: 4.7,
    totalReviews: 247,
    ratingDistribution: {
      5: 180,
      4: 45,
      3: 15,
      2: 5,
      1: 2
    },
    verifiedPurchaseRate: 0.89,
    recentTrend: 'up'
  }), [])

  useEffect(() => {
    // Load reviews and stats
    setReviews(mockReviews)
    setStats(mockStats)
  }, [productId, mockReviews, mockStats])

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return review.title.toLowerCase().includes(query) ||
               review.comment.toLowerCase().includes(query) ||
               review.userName.toLowerCase().includes(query)
      }
      return true
    })
    .filter(review => {
      // Rating filter
      switch (filterBy) {
        case 'verified':
          return review.verifiedPurchase
        case 'with_images':
          return review.images.length > 0
        case '5_star':
          return review.rating === 5
        case '4_star':
          return review.rating === 4
        case '3_star':
          return review.rating === 3
        case '2_star':
          return review.rating === 2
        case '1_star':
          return review.rating === 1
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'most_helpful':
          return b.helpful - a.helpful
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (newReview.rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const review: Partial<Review> = {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        images: selectedImages.map(file => URL.createObjectURL(file)),
        size: newReview.size,
        color: newReview.color,
        verifiedPurchase: true, // Mock
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onReviewSubmit?.(review)
      
      // Reset form
      setNewReview({ rating: 0, title: '', comment: '', size: '', color: '' })
      setSelectedImages([])
      setShowReviewForm(false)
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle helpful vote
  const handleHelpfulVote = (reviewId: string, isHelpful: boolean) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpful: isHelpful ? review.helpful + 1 : review.helpful,
          notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful
        }
      }
      return review
    }))
  }

  // Handle review report
  const handleReviewReport = (reviewId: string, reason: string) => {
    onReviewReport?.(reviewId, reason)
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, isReported: true, reportCount: review.reportCount + 1 }
        : review
    ))
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  return (
    <div className="bg-ink-900 rounded-2xl p-6 border border-ink-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Review Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.averageRating}</div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(stats.averageRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-ink-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-ink-400 text-sm">Average Rating</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.totalReviews}</div>
            <div className="text-ink-400 text-sm">Total Reviews</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {Math.round(stats.verifiedPurchaseRate * 100)}%
            </div>
            <div className="text-ink-400 text-sm">Verified Purchases</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.recentTrend === 'up' ? '↗️' : stats.recentTrend === 'down' ? '↘️' : '→'}
            </div>
            <div className="text-ink-400 text-sm">Recent Trend</div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = (count / stats.totalReviews) * 100
              
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-ink-300 text-sm">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-ink-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-ink-400 text-sm w-12 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full sm:w-64 bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
            >
              <option value="all">All Reviews</option>
              <option value="verified">Verified Purchases</option>
              <option value="with_images">With Images</option>
              <option value="5_star">5 Stars</option>
              <option value="4_star">4 Stars</option>
              <option value="3_star">3 Stars</option>
              <option value="2_star">2 Stars</option>
              <option value="1_star">1 Star</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="most_helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-ink-800 rounded-xl p-6 mb-8 border border-ink-700">
          <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Rating *</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= newReview.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-ink-600 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience..."
                className="w-full bg-ink-700 border border-ink-600 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Tell others about your experience with this product..."
                rows={4}
                className="w-full bg-ink-700 border border-ink-600 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Size and Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Size</label>
                <input
                  type="text"
                  value={newReview.size}
                  onChange={(e) => setNewReview(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="e.g., 10, M, Large"
                  className="w-full bg-ink-700 border border-ink-600 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Color</label>
                <input
                  type="text"
                  value={newReview.color}
                  onChange={(e) => setNewReview(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="e.g., Red, Black, White"
                  className="w-full bg-ink-700 border border-ink-600 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-2">Photos (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="review-images"
              />
              <label
                htmlFor="review-images"
                className="inline-flex items-center space-x-2 bg-ink-700 hover:bg-ink-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Add Photos</span>
              </label>
              {selectedImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Review image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 text-ink-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmitting || newReview.rating === 0}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-ink-600" />
            </div>
            <h3 className="text-xl font-semibold text-ink-300 mb-2">No reviews found</h3>
            <p className="text-ink-400">
              {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to review this product'}
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="bg-ink-800 rounded-xl p-6 border border-ink-700">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  {/* User Info and Rating */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-semibold">{review.userName}</span>
                    {review.userVerified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {review.verifiedPurchase && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-ink-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-ink-400 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                  )}

                  {/* Review Comment */}
                  <p className="text-ink-300 mb-4">{review.comment}</p>

                  {/* Size and Color */}
                  {(review.size || review.color) && (
                    <div className="flex items-center space-x-4 mb-4 text-sm text-ink-400">
                      {review.size && <span>Size: {review.size}</span>}
                      {review.color && <span>Color: {review.color}</span>}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleHelpfulVote(review.id, true)}
                        className="flex items-center space-x-1 text-ink-400 hover:text-green-400 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">Helpful ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => handleHelpfulVote(review.id, false)}
                        className="flex items-center space-x-1 text-ink-400 hover:text-red-400 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm">Not Helpful ({review.notHelpful})</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewReport(review.id, 'inappropriate')}
                        className="flex items-center space-x-1 text-ink-400 hover:text-red-400 transition-colors text-sm"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredAndSortedReviews.length > 0 && (
        <div className="text-center mt-8">
          <button className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  )
}
