'use client';

import { useState, useEffect, useCallback } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { flags } from '@/lib/flags';
import { type ReviewResponse } from '@/lib/schemas/viral';

interface ReviewDisplayProps {
  subjectType: 'seller' | 'stylist' | 'driver';
  subjectId: string;
  showForm?: boolean;
}

interface ReviewsData {
  reviews: ReviewResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function ReviewDisplay({
  subjectType,
  subjectId,
  showForm = false,
}: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(showForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!flags.reviews) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        subjectType,
        subjectId,
        page: currentPage.toString(),
        pageSize: '10',
      });

      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewsData = await response.json();
      setReviews(prev => currentPage === 1 ? data.reviews : [...prev, ...data.reviews]);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [subjectType, subjectId, currentPage]);

  useEffect(() => {
    fetchReviews();
  }, [subjectType, subjectId, currentPage, fetchReviews]);


  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (!flags.reviews) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Reviews ({reviews.length})
          </h3>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          {showReviewForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {/* Review Form */}
              {showReviewForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600">Review form would appear here when enabled.</p>
          </div>
        )}

      {/* Reviews List */}
      {loading && currentPage === 1 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-2 text-yellow-600 hover:text-yellow-700"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ChatBubbleLeftIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: ReviewResponse }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.reviewer?.avatarUrl ? (
            <img
              src={review.reviewer.avatarUrl}
              alt={review.reviewer.fullName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-yellow-600" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">
              {review.reviewer?.fullName || 'Anonymous User'}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {review.rating}/5
            </span>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
