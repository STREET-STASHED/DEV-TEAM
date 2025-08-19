import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your StreetStashed account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ink-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            Join StreetStashed and start your fashion journey
          </p>
        </div>
        
        <SignupForm />
        
        <div className="text-center">
          <p className="text-sm text-ink-300">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
