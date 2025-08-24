'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CameraIcon, 
  PhotoIcon,
  ArrowLeftIcon,
  PlayIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ARProduct {
  id: string
  name: string
  category: string
  image: string
  arModel: string
  colors: string[]
  sizes: string[]
  price: number
}

interface BodyMeasurements {
  height: number
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
  
  // Check browser compatibility for camera and AR features
  const isBrowserCompatible = typeof window !== 'undefined' && 
    !!navigator?.mediaDevices?.getUserMedia

  // Available AR products for try-on
  const arProducts: ARProduct[] = [
    {
      id: 'ar-1',
      name: 'Urban Street Hoodie',
      category: 'Clothing',
      image: '/mock/default-product.jpg',
      arModel: 'hoodie-3d.glb',
      colors: ['Black', 'Gray', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      price: 89.99
    },
    {
      id: 'ar-2',
      name: 'Vintage Denim Jacket',
      category: 'Clothing',
      image: '/mock/default-product.jpg',
      arModel: 'denim-jacket-3d.glb',
      colors: ['Blue', 'Light Blue', 'Black'],
      sizes: ['M', 'L', 'XL'],
      price: 145
    },
    {
      id: 'ar-3',
      name: 'Performance Leggings',
      category: 'Clothing',
      image: '/mock/default-product.jpg',
      arModel: 'leggings-3d.glb',
      colors: ['Black', 'Navy', 'Gray'],
      sizes: ['XS', 'S', 'M', 'L'],
      price: 65.99
    }
  ]

  // Start camera
  const startCamera = useCallback(async () => {
    // Early return if browser is not compatible
    if (!isBrowserCompatible) {
      console.warn('Camera not supported in this browser')
      return
    }
    
    try {
      // Check if we're in a browser environment and MediaDevices API is supported
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        console.warn('MediaDevices API not supported in this environment')
        alert('Camera access is not supported in this browser. Please use a modern browser with camera support.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (!isBrowserCompatible) return
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }, [isBrowserCompatible])

  // Start body scanning
  const startBodyScan = useCallback(async () => {
    if (!isBrowserCompatible) {
      alert('Camera features not supported in this browser')
      return
    }
    
    if (!isCameraActive) {
      alert('Please start camera first')
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setIsProcessing(true)

    // Simulate body scanning process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setScanProgress(i)
    }

    // Generate mock body measurements
    const measurements: BodyMeasurements = {
      height: 175 + Math.floor(Math.random() * 20),
      chest: 95 + Math.floor(Math.random() * 10),
      waist: 80 + Math.floor(Math.random() * 15),
      hips: 95 + Math.floor(Math.random() * 10),
      inseam: 80 + Math.floor(Math.random() * 8),
      shoulder: 45 + Math.floor(Math.random() * 5)
    }

    setBodyMeasurements(measurements)
    setIsScanning(false)
    setIsProcessing(false)
  }, [isCameraActive, isBrowserCompatible])

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
        ctx.fillStyle = 'rgba(138, 43, 226, 0.3)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add product info overlay
        ctx.fillStyle = 'white'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${currentProduct.name} - AR Try-On`, canvas.width / 2, 50)
        ctx.fillText(`Recommended Size: ${recommendedSize}`, canvas.width / 2, 80)
      }
    }
  }, [arOverlay, currentProduct, recommendedSize])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (isBrowserCompatible) {
        stopCamera()
      }
    }
  }, [stopCamera, isBrowserCompatible])

  return (
    <div className="min-h-screen bg-ink-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
                <span>AR Virtual Try-On</span>
              </h1>
              <p className="text-ink-300">Real-time virtual fitting room with AI body scanning</p>
            </div>
            <button 
              onClick={() => router.push('/buyer/marketplace')}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Browser Compatibility Warning */}
        {!isBrowserCompatible && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-yellow-400">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Browser Compatibility Notice</span>
            </div>
            <p className="text-yellow-300 mt-2">
              Your browser doesn&apos;t support camera access or AR features. Please use a modern browser with camera permissions enabled.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed & AR Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Controls */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Camera & AR Controls</h3>
                <div className="flex space-x-3">
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      disabled={!isBrowserCompatible}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        isBrowserCompatible 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gray-500 cursor-not-allowed text-gray-300'
                      }`}
                    >
                      <CameraIcon className="w-4 h-4" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Stop Camera</span>
                    </button>
                  )}
                  
                  {isCameraActive && (
                    <button
                      onClick={capturePhoto}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Camera Feed */}
              <div className="relative bg-ink-800 rounded-lg overflow-hidden">
                {!isCameraActive ? (
                  <div className="aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <CameraIcon className="w-16 h-16 text-ink-400 mx-auto mb-4" />
                      <p className="text-ink-300 mb-4">Camera not active</p>
                      <button
                        onClick={startCamera}
                        disabled={!isBrowserCompatible}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isBrowserCompatible 
                            ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                            : 'bg-gray-500 cursor-not-allowed text-gray-300'
                        }`}
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                    
                    {/* AR Overlay Indicator */}
                    {arOverlay && currentProduct && (
                      <div className="absolute top-4 right-4 bg-purple-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                        AR Active: {currentProduct.name}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Body Scanning */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">AI Body Scanning</h3>
              
              {!bodyMeasurements ? (
                <div className="space-y-4">
                  <p className="text-ink-300">
                    Get accurate body measurements for perfect fit recommendations
                  </p>
                  
                  {isScanning ? (
                    <div className="space-y-4">
                      <div className="w-full bg-ink-800 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-ink-300">
                        Scanning body measurements... {scanProgress}%
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={startBodyScan}
                      disabled={!isCameraActive || isProcessing}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:bg-ink-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      <span>Start Body Scanning</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckIcon className="w-5 h-5" />
                    <span className="font-medium">Body scanning complete!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Height</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.height}cm</div>
                    </div>
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Chest</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.chest}cm</div>
                    </div>
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Waist</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.waist}cm</div>
                    </div>
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Hips</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.hips}cm</div>
                    </div>
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Inseam</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.inseam}cm</div>
                    </div>
                    <div className="bg-ink-800 p-3 rounded-lg">
                      <div className="text-sm text-ink-400">Shoulder</div>
                      <div className="text-lg font-semibold">{bodyMeasurements.shoulder}cm</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setBodyMeasurements(null)}
                    className="bg-ink-700 hover:bg-ink-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Rescan Body
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Selection & AR Controls */}
          <div className="space-y-6">
            {/* Available Products */}
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Try-On Products</h3>
              
              <div className="space-y-4">
                {arProducts.map((product) => (
                  <div key={product.id} className="bg-ink-800 rounded-lg p-4 border border-ink-700 hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{product.name}</h4>
                        <p className="text-sm text-ink-400">{product.category}</p>
                        <div className="text-lg font-bold text-green-400">${product.price}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <span key={color} className="text-xs bg-ink-700 text-ink-300 px-2 py-1 rounded">
                            {color}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <span key={size} className="text-xs bg-ink-700 text-ink-300 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => tryOnProduct(product)}
                      disabled={!bodyMeasurements || isProcessing}
                      className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-ink-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>Try On with AR</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AR Status & Controls */}
            {currentProduct && (
              <div className="bg-ink-900 rounded-xl p-6 border border-purple-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  <span>AR Try-On Active</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-ink-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">{currentProduct.name}</h4>
                    <p className="text-sm text-ink-300 mb-3">Currently trying on</p>
                    
                    {recommendedSize && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                        <div className="text-sm text-green-400 font-medium">Recommended Size</div>
                        <div className="text-lg font-bold text-green-400">{recommendedSize}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setArOverlay(!arOverlay)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        arOverlay 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-ink-700 hover:bg-ink-600 text-white'
                      }`}
                    >
                      {arOverlay ? 'Hide AR' : 'Show AR'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentProduct(null)
                        setArOverlay(false)
                        setRecommendedSize('')
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AR Technology Features */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30">
              <h3 className="text-xl font-bold text-white mb-4 text-center">AR Technology Features</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-lg">📏</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Real Body Scanning</h4>
                    <p className="text-sm text-ink-300">Live camera-based measurements using computer vision</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <span className="text-pink-400 text-lg">👔</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Virtual Try-On</h4>
                    <p className="text-sm text-ink-300">See how clothes look on your body in real-time AR overlay</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-lg">💡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Smart Sizing</h4>
                    <p className="text-sm text-ink-300">AI-powered size recommendations based on your measurements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
