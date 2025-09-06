'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Phone, Mail, Send, Paperclip, X, Search, User, Bot } from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  category: 'order' | 'return' | 'payment' | 'technical' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  messages: SupportMessage[]
  createdAt: string
  updatedAt: string
  assignedTo?: {
    name: string
    avatar: string
    department: string
  }
}

interface SupportMessage {
  id: string
  sender: 'user' | 'agent' | 'bot'
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  isRead: boolean
}

interface CustomerSupportSystemProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
  initialCategory?: string
}

export default function CustomerSupportSystem({
  isOpen,
  onClose,
  orderId: _orderId,
  initialCategory = 'general'
}: CustomerSupportSystemProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq'>('chat')
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null)
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data
  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Order not delivered',
      category: 'order',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-11T14:30:00Z',
      assignedTo: {
        name: 'Sarah Johnson',
        avatar: '/mock/agent-1.jpg',
        department: 'Order Support'
      },
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: 'You',
          content: 'Hi, my order #SS-2024-001234 was supposed to be delivered yesterday but I haven\'t received it yet.',
          timestamp: '2024-02-10T10:00:00Z',
          isRead: true
        },
        {
          id: '2',
          sender: 'agent',
          senderName: 'Sarah Johnson',
          senderAvatar: '/mock/agent-1.jpg',
          content: 'I apologize for the delay. Let me check the status of your order and get back to you with an update.',
          timestamp: '2024-02-10T10:15:00Z',
          isRead: true
        },
        {
          id: '3',
          sender: 'agent',
          senderName: 'Sarah Johnson',
          senderAvatar: '/mock/agent-1.jpg',
          content: 'I\'ve checked with our delivery team and your order is currently out for delivery. The driver should arrive within the next 2 hours. I\'ll send you a tracking link shortly.',
          timestamp: '2024-02-10T11:30:00Z',
          isRead: true
        }
      ]
    },
    {
      id: '2',
      subject: 'Return request status',
      category: 'return',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2024-02-08T15:20:00Z',
      updatedAt: '2024-02-09T09:45:00Z',
      assignedTo: {
        name: 'Mike Chen',
        avatar: '/mock/agent-2.jpg',
        department: 'Returns'
      },
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: 'You',
          content: 'I submitted a return request 3 days ago but haven\'t heard back yet. Can you check the status?',
          timestamp: '2024-02-08T15:20:00Z',
          isRead: true
        },
        {
          id: '2',
          sender: 'agent',
          senderName: 'Mike Chen',
          senderAvatar: '/mock/agent-2.jpg',
          content: 'Your return request has been approved! I\'ve sent you a prepaid return label via email. You should receive it within the next few minutes.',
          timestamp: '2024-02-09T09:45:00Z',
          isRead: true
        }
      ]
    }
  ]

  const faqCategories = [
    {
      category: 'Orders',
      questions: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Same-day delivery is available in select areas.'
        },
        {
          question: 'Can I track my order?',
          answer: 'Yes! You can track your order in real-time through your account dashboard or by using the tracking number sent to your email.'
        },
        {
          question: 'What if my order is delayed?',
          answer: 'If your order is delayed, we\'ll notify you via email and SMS. You can also contact our support team for assistance.'
        }
      ]
    },
    {
      category: 'Returns',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items may have different return policies.'
        },
        {
          question: 'How do I start a return?',
          answer: 'You can start a return through your account dashboard or by contacting our support team. We\'ll provide you with a prepaid return label.'
        },
        {
          question: 'How long does it take to process a return?',
          answer: 'Returns are typically processed within 3-5 business days after we receive the item. Refunds are issued within 5-7 business days.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and cryptocurrency payments.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard encryption and never store your full payment information on our servers.'
        },
        {
          question: 'Can I change my payment method?',
          answer: 'Yes, you can update your payment method in your account settings or during checkout.'
        }
      ]
    }
  ]

  const quickReplies = [
    'Track my order',
    'Start a return',
    'Update payment method',
    'Cancel my order',
    'Speak to a human agent'
  ]

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentTicket?.messages])

  // Handle message send
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return

    setIsSubmitting(true)
    setIsTyping(true)

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newMessage: SupportMessage = {
        id: Date.now().toString(),
        sender: 'user',
        senderName: 'You',
        content: message,
        timestamp: new Date().toISOString(),
        attachments: attachments.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type
        })),
        isRead: true
      }

      if (currentTicket) {
        setCurrentTicket(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date().toISOString()
        } : null)
      }

      setMessage('')
      setAttachments([])

      // Simulate agent response
      setTimeout(() => {
        const agentResponse: SupportMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          senderName: 'Support Agent',
          senderAvatar: '/mock/agent-1.jpg',
          content: 'Thank you for your message. I\'m looking into this for you and will get back to you shortly.',
          timestamp: new Date().toISOString(),
          isRead: false
        }

        setCurrentTicket(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentResponse],
          updatedAt: new Date().toISOString()
        } : null)

        setIsTyping(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  // Handle new ticket creation
  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) return

    setIsSubmitting(true)
    try {
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        subject: ticketSubject,
        category: selectedCategory as any,
        priority: selectedPriority,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [{
          id: '1',
          sender: 'user',
          senderName: 'You',
          content: ticketDescription,
          timestamp: new Date().toISOString(),
          isRead: true
        }]
      }

      setCurrentTicket(newTicket)
      setTicketSubject('')
      setTicketDescription('')
      setActiveTab('chat')
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter tickets based on search
  const filteredTickets = mockTickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-ink-900 rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden border border-ink-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-700">
          <div className="flex items-center space-x-4">
            <MessageCircle className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Customer Support</h2>
              <p className="text-ink-400">We&apos;re here to help you 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-80 border-r border-ink-700 bg-ink-800/50">
            {/* Tabs */}
            <div className="flex border-b border-ink-700">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-white border-b-2 border-purple-500' 
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'tickets' 
                    ? 'text-white border-b-2 border-purple-500' 
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                Tickets
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'faq' 
                    ? 'text-white border-b-2 border-purple-500' 
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                FAQ
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(reply)}
                          className="w-full text-left p-2 bg-ink-700 hover:bg-ink-600 rounded-lg text-ink-300 hover:text-white transition-colors text-sm"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Contact Options</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 p-3 bg-ink-700 hover:bg-ink-600 rounded-lg transition-colors">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span className="text-ink-300">Call Support</span>
                        <span className="text-ink-500 text-xs ml-auto">+1 (555) 123-4567</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-ink-700 hover:bg-ink-600 rounded-lg transition-colors">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-ink-300">Email Support</span>
                        <span className="text-ink-500 text-xs ml-auto">support@streetstashed.com</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Your Tickets</h3>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tickets..."
                        className="w-full bg-ink-700 border border-ink-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setCurrentTicket(ticket)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentTicket?.id === ticket.id 
                            ? 'bg-purple-500/20 border border-purple-500/50' 
                            : 'bg-ink-700 hover:bg-ink-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm line-clamp-1">
                            {ticket.subject}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                            ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-ink-400 text-xs">
                          {ticket.category} • {new Date(ticket.updatedAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentTicket(null)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    New Ticket
                  </button>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold mb-3">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {faqCategories.map((category, index) => (
                      <div key={index}>
                        <h4 className="text-ink-300 font-medium mb-2">{category.category}</h4>
                        <div className="space-y-2">
                          {category.questions.map((faq, faqIndex) => (
                            <div key={faqIndex} className="bg-ink-700 rounded-lg p-3">
                              <p className="text-white text-sm font-medium mb-1">{faq.question}</p>
                              <p className="text-ink-400 text-xs">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'chat' && (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-ink-700">
                  {currentTicket ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Ticket #{currentTicket.id}</h3>
                        <p className="text-ink-400 text-sm">{currentTicket.subject}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Live Chat</h3>
                        <p className="text-ink-400 text-sm">Start a conversation with our support team</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentTicket?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.sender === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-ink-800 text-white'
                      } rounded-lg p-3`}>
                        {msg.sender !== 'user' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <img
                              src={msg.senderAvatar || '/mock/agent-1.jpg'}
                              alt={msg.senderName}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs font-medium">{msg.senderName}</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((attachment, index) => (
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
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
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
                          <span className="text-xs">Agent is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
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
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSubmitting || (!message.trim() && attachments.length === 0)}
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
              </>
            )}

            {activeTab === 'tickets' && !currentTicket && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-ink-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-ink-300 mb-2">No ticket selected</h3>
                  <p className="text-ink-400 mb-6">Select a ticket from the sidebar or create a new one</p>
                  <button
                    onClick={() => setCurrentTicket(null)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Create New Ticket
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && !currentTicket && (
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Ticket</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-ink-300 text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue..."
                      className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-ink-300 text-sm font-medium mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="order">Order Issue</option>
                        <option value="return">Return/Exchange</option>
                        <option value="payment">Payment Issue</option>
                        <option value="technical">Technical Support</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-ink-300 text-sm font-medium mb-2">Priority</label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as any)}
                        className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-ink-300 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                      className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white placeholder-ink-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <button
                    onClick={handleCreateTicket}
                    disabled={isSubmitting || !ticketSubject.trim() || !ticketDescription.trim()}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
