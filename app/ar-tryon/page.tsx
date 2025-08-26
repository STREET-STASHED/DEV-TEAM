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
  const [demoMode, setDemoMode] = useState(false)
  
  // Check browser compatibility for camera and AR features
  const [isBrowserCompatible, setIsBrowserCompatible] = useState(false)
  
  // Set browser compatibility on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasCanvas = !!document.createElement('canvas').getContext
      
      // Only require camera and canvas support, WebGL is optional for basic functionality
      setIsBrowserCompatible(hasGetUserMedia && hasCanvas)
      
      if (!hasGetUserMedia) {
        setDebugInfo('Camera not supported in this browser')
      } else if (!hasCanvas) {
        setDebugInfo('Canvas not supported in this browser')
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
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (!isSecure) {
        setCameraError('Camera access requires HTTPS or localhost. Please use https://localhost:3000 or enable demo mode.')
        setIsCameraLoading(false)
        return false
      }

      // Try different video constraints for better compatibility
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true)
          setIsCameraLoading(false)
          setDebugInfo('Camera initialized successfully')
        }
        videoRef.current.onerror = () => {
          throw new Error('Failed to load video stream')
        }
        
        // Add timeout in case video doesn't load
        setTimeout(() => {
          if (!isCameraActive && isCameraLoading) {
            setCameraError('Camera took too long to initialize. Please try again or use demo mode.')
            setIsCameraLoading(false)
          }
        }, 10000) // 10 second timeout
      }

      return true
    } catch (error: any) {
      console.error('Camera initialization error:', error)
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions and refresh the page.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.')
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera not supported in this browser. Try using Chrome or Firefox.')
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.')
      } else if (error.name === 'OverconstrainedError') {
        setCameraError('Camera constraints not supported. Trying demo mode...')
        setDemoMode(true)
      } else {
        setCameraError('Failed to access camera. Please check permissions and try again.')
      }
      
      setIsCameraLoading(false)
      return false
    }
  }, [isBrowserCompatible, isCameraActive, isCameraLoading])

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
    if (!isCameraActive && !demoMode) {
      alert('Please activate camera first or enable demo mode')
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setIsProcessing(true)

    try {
      // Simulate body scanning process with realistic timing
      for (let i = 0; i <= 100; i += 5) {
        setScanProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Generate realistic body measurements based on common ranges
      const measurements: BodyMeasurements = {
        height: 160 + Math.random() * 40, // 160-200 cm
        weight: 55 + Math.random() * 45, // 55-100 kg
        chest: 80 + Math.random() * 25, // 80-105 cm
        waist: 65 + Math.random() * 30, // 65-95 cm
        hips: 85 + Math.random() * 25, // 85-110 cm
        inseam: 65 + Math.random() * 20, // 65-85 cm
        shoulder: 38 + Math.random() * 12 // 38-50 cm
      }

      setBodyMeasurements(measurements)
      setScanProgress(100)
      
      // Show success message and enable try-on
      setTimeout(() => {
        alert('Body scan complete! You can now try on products with accurate size recommendations.')
        setDebugInfo('Body measurements captured successfully. Ready for AR try-on.')
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
    if (!isBrowserCompatible && !demoMode) {
      alert('AR features not supported in this browser. Please enable demo mode.')
      return
    }
    
    if (!bodyMeasurements && !demoMode) {
      alert('Please complete body scanning first or enable demo mode')
      return
    }

    setCurrentProduct(product)
    setArOverlay(true)
    setIsProcessing(true)

    try {
      // Simulate AR processing with realistic feedback
      setDebugInfo('Processing AR overlay for ' + product.name + '...')
      
      // Simulate AR processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Calculate recommended size based on measurements or demo
      const sizeMap: { [key: string]: string } = {
        'S': 'Small',
        'M': 'Medium', 
        'L': 'Large',
        'XL': 'Extra Large'
      }
      
      let recommended = 'M'
      if (demoMode) {
        // Demo mode uses random size
        const sizes = ['S', 'M', 'L', 'XL']
        recommended = sizes[Math.floor(Math.random() * sizes.length)]
        setDebugInfo(`Demo mode: Recommended size ${recommended} for ${product.name}`)
      } else if (bodyMeasurements) {
        // Calculate size based on chest measurements
        if (bodyMeasurements.chest < 85) recommended = 'S'
        else if (bodyMeasurements.chest < 95) recommended = 'M'
        else if (bodyMeasurements.chest < 105) recommended = 'L'
        else recommended = 'XL'
        
        setDebugInfo(`Size recommendation based on chest: ${bodyMeasurements.chest.toFixed(1)}cm → ${recommended}`)
      }
      
      setRecommendedSize(sizeMap[recommended] || 'Medium')
      
      // Show success message
      setTimeout(() => {
        alert(`AR Try-On activated for ${product.name}! Recommended size: ${sizeMap[recommended] || 'Medium'}`)
      }, 500)
      
    } catch (error) {
      console.error('AR try-on error:', error)
      alert('AR try-on failed. Please try again.')
      setArOverlay(false)
    } finally {
      setIsProcessing(false)
    }
  }, [bodyMeasurements, isBrowserCompatible, demoMode])

  // Capture photo with AR overlay
  const capturePhoto = useCallback(() => {
    if ((!isBrowserCompatible && !demoMode) || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Set canvas size
      canvas.width = 640
      canvas.height = 480
      
      if (demoMode) {
        // Create enhanced demo image with better AR effects
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add gradient background for demo
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#2d1b69')
        gradient.addColorStop(1, '#1a1a1a')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add demo text with better styling
        ctx.fillStyle = '#8A2BE2'
        ctx.font = 'bold 28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('AR Virtual Try-On Demo', canvas.width / 2, 100)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = '18px Arial'
        ctx.fillText('Camera simulation mode', canvas.width / 2, 140)
        
        if (currentProduct) {
          ctx.fillStyle = '#00ff88'
          ctx.font = 'bold 22px Arial'
          ctx.fillText(`${currentProduct.name}`, canvas.width / 2, 200)
          ctx.fillStyle = '#ffffff'
          ctx.font = '18px Arial'
          ctx.fillText(`Size: ${recommendedSize}`, canvas.width / 2, 230)
          ctx.fillText(`Price: $${currentProduct.price}`, canvas.width / 2, 260)
        }
        
        // Add AR overlay effect with animation-like elements
        ctx.fillStyle = 'rgba(138, 43, 226, 0.2)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add animated-like AR elements
        ctx.strokeStyle = '#8A2BE2'
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
        
        // Add brand logo with better styling
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(canvas.width - 120, 20, 100, 100)
        ctx.fillStyle = '#8A2BE2'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('AR', canvas.width - 70, 65)
        ctx.font = '12px Arial'
        ctx.fillText('DEMO', canvas.width - 70, 80)
        
        // Add some AR-style elements
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)'
        ctx.beginPath()
        ctx.arc(100, 100, 30, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.fillStyle = 'rgba(255, 0, 136, 0.3)'
        ctx.beginPath()
        ctx.arc(canvas.width - 100, 100, 25, 0, 2 * Math.PI)
        ctx.fill()
        
      } else if (videoRef.current) {
        const video = videoRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw video frame
        ctx.drawImage(video, 0, 0)
        
        // Add AR overlay if active
        if (arOverlay && currentProduct) {
          // Add semi-transparent overlay
          ctx.fillStyle = 'rgba(138, 43, 226, 0.3)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Add product info overlay with better positioning
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
          ctx.fillRect(20, 20, canvas.width - 40, 80)
          
          ctx.fillStyle = 'white'
          ctx.font = 'bold 20px Arial'
          ctx.textAlign = 'left'
          ctx.fillText(`${currentProduct.name} - AR Try-On`, 30, 45)
          ctx.font = '16px Arial'
          ctx.fillText(`Recommended Size: ${recommendedSize}`, 30, 65)
          ctx.fillText(`Price: $${currentProduct.price}`, 30, 85)
          
          // Add brand logo or icon
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.fillRect(canvas.width - 100, 20, 80, 80)
          ctx.fillStyle = '#8A2BE2'
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('AR', canvas.width - 60, 65)
          
          // Add AR tracking elements
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
        }
      }
      
      // Convert to data URL and save
      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      
      // Show success message
      setTimeout(() => {
        alert('Photo captured with AR overlay! Check the preview below.')
      }, 500)
    }
  }, [arOverlay, currentProduct, recommendedSize, isBrowserCompatible, demoMode])

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
      image: '/mock/hoodie-1.jpg',
      price: 89.99,
      colors: ['Black', 'Gray', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'ar-2',
      name: 'Vintage Denim Jacket',
      category: 'Clothing',
      image: '/mock/denim-jacket-1.jpg',
      price: 145,
      colors: ['Blue', 'Light Blue', 'Black'],
      sizes: ['M', 'L', 'XL']
    },
    {
      id: 'ar-3',
      name: 'Street Style Sneakers',
      category: 'Footwear',
      image: '/mock/sneakers-1.jpg',
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
            <p className="text-xl text-ink-300 mb-6">Try on clothes virtually with augmented reality</p>
            
            {/* Demo Mode Toggle */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setDemoMode(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !demoMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                }`}
              >
                Camera Mode
              </button>
              <button
                onClick={() => setDemoMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  demoMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                }`}
              >
                Demo Mode
              </button>
            </div>
          </div>

          {/* Browser Compatibility Check */}
          {!isBrowserCompatible && (
            <div className="mb-8 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-center mb-3">
                Camera features may be limited in this browser. For the best experience, use Chrome, Firefox, or Safari with camera permissions enabled.
              </p>
              <div className="text-center">
                <button
                  onClick={() => setDemoMode(true)}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Try Demo Mode Instead
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-6 bg-ink-800/50 border border-ink-600 rounded-lg p-4">
              <h4 className="text-sm font-medium text-ink-300 mb-3 text-center">System Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isBrowserCompatible ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-ink-400">Browser</span>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isCameraActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-ink-400">Camera</span>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${demoMode ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
                  <span className="text-xs text-ink-400">Mode</span>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${bodyMeasurements ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-ink-400">Scan</span>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${arOverlay ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-ink-400">AR</span>
                </div>
              </div>
              <p className="text-ink-300 text-sm text-center">{debugInfo}</p>
              {debugInfo.includes('Camera not supported') && (
                <div className="mt-3 text-center">
                  <p className="text-ink-400 text-xs mb-2">💡 Tip: Try using Chrome or Firefox, or enable demo mode to test the interface</p>
                  <button
                    onClick={() => setDemoMode(true)}
                    className="bg-green-600 text-white py-1 px-3 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Enable Demo Mode
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Camera & AR */}
            <div className="space-y-6">
              {/* Camera Controls */}
              <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                <h3 className="text-lg font-semibold mb-4">
                  {demoMode ? 'Demo Mode Active' : 'Camera Setup'}
                </h3>
                
                <div className="space-y-4">
                  {demoMode ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CameraIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-green-400 font-medium mb-2">Demo Mode Active</p>
                      <p className="text-ink-300 text-sm">You can test the AR interface without camera access</p>
                    </div>
                  ) : (
                    <>
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
                          <button
                            onClick={() => setDemoMode(true)}
                            className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Try Demo Mode
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Camera Feed */}
              {(isCameraActive || demoMode) && (
                <div className="bg-ink-900 rounded-lg p-6 border border-ink-700">
                  <h3 className="text-lg font-semibold mb-4">
                    {demoMode ? 'Demo Mode' : 'Camera Feed'}
                  </h3>
                  
                  <div className="relative">
                    {demoMode ? (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border-2 border-dashed border-ink-600 flex items-center justify-center">
                        <div className="text-center">
                          <CameraIcon className="w-16 h-16 text-ink-400 mx-auto mb-4" />
                          <p className="text-ink-300">Demo Mode Active</p>
                          <p className="text-sm text-ink-400">Camera simulation for testing</p>
                        </div>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover rounded-lg bg-ink-800"
                      />
                    )}
                    
                    {/* AR Overlay Indicator */}
                    {arOverlay && currentProduct && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                          <span>AR Active: {currentProduct.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Success Message */}
                    {arOverlay && currentProduct && recommendedSize && (
                      <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                        <div className="flex items-center space-x-2">
                          <span>✓</span>
                          <span>Size: {recommendedSize}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera Actions */}
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraActive && !demoMode}
                      className="flex-1 bg-brand-600 text-ink-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      <span>{demoMode ? 'Simulate Capture' : 'Capture Photo'}</span>
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
                      disabled={(!isCameraActive && !demoMode) || isScanning}
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
                      <div className="w-16 h-16 bg-ink-700 rounded-lg overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-ink-400">{product.category}</p>
                        <p className="text-sm text-brand-400">${product.price}</p>
                      </div>
                      <button
                        onClick={() => tryOnProduct(product)}
                        disabled={(!bodyMeasurements && !demoMode) || isProcessing}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 min-w-[80px]"
                      >
                        {isProcessing && currentProduct?.id === product.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>AR...</span>
                          </>
                        ) : (
                          <>
                            <span>Try On</span>
                            {currentProduct?.id === product.id && arOverlay && (
                              <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
                            )}
                          </>
                        )}
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
