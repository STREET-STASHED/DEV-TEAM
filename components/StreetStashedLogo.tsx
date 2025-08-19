'use client'

import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark' | 'gold'
  showText?: boolean
  className?: string
}

export function StreetStashedLogo({ 
  href = '/', 
  size = 'md', 
  variant = 'light',
  showText = true,
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const variantClasses = {
    light: 'text-white',
    dark: 'text-gray-900',
    gold: 'text-yellow-500'
  }

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Golden Dollar Sign Logo */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Golden glitter effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-300/30 to-transparent rounded-lg"></div>
        
        {/* Dollar sign */}
        <svg 
          className="relative z-10 w-full h-full p-1 text-black font-bold" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 6c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5h3c1.93 0 3.5 1.57 3.5 3.5S15.43 18 13.5 18v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c-1.93 0-3.5-1.57-3.5-3.5 0-.55.45-1 1-1s1 .45 1 1c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-1.93 0-3.5-1.57-3.5-3.5S8.57 6 10.5 6V5c0-.55.45-1 1-1s1 .45 1 1v1z"/>
        </svg>
      </div>
      
      {/* StreetStashed Text */}
      {showText && (
        <span className={`
          ${textSizeClasses[size]} 
          ${variantClasses[variant]} 
          font-bold tracking-tight
          bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 
          bg-clip-text text-transparent
        `}>
          STREETSTASHED
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
