import { Suspense } from 'react';
import { flags } from '@/lib/flags';

import ReviewDisplay from '@/components/viral/ReviewDisplay';
import ShareButton from '@/components/viral/ShareButton';
import ReferralLeaderboard from '@/components/viral/ReferralLeaderboard';

export default function ViralDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StreetStashed Viral Features Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test and showcase the new engagement and virality features. All features are controlled by feature flags.
          </p>
          
          {/* Feature Flags Status */}
          <div className="mt-8 inline-flex flex-wrap gap-2 justify-center">
            {Object.entries(flags).map(([flag, enabled]) => (
              <div
                key={flag}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {flag}: {enabled ? 'ON' : 'OFF'}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Reviews & Ratings
              </h2>
              <Suspense fallback={<div>Loading reviews...</div>}>
                <ReviewDisplay
                  subjectType="seller"
                  subjectId="demo-seller-id"
                  showForm={true}
                />
              </Suspense>
            </div>
          </div>

          {/* Sharing Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Social Sharing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Share Product
                  </h3>
                  <ShareButton
                    type="product"
                    id="demo-product-123"
                    title="Check out this amazing product!"
                    text="I found this on StreetStashed"
                    variant="default"
                    size="md"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Share Storefront
                  </h3>
                  <ShareButton
                    type="storefront"
                    id="demo-store-456"
                    title="Amazing store on StreetStashed!"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Quick Share (Icon Only)
                  </h3>
                  <div className="flex space-x-2">
                    <ShareButton
                      type="bundle"
                      id="demo-bundle-789"
                      title="Stylish bundle!"
                      size="sm"
                    />
                    <ShareButton
                      type="product"
                      id="demo-product-999"
                      title="Limited edition!"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm">
            <Suspense fallback={<div className="p-6">Loading leaderboard...</div>}>
              <ReferralLeaderboard />
            </Suspense>
          </div>
        </div>

        {/* Feature Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Feature Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Reviews & Ratings</h3>
              <ul className="space-y-1">
                <li>• 1-5 star rating system</li>
                <li>• Optional comments (max 500 chars)</li>
                <li>• Only buyers can review completed orders</li>
                <li>• RLS policies ensure data security</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Social Sharing</h3>
              <ul className="space-y-1">
                <li>• Deep link generation for products/storefronts</li>
                <li>• Native sharing on mobile devices</li>
                <li>• Clipboard fallback on web</li>
                <li>• Universal links work on all platforms</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Referral Leaderboard</h3>
              <ul className="space-y-1">
                <li>• Materialized view for performance</li>
                <li>• Pagination support (20 per page)</li>
                <li>• Fallback to regular queries</li>
                <li>• Admin refresh capability</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Push Notifications</h3>
              <ul className="space-y-1">
                <li>• Provider-agnostic implementation</li>
                <li>• OneSignal and Firebase support</li>
                <li>• Graceful fallback without keys</li>
                <li>• Token cleanup after 30 days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-3">
            Environment Variables Required
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><code>ENABLE_PUSH=true</code> - Enable push notifications</p>
            <p><code>ENABLE_REVIEWS=true</code> - Enable reviews system</p>
            <p><code>ENABLE_SHARE=true</code> - Enable social sharing</p>
            <p><code>ENABLE_LEADERBOARD=true</code> - Enable referral leaderboard</p>
            <p><code>ENABLE_DEEP_LINKS=true</code> - Enable deep link generation</p>
            <p><code>ENABLE_ANALYTICS=true</code> - Enable analytics tracking</p>
            <p><code>NEXT_PUBLIC_BASE_URL</code> - Your domain for link generation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
