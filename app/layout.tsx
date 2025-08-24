import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { SupabaseProvider } from '@/context/SupabaseContext'


const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    template: '%s | StreetStashed',
    default: 'StreetStashed - Premium Streetwear Marketplace',
  },
  description: 'Discover unique streetwear from local stylists. Shop the latest trends with premium quality and authentic style.',
  keywords: 'streetwear, fashion, marketplace, local stylists, premium clothing',
  authors: [{ name: 'StreetStashed Team' }],
  creator: 'StreetStashed',
  publisher: 'StreetStashed',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://streetstashed.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StreetStashed',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://streetstashed.com',
    title: 'StreetStashed - Premium Streetwear Marketplace',
    description: 'Discover unique streetwear from local stylists',
    siteName: 'StreetStashed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetStashed - Premium Streetwear Marketplace',
    description: 'Discover unique streetwear from local stylists',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="bg-ink-black text-white h-full font-sans">
        <SupabaseProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
