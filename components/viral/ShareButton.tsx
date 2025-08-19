'use client';

import { useState } from 'react';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { flags } from '@/lib/flags';
import { shareContent, generateUniversalLink } from '@/lib/deeplink';
import { type ShareLinkRequest } from '@/lib/schemas/viral';

interface ShareButtonProps {
  type: 'product' | 'storefront' | 'bundle';
  id: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareButton({
  type,
  id,
  title,
  text,
  className = '',
  variant = 'default',
  size = 'md',
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!flags.share) {
    return null;
  }

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareRequest: ShareLinkRequest = { type, id };
      const shareUrl = generateUniversalLink(shareRequest);
      
      const success = await shareContent({
        title: title || 'Check this out on StreetStashed!',
        text: text || 'I found something amazing on StreetStashed',
        url: shareUrl,
      });

      if (success) {
        // If native sharing succeeded, show copied feedback briefly
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to clipboard copy
      try {
        const shareRequest: ShareLinkRequest = { type, id };
        const shareUrl = generateUniversalLink(shareRequest);
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
      default: 'bg-yellow-600 text-white hover:bg-yellow-700',
      outline: 'bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-50',
      ghost: 'text-yellow-600 hover:bg-yellow-50',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={getButtonClasses()}
      aria-label={`Share ${type}`}
    >
      {isSharing ? (
        <div className={`${getIconSize()} animate-spin rounded-full border-2 border-current border-t-transparent`} />
      ) : copied ? (
        <CheckIcon className={`${getIconSize()} mr-2`} />
      ) : (
        <ShareIcon className={`${getIconSize()} mr-2`} />
      )}
      
      {copied ? 'Copied!' : isSharing ? 'Sharing...' : 'Share'}
    </button>
  );
}

// Quick Share Button (icon only)
export function QuickShareButton({
  type,
  id,
  title,
  text,
  className = '',
}: Omit<ShareButtonProps, 'variant' | 'size'>) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!flags.share) {
    return null;
  }

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareRequest: ShareLinkRequest = { type, id };
      const shareUrl = generateUniversalLink(shareRequest);
      
      const success = await shareContent({
        title: title || 'Check this out on StreetStashed!',
        text: text || 'I found something amazing on StreetStashed',
        url: shareUrl,
      });

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      try {
        const shareRequest: ShareLinkRequest = { type, id };
        const shareUrl = generateUniversalLink(shareRequest);
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 ${className}`}
      aria-label={`Share ${type}`}
    >
      {isSharing ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
      ) : copied ? (
        <CheckIcon className="w-5 h-5 text-green-600" />
      ) : (
        <ShareIcon className="w-5 h-5 text-yellow-600 hover:text-yellow-700" />
      )}
    </button>
  );
}
