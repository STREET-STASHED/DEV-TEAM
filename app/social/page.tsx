'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  PlusIcon,
  FireIcon,
  StarIcon,
  UserCircleIcon,
  CameraIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'

interface Post {
  id: string
  userId: string
  username: string
  userAvatar: string
  content: string
  image?: string
  hashtags: string[]
  likes: number
  comments: number
  shares: number
  timestamp: string
  isLiked: boolean
  isFollowing: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  hashtag: string
  participants: number
  deadline: string
  prizePool: number
  status: 'active' | 'voting' | 'completed' | 'coming-soon'
  category: string
  image: string
  isJoined: boolean
}

export default function SocialPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState<File | null>(null)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSocialData()
  }, [])

  const loadSocialData = async () => {
    setIsLoading(true)
    try {
      // Load posts and challenges from API
      await Promise.all([
        loadPosts(),
        loadChallenges()
      ])
    } catch (error) {
      console.error('Error loading social data:', error)
      // Fallback to mock data
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/social/posts?type=trending')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        throw new Error('Failed to load posts')
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      throw error
    }
  }

  const loadChallenges = async () => {
    try {
      const response = await fetch('/api/social/challenges')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges || [])
      } else {
        throw new Error('Failed to load challenges')
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
      throw error
    }
  }

  const loadMockData = () => {
    // Mock posts
    const mockPosts: Post[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'StyleMaster',
        userAvatar: '/mock/avatar1.jpg',
        content: 'Just copped these limited edition sneakers! 🔥 What do you think of this fit? #Streetwear #LimitedEdition #FreshKicks',
        image: '/mock/post1.jpg',
        hashtags: ['streetwear', 'limitededition', 'freshkicks'],
        likes: 247,
        comments: 23,
        shares: 12,
        timestamp: '2 hours ago',
        isLiked: false,
        isFollowing: true
      },
      {
        id: '2',
        userId: 'user2',
        username: 'UrbanTrendsetter',
        userAvatar: '/mock/avatar2.jpg',
        content: 'Streetwear isn\'t just fashion, it\'s a lifestyle. Representing the culture every day! 💯 #StreetwearCulture #UrbanStyle #FashionLifestyle',
        hashtags: ['streetwearculture', 'urbanstyle', 'fashionlifestyle'],
        likes: 189,
        comments: 15,
        shares: 8,
        timestamp: '4 hours ago',
        isLiked: true,
        isFollowing: false
      },
      {
        id: '3',
        userId: 'user3',
        username: 'FashionForward',
        userAvatar: '/mock/avatar3.jpg',
        content: 'New drop alert! 🚨 This vintage-inspired collection is everything I\'ve been looking for. Thoughts on the color palette? #VintageVibes #NewDrop #FashionForward',
        image: '/mock/post2.jpg',
        hashtags: ['vintagevibes', 'newdrop', 'fashionforward'],
        likes: 156,
        comments: 31,
        shares: 19,
        timestamp: '6 hours ago',
        isLiked: false,
        isFollowing: true
      }
    ]

    // Mock challenges
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Streetwear Showdown',
        description: 'Show off your best streetwear fit and win up to $1000 in prizes. Share your look with #StreetwearShowdown',
        hashtag: 'StreetwearShowdown',
        participants: 2847,
        deadline: '3 days left',
        prizePool: 5000,
        status: 'active',
        category: 'Style',
        image: '/mock/challenge1.jpg',
        isJoined: false
      },
      {
        id: '2',
        title: 'Style Transformation',
        description: 'Transform your style with before/after photos and win styling sessions with top stylists.',
        hashtag: 'StyleTransformation',
        participants: 1234,
        deadline: '7 days left',
        prizePool: 2500,
        status: 'active',
        category: 'Transformation',
        image: '/mock/challenge2.jpg',
        isJoined: true
      },
      {
        id: '3',
        title: 'Brand Ambassador',
        description: 'Become a brand ambassador for your favorite streetwear brands.',
        hashtag: 'BrandAmbassador',
        participants: 0,
        deadline: 'Next Week',
        prizePool: 0,
        status: 'coming-soon',
        category: 'Partnership',
        image: '/mock/challenge3.jpg',
        isJoined: false
      }
    ]

    setPosts(mockPosts)
    setChallenges(mockChallenges)
  }

  const createPost = async () => {
    if (!newPostContent.trim()) return

    setIsCreatingPost(true)
    try {
      // Simulate post creation
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newPost: Post = {
        id: Date.now().toString(),
        userId: 'currentUser',
        username: 'You',
        userAvatar: '/mock/current-user.jpg',
        content: newPostContent,
        image: newPostImage ? URL.createObjectURL(newPostImage) : undefined,
        hashtags: extractHashtags(newPostContent),
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: 'Just now',
        isLiked: false,
        isFollowing: false
      }

      setPosts(prev => [newPost, ...prev])
      setNewPostContent('')
      setNewPostImage(null)
      
      // In real implementation, send to API
      console.log('Post created:', newPost)
      
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsCreatingPost(false)
    }
  }

  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w]+/g
    return content.match(hashtagRegex)?.map(tag => tag.slice(1)) || []
  }

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const toggleFollow = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isFollowing: !post.isFollowing
        }
      }
      return post
    }))
  }

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          isJoined: !challenge.isJoined,
          participants: challenge.isJoined ? challenge.participants - 1 : challenge.participants + 1
        }
      }
      return challenge
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewPostImage(file)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-300">Loading social feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🌐 Social Community</h1>
              <p className="text-ink-300">Connect with fashion enthusiasts, share your style, and participate in challenges</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {[
              { id: 'feed', name: 'Feed', icon: FireIcon },
              { id: 'challenges', name: 'Challenges', icon: StarIcon },
              { id: 'trending', name: 'Trending', icon: HashtagIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {selectedTab === 'feed' && (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <div className="flex items-start space-x-4">
                <UserCircleIcon className="w-12 h-12 text-ink-400" />
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind? Share your style, thoughts, or latest finds..."
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-3 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                  
                  {/* Image Preview */}
                  {newPostImage && (
                    <div className="mt-3 relative">
                      <img
                        src={URL.createObjectURL(newPostImage)}
                        alt="Post preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setNewPostImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-sm"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <CameraIcon className="w-6 h-6 text-ink-400 hover:text-purple-400 transition-colors" />
                      </label>
                      <span className="text-sm text-ink-400">Add photo</span>
                    </div>
                    
                    <button
                      onClick={createPost}
                      disabled={!newPostContent.trim() || isCreatingPost}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-ink-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isCreatingPost ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4" />
                          <span>Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userAvatar}
                        alt={post.username}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/mock/default-avatar.jpg'
                        }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{post.username}</h3>
                          {post.isFollowing && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Following</span>
                          )}
                        </div>
                        <p className="text-sm text-ink-400">{post.timestamp}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFollow(post.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        post.isFollowing
                          ? 'bg-ink-700 text-ink-300 hover:bg-red-500 hover:text-white'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      {post.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-white mb-3">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post image"
                        className="w-full rounded-lg object-cover max-h-96"
                        onError={(e) => {
                          e.currentTarget.src = '/mock/default-post.jpg'
                        }}
                      />
                    )}
                  </div>

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-500/20 text-purple-400 text-sm px-2 py-1 rounded-full cursor-pointer hover:bg-purple-500/30 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-red-400' : 'text-ink-400 hover:text-red-400'
                        }`}
                      >
                        <HeartIcon className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{formatNumber(post.likes)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-ink-400 hover:text-blue-400 transition-colors">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span>{formatNumber(post.comments)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-ink-400 hover:text-green-400 transition-colors">
                        <ShareIcon className="w-5 h-5" />
                        <span>{formatNumber(post.shares)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'challenges' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Active Challenges</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden">
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/mock/default-challenge.jpg'
                    }}
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        challenge.status === 'active' ? 'bg-green-500 text-white' :
                        challenge.status === 'voting' ? 'bg-yellow-500 text-white' :
                        challenge.status === 'completed' ? 'bg-blue-500 text-white' :
                        'bg-ink-700 text-ink-300'
                      }`}>
                        {challenge.status === 'coming-soon' ? 'Coming Soon' : challenge.status}
                      </span>
                    </div>
                    
                    <p className="text-ink-300 text-sm mb-4">{challenge.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-400">Participants:</span>
                        <span className="text-white font-semibold">{challenge.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-400">Deadline:</span>
                        <span className="text-white font-semibold">{challenge.deadline}</span>
                      </div>
                      {challenge.prizePool > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-400">Prize Pool:</span>
                          <span className="text-green-400 font-semibold">${challenge.prizePool.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-medium">#{challenge.hashtag}</span>
                      
                      {challenge.status === 'active' && (
                        <button
                          onClick={() => joinChallenge(challenge.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            challenge.isJoined
                              ? 'bg-ink-700 text-ink-300 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                        >
                          {challenge.isJoined ? 'Joined ✓' : 'Join Challenge'}
                        </button>
                      )}
                      
                      {challenge.status === 'coming-soon' && (
                        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-ink-700 text-ink-400 cursor-not-allowed">
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'trending' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Trending Topics</h2>
            
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Hashtags</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['#Streetwear', '#LimitedEdition', '#FreshKicks', '#UrbanStyle', '#VintageVibes', '#NewDrop'].map((hashtag) => (
                  <div key={hashtag} className="bg-ink-800 rounded-lg p-4 text-center cursor-pointer hover:bg-ink-700 transition-colors">
                    <HashtagIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <span className="text-white font-medium">{hashtag}</span>
                    <div className="text-sm text-ink-400 mt-1">
                      {Math.floor(Math.random() * 1000) + 100} posts
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-lg font-semibold text-white mb-4">Trending Posts</h3>
              <div className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center space-x-4 p-3 bg-ink-800 rounded-lg">
                    <img
                      src={post.userAvatar}
                      alt={post.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/mock/default-avatar.jpg'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{post.username}</span>
                        <span className="text-sm text-ink-400">• {post.timestamp}</span>
                      </div>
                      <p className="text-sm text-ink-300 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-400 font-medium">{formatNumber(post.likes)} likes</div>
                      <div className="text-xs text-ink-400">{formatNumber(post.comments)} comments</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
