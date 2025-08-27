'use client'

import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { SupabaseProvider } from '@/context/SupabaseContext'
import '@/lib/polyfills'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreetStashed - Discover Streetwear & Connect with Local Stores</title>
        <meta name="description" content="Discover the latest streetwear, connect with local stores, and get your style delivered in minutes" />
        <meta name="keywords" content="streetwear, fashion, local stores, delivery, street style" />
        <link rel="icon" href="/favicon.ico" />
      </head>
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
