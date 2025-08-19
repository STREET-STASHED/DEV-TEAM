'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrophyIcon, UserIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { flags } from '@/lib/flags';

interface LeaderboardEntry {
  referrer_id: string;
  full_name: string | null;
  avatar_url: string | null;
  referred_orders: number;
  completed_orders: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentOffset, fetchLeaderboard]);

  const fetchLeaderboard = useCallback(async () => {
    if (!flags.leaderboard) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: currentOffset.toString(),
      });

      const response = await fetch(`/api/leaderboard/referrals?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data: LeaderboardData = await response.json();
      setLeaderboard(prev => currentOffset === 0 ? data.leaderboard : [...prev, ...data.leaderboard]);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [currentOffset]);

  const loadMore = () => {
    setCurrentOffset(prev => prev + 20);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank === 2) return 'text-gray-600 bg-gray-100';
    if (rank === 3) return 'text-amber-600 bg-amber-100';
    return 'text-gray-600 bg-gray-50';
  };

  if (!flags.leaderboard) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <TrophyIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Referral Leaderboard</h2>
            <p className="text-sm text-gray-600">Top referrers this month</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="divide-y divide-gray-200">
        {loading && currentOffset === 0 ? (
          // Loading skeleton
          [...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <TrophyIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No referrals yet. Start referring friends to climb the leaderboard!</p>
          </div>
        ) : (
          <>
            {leaderboard.map((entry, index) => {
              const rank = currentOffset + index + 1;
              return (
                <LeaderboardRow
                  key={entry.referrer_id}
                  entry={entry}
                  rank={rank}
                  rankIcon={getRankIcon(rank)}
                  rankColor={getRankColor(rank)}
                />
              );
            })}

            {/* Load More */}
            {hasMore && (
              <div className="px-6 py-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Leaderboard Row Component
function LeaderboardRow({
  entry,
  rankIcon,
  rankColor,
}: {
  entry: LeaderboardEntry;
  rankIcon: string;
  rankColor: string;
}) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${rankColor}`}>
          {rankIcon}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            {entry.avatar_url ? (
              <img
                src={entry.avatar_url}
                alt={entry.full_name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-yellow-600" />
              </div>
            )}

            {/* Name and Stats */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {entry.full_name || 'Anonymous User'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  <span>{entry.referred_orders} referrals</span>
                </span>
                <span>•</span>
                <span>{entry.completed_orders} completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-600">
            {entry.completed_orders}
          </div>
          <div className="text-xs text-gray-500">completed</div>
        </div>
      </div>
    </div>
  );
}
