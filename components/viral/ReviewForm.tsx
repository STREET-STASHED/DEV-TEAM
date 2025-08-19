'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { reviewSchema, type ReviewSubmission } from '@/lib/schemas/viral';
import { flags } from '@/lib/flags';

interface ReviewFormProps {
  orderId: string;
  subjectType: 'seller' | 'stylist' | 'driver';
  subjectId: string;
  subjectName: string;
  onSubmit: (data: ReviewSubmission) => Promise<void>;
  onCancel: () => void;
}

export default function ReviewForm({
  orderId,
  subjectType,
  subjectId,
  subjectName,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReviewSubmission>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      orderId,
      subjectType,
      subjectId,
      rating: 0,
      comment: '',
    },
  });

  const comment = watch('comment');

  const handleFormSubmit = async (data: ReviewSubmission) => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, rating });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!flags.reviews) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Rate your experience with {subjectName}
        </h3>
        <p className="text-sm text-gray-600">
          Help other users by sharing your experience with this {subjectType}.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Hidden fields */}
        <input type="hidden" {...register('orderId')} />
        <input type="hidden" {...register('subjectType')} />
        <input type="hidden" {...register('subjectId')} />

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors duration-200"
              >
                {star <= (hoveredRating || rating) ? (
                  <StarIconSolid className="w-8 h-8 text-yellow-400" />
                ) : (
                  <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="mt-2 text-sm text-red-600">Please select a rating</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (optional)
          </label>
          <div className="relative">
            <textarea
              {...register('comment')}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
              placeholder={`Share your experience with this ${subjectType}...`}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {comment?.length || 0}/500
            </div>
          </div>
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
