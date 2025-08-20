'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, Eye, ShoppingBag, Sparkles } from 'lucide-react'

interface PersonalizedRecommendation {
  id: string
  itemId: string
  score: number
  reason: string
  category: string
  item: {
    name: string
    price: number
    category: string
    images: string[]
    seller_id: string
  }
  personalizationFactors: {
    styleMatch: number
    priceMatch: number
    sizeMatch: number
    trendMatch: number
    socialProof: number
    contextMatch: number
  }
  context: {
    occasion: string
    season: string
    weather: string
    mood: string
  }
}

export default function PersonalizedFeed() {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState<string>('all')

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      
      const context = selectedMood !== 'all' ? { mood: selectedMood } : {}
      const response = await fetch(`/api/personalization/recommendations?limit=12&context=${JSON.stringify(context)}`)
      
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMood])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const handleRecommendationAction = async (itemId: string, action: 'like' | 'view', feedback?: 'positive' | 'negative') => {
    try {
      await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, feedback })
      })
    } catch (error) {
      console.error('Error tracking recommendation action:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <Sparkles className="w-4 h-4" />
    if (score >= 0.6) return <Eye className="w-4 h-4" />
    return <Eye className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mood Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedMood === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setSelectedMood('all')}
        >
          All Moods
        </button>
        {['confident', 'casual', 'professional', 'creative', 'comfortable', 'bold'].map((mood) => (
          <button
            key={mood}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              selectedMood === mood 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setSelectedMood(mood)}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-gray-800 rounded-lg p-6 group hover:shadow-lg transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`${getScoreColor(rec.score)}`}>
                  {getScoreIcon(rec.score)}
                </div>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  {(rec.score * 100).toFixed(0)}% match
                </span>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700 rounded"
                onClick={() => handleRecommendationAction(rec.itemId, 'like', 'positive')}
              >
                <Heart className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            {/* Item Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
            </div>
            
            {/* Item Details */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white truncate">{rec.item.name}</h3>
              <p className="text-green-400 font-bold">${rec.item.price}</p>
              <p className="text-gray-400 text-sm">{rec.reason}</p>
              
              {/* Personalization Factors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Style Match:</span>
                  <span className="text-white">{(rec.personalizationFactors.styleMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Match:</span>
                  <span className="text-white">{(rec.personalizationFactors.priceMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trend Match:</span>
                  <span className="text-white">{(rec.personalizationFactors.trendMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Context Match:</span>
                  <span className="text-white">{(rec.personalizationFactors.contextMatch * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {/* Context Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.occasion}
                </span>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.season}
                </span>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.mood}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-medium"
                  onClick={() => handleRecommendationAction(rec.itemId, 'view')}
                >
                  View Details
                </button>
                <button
                  className="p-2 border border-gray-600 text-gray-400 hover:bg-gray-700 rounded"
                  onClick={() => handleRecommendationAction(rec.itemId, 'like', 'positive')}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
          <p className="text-gray-400 mb-4">
            Start browsing and liking items to get personalized recommendations.
          </p>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium"
            onClick={fetchRecommendations}
          >
            Refresh Recommendations
          </button>
        </div>
      )}
    </div>
  )
}
