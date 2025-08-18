import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'StreetStashed - Fashion Forward',
    template: '%s | StreetStashed'
  },
  description: 'Discover unique streetwear from local stylists. Get personalized fashion delivered to your door.',
  keywords: ['streetwear', 'fashion', 'stylists', 'delivery', 'local fashion'],
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
  openGraph: {
    title: 'StreetStashed - Fashion Forward',
    description: 'Discover unique streetwear from local stylists. Get personalized fashion delivered to your door.',
    url: 'https://streetstashed.com',
    siteName: 'StreetStashed',
    images: [
      {
        url: '/logo-new.png',
        width: 1200,
        height: 630,
        alt: 'StreetStashed - Fashion Forward',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetStashed - Fashion Forward',
    description: 'Discover unique streetwear from local stylists. Get personalized fashion delivered to your door.',
    images: ['/logo-new.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  )
}
