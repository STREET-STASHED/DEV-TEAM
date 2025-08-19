'use client';

import { useState, useEffect, useCallback } from 'react';

import { StreetStashedLogo } from '@/components/StreetStashedLogo';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'expired';
  referral_code: string;
  completed_at: string | null;
  reward_points_awarded: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  const fetchReferrals = useCallback(async () => {
    try {
      const response = await fetch(`/api/referrals?type=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch referrals');
      const data = await response.json();
      setReferrals(data.referrals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const generateReferralCode = async () => {
    setGeneratingCode(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/referrals', {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate referral code');
      }

      const data = await response.json();
      setReferralCode(data.referral_code);
      setSuccess('Referral code generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate referral code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setSuccess('Referral code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const shareReferral = () => {
    if (!referralCode) return;

    const shareText = `Join StreetStashed using my referral code: ${referralCode}\n\nGet started with streetwear delivery in your city!`;
    const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join StreetStashed',
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setSuccess('Referral link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status as keyof typeof statusConfig]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <StreetStashedLogo size="lg" variant="gold" showText={false} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Referral Program</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Invite friends to StreetStashed and earn reward points! When someone uses your referral code 
          and places their first order, you&apos;ll get 50 reward points (worth $5 in future purchases).
        </p>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Code</h2>
        
        {!referralCode ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Generate your unique referral code to start inviting friends</p>
            <button
              onClick={generateReferralCode}
              disabled={generatingCode}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingCode ? 'Generating...' : 'Generate Referral Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-900 font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={shareReferral}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                📱 Share
              </button>
              <button
                onClick={generateReferralCode}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Referrals Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Referrals Sent ({referrals.filter(r => r.status === 'pending').length} pending)
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Referrals Received
            </button>
          </nav>
        </div>

        <div className="p-6">
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'sent' ? 'No referrals sent yet' : 'No referrals received'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'sent' 
                  ? 'Start sharing your referral code with friends!'
                  : 'You haven\'t been referred by anyone yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {referral.profiles.full_name || 'Unknown User'}
                        </h4>
                        {getStatusBadge(referral.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {referral.profiles.email}</p>
                        <p>Referred on: {formatDate(referral.created_at)}</p>
                        {referral.completed_at && (
                          <p>Completed on: {formatDate(referral.completed_at)}</p>
                        )}
                        {referral.reward_points_awarded > 0 && (
                          <p className="text-green-600 font-medium">
                            +{referral.reward_points_awarded} reward points earned!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Share Your Code</h3>
            <p className="text-sm text-gray-600">
              Generate and share your unique referral code with friends
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Friend Signs Up</h3>
            <p className="text-sm text-gray-600">
              They use your code when creating their account
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-sm text-gray-600">
              Get 50 points when they place their first order
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
