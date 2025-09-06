'use client'

import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { SupabaseProvider } from '@/context/SupabaseContext'
import '@/lib/polyfills'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import AIChatbot from '@/components/ai/AIChatbot'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

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
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

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
              
              {/* AI Chatbot Button */}
              <button
                onClick={() => setIsChatbotOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
                aria-label="Open AI Assistant"
              >
                <MessageCircle className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 bg-gold-500 text-ink-black text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  AI
                </div>
              </button>

              {/* AI Chatbot Modal */}
              <AIChatbot
                isOpen={isChatbotOpen}
                onClose={() => setIsChatbotOpen(false)}
                context={{
                  sessionId: `session-${Date.now()}`,
                  userId: 'user-123' // This would come from auth context in real app
                }}
              />
            </CartProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
