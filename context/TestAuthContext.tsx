'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TestUser {
  id: string
  email: string
  role: 'buyer' | 'stylist' | 'driver'
  profile: any
}

interface TestSession {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    role: string
  }
}

interface TestAuthContextType {
  user: TestUser | null
  session: TestSession | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const TestAuthContext = createContext<TestAuthContextType | undefined>(undefined)

export function TestAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TestUser | null>(null)
  const [session, setSession] = useState<TestSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('test-session')
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession)
        setSession(parsed)
        // Fetch user profile
        fetchUserProfile(parsed.user.id, parsed.user.role)
      } catch (error) {
        console.error('Failed to parse saved session:', error)
        localStorage.removeItem('test-session')
      }
    }
    setIsLoading(false)
  }, [])

  const fetchUserProfile = async (_userId: string, role: string) => {
    try {
      // Find the user by role
      const testUsers = ['buyer@test.com', 'stylist@test.com', 'driver@test.com']
      const userEmail = testUsers.find(email => {
        if (role === 'buyer' && email === 'buyer@test.com') return true
        if (role === 'stylist' && email === 'stylist@test.com') return true
        if (role === 'driver' && email === 'driver@test.com') return true
        return false
      })
      
      if (userEmail) {
        const loginResponse = await fetch('/api/auth/test-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: 'test123' })
        })
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          setUser(loginData.user)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSession(data.session)
        localStorage.setItem('test-session', JSON.stringify(data.session))
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('test-session')
  }

  const value: TestAuthContextType = {
    user,
    session,
    login,
    logout,
    isLoading
  }

  return (
    <TestAuthContext.Provider value={value}>
      {children}
    </TestAuthContext.Provider>
  )
}

export function useTestAuth() {
  const context = useContext(TestAuthContext)
  if (context === undefined) {
    throw new Error('useTestAuth must be used within a TestAuthProvider')
  }
  return context
}
