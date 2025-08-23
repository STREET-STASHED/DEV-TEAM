'use client'

import { useState } from 'react'

export default function AIStylistPage() {
  const [products] = useState(5)
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!name.trim()) return
    
    setIsAnalyzing(true)
    setCurrentStep(2)
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCurrentStep(3)
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-ink-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Stylist - Simple Test</h1>
        
        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              1
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              2
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Name Input */}
        {currentStep === 1 && (
          <div className="bg-ink-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Enter Your Name</h2>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-4 py-2 text-white mb-4"
            />
            <div className="text-sm text-ink-400 mb-4">
              Available Products: {products}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!name.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              Start AI Analysis
            </button>
          </div>
        )}

        {/* Step 2: Analysis */}
        {currentStep === 2 && (
          <div className="bg-ink-900 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">AI Analysis in Progress</h2>
            {isAnalyzing && (
              <div className="text-blue-400">
                Analyzing your style preferences...
              </div>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <div className="bg-ink-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">AI Analysis Complete!</h2>
            <p className="text-ink-300 mb-4">
              Hello {name}! We&apos;ve analyzed {products} products and created personalized recommendations for you.
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
