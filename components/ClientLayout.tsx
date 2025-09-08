'use client'

import AIChatbot from '@/components/ai/AIChatbot'
import { useState } from 'react'
import { MessageCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ClientLayout() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const { isAuthenticated, signOut } = useAuth()

  return (
    <>
      {/* AI Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

      {isAuthenticated && (
        <button
          onClick={() => void signOut()}
          className="fixed bottom-6 left-6 z-40 bg-ink-800 hover:bg-ink-700 text-white p-3 rounded-full border border-ink-600 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
