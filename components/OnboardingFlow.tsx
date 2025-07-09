// OnboardingFlow.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient.ts'

// Onboarding steps
const STEPS = {
  ROLE: 'role',
  DETAILS: 'details',
  VERIFICATION: 'verification',
  VERIFICATION_PENDING: 'verification_pending',
  COMPLETE: 'complete'
}

export default function OnboardingFlow() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<{ role: string; verified: boolean; current_step?: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(STEPS.ROLE)

  useEffect(() => {
    if (!router.pathname.startsWith('/onboarding')) return;

    const fetchUser = async () => {
      const { data: { user: _user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      if (_user) setUser(_user);
    };

    fetchUser();
  }, [router.pathname]);

  useEffect(() => {
    if (!user || !router.pathname.startsWith('/onboarding')) return;
    fetchOnboardingStatus();
  }, [user, router.pathname]);

  async function fetchOnboardingStatus() {
    try {
      setLoading(true)
      setError(null)

      const { data: _data, error } = await supabase.functions.invoke('handle-onboarding', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (error) throw error

      setOnboardingStatus(_data.status)
      setCurrentStep(_data?.status?.current_step || STEPS.ROLE)
    } catch (error) {
      console.error('Error fetching onboarding status:', error)
      setError(new Error('Failed to load onboarding status'))
    } finally {
      setLoading(false)
    }
  }

  // Update user role
  async function handleRoleSelection(role: string) {
    try {
      setLoading(true)
      setError(null)

      const { data: _data, error } = await supabase.functions.invoke('handle-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ role })
      })

      if (error) throw error

      // Refresh onboarding status
      await fetchOnboardingStatus()
    } catch (error) {
      console.error('Error updating role:', error)
      setError(new Error('Failed to update role'))
    } finally {
      setLoading(false)
    }
  }

  // Update profile details
  async function handleDetailsSubmission(details: { fullName: string }) {
    try {
      setLoading(true)
      setError(null)

      const { data: _data, error } = await supabase.functions.invoke('handle-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          ...details // Include any additional details
        })
      })

      if (error) throw error

      // Refresh onboarding status
      await fetchOnboardingStatus()
    } catch (error) {
      console.error('Error updating details:', error)
      setError(new Error('Failed to update details'))
    } finally {
      setLoading(false)
    }
  }

  // Submit verification documents
  async function handleVerificationSubmission(documentType: string, documentUrl: string, notes: string) {
    try {
      setLoading(true)
      setError(null)

      const { data: _data, error } = await supabase.functions.invoke('handle-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          documentType,
          documentUrl,
          notes
        })
      })

      if (error) throw error

      // Refresh onboarding status
      await fetchOnboardingStatus()
    } catch (error) {
      console.error('Error submitting verification:', error)
      setError(new Error('Failed to submit verification documents'))
    } finally {
      setLoading(false)
    }
  }

  // Render different steps based on current step
  function renderStep() {
    if (loading) return <div>Loading...</div>
    if (error) return <div className="error">{error.message}</div>

    switch (currentStep) {
      case STEPS.ROLE:
        return <RoleSelectionStep onSubmit={handleRoleSelection} />
      case STEPS.DETAILS:
        return <DetailsStep onSubmit={handleDetailsSubmission} role={onboardingStatus?.role ?? ''} />
      case STEPS.VERIFICATION:
        return <VerificationStep onSubmit={handleVerificationSubmission} role={onboardingStatus?.role ?? ''} />
      case STEPS.VERIFICATION_PENDING:
        return <VerificationPendingStep />
      case STEPS.COMPLETE:
        return <OnboardingCompleteStep verified={onboardingStatus?.verified ?? false} />
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="onboarding-flow">
      <h1>Complete Your Profile</h1>
      {renderStep()}
    </div>
  )
}

// Step components (implement these based on your UI framework)
function RoleSelectionStep({ onSubmit }: { onSubmit: (role: string) => void }) {
  // Role selection UI
  return (
    <div>
      <h2>Select your role</h2>
      <button type="button" onClick={() => onSubmit('buyer')}>Buyer</button>
      <button type="button" onClick={() => onSubmit('seller/brand')}>Seller/Brand</button>
      <button type="button" onClick={() => onSubmit('stylist')}>Stylist</button>
      <button type="button" onClick={() => onSubmit('driver')}>Driver</button>
    </div>
  )
}

function DetailsStep({ onSubmit, role: _role }: { onSubmit: (details: { fullName: string }) => void; role: string }) {
  // Form for collecting user details
  const [fullName, setFullName] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ fullName })
  }
  
  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        {/* Add more fields based on role */}
        <button type="submit">Continue</button>
      </form>
    </div>
  )
}

function VerificationStep({
  onSubmit,
  role: _role,
}: {
  onSubmit: (documentType: string, documentUrl: string, notes: string) => void;
  role: string;
}) {
  // Document upload UI
  const [documentType, setDocumentType] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // Handle file upload to Storage
  async function uploadDocument(file: File) {
    try {
      setUploading(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `verification/${fileName}`
      
      const { data: _data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file)
        
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)
        
      setDocumentUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error uploading document')
    } finally {
      setUploading(false)
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(documentType, documentUrl, notes)
  }
  
  return (
    <div>
      <h2>Verification Required</h2>
      <p>Please upload the required documents for your {_role} account.</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Document Type</label>
          <select 
            value={documentType} 
            onChange={(e) => setDocumentType(e.target.value)}
            required
          >
            <option value="">Select document type</option>
            <option value="id">ID Card</option>
            <option value="license">Business License</option>
            <option value="certificate">Professional Certificate</option>
          </select>
        </div>
        
        <div>
          <label>Upload Document</label>
          <input 
            type="file" 
            onChange={(e) => uploadDocument(e.target.files![0])}
            disabled={uploading}
          />
          {uploading && <p>Uploading...</p>}
          {documentUrl && <p>Document uploaded successfully!</p>}
        </div>
        
        <div>
          <label>Additional Notes</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <button type="submit" disabled={!documentUrl || !documentType}>
          Submit for Verification
        </button>
      </form>
    </div>
  )
}

function VerificationPendingStep() {
  return (
    <div>
      <h2>Verification Pending</h2>
      <p>Your documents have been submitted and are pending review.</p>
      <p>We'll notify you once your account has been verified.</p>
    </div>
  )
}

function OnboardingCompleteStep({ verified: _verified }: { verified: boolean }) {
  return (
    <div>
      <h2>Onboarding Complete</h2>
      <p>Your profile is now set up!</p>
      {_verified ? (
        <p>Your account has been verified. You can now access all features.</p>
      ) : (
        <p>You can start using the app now.</p>
      )}
    </div>
  )
}