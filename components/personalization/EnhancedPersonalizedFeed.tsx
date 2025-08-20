'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart, Eye, ShoppingBag, Sparkles, TrendingUp, Zap, Clock, Target } from 'lucide-react'
import { enhancedPersonalizationSystem } from '@/lib/personalization/enhancedUserProfile'

interface EnhancedPersonalizedRecommendation {
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
    description?: string
    tags?: string[]
    seller?: {
      username: string
      avatar_url: string
      verified: boolean
    }
  }
  personalizationFactors: {
    styleMatch: number
    priceMatch: number
    sizeMatch: number
    trendMatch: number
    socialProof: number
    contextMatch: number
    weatherMatch: number
    moodMatch: number
    occasionMatch: number
    timeMatch: number
    seasonMatch: number
  }
  context: {
    occasion: string
    season: string
    weather: string
    mood: string
    currentWeather?: string
    trendingTopics?: string[]
    localEvents?: string[]
  }
  metadata: {
    cached: boolean
    lastUpdated: string
    confidence: number
    personalizedFor: string
  }
}

interface UserMood {
  mood: string
  intensity: number
  triggers: string[]
}

export default function EnhancedPersonalizedFeed() {
  const [recommendations, setRecommendations] = useState<EnhancedPersonalizedRecommendation[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all')
  const [selectedWeather, setSelectedWeather] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'trend' | 'recent'>('score')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)
  const [userMood, setUserMood] = useState<UserMood | null>(null)
  const [moodIntensity, setMoodIntensity] = useState(0.5)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchEnhancedRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      
      const context: Record<string, unknown> = {}
      if (selectedMood !== 'all') context.mood = selectedMood
      if (selectedOccasion !== 'all') context.occasion = selectedOccasion
      if (selectedWeather !== 'all') context.weather = selectedWeather
      if (userMood) context.mood = userMood.mood
      
      const response = await fetch(
        `/api/personalization/enhanced-recommendations?limit=20&trending=true&context=${JSON.stringify(context)}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setTrending(data.trending || [])
        setInsights(data.insights || [])
      }
    } catch (error) {
      console.error('Error fetching enhanced recommendations:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMood, selectedOccasion, selectedWeather, userMood])

  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeEnabled) return

    // Set up Server-Sent Events for real-time updates
    const eventSource = new EventSource('/api/personalization/enhanced-recommendations?realtime=true')
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'recommendations_updated') {
          // Refresh recommendations
          fetchEnhancedRecommendations()
        }
      } catch (error) {
        console.error('Error parsing real-time update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error)
      setRealTimeEnabled(false)
    }

    return () => {
      eventSource.close()
    }
  }, [realTimeEnabled, fetchEnhancedRecommendations])

  useEffect(() => {
    fetchEnhancedRecommendations()
  }, [fetchEnhancedRecommendations])

  useEffect(() => {
    const cleanup = setupRealTimeUpdates()
    return cleanup
  }, [setupRealTimeUpdates])

  const handleRecommendationAction = async (
    itemId: string, 
    action: 'like' | 'view', 
    feedback?: 'positive' | 'negative'
  ) => {
    try {
      const response = await fetch('/api/personalization/enhanced-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId, 
          action, 
          feedback,
          mood: userMood,
          context: {
            mood: selectedMood,
            occasion: selectedOccasion,
            weather: selectedWeather
          }
        })
      })

      if (response.ok) {
        // Optimistic update
        setRecommendations(prev => 
          prev.map(rec => 
            rec.itemId === itemId 
              ? { ...rec, score: feedback === 'positive' ? rec.score * 1.1 : rec.score * 0.9 }
              : rec
          )
        )
      }
    } catch (error) {
      console.error('Error tracking recommendation action:', error)
    }
  }

  const handleMoodUpdate = async () => {
    if (!userMood) return

    try {
      await enhancedPersonalizationSystem.trackUserMood(
        'current-user-id', // This would come from auth context
        userMood.mood,
        userMood.intensity,
        userMood.triggers
      )

      // Refresh recommendations with new mood
      fetchEnhancedRecommendations()
    } catch (error) {
      console.error('Error updating mood:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <Sparkles className="w-4 h-4" />
    if (score >= 0.6) return <Target className="w-4 h-4" />
    return <Eye className="w-4 h-4" />
  }

  const getSortedRecommendations = () => {
    const sorted = [...recommendations]
    
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.score - a.score)
      case 'price':
        return sorted.sort((a, b) => a.item.price - b.item.price)
      case 'trend':
        return sorted.sort((a, b) => b.personalizationFactors.trendMatch - a.personalizationFactors.trendMatch)
      case 'recent':
        return sorted.sort((a, b) => new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime())
      default:
        return sorted
    }
  }

  const getFilteredRecommendations = () => {
    return getSortedRecommendations().filter(rec => {
      const price = rec.item.price
      return price >= priceRange[0] && price <= priceRange[1]
    })
  }

  const filteredRecommendations = getFilteredRecommendations()

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
      {/* Real-Time Status */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-300">
            {realTimeEnabled ? 'Real-time updates active' : 'Real-time updates disabled'}
          </span>
        </div>
        <button
          onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          className={`px-3 py-1 rounded text-xs font-medium ${
            realTimeEnabled 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          {realTimeEnabled ? 'Disable' : 'Enable'} Real-time
        </button>
      </div>

      {/* Mood Tracker */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          How are you feeling today?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['confident', 'casual', 'professional', 'creative', 'comfortable', 'bold'].map((mood) => (
            <button
              key={mood}
              onClick={() => setUserMood({ mood, intensity: moodIntensity, triggers: selectedTriggers })}
              className={`p-3 rounded-lg text-sm font-medium capitalize transition-all ${
                userMood?.mood === mood
                  ? 'bg-purple-600 text-white scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
        {userMood && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Intensity: {moodIntensity}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Triggers:</label>
              <div className="flex flex-wrap gap-2">
                {['work', 'social', 'weather', 'music', 'exercise', 'food'].map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() => {
                      setSelectedTriggers(prev => 
                        prev.includes(trigger) 
                          ? prev.filter(t => t !== trigger)
                          : [...prev, trigger]
                      )
                    }}
                    className={`px-2 py-1 rounded text-xs ${
                      selectedTriggers.includes(trigger)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleMoodUpdate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
            >
              Update Mood & Refresh Recommendations
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mood</label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="all">All Moods</option>
              {['confident', 'casual', 'professional', 'creative', 'comfortable', 'bold'].map((mood) => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Occasion</label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="all">All Occasions</option>
              {['casual', 'formal', 'athletic', 'party', 'work'].map((occasion) => (
                <option key={occasion} value={occasion}>{occasion}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Weather</label>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="all">All Weather</option>
              {['sunny', 'rainy', 'cloudy', 'hot', 'cold'].map((weather) => (
                <option key={weather} value={weather}>{weather}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="score">Best Match</option>
              <option value="price">Price</option>
              <option value="trend">Trending</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Panel */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Personalized Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((insight, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">{insight.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Confidence: {(insight.confidence * 100).toFixed(0)}%
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-600 text-white' :
                    insight.impact === 'medium' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Items */}
      {trending.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trending Now
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trending.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.category}</p>
                <div className="text-purple-400 text-xs mt-1">
                  {(item.personalizedScore * 100).toFixed(0)}% match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((rec) => (
          <div key={rec.id} className="bg-gray-800 rounded-lg p-6 group hover:shadow-lg transition-all duration-200 border border-gray-700 hover:border-purple-500">
            {/* Header with enhanced metrics */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`${getScoreColor(rec.score)}`}>
                  {getScoreIcon(rec.score)}
                </div>
                <div className="text-right">
                  <div className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                    {(rec.score * 100).toFixed(0)}% match
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(rec.metadata.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
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
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-white truncate">{rec.item.name}</h3>
                <p className="text-green-400 font-bold">${rec.item.price}</p>
                <p className="text-gray-400 text-sm">{rec.reason}</p>
              </div>
              
              {/* Enhanced Personalization Factors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Style:</span>
                  <span className="text-white">{(rec.personalizationFactors.styleMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">{(rec.personalizationFactors.priceMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather:</span>
                  <span className="text-white">{(rec.personalizationFactors.weatherMatch * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mood:</span>
                  <span className="text-white">{(rec.personalizationFactors.moodMatch * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {/* Enhanced Context Tags */}
              <div className="flex flex-wrap gap-1">
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.occasion}
                </span>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.season}
                </span>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                  {rec.context.mood}
                </span>
                {rec.context.currentWeather && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded capitalize">
                    {rec.context.currentWeather}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
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
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Found</h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your filters or updating your mood to get personalized recommendations.
          </p>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium"
            onClick={fetchEnhancedRecommendations}
          >
            Refresh Recommendations
          </button>
        </div>
      )}
    </div>
  )
}
