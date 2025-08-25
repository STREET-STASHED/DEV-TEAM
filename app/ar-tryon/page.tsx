'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CameraIcon,
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ARProduct {
  id: string
  name: string
  category: string
  image: string
  price: number
  colors: string[]
  sizes: string[]
}

interface BodyMeasurements {
  height: number
  weight: number
  chest: number
  waist: number
  hips: number
  inseam: number
  shoulder: number
}

export default function ARTryOnPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<ARProduct | null>(null)
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements | null>(null)
  const [arOverlay, setArOverlay] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [recommendedSize, setRecommendedSize] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  // Check browser compatibility for camera and AR features
  const [isBrowserCompatible, setIsBrowserCompatible] = useState(false)
  
  // Set browser compatibility on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasCanvas = !!document.createElement('canvas').getContext
      const hasWebGL = !!window.WebGLRenderingContext
      
      setIsBrowserCompatible(hasGetUserMedia && hasCanvas && hasWebGL)
      
      if (!hasGetUserMedia) {
        setDebugInfo('Camera not supported in this browser')
      } else if (!hasCanvas) {
        setDebugInfo('Canvas not supported in this browser')
      } else if (!hasWebGL) {
        setDebugInfo('WebGL not supported in this browser')
      } else {
        setDebugInfo('Browser is compatible with AR features')
      }
    }
  }, [])

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    if (!isBrowserCompatible) {
      setCameraError('AR features not supported in this browser')
      return false
    }

    setIsCameraLoading(true)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true)
          setIsCameraLoading(false)
        }
        videoRef.current.onerror = () => {
          throw new Error('Failed to load video stream')
        }
      }

      return true
    } catch (error) {
      console.error('Camera initialization error:', error)
      setCameraError('Failed to access camera. Please check permissions.')
      setIsCameraLoading(false)
      return false
    }
  }, [isBrowserCompatible])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }, [])

  // Start body scanning
  const startBodyScan = async () => {
    if (!isCameraActive || !isBrowserCompatible) {
      alert('Please activate camera first')
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setIsProcessing(true)

    try {
      // Simulate body scanning process
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Generate mock body measurements
      const measurements: BodyMeasurements = {
        height: 170 + Math.random() * 30, // 170-200 cm
        weight: 60 + Math.random() * 40, // 60-100 kg
        chest: 85 + Math.random() * 20, // 85-105 cm
        waist: 70 + Math.random() * 25, // 70-95 cm
        hips: 90 + Math.random() * 20, // 90-110 cm
        inseam: 70 + Math.random() * 15, // 70-85 cm
        shoulder: 40 + Math.random() * 10 // 40-50 cm
      }

      setBodyMeasurements(measurements)
      setScanProgress(100)
      
      // Show success message
      setTimeout(() => {
        alert('Body scan complete! You can now try on products.')
      }, 500)

    } catch (error) {
      console.error('Body scanning error:', error)
      alert('Body scanning failed. Please try again.')
    } finally {
      setIsScanning(false)
      setIsProcessing(false)
    }
  }

  // Try on product with AR
  const tryOnProduct = useCallback(async (product: ARProduct) => {
    if (!isBrowserCompatible) {
      alert('AR features not supported in this browser')
      return
    }
    
    if (!bodyMeasurements) {
      alert('Please complete body scanning first')
      return
    }

    setCurrentProduct(product)
    setArOverlay(true)
    setIsProcessing(true)

    // Simulate AR processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Calculate recommended size based on measurements
    const sizeMap: { [key: string]: string } = {
      'S': 'Small',
      'M': 'Medium', 
      'L': 'Large',
      'XL': 'Extra Large'
    }
    
    let recommended = 'M'
    if (bodyMeasurements.chest < 90) recommended = 'S'
    else if (bodyMeasurements.chest > 105) recommended = 'L'
    else if (bodyMeasurements.chest > 115) recommended = 'XL'
    
    setRecommendedSize(sizeMap[recommended] || 'Medium')
    setIsProcessing(false)
  }, [bodyMeasurements, isBrowserCompatible])

  // Capture photo with AR overlay
  const capturePhoto = useCallback(() => {
    if (!isBrowserCompatible || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (ctx) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame
      ctx.drawImage(video, 0, 0)
      
      // Add AR overlay if active
      if (arOverlay && currentProduct) {
        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(138, 43, 226, 0.3)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add product info overlay
        ctx.fillStyle = 'white'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${currentProduct.name} - AR Try-On`, canvas.width / 2, 50)
        ctx.fillText(`Recommended Size: ${recommendedSize}`, canvas.width / 2, 80)
        
        // Add brand logo or icon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fillRect(canvas.width - 100, 20, 80, 80)
        ctx.fillStyle = '#8A2BE2'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('AR', canvas.width - 60, 65)
      }
      
      // Convert to data URL and save
      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
    }
  }, [arOverlay, currentProduct, recommendedSize, isBrowserCompatible])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Mock products for demo
  const mockProducts: ARProduct[] = [
    {
      id: 'ar-1',
      name: 'Urban Street Hoodie',
      category: 'Clothing',
      image: '/mock/default-product.jpg',
      price: 89.99,
      colors: ['Black', 'Gray', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'ar-2',
      name: 'Vintage Denim Jacket',
      category: 'Clothing',
      image: '/mock/default-product.jpg',
      price: 145,
      colors: ['Blue', 'Light Blue', 'Black'],
      sizes: ['M', 'L', 'XL']
    },
    {
      id: 'ar-3',
      name: 'Street Style Sneakers',
      category: 'Footwear',
      image: '/mock/default-product.jpg',
      price: 120,
      colors: ['White', 'Black', 'Red'],
      sizes: ['7', '8', '9', '10', '11']
    }
  ]

  return (
    <div className="min-h-screen bg-ink-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6">
              <CameraIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AR Virtual Try-On</h1>
            <p className="text-xl text-ink-300">Try on clothes virtually with augmented reality</p>
          </div>

          {/* Browser Compatibility Check */}
          {!isBrowserCompatible && (
            <div className="mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-center">
                Your browser doesn&apos;t support AR features. Please use a modern browser with camera support.
              </p>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-6 bg-ink-800/50 border border-ink-600 rounded-lg p-3">
              <p className="text-ink-300 text-sm text-center">{debugInfo}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Camera & AR */}
            <div className="space-y-6">
              {/* Camera Controls */}
              <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                <h3 className="text-lg font-semibold mb-4">Camera Setup</h3>
                
                <div className="space-y-4">
                  {!isCameraActive ? (
                    <button
                      onClick={initializeCamera}
                      disabled={isCameraLoading || !isBrowserCompatible}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isCameraLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Initializing Camera...</span>
                        </>
                      ) : (
                        <>
                          <CameraIcon className="w-5 h-5" />
                          <span>Start Camera</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Stop Camera</span>
                    </button>
                  )}

                  {cameraError && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Feed */}
              {isCameraActive && (
                <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                  <h3 className="text-lg font-semibold mb-4">Camera Feed</h3>
                  
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-lg bg-ink-800"
                    />
                    
                    {/* AR Overlay Indicator */}
                    {arOverlay && currentProduct && (
                      <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        AR Active: {currentProduct.name}
                      </div>
                    )}
                  </div>

                  {/* Camera Actions */}
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraActive}
                      className="flex-1 bg-brand-600 text-ink-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Body Scanning */}
              <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                <h3 className="text-lg font-semibold mb-4">Body Measurements</h3>
                
                {!bodyMeasurements ? (
                  <div className="space-y-4">
                    <p className="text-ink-300 text-sm">
                      Scan your body to get accurate size recommendations for virtual try-on.
                    </p>
                    
                    <button
                      onClick={startBodyScan}
                      disabled={!isCameraActive || isScanning}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isScanning ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Scanning... {scanProgress}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowPathIcon className="w-5 h-5" />
                          <span>Start Body Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-ink-800 rounded-lg p-3">
                        <span className="text-ink-400">Height:</span>
                        <p className="text-white font-medium">{bodyMeasurements.height.toFixed(1)} cm</p>
                      </div>
                      <div className="bg-ink-800 rounded-lg p-3">
                        <span className="text-ink-400">Weight:</span>
                        <p className="text-white font-medium">{bodyMeasurements.weight.toFixed(1)} kg</p>
                      </div>
                      <div className="bg-ink-800 rounded-lg p-3">
                        <span className="text-ink-400">Chest:</span>
                        <p className="text-white font-medium">{bodyMeasurements.chest.toFixed(1)} cm</p>
                      </div>
                      <div className="bg-ink-800 rounded-lg p-3">
                        <span className="text-ink-400">Waist:</span>
                        <p className="text-white font-medium">{bodyMeasurements.waist.toFixed(1)} cm</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setBodyMeasurements(null)}
                      className="w-full bg-ink-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-ink-600 transition-colors"
                    >
                      Reset Measurements
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden Canvas for Photo Capture */}
              <canvas
                ref={canvasRef}
                className="hidden"
                style={{ display: 'none' }}
              />
            </div>

            {/* Right Column - Products & Results */}
            <div className="space-y-6">
              {/* Available Products */}
              <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                <h3 className="text-lg font-semibold mb-4">Try On Products</h3>
                
                <div className="space-y-3">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-3 bg-ink-800 rounded-lg">
                      <div className="w-16 h-16 bg-ink-700 rounded-lg flex items-center justify-center">
                        <CameraIcon className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-ink-400">{product.category}</p>
                        <p className="text-sm text-brand-400">${product.price}</p>
                      </div>
                      <button
                        onClick={() => tryOnProduct(product)}
                        disabled={!bodyMeasurements || isProcessing}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isProcessing && currentProduct?.id === product.id ? 'Processing...' : 'Try On'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AR Results */}
              {arOverlay && currentProduct && (
                <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                  <h3 className="text-lg font-semibold mb-4">AR Try-On Results</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-ink-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2">{currentProduct.name}</h4>
                      <p className="text-sm text-ink-400 mb-3">
                        Based on your body measurements, here&apos;s what we recommend:
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-300">Recommended Size:</span>
                          <span className="text-brand-400 font-medium">{recommendedSize}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-300">Fit Confidence:</span>
                          <span className="text-green-400 font-medium">85%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-300">Price:</span>
                          <span className="text-white font-medium">${currentProduct.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/buyer/marketplace/product/${currentProduct.id}`)}
                        className="flex-1 bg-brand-600 text-ink-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 transition-colors"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => setArOverlay(false)}
                        className="flex-1 bg-ink-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-ink-600 transition-colors"
                      >
                        Close AR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Captured Photo */}
              {capturedImage && (
                <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                  <h3 className="text-lg font-semibold mb-4">Captured Photo</h3>
                  
                  <div className="space-y-4">
                    <img
                      src={capturedImage}
                      alt="AR Try-On Capture"
                      className="w-full rounded-lg border border-ink-600"
                    />
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.download = 'ar-tryon-capture.png'
                          link.href = capturedImage
                          link.click()
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Download Photo
                      </button>
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="flex-1 bg-ink-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-ink-600 transition-colors"
                      >
                        Clear Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-ink-900/50 rounded-lg p-6 border border-ink-700">
            <h3 className="text-lg font-semibold mb-4 text-center">How to Use AR Try-On</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-medium">Start Camera</h4>
                <p className="text-sm text-ink-300">Allow camera access and position yourself in frame</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-medium">Body Scan</h4>
                <p className="text-sm text-ink-300">Complete body measurement scan for accurate sizing</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-medium">Try On</h4>
                <p className="text-sm text-ink-300">Select products and see how they look on you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
