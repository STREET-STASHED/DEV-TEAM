'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertCircle, Camera, Upload, Building, CreditCard } from 'lucide-react'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  required: boolean
}

interface VerificationData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
  }
  businessInfo: {
    businessName: string
    businessType: string
    taxId: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  documents: {
    idFront: File | null
    idBack: File | null
    businessLicense: File | null
    taxDocument: File | null
  }
  backgroundCheck: {
    consent: boolean
    ssn: string
  }
}

export default function SellerVerification() {
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: ''
    },
    businessInfo: {
      businessName: '',
      businessType: '',
      taxId: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    documents: {
      idFront: null,
      idBack: null,
      businessLicense: null,
      taxDocument: null
    },
    backgroundCheck: {
      consent: false,
      ssn: ''
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_progress' | 'approved' | 'rejected'>('pending')

  const verificationSteps: VerificationStep[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Provide your basic personal details',
      status: 'completed',
      required: true
    },
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Enter your business details',
      status: 'in_progress',
      required: true
    },
    {
      id: 'identity-verification',
      title: 'Identity Verification',
      description: 'Upload government-issued ID',
      status: 'pending',
      required: true
    },
    {
      id: 'business-documents',
      title: 'Business Documents',
      description: 'Upload business license and tax documents',
      status: 'pending',
      required: true
    },
    {
      id: 'background-check',
      title: 'Background Check',
      description: 'Complete background verification',
      status: 'pending',
      required: true
    },
    {
      id: 'payment-setup',
      title: 'Payment Setup',
      description: 'Set up payment processing',
      status: 'pending',
      required: true
    }
  ]

  const handlePersonalInfoChange = (field: keyof VerificationData['personalInfo'], value: string) => {
    setVerificationData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const handleBusinessInfoChange = (field: keyof VerificationData['businessInfo'], value: string) => {
    setVerificationData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }))
  }

  const handleDocumentUpload = (field: keyof VerificationData['documents'], file: File) => {
    setVerificationData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }))
  }

  const handleBackgroundCheckChange = (field: keyof VerificationData['backgroundCheck'], value: string | boolean) => {
    setVerificationData(prev => ({
      ...prev,
      backgroundCheck: {
        ...prev.backgroundCheck,
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock verification result
      const isApproved = Math.random() > 0.2 // 80% approval rate
      setVerificationStatus(isApproved ? 'approved' : 'rejected')
      
      if (isApproved) {
        // Update all steps to completed
        verificationSteps.forEach(step => {
          step.status = 'completed'
        })
      }
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={verificationData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={verificationData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={verificationData.personalInfo.dateOfBirth}
                  onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.businessName}
                  onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Business Type</label>
                <select
                  value={verificationData.businessInfo.businessType}
                  onChange={(e) => handleBusinessInfoChange('businessType', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                >
                  <option value="">Select business type</option>
                  <option value="individual">Individual/Sole Proprietor</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Tax ID / EIN</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.taxId}
                  onChange={(e) => handleBusinessInfoChange('taxId', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter Tax ID or EIN"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.address}
                  onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter business address"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.city}
                  onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.state}
                  onChange={(e) => handleBusinessInfoChange('state', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-ink-300 text-sm font-medium mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={verificationData.businessInfo.zipCode}
                  onChange={(e) => handleBusinessInfoChange('zipCode', e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Identity Verification</h3>
            <p className="text-ink-300 mb-6">
              Please upload clear photos of your government-issued ID. We use bank-level encryption to protect your information.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-ink-700 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-ink-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Front of ID</h4>
                <p className="text-ink-300 text-sm mb-4">Upload a clear photo of the front of your ID</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleDocumentUpload('idFront', file)
                  }}
                  className="hidden"
                  id="id-front-upload"
                />
                <label
                  htmlFor="id-front-upload"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Photo
                </label>
                {verificationData.documents.idFront && (
                  <p className="text-green-400 text-sm mt-2">✓ ID Front uploaded</p>
                )}
              </div>

              <div className="border-2 border-dashed border-ink-700 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-ink-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Back of ID</h4>
                <p className="text-ink-300 text-sm mb-4">Upload a clear photo of the back of your ID</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleDocumentUpload('idBack', file)
                  }}
                  className="hidden"
                  id="id-back-upload"
                />
                <label
                  htmlFor="id-back-upload"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Photo
                </label>
                {verificationData.documents.idBack && (
                  <p className="text-green-400 text-sm mt-2">✓ ID Back uploaded</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Business Documents</h3>
            <p className="text-ink-300 mb-6">
              Upload your business license and tax documents to verify your business legitimacy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-ink-700 rounded-lg p-6 text-center">
                <Building className="w-12 h-12 text-ink-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Business License</h4>
                <p className="text-ink-300 text-sm mb-4">Upload your business license or permit</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleDocumentUpload('businessLicense', file)
                  }}
                  className="hidden"
                  id="business-license-upload"
                />
                <label
                  htmlFor="business-license-upload"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Document
                </label>
                {verificationData.documents.businessLicense && (
                  <p className="text-green-400 text-sm mt-2">✓ Business License uploaded</p>
                )}
              </div>

              <div className="border-2 border-dashed border-ink-700 rounded-lg p-6 text-center">
                <CreditCard className="w-12 h-12 text-ink-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Tax Document</h4>
                <p className="text-ink-300 text-sm mb-4">Upload your latest tax return or W-9</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleDocumentUpload('taxDocument', file)
                  }}
                  className="hidden"
                  id="tax-document-upload"
                />
                <label
                  htmlFor="tax-document-upload"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Document
                </label>
                {verificationData.documents.taxDocument && (
                  <p className="text-green-400 text-sm mt-2">✓ Tax Document uploaded</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Background Check</h3>
            <p className="text-ink-300 mb-6">
              We conduct a background check to ensure the safety and trust of our marketplace. This is required for all sellers.
            </p>
            
            <div className="bg-ink-800 rounded-lg p-6">
              <div className="flex items-start space-x-4 mb-6">
                <Shield className="w-6 h-6 text-purple-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-2">Background Check Consent</h4>
                  <p className="text-ink-300 text-sm">
                    By proceeding, you consent to a background check that includes criminal history, 
                    identity verification, and business legitimacy verification.
                  </p>
                </div>
              </div>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verificationData.backgroundCheck.consent}
                  onChange={(e) => handleBackgroundCheckChange('consent', e.target.checked)}
                  className="mt-1 rounded border-ink-600 bg-ink-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-ink-300 text-sm">
                  I consent to a background check and understand that this information will be used 
                  solely for verification purposes and will be kept confidential.
                </span>
              </label>
              
              {verificationData.backgroundCheck.consent && (
                <div className="mt-6">
                  <label className="block text-ink-300 text-sm font-medium mb-2">Social Security Number (Last 4 digits)</label>
                  <input
                    type="text"
                    value={verificationData.backgroundCheck.ssn}
                    onChange={(e) => handleBackgroundCheckChange('ssn', e.target.value)}
                    className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-white focus:border-purple-500"
                    placeholder="Enter last 4 digits of SSN"
                    maxLength={4}
                  />
                  <p className="text-ink-400 text-xs mt-1">
                    We only need the last 4 digits for verification purposes
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Setup</h3>
            <p className="text-ink-300 mb-6">
              Set up your payment processing to receive payments from customers.
            </p>
            
            <div className="bg-ink-800 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <CreditCard className="w-6 h-6 text-green-400" />
                <h4 className="text-white font-semibold">Stripe Connect</h4>
              </div>
              <p className="text-ink-300 text-sm mb-6">
                We use Stripe Connect for secure payment processing. You&apos;ll be redirected to Stripe 
                to complete your account setup.
              </p>
              
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Connect with Stripe
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <div className="w-5 h-5 border-2 border-ink-600 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Seller Verification</h1>
          <p className="text-ink-300">Complete verification to start selling on StreetStashed</p>
        </div>

        {/* Verification Status */}
        {verificationStatus === 'approved' && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">Verification Approved!</h3>
                <p className="text-green-300 text-sm">You can now start selling on StreetStashed</p>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-white font-semibold">Verification Rejected</h3>
                <p className="text-red-300 text-sm">Please review your information and try again</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-8">
          {verificationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                index === currentStep
                  ? 'bg-purple-500/20 border-purple-500/30'
                  : index < currentStep
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-ink-800 border-ink-700'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex items-center space-x-3">
                {getStepStatusIcon(step.status)}
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">{step.title}</h4>
                  <p className="text-ink-400 text-xs">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-ink-900 rounded-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="bg-ink-800 hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>

          {currentStep < verificationSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
