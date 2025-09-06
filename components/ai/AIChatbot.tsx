'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Mic, MicOff, Paperclip, X, ThumbsUp, ThumbsDown } from 'lucide-react'

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((_event: any) => void) | null
  onerror: ((_event: any) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: string
  isTyping?: boolean
  suggestions?: string[]
  quickActions?: Array<{
    label: string
    action: string
    icon?: string
  }>
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  rating?: number
  isHelpful?: boolean
}

interface AIChatbotProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: string
  context?: {
    orderId?: string
    userId?: string
    sessionId?: string
  }
}

export default function AIChatbot({
  isOpen,
  onClose,
  initialMessage,
  context
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [_isRecording, _setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [_showSuggestions, _setShowSuggestions] = useState(true)
  const [_sessionId] = useState(context?.sessionId || `session-${Date.now()}`)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputMessage(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: initialMessage || "Hi! I'm your AI assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
        suggestions: [
          'Track my order',
          'Start a return',
          'Get product recommendations',
          'Check my account balance',
          'Speak to a human agent'
        ],
        quickActions: [
          { label: 'Order Status', action: 'order_status', icon: '📦' },
          { label: 'Returns', action: 'returns', icon: '🔄' },
          { label: 'Support', action: 'support', icon: '💬' },
          { label: 'Recommendations', action: 'recommendations', icon: '⭐' }
        ]
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, initialMessage, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle voice input
  const handleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Handle message send
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend && attachments.length === 0) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
      attachments: attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }))
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setAttachments([])
    setIsTyping(true)

    try {
      // Simulate AI response
      const response = await generateAIResponse(messageToSend, context)
      
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: response.content,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions,
          quickActions: response.quickActions
        }

        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000 + Math.random() * 2000) // Random delay for realism
    } catch (error) {
      console.error('Failed to get AI response:', error)
      setIsTyping(false)
    }
  }

  // Generate AI response (mock implementation)
  const generateAIResponse = async (message: string, _context?: any) => {
    const lowerMessage = message.toLowerCase()
    
    // Order tracking
    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      return {
        content: "I can help you track your order! I can see you have an active order #SS-2024-001234 that's currently in transit. It's expected to arrive tomorrow by 6 PM. Would you like me to show you the detailed tracking information?",
        suggestions: ['Show tracking details', 'Update delivery address', 'Contact driver', 'Change delivery time'],
        quickActions: [
          { label: 'View Tracking', action: 'view_tracking', icon: '📍' },
          { label: 'Contact Driver', action: 'contact_driver', icon: '📞' }
        ]
      }
    }

    // Returns
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return {
        content: "I can help you with returns and refunds! You have 30 days to return most items. I can see you have a recent order that's eligible for return. Would you like me to start the return process for you?",
        suggestions: ['Start return process', 'Check return policy', 'Track return status', 'Get refund timeline'],
        quickActions: [
          { label: 'Start Return', action: 'start_return', icon: '🔄' },
          { label: 'Return Policy', action: 'return_policy', icon: '📋' }
        ]
      }
    }

    // Product recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return {
        content: "I'd be happy to recommend products for you! Based on your recent purchases, I can suggest some great streetwear items. What style are you looking for? Sneakers, hoodies, or accessories?",
        suggestions: ['Show sneaker recommendations', 'Browse hoodies', 'See accessories', 'Get style advice'],
        quickActions: [
          { label: 'Sneakers', action: 'recommend_sneakers', icon: '👟' },
          { label: 'Hoodies', action: 'recommend_hoodies', icon: '👕' },
          { label: 'Accessories', action: 'recommend_accessories', icon: '🎒' }
        ]
      }
    }

    // Human agent
    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('speak to')) {
      return {
        content: "I understand you'd like to speak with a human agent. I can connect you with our support team right away. They're available 24/7 and can help with any complex issues. Would you like me to transfer you now?",
        suggestions: ['Transfer to agent', 'Schedule callback', 'Leave message', 'Check wait time'],
        quickActions: [
          { label: 'Transfer Now', action: 'transfer_agent', icon: '👤' },
          { label: 'Schedule Callback', action: 'schedule_callback', icon: '📅' }
        ]
      }
    }

    // Account balance
    if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
      return {
        content: "I can help you check your account information! Your current account balance is $0.00, and you have 1,250 StreetStashed points. You also have 2 active orders and 1 pending return. Is there anything specific about your account you'd like to know?",
        suggestions: ['View points history', 'Check order history', 'Update payment method', 'View profile'],
        quickActions: [
          { label: 'Account Dashboard', action: 'view_dashboard', icon: '📊' },
          { label: 'Points History', action: 'points_history', icon: '⭐' }
        ]
      }
    }

    // Default response
    return {
      content: "I understand you're looking for help. I can assist you with order tracking, returns, product recommendations, account questions, and more. What would you like to know?",
      suggestions: ['Track my order', 'Start a return', 'Get recommendations', 'Check my account', 'Speak to human agent'],
      quickActions: [
        { label: 'Order Help', action: 'order_help', icon: '📦' },
        { label: 'Returns', action: 'returns', icon: '🔄' },
        { label: 'Support', action: 'support', icon: '💬' }
      ]
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    handleSendMessage(suggestion)
  }

  // Handle quick action
  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      'order_status': 'I can help you check your order status. Let me look that up for you.',
      'returns': 'I can help you with returns and refunds. What would you like to return?',
      'support': 'I\'m here to help! What can I assist you with today?',
      'recommendations': 'I\'d love to recommend some products for you. What style are you interested in?',
      'view_tracking': 'Let me show you the detailed tracking information for your order.',
      'contact_driver': 'I can help you contact your driver. Let me get that information for you.',
      'start_return': 'I\'ll help you start the return process. Which item would you like to return?',
      'return_policy': 'Here\'s our return policy information for you.',
      'recommend_sneakers': 'Great choice! Let me show you some trending sneakers.',
      'recommend_hoodies': 'I\'ll find some great hoodies for you.',
      'recommend_accessories': 'Let me show you some stylish accessories.',
      'transfer_agent': 'I\'ll transfer you to a human agent right away.',
      'schedule_callback': 'I can schedule a callback for you. When would be convenient?',
      'view_dashboard': 'Let me show you your account dashboard.',
      'points_history': 'I\'ll show you your points history and rewards.',
      'order_help': 'I can help you with any order-related questions.'
    }

    const message = actionMessages[action] || 'I can help you with that. Let me assist you.'
    handleSendMessage(message)
  }

  // Handle message rating
  const handleMessageRating = (messageId: string, isHelpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isHelpful } : msg
    ))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-ink-900 rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden border border-ink-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-ink-400 text-sm">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.type === 'user' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-ink-800 text-white'
              } rounded-lg p-3`}>
                {message.type === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                )}
                
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs underline hover:no-underline"
                      >
                        📎 {attachment.name}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                  
                  {message.type === 'bot' && message.id !== 'welcome' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMessageRating(message.id, true)}
                        className={`p-1 rounded ${
                          message.isHelpful === true ? 'bg-green-500 text-white' : 'hover:bg-ink-700'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMessageRating(message.id, false)}
                        className={`p-1 rounded ${
                          message.isHelpful === false ? 'bg-red-500 text-white' : 'hover:bg-ink-700'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-ink-800 text-white rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-ink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {_showSuggestions && messages.length > 0 && messages[messages.length - 1].suggestions && (
          <div className="p-4 border-t border-ink-700">
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length > 0 && messages[messages.length - 1].quickActions && (
          <div className="p-4 border-t border-ink-700">
            <div className="grid grid-cols-2 gap-2">
              {messages[messages.length - 1].quickActions?.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-2 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white p-3 rounded-lg transition-colors"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-ink-700">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-ink-400 hover:text-white transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 pr-20"
              />
              <button
                onClick={handleVoiceInput}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                  isListening ? 'text-red-400 bg-red-500/20' : 'text-ink-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() && attachments.length === 0}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-ink-800 rounded-lg px-3 py-1">
                  <span className="text-ink-300 text-sm">{file.name}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-ink-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
