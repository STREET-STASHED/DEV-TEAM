'use client'

import AIChatbot from '@/components/ai/AIChatbot'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function ClientLayout() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <>
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
    </>
  )
}
