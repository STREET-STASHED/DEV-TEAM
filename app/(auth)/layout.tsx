import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | StreetStashed',
    default: 'Authentication | StreetStashed',
  },
  description: 'Sign in or sign up for your StreetStashed account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  )
}
