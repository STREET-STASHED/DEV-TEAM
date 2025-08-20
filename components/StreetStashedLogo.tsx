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
    gold: 'text-yellow-500',
    graffiti: 'text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text'
  }

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Graffiti Style "S" Logo */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Graffiti background with depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-lg shadow-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-pink-500 to-purple-600 rounded-lg transform scale-95"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-300 via-yellow-400 to-orange-500 rounded-lg transform scale-90"></div>
        
        {/* Authentic Graffiti "S" - Street Art Style */}
        <svg 
          className="relative z-10 w-full h-full p-1 text-white font-bold drop-shadow-lg" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {/* Real graffiti S shape - inspired by street art but completely original */}
          <path d="M6 4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2c0 .83-.67 1.5-1.5 1.5H16c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2c.83 0 1.5.67 1.5 1.5V20c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-2c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H8c-.83 0-1.5-.67-1.5-1.5v-2c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H8c-.83 0-1.5-.67-1.5-1.5v-2c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H8c-.83 0-1.5-.67-1.5-1.5V4z"/>
        </svg>
        
        {/* Graffiti paint drips effect */}
        <div className="absolute bottom-0 left-1/4 w-1 h-2 bg-purple-600 transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1 h-3 bg-pink-500 transform translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-orange-500 transform -translate-x-1/2"></div>
      </div>
      
      {/* StreetStashed Text - Graffiti Style */}
      {showText && (
        <span className={`
          ${textSizeClasses[size]} 
          ${variantClasses[variant]} 
          font-bold tracking-wider
          bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 
          bg-clip-text text-transparent
          drop-shadow-sm
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
