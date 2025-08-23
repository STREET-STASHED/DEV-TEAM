'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { Trophy, Users, Calendar, Gift, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SocialChallenge {
  id: string
  title: string
  description: string
  hashtag: string
  start_date: string
  end_date: string
  prize: {
    type: 'cash' | 'products' | 'credits' | 'experience'
    value: number
    description: string
  }
  participants: number
  submissions: number
  rules: string[]
  featured_posts: string[]
  is_active: boolean
  created_at: string
}

export default function SocialChallenges({ limit = 5 }: { limit?: number }) {
  const { session } = useSupabase()
  const [challenges, setChallenges] = useState<SocialChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [participating, setParticipating] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/social/challenges?type=active&limit=${limit}`)
      const data = await response.json()
      
      if (data.challenges) {
        setChallenges(data.challenges)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const handleParticipate = async (challengeId: string) => {
    if (!session?.user) return

    try {
      setParticipating(challengeId)
      
      // For now, just update local state
      // In a real implementation, you'd create a post and link it to the challenge
      setChallenges(prev => prev.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            participants: challenge.participants + 1,
            submissions: challenge.submissions + 1
          }
        }
        return challenge
      }))

      // Show success message
      alert('Successfully joined the challenge! Create a post with the challenge hashtag to participate.')
    } catch (error) {
      console.error('Error participating in challenge:', error)
    } finally {
      setParticipating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'cash': return '💰'
      case 'products': return '🛍️'
      case 'credits': return '🎫'
      case 'experience': return '🎯'
      default: return '🏆'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
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
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Social Challenges
        </h2>
        <Badge variant="secondary" className="bg-yellow-500 text-black">
          {challenges.length} active
        </Badge>
      </div>

      {challenges.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">No active challenges</h3>
            <p className="text-gray-400 mb-4">
              Check back soon for exciting new challenges and prizes!
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              View All Challenges
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge.end_date)
            const progress = Math.min((challenge.submissions / Math.max(challenge.participants, 1)) * 100, 100)
            
            return (
              <Card key={challenge.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{challenge.title}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <Hash className="w-4 h-4" />
                        <span className="text-blue-400">#{challenge.hashtag}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        daysRemaining <= 3 ? 'bg-red-500 text-white' : 
                        daysRemaining <= 7 ? 'bg-orange-500 text-white' : 
                        'bg-green-500 text-white'
                      }`}
                    >
                      {daysRemaining}d left
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Prize */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getPrizeIcon(challenge.prize.type)}</span>
                      <span className="font-semibold text-yellow-400">Prize</span>
                    </div>
                    <p className="text-white font-medium">{challenge.prize.description}</p>
                    <p className="text-yellow-400 text-sm">
                      Value: ${challenge.prize.value.toLocaleString()}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{challenge.participants}</p>
                        <p className="text-gray-400">Participants</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium">{challenge.submissions}</p>
                        <p className="text-gray-400">Submissions</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Participation Rate</span>
                      <span className="text-white">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Rules Preview */}
                  {challenge.rules && challenge.rules.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Rules:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {challenge.rules.slice(0, 2).map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {rule}
                          </li>
                        ))}
                        {challenge.rules.length > 2 && (
                          <li className="text-blue-400">
                            +{challenge.rules.length - 2} more rules
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Started {formatDate(challenge.start_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Ends {formatDate(challenge.end_date)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    onClick={() => handleParticipate(challenge.id)}
                    disabled={participating === challenge.id || daysRemaining === 0}
                  >
                    {participating === challenge.id ? (
                      'Joining...'
                    ) : daysRemaining === 0 ? (
                      'Challenge Ended'
                    ) : (
                      'Join Challenge'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* View All Button */}
      {challenges.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
            View All Challenges
          </Button>
        </div>
      )}
    </div>
  )
}
