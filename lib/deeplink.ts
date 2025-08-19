import { flags } from './flags';
import { shareLinkSchema, type ShareLinkRequest } from './schemas/viral';

export interface DeepLinkConfig {
  baseUrl: string;
  appScheme: string;
  fallbackUrl: string;
}

export interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
  imageUrl?: string;
}

class DeepLinkService {
  private config: DeepLinkConfig = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://streetstashed.com',
    appScheme: 'streetstashed://',
    fallbackUrl: process.env.NEXT_PUBLIC_FALLBACK_URL || 'https://streetstashed.com',
  };

  /**
   * Generate a deep link for a specific content type
   */
  generateDeepLink(request: ShareLinkRequest): string {
    if (!flags.deeplinks) {
      return this.generateWebUrl(request);
    }

    try {
      // Validate input
      const validated = shareLinkSchema.parse(request);
      
      // Generate app-specific deep link
      const appLink = `${this.config.appScheme}${validated.type}/${validated.id}`;
      
      // For web, return the app link (will fallback to web if app not installed)
      if (validated.platform === 'web') {
        return appLink;
      }
      
      // For mobile, return app link
      return appLink;
    } catch (error) {
      console.error('[DeepLink] Invalid request:', error);
      return this.generateWebUrl(request);
    }
  }

  /**
   * Generate a web URL as fallback
   */
  private generateWebUrl(request: ShareLinkRequest): string {
    const { type, id } = request;
    
    switch (type) {
      case 'product':
        return `${this.config.baseUrl}/marketplace/product/${id}`;
      case 'storefront':
        return `${this.config.baseUrl}/seller/${id}`;
      case 'bundle':
        return `${this.config.baseUrl}/stylist/bundle/${id}`;
      default:
        return this.config.baseUrl;
    }
  }

  /**
   * Generate a universal link that works on both web and mobile
   */
  generateUniversalLink(request: ShareLinkRequest): string {
    if (!flags.deeplinks) {
      return this.generateWebUrl(request);
    }

    const webUrl = this.generateWebUrl(request);
    
    // Return web URL - mobile apps can intercept this and redirect to app
    return webUrl;
  }

  /**
   * Check if running in mobile app context
   */
  isMobileApp(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Capacitor
    return !!(window as Record<string, unknown>).Capacitor;
  }

  /**
   * Check if running in iOS
   */
  isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Check if running in Android
   */
  isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Get platform-specific share options
   */
  getShareOptions(request: ShareLinkRequest, customOptions?: Partial<ShareOptions>): ShareOptions {
    const url = this.generateUniversalLink(request);
    
    const defaultOptions: ShareOptions = {
      title: 'Check this out on StreetStashed!',
      text: 'I found something amazing on StreetStashed',
      url,
    };

    return { ...defaultOptions, ...customOptions };
  }

  /**
   * Attempt to use native sharing if available
   */
  async shareContent(options: ShareOptions): Promise<boolean> {
    if (!flags.share) {
      return false;
    }

    try {
      // Try native sharing first
      if (navigator.share && this.isMobileApp()) {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      }

      // Fallback to clipboard copy
      await navigator.clipboard.writeText(options.url);
      
      // Show success message (you can integrate with your toast system)
      console.log('Link copied to clipboard:', options.url);
      return true;
    } catch (error) {
      console.error('[DeepLink] Share failed:', error);
      
      // Final fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(options.url);
        console.log('Link copied to clipboard:', options.url);
        return true;
      } catch (clipboardError) {
        console.error('[DeepLink] Clipboard copy failed:', clipboardError);
        return false;
      }
    }
  }

  /**
   * Generate a signed, time-limited link (for premium features)
   */
  generateSignedLink(request: ShareLinkRequest): string {
    if (!flags.deeplinks) {
      return this.generateWebUrl(request);
    }

    // For now, return regular link
    // In production, you could add JWT signing here
    return this.generateUniversalLink(request);
  }

  /**
   * Parse incoming deep link (for mobile app handling)
   */
  parseIncomingLink(url: string): { type: string; id: string } | null {
    try {
      // Handle app scheme links
      if (url.startsWith(this.config.appScheme)) {
        const path = url.replace(this.config.appScheme, '');
        const [type, id] = path.split('/');
        
        if (type && id) {
          return { type, id };
        }
      }

      // Handle web URLs
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 3) {
        const [section, type, id] = pathParts;
        
        if (['marketplace', 'seller', 'stylist'].includes(section) && id) {
          return { type, id };
        }
      }

      return null;
    } catch (error) {
      console.error('[DeepLink] Failed to parse incoming link:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deepLinkService = new DeepLinkService();

// Convenience functions
export function generateDeepLink(request: ShareLinkRequest): string {
  return deepLinkService.generateDeepLink(request);
}

export function generateUniversalLink(request: ShareLinkRequest): string {
  return deepLinkService.generateUniversalLink(request);
}

export async function shareContent(options: ShareOptions): Promise<boolean> {
  return deepLinkService.shareContent(options);
}

export function isMobileApp(): boolean {
  return deepLinkService.isMobileApp();
}
