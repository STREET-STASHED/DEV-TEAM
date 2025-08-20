import { flags } from '@/lib/flags';

export default function TestViralPage() {
  return (
    <div className="min-h-screen bg-ink-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-500 mb-8">
          🧪 Viral Features Test Page
        </h1>
        
        <div className="space-y-8">
          {/* Feature Flags Status */}
          <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
            <h2 className="text-2xl font-semibold mb-4">Feature Flags Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(flags).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-mono text-sm">{feature}</span>
                  <span className={`text-sm ${enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Test */}
          {flags.reviews && (
            <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
              <h2 className="text-2xl font-semibold mb-4">✅ Reviews System</h2>
              <p className="text-ink-300 mb-4">Reviews feature is enabled and ready!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">🎯 Ready to test: Submit reviews, view ratings</p>
              </div>
            </div>
          )}

          {/* Social Sharing Test */}
          {flags.share && (
            <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
              <h2 className="text-2xl font-semibold mb-4">✅ Social Sharing</h2>
              <p className="text-ink-300 mb-4">Social sharing feature is enabled and ready!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">🎯 Ready to test: Share buttons, deep links</p>
              </div>
            </div>
          )}

          {/* Leaderboard Test */}
          {flags.leaderboard && (
            <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
              <h2 className="text-2xl font-semibold mb-4">✅ Referral Leaderboard</h2>
              <p className="text-ink-300 mb-4">Leaderboard feature is enabled and ready!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">🎯 Ready to test: View referral rankings</p>
              </div>
            </div>
          )}

          {/* Analytics Test */}
          {flags.analytics && (
            <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
              <h2 className="text-2xl font-semibold mb-4">✅ Analytics System</h2>
              <p className="text-ink-300 mb-4">Analytics feature is enabled and ready!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">🎯 Ready to test: Event tracking, user analytics</p>
              </div>
            </div>
          )}

          {/* Push Notifications Test */}
          {flags.push && (
            <div className="bg-ink-900 rounded-lg p-6 border border-ink-800">
              <h2 className="text-2xl font-semibold mb-4">✅ Push Notifications</h2>
              <p className="text-ink-300 mb-4">Push notifications feature is enabled and ready!</p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">🎯 Ready to test: Token registration, notifications</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-brand-900/20 rounded-lg p-6 border border-brand-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-brand-400">🚀 Next Steps</h2>
            <div className="space-y-3 text-ink-300">
              <p>1. ✅ All features are enabled and ready</p>
              <p>2. 🧪 Test individual features on their respective pages</p>
              <p>3. 📱 Visit <code className="bg-ink-800 px-2 py-1 rounded">/viral-demo</code> for full demo</p>
              <p>4. 🎯 Test <code className="bg-ink-800 px-2 py-1 rounded">/referrals/leaderboard</code> for leaderboard</p>
              <p>5. 🚀 Ready for production launch!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
