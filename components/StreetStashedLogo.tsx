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

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Black and Gold Logo */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 rounded-lg shadow-lg border-2 border-brand-500`}>
        {/* Bold "S" letter in gold */}
        <span className="font-black text-4xl drop-shadow-lg text-[#facc15]">
          S
        </span>
        
        {/* Subtle gold accent */}
        <div className="absolute inset-0 border-2 border-brand-500/30 rounded-lg"></div>
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
