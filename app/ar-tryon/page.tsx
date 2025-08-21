'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CameraIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function ARTryOnPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)

  const startScan = () => {
    setIsScanning(true)
    // Simulate AR scanning
    setTimeout(() => {
      setIsScanning(false)
      setScanComplete(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📱 AR Try-On</h1>
              <p className="text-ink-300">Virtual fitting room with augmented reality technology</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-white mb-4">Virtual Fitting Room</h2>
          <p className="text-ink-300">Try on clothes virtually using your device's camera and AR technology</p>
        </div>

        {!scanComplete ? (
          <div className="bg-ink-900 rounded-xl p-8 border border-ink-800 text-center">
            <div className="mb-6">
              <CameraIcon className="w-16 h-16 text-purple-400 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Start AR Try-On</h3>
            <p className="text-ink-300 mb-6">
              Position yourself in front of your camera and we'll create a virtual fitting room experience
            </p>
            
            {!isScanning ? (
              <button
                onClick={startScan}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <div className="space-y-4">
                <ArrowPathIcon className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
                <p className="text-purple-400">Scanning your body measurements...</p>
                <div className="w-full bg-ink-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-3000" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Body Measurements</h3>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Complete</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">42"</div>
                  <div className="text-sm text-ink-400">Chest</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">32"</div>
                  <div className="text-sm text-ink-400">Waist</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">34"</div>
                  <div className="text-sm text-ink-400">Hips</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">10</div>
                  <div className="text-sm text-ink-400">Shoe Size</div>
                </div>
              </div>
            </div>

            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Try On Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Urban Street Hoodie', 'Performance Leggings', 'Limited Edition Sneakers'].map((product) => (
                  <div key={product} className="bg-ink-800 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">👕</div>
                    <h4 className="font-semibold text-white mb-2">{product}</h4>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition-colors">
                      Try On
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setScanComplete(false)}
                className="bg-ink-800 hover:bg-ink-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">AR Technology Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📏</div>
              <h4 className="font-semibold text-white mb-2">Body Scanning</h4>
              <p className="text-sm text-ink-300">Accurate body measurements using computer vision</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👔</div>
              <h4 className="font-semibold text-white mb-2">Virtual Try-On</h4>
              <p className="text-sm text-ink-300">See how clothes look on your body in real-time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-semibold text-white mb-2">Smart Sizing</h4>
              <p className="text-sm text-ink-300">AI-powered size recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
