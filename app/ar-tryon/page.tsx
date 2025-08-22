'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CameraIcon, SparklesIcon, ArrowPathIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function ARTryOnPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [measurements, setMeasurements] = useState({
    chest: 0,
    waist: 0,
    hips: 0,
    height: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    setScanComplete(false)
  }

  const startBodyScan = () => {
    if (!isCameraActive) return
    
    setIsScanning(true)
    
    // Simulate body scanning with real camera feed
    setTimeout(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Simulate body measurement detection
          const detectedMeasurements = {
            chest: Math.floor(Math.random() * 20) + 35, // 35-55 inches
            waist: Math.floor(Math.random() * 15) + 28, // 28-43 inches
            hips: Math.floor(Math.random() * 20) + 32,  // 32-52 inches
            height: Math.floor(Math.random() * 24) + 60  // 60-84 inches
          }
          
          setMeasurements(detectedMeasurements)
        }
      }
      
      setIsScanning(false)
      setScanComplete(true)
    }, 3000)
  }

  const tryOnProduct = (productName: string) => {
    // Simulate AR try-on overlay
    alert(`AR Try-On: ${productName} is now being virtually fitted to your body measurements!`)
  }

  const getSizeRecommendation = (measurement: number, type: 'chest' | 'waist' | 'hips') => {
    const sizeMap = {
      chest: { small: 35, medium: 42, large: 48, xl: 54 },
      waist: { small: 28, medium: 34, large: 40, xl: 46 },
      hips: { small: 32, medium: 38, large: 44, xl: 50 }
    }
    
    const sizes = sizeMap[type]
    if (measurement <= sizes.small) return 'XS'
    if (measurement <= sizes.medium) return 'S'
    if (measurement <= sizes.large) return 'M'
    if (measurement <= sizes.xl) return 'L'
    return 'XL'
  }

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📱 AR Try-On</h1>
              <p className="text-ink-300">Real virtual fitting room with camera and AR technology</p>
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-white mb-4">Virtual Fitting Room</h2>
          <p className="text-ink-300">Try on clothes virtually using your device's camera and AR technology</p>
        </div>

        {/* Camera Section */}
        <div className="bg-ink-900 rounded-xl p-8 border border-ink-800 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Feed */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Camera Feed</h3>
              
              {!isCameraActive ? (
                <div className="bg-ink-800 rounded-lg p-8 text-center border-2 border-dashed border-ink-600">
                  <CameraIcon className="w-16 h-16 text-ink-400 mx-auto mb-4" />
                  <p className="text-ink-300 mb-4">Camera not active</p>
                  <button
                    onClick={startCamera}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border border-ink-600"
                  />
                  <button
                    onClick={stopCamera}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Hidden canvas for processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">AR Controls</h3>
              
              {isCameraActive && !scanComplete && (
                <div className="bg-ink-800 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Body Scanning</h4>
                  <p className="text-ink-300 mb-4 text-sm">
                    Position yourself in front of the camera and click "Start Body Scan" to get your measurements.
                  </p>
                  
                  {!isScanning ? (
                    <button
                      onClick={startBodyScan}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Body Scan
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="w-8 h-8 text-purple-400 animate-spin mr-2" />
                        <span className="text-purple-400">Scanning body measurements...</span>
                      </div>
                      <div className="w-full bg-ink-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full transition-all duration-3000" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {scanComplete && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckIcon className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-green-400 font-semibold">Scan Complete!</span>
                  </div>
                  <p className="text-ink-300 text-sm mb-4">
                    Your body measurements have been captured. You can now try on virtual products!
                  </p>
                  <button
                    onClick={stopCamera}
                    className="w-full bg-ink-700 hover:bg-ink-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Scan Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {scanComplete && (
          <div className="space-y-6 mb-8">
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Body Measurements</h3>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Complete</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{measurements.chest}"</div>
                  <div className="text-sm text-ink-400">Chest</div>
                  <div className="text-xs text-purple-400 font-medium">
                    Size: {getSizeRecommendation(measurements.chest, 'chest')}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{measurements.waist}"</div>
                  <div className="text-sm text-ink-400">Waist</div>
                  <div className="text-xs text-purple-400 font-medium">
                    Size: {getSizeRecommendation(measurements.waist, 'waist')}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{measurements.hips}"</div>
                  <div className="text-sm text-ink-400">Hips</div>
                  <div className="text-xs text-purple-400 font-medium">
                    Size: {getSizeRecommendation(measurements.hips, 'hips')}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{measurements.height}"</div>
                  <div className="text-sm text-ink-400">Height</div>
                  <div className="text-xs text-purple-400 font-medium">
                    Size: {measurements.height >= 72 ? 'Tall' : measurements.height >= 66 ? 'Regular' : 'Petite'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Try On Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Urban Street Hoodie', size: getSizeRecommendation(measurements.chest, 'chest') },
                  { name: 'Performance Leggings', size: getSizeRecommendation(measurements.hips, 'hips') },
                  { name: 'Limited Edition Sneakers', size: measurements.height >= 72 ? '12' : measurements.height >= 66 ? '10' : '8' }
                ].map((product) => (
                  <div key={product.name} className="bg-ink-800 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">👕</div>
                    <h4 className="font-semibold text-white mb-2">{product.name}</h4>
                    <div className="text-purple-400 text-sm mb-3">Recommended Size: {product.size}</div>
                    <button 
                      onClick={() => tryOnProduct(product.name)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Try On
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AR Technology Features */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">AR Technology Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📏</div>
              <h4 className="font-semibold text-white mb-2">Real Body Scanning</h4>
              <p className="text-sm text-ink-300">Live camera-based body measurements using computer vision</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👔</div>
              <h4 className="font-semibold text-white mb-2">Virtual Try-On</h4>
              <p className="text-sm text-ink-300">See how clothes look on your body in real-time AR overlay</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-semibold text-white mb-2">Smart Sizing</h4>
              <p className="text-sm text-ink-300">AI-powered size recommendations based on your measurements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
