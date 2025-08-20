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
      {/* Clean, Simple Logo - Actually Looks Like Something! */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg shadow-lg`}>
        {/* Simple, bold "S" letter */}
        <span className="text-white font-black text-4xl drop-shadow-lg">
          S
        </span>
        
        {/* Add a subtle border for definition */}
        <div className="absolute inset-0 border-2 border-white/20 rounded-lg"></div>
      </div>
      
      {/* StreetStashed Text - Clean and Visible */}
      {showText && (
        <span className={`
          ${textSizeClasses[size]} 
          font-bold tracking-wider
          text-white
          drop-shadow-lg
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
