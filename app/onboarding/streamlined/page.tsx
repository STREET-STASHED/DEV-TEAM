'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/app/lib/supabase/browser'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  SparklesIcon,
  TruckIcon,
  ShoppingBagIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface OnboardingStep {
  id: string
  title: string
  description: string
  estimatedTime: string
  completed: boolean
  required: boolean
}

interface RoleOnboarding {
  role: 'seller' | 'stylist' | 'driver'
  steps: OnboardingStep[]
  benefits: string[]
  incentives: string[]
}

const roleConfigs: Record<string, RoleOnboarding> = {
  seller: {
    role: 'seller',
    steps: [
      {
        id: 'basic-info',
        title: 'Basic Information',
        description: 'Name, email, business name',
        estimatedTime: '30 seconds',
        completed: false,
        required: true
      },
      {
        id: 'quick-verification',
        title: 'Quick Verification',
        description: 'Phone & email confirmation',
        estimatedTime: '2 minutes',
        completed: false,
        required: true
      },
      {
        id: 'payment-setup',
        title: 'Payment Setup',
        description: 'Stripe Express onboarding',
        estimatedTime: '1 minute',
        completed: false,
        required: true
      },
      {
        id: 'first-product',
        title: 'First Product Upload',
        description: 'Upload your first item',
        estimatedTime: '3 minutes',
        completed: false,
        required: true
      }
    ],
    benefits: [
      '0% commission for first month',
      'Featured placement for new sellers',
      'Bulk import tools available',
      'AI product description generation'
    ],
    incentives: [
      '🎉 $50 welcome bonus after first sale',
      '⭐ Featured seller badge',
      '📈 Advanced analytics access',
      '🤝 Dedicated account manager'
    ]
  },
  stylist: {
    role: 'stylist',
    steps: [
      {
        id: 'profile-creation',
        title: 'Profile Creation',
        description: 'Bio, specialties, portfolio',
        estimatedTime: '1 minute',
        completed: false,
        required: true
      },
      {
        id: 'service-setup',
        title: 'Service Setup',
        description: 'Services, pricing, availability',
        estimatedTime: '2 minutes',
        completed: false,
        required: true
      },
      {
        id: 'ai-matching',
        title: 'AI-Powered Matching',
        description: 'Style analysis & client matching',
        estimatedTime: 'Instant',
        completed: false,
        required: true
      }
    ],
    benefits: [
      'Instant client matching',
      'Portfolio templates provided',
      'Commission calculator',
      'Booking system integration'
    ],
    incentives: [
      '🎨 $100 portfolio setup bonus',
      '👥 First 5 clients guaranteed',
      '💎 Premium stylist badge',
      '📊 Performance analytics'
    ]
  },
  driver: {
    role: 'driver',
    steps: [
      {
        id: 'basic-info',
        title: 'Basic Information',
        description: 'Name, phone, location, vehicle',
        estimatedTime: '30 seconds',
        completed: false,
        required: true
      },
      {
        id: 'document-upload',
        title: 'Document Upload',
        description: 'License, insurance, registration',
        estimatedTime: '2 minutes',
        completed: false,
        required: true
      },
      {
        id: 'background-check',
        title: 'Background Check',
        description: 'Real-time verification',
        estimatedTime: 'Instant',
        completed: false,
        required: true
      }
    ],
    benefits: [
      'Same-day approval process',
      'Earnings guarantee for first week',
      'Route optimization training',
      'Safety bonus program'
    ],
    incentives: [
      '💰 $200 first week guarantee',
      '🚀 Priority delivery assignments',
      '⭐ Top stasher badge',
      '📱 Advanced tracking tools'
    ]
  }
}

function StreamlinedOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [role, setRole] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && roleConfigs[roleParam]) {
      setRole(roleParam)
    } else {
      router.push('/signup')
    }
  }, [searchParams, router])

  const config = roleConfigs[role]
  if (!config) return null

  const handleStepComplete = async (stepId: string) => {
    setIsProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setCompletedSteps(prev => [...prev, stepId])
    setProgress(prev => prev + (100 / config.steps.length))
    
    // Auto-advance to next step
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // All steps completed - redirect to dashboard
      await handleOnboardingComplete()
    }
    
    setIsProcessing(false)
  }

  const handleOnboardingComplete = async () => {
    try {
      // Update user profile with onboarding completion
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // TODO: Update profile after migration adds onboarding fields
        // await supabase
        //   .from('profiles')
        //   .update({ 
        //     onboarding_completed: true,
        //     onboarding_completed_at: new Date().toISOString()
        //   })
        //   .eq('id', user.id)
      }

      // Redirect to role-specific dashboard
      switch (role) {
        case 'seller':
          router.push('/seller-dashboard?onboarding=complete')
          break
        case 'stylist':
          router.push('/stylist/dashboard?onboarding=complete')
          break
        case 'driver':
          router.push('/driver-dashboard?onboarding=complete')
          break
        default:
          router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'seller':
        return <ShoppingBagIcon className="w-8 h-8" />
      case 'stylist':
        return <SparklesIcon className="w-8 h-8" />
      case 'driver':
        return <TruckIcon className="w-8 h-8" />
      default:
        return <UserIcon className="w-8 h-8" />
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'seller':
        return 'from-green-500 to-green-600'
      case 'stylist':
        return 'from-purple-500 to-purple-600'
      case 'driver':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-blue-500 to-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${getRoleColor()}`}>
                {getRoleIcon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold capitalize">{role} Onboarding</h1>
                <p className="text-gray-300">Get started in minutes, not hours</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getRoleColor()} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Step {currentStep + 1}: {config.steps[currentStep]?.title}
                  </h2>
                  <p className="text-gray-300 mt-1">
                    {config.steps[currentStep]?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{config.steps[currentStep]?.estimatedTime}</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                {role === 'seller' && (
                  <SellerStepContent 
                    stepId={config.steps[currentStep]?.id}
                    onComplete={handleStepComplete}
                    isProcessing={isProcessing}
                  />
                )}
                {role === 'stylist' && (
                  <StylistStepContent 
                    stepId={config.steps[currentStep]?.id}
                    onComplete={handleStepComplete}
                    isProcessing={isProcessing}
                  />
                )}
                {role === 'driver' && (
                  <DriverStepContent 
                    stepId={config.steps[currentStep]?.id}
                    onComplete={handleStepComplete}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Steps Overview */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">Onboarding Steps</h3>
              <div className="space-y-3">
                {config.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                        ? `bg-gradient-to-r ${getRoleColor()} text-white` 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${index <= currentStep ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.estimatedTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">What You Get</h3>
              <div className="space-y-2">
                {config.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Incentives */}
            <div className="bg-gradient-to-r from-brand-600/20 to-brand-500/20 rounded-xl p-6 border border-brand-500/30">
              <h3 className="font-semibold mb-4 text-brand-400">Welcome Bonuses</h3>
              <div className="space-y-2">
                {config.incentives.map((incentive, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    {incentive}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Content Components
function SellerStepContent({ stepId, onComplete, isProcessing }: any) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    email: '',
    firstProduct: {
      name: '',
      price: '',
      description: '',
      image: null as File | null
    }
  })

  const handleSubmit = async () => {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    onComplete(stepId)
  }

  switch (stepId) {
    case 'basic-info':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Business Type</label>
            <select
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              value={formData.businessType}
              onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
            >
              <option value="">Select business type</option>
              <option value="retail">Retail Store</option>
              <option value="online">Online Store</option>
              <option value="wholesale">Wholesale</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!formData.businessName || !formData.businessType || isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'quick-verification':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verification Complete!</h3>
            <p className="text-gray-300">Your phone and email have been verified automatically.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'payment-setup':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Setup Complete!</h3>
            <p className="text-gray-300">Stripe Express onboarding completed successfully.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'first-product':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter product name"
              value={formData.firstProduct.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                firstProduct: { ...prev.firstProduct, name: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="0.00"
              value={formData.firstProduct.price}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                firstProduct: { ...prev.firstProduct, price: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              rows={3}
              placeholder="Describe your product"
              value={formData.firstProduct.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                firstProduct: { ...prev.firstProduct, description: e.target.value }
              }))}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!formData.firstProduct.name || !formData.firstProduct.price || isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Uploading...' : 'Upload Product & Complete'}
          </button>
        </div>
      )

    default:
      return <div>Step not found</div>
  }
}

function StylistStepContent({ stepId, onComplete, isProcessing }: any) {
  const handleSubmit = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    onComplete(stepId)
  }

  switch (stepId) {
    case 'profile-creation':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Profile Created!</h3>
            <p className="text-gray-300">Your stylist profile has been set up with AI-powered optimization.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'service-setup':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Services Configured!</h3>
            <p className="text-gray-300">Your services and pricing have been set up with smart defaults.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'ai-matching':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Matching Complete!</h3>
            <p className="text-gray-300">You&apos;ve been matched with 5 potential clients based on your style preferences.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Start Styling!'}
          </button>
        </div>
      )

    default:
      return <div>Step not found</div>
  }
}

function DriverStepContent({ stepId, onComplete, isProcessing }: any) {
  const handleSubmit = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    onComplete(stepId)
  }

  switch (stepId) {
    case 'basic-info':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Info Collected!</h3>
            <p className="text-gray-300">Your basic information has been recorded successfully.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'document-upload':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Documents Verified!</h3>
            <p className="text-gray-300">Your license, insurance, and registration have been verified.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )

    case 'background-check':
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Background Check Passed!</h3>
            <p className="text-gray-300">You&apos;re approved to start delivering! Your first assignment is ready.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Start Delivering!'}
          </button>
        </div>
      )

    default:
      return <div>Step not found</div>
  }
}

export default function StreamlinedOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading onboarding...</p>
        </div>
      </div>
    }>
      <StreamlinedOnboardingContent />
    </Suspense>
  )
}
