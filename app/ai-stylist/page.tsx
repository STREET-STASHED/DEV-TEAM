'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon, 
  CameraIcon, 
  HeartIcon, 
  StarIcon,
  ArrowPathIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface StyleProfile {
  id: string
  name: string
  preferences: string[]
  favoriteColors: string[]
  styleType: string
  budget: string
  occasions: string[]
}

interface AIRecommendation {
  id: string
  outfit: {
    top: string
    bottom: string
    shoes: string
    accessories: string[]
  }
  confidence: number
  reasoning: string
  price: number
  style: string
}

export default function AIStylistPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [styleProfile, setStyleProfile] = useState<StyleProfile>({
    id: '1',
    name: 'Alex',
    preferences: ['streetwear', 'minimalist', 'comfortable'],
    favoriteColors: ['black', 'white', 'navy'],
    styleType: 'urban',
    budget: 'mid-range',
    occasions: ['casual', 'work', 'going-out']
  })
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [selectedOutfit, setSelectedOutfit] = useState<AIRecommendation | null>(null)

  // Simulate AI analysis
  const analyzeStyle = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const aiRecommendations: AIRecommendation[] = [
      {
        id: '1',
        outfit: {
          top: 'Urban Street Hoodie',
          bottom: 'Performance Leggings',
          shoes: 'Limited Edition Sneakers',
          accessories: ['Premium Leather Belt', 'Designer Crossbody Bag']
        },
        confidence: 94,
        reasoning: 'Based on your preference for streetwear and comfort, this outfit combines urban aesthetics with performance wear. The color scheme matches your favorite palette.',
        price: 299.99,
        style: 'Streetwear Performance'
      },
      {
        id: '2',
        outfit: {
          top: 'Vintage Denim Jacket',
          bottom: 'Classic Boots',
          shoes: 'Classic Boots',
          accessories: ['Sterling Silver Ring', 'Premium Leather Belt']
        },
        confidence: 87,
        reasoning: 'This vintage-inspired look aligns with your minimalist preferences while maintaining urban sophistication.',
        price: 189.99,
        style: 'Vintage Urban'
      },
      {
        id: '3',
        outfit: {
          top: 'Urban Street Hoodie',
          bottom: 'Limited Edition Sneakers',
          shoes: 'Limited Edition Sneakers',
          accessories: ['Diamond Pendant Necklace', 'Luxury Automatic Watch']
        },
        confidence: 82,
        reasoning: 'A premium streetwear combination that elevates your casual style for special occasions.',
        price: 899.99,
        style: 'Premium Streetwear'
      }
    ]
    
    setRecommendations(aiRecommendations)
    setIsAnalyzing(false)
    setCurrentStep(3)
  }

  const generateNewRecommendations = () => {
    setCurrentStep(2)
    analyzeStyle()
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🤖 AI Stylist</h1>
              <p className="text-ink-300">Get personalized fashion recommendations powered by artificial intelligence</p>
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

      {/* Progress Steps */}
      <div className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step ? 'bg-blue-500 text-white' : 'bg-ink-700 text-ink-400'
                }`}>
                  {step}
                </div>
                <span className={`text-sm ${currentStep >= step ? 'text-white' : 'text-ink-400'}`}>
                  {step === 1 ? 'Style Profile' : step === 2 ? 'AI Analysis' : 'Recommendations'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Style Profile */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h2 className="text-2xl font-bold mb-6">Your Style Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={styleProfile.name}
                    onChange={(e) => setStyleProfile({...styleProfile, name: e.target.value})}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Style Preferences</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['streetwear', 'minimalist', 'comfortable', 'luxury', 'vintage', 'sporty'].map((style) => (
                      <label key={style} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={styleProfile.preferences.includes(style)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStyleProfile({
                                ...styleProfile,
                                preferences: [...styleProfile.preferences, style]
                              })
                            } else {
                              setStyleProfile({
                                ...styleProfile,
                                preferences: styleProfile.preferences.filter(p => p !== style)
                              })
                            }
                          }}
                          className="rounded border-ink-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">Favorite Colors</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['black', 'white', 'navy', 'red', 'green', 'purple'].map((color) => (
                      <label key={color} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={styleProfile.favoriteColors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStyleProfile({
                                ...styleProfile,
                                favoriteColors: [...styleProfile.favoriteColors, color]
                              })
                            } else {
                              setStyleProfile({
                                ...styleProfile,
                                favoriteColors: styleProfile.favoriteColors.filter(c => c !== color)
                              })
                            }
                          }}
                          className="rounded border-ink-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue to AI Analysis
                </button>
              </div>
            </div>

            {/* AI Preview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/30">
              <div className="text-center mb-6">
                <SparklesIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">AI Analysis Preview</h3>
                <p className="text-ink-300">Our AI will analyze your style profile and create personalized outfit recommendations</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">What AI Will Analyze:</h4>
                  <ul className="text-sm text-ink-300 space-y-1">
                    <li>• Style preferences and patterns</li>
                    <li>• Color compatibility</li>
                    <li>• Occasion appropriateness</li>
                    <li>• Budget considerations</li>
                    <li>• Current fashion trends</li>
                  </ul>
                </div>
                
                <div className="bg-ink-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">AI Confidence Score:</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-ink-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-blue-400 font-bold">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <ArrowPathIcon className="w-16 h-16 text-blue-400 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">AI is Analyzing Your Style</h2>
            <p className="text-ink-300 mb-6">Our advanced AI is processing your preferences and creating personalized recommendations...</p>
            
            <div className="max-w-md mx-auto bg-ink-800 rounded-lg p-6 border border-ink-700">
              <h3 className="font-semibold text-white mb-4">AI Analysis Progress:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-ink-300">Analyzing style preferences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-ink-300">Processing color combinations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-ink-300">Generating outfit combinations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ink-600 rounded-full"></div>
                  <span className="text-sm text-ink-400">Calculating confidence scores</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">AI-Generated Recommendations</h2>
              <button
                onClick={generateNewRecommendations}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generate New Recommendations
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800 hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {rec.confidence}% Confidence
                    </span>
                    <span className="text-brand-400 font-bold">${rec.price}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-3">{rec.style}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-ink-800 rounded-lg p-3">
                      <h4 className="font-medium text-white mb-2">Complete Outfit:</h4>
                      <div className="text-sm text-ink-300 space-y-1">
                        <div>👕 <span className="text-white">{rec.outfit.top}</span></div>
                        <div>👖 <span className="text-white">{rec.outfit.bottom}</span></div>
                        <div>👟 <span className="text-white">{rec.outfit.shoes}</span></div>
                        <div>💍 <span className="text-white">{rec.outfit.accessories.join(', ')}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2">AI Reasoning:</h4>
                    <p className="text-sm text-ink-300">{rec.reasoning}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOutfit(rec)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button className="bg-ink-800 hover:bg-ink-700 p-2 rounded-lg transition-colors">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Outfit Modal */}
      {selectedOutfit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Outfit Details</h3>
              <button
                onClick={() => setSelectedOutfit(null)}
                className="text-ink-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Complete Outfit Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Top</h5>
                    <p className="text-white">{selectedOutfit.outfit.top}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Bottom</h5>
                    <p className="text-white">{selectedOutfit.outfit.bottom}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Shoes</h5>
                    <p className="text-white">{selectedOutfit.outfit.shoes}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-ink-300 mb-2">Accessories</h5>
                    <p className="text-white">{selectedOutfit.outfit.accessories.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">AI Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-ink-300">Confidence Score:</span>
                    <span className="text-blue-400 font-bold">{selectedOutfit.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-300">Style Type:</span>
                    <span className="text-white">{selectedOutfit.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-300">Total Price:</span>
                    <span className="text-brand-400 font-bold">${selectedOutfit.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-ink-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Why This Works for You</h4>
                <p className="text-ink-300">{selectedOutfit.reasoning}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/buyer/marketplace')}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Shop This Outfit
                </button>
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="flex-1 bg-ink-800 hover:bg-ink-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
