'use client'

import { useState } from 'react'
import CustomerSupportSystem from '@/components/support/CustomerSupportSystem'
import { MessageCircle, Phone, Mail, HelpCircle, Shield, Zap } from 'lucide-react'

export default function SupportPage() {
  const [showSupportSystem, setShowSupportSystem] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Support Center</h1>
          <p className="text-xl text-ink-300 max-w-3xl mx-auto">
            Get help with your orders, returns, payments, and more. Our support team is here 24/7.
          </p>
        </div>

        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <button
            onClick={() => setShowSupportSystem(true)}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 group"
          >
            <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
            <p className="text-ink-300 text-sm">Get instant help from our support team</p>
          </button>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-8 text-center">
            <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Phone Support</h3>
            <p className="text-ink-300 text-sm mb-2">+1 (555) 123-4567</p>
            <p className="text-ink-400 text-xs">Mon-Fri 9AM-6PM EST</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-8 text-center">
            <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-ink-300 text-sm mb-2">support@streetstashed.com</p>
            <p className="text-ink-400 text-xs">Response within 2 hours</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-8 text-center">
            <HelpCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Help Center</h3>
            <p className="text-ink-300 text-sm">Browse our knowledge base</p>
          </div>
        </div>

        {/* Support Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">24/7 Support</h3>
                <p className="text-ink-300">Always here when you need us</p>
              </div>
            </div>
            <ul className="space-y-3 text-ink-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Live chat with real agents</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Phone support during business hours</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Email support with quick response</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Comprehensive FAQ section</span>
              </li>
            </ul>
          </div>

          <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Quick Resolution</h3>
                <p className="text-ink-300">Fast and efficient problem solving</p>
              </div>
            </div>
            <ul className="space-y-3 text-ink-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Average response time: 2 minutes</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>95% of issues resolved in first contact</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Multi-language support available</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Follow-up on all resolved tickets</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Common Issues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Order Tracking</h3>
              <p className="text-ink-300 text-sm mb-4">Can&apos;t find your order or need tracking updates?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Returns & Exchanges</h3>
              <p className="text-ink-300 text-sm mb-4">Need to return or exchange an item?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Payment Issues</h3>
              <p className="text-ink-300 text-sm mb-4">Problems with payment or billing?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Account Problems</h3>
              <p className="text-ink-300 text-sm mb-4">Can&apos;t access your account or need to update info?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Technical Support</h3>
              <p className="text-ink-300 text-sm mb-4">App or website not working properly?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>

            <div className="bg-ink-800 rounded-xl p-6 hover:bg-ink-700 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">General Questions</h3>
              <p className="text-ink-300 text-sm mb-4">Have a question about our services?</p>
              <button
                onClick={() => setShowSupportSystem(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Get Help →
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-400/20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-ink-300 text-lg mb-6">
            Our support team is ready to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowSupportSystem(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Live Chat</span>
            </button>
            <a
              href="mailto:support@streetstashed.com"
              className="bg-ink-800 hover:bg-ink-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Send Email</span>
            </a>
          </div>
        </div>
      </div>

      {/* Customer Support System Modal */}
      <CustomerSupportSystem
        isOpen={showSupportSystem}
        onClose={() => setShowSupportSystem(false)}
      />
    </div>
  )
}
