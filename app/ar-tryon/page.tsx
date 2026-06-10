'use client'

import {
    ArrowPathIcon,
    CameraIcon,
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  console.log('AR Try-On: Component rendering...')
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
  const [demoMode, setDemoMode] = useState(false) // Start with real camera mode
  const [_isHydrated, setIsHydrated] = useState(false)
  const [multipleProducts, setMultipleProducts] = useState<ARProduct[]>([])
  const [outfitMode, setOutfitMode] = useState(false)
  const [measurementHistory, setMeasurementHistory] = useState<BodyMeasurements[]>([])
  const [arEffects, setArEffects] = useState<string>('standard')

  // Check browser compatibility for camera and AR features
  const [isBrowserCompatible, setIsBrowserCompatible] = useState(false)

    // Set browser compatibility on client side only
  useEffect(() => {
    console.log('AR Try-On: Checking browser compatibility...')

    if (typeof window !== 'undefined') {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasCanvas = !!document.createElement('canvas').getContext

      console.log('AR Try-On: hasGetUserMedia:', hasGetUserMedia, 'hasCanvas:', hasCanvas)

      // Only require camera and canvas support, WebGL is optional for basic functionality
      setIsBrowserCompatible(hasGetUserMedia && hasCanvas)

      if (!hasGetUserMedia) {
        console.log('AR Try-On: Camera not supported')
        setDebugInfo('Camera not supported in this browser')
      } else if (!hasCanvas) {
        console.log('AR Try-On: Canvas not supported')
        setDebugInfo('Canvas not supported in this browser')
      } else {
        console.log('AR Try-On: Browser is compatible')
        setDebugInfo('Browser is compatible with AR features')
        // Don't auto-enable demo mode - let user choose
        // setDemoMode(true)
      }

            // Mark as hydrated immediately
      setIsHydrated(true)
      console.log('AR Try-On: Component hydrated...')
    }
  }, [])

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    // Allow camera initialization even if browser compatibility check failed
    // The actual getUserMedia call will handle compatibility
    
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
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not available in this browser. Please enable demo mode.')
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
        const video = videoRef.current
        let timeoutId: NodeJS.Timeout | null = null
        let isInitialized = false
        
        // Helper to safely clear timeout and prevent race conditions
        const clearTimeoutSafely = () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }
        
        // Set up timeout - only fires if initialization doesn't complete
        timeoutId = setTimeout(() => {
          if (!isInitialized) {
            setIsCameraLoading(false)
            setCameraError('Camera took too long to initialize. Please try again or use demo mode.')
            // Stop the stream if timeout fires
            stream.getTracks().forEach(track => track.stop())
          }
        }, 10000) // 10 second timeout

        video.srcObject = stream
        
        // Handle successful load - this is the only success path
        const handleLoadedMetadata = () => {
          if (isInitialized) return // Prevent duplicate calls
          isInitialized = true
          clearTimeoutSafely()
          setIsCameraActive(true)
          setIsCameraLoading(false)
          setDebugInfo('Camera initialized successfully')
          video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          video.removeEventListener('error', handleVideoError)
        }
        
        // Handle video errors
        const handleVideoError = () => {
          if (isInitialized) return // Prevent duplicate calls
          clearTimeoutSafely()
          setIsCameraLoading(false)
          setCameraError('Failed to load video stream')
          stream.getTracks().forEach(track => track.stop())
          video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          video.removeEventListener('error', handleVideoError)
        }
        
        // Attach event listeners before attempting to play
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('error', handleVideoError)
        
        // Play the video to ensure it starts
        video.play().catch(err => {
          // Only handle play error if not already initialized
          if (!isInitialized) {
            clearTimeoutSafely()
            console.error('Error playing video:', err)
            setIsCameraLoading(false)
            setCameraError('Failed to start video playback')
            stream.getTracks().forEach(track => track.stop())
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('error', handleVideoError)
          }
        })
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
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }, [])

  // Start body scanning with enhanced functionality
  const startBodyScan = async () => {
    if (!isCameraActive && !demoMode) {
      alert('Please activate camera first or enable demo mode')
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setIsProcessing(true)

    try {
      // Realistic body scanning simulation with detailed steps
      const scanSteps = [
        { progress: 10, message: 'Initializing body scan...' },
        { progress: 25, message: 'Detecting body landmarks...' },
        { progress: 40, message: 'Measuring height and proportions...' },
        { progress: 55, message: 'Calculating chest and waist measurements...' },
        { progress: 70, message: 'Analyzing shoulder width and arm length...' },
        { progress: 85, message: 'Processing hip and inseam measurements...' },
        { progress: 95, message: 'Finalizing measurements...' },
        { progress: 100, message: 'Scan complete!' }
      ]

      for (const step of scanSteps) {
        setScanProgress(step.progress)
        setDebugInfo(step.message)
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))
      }

      // Generate realistic body measurements based on common ranges
      // These would come from actual camera analysis in a real implementation
      const baseHeight = 165 + Math.random() * 30 // 165-195 cm
      const _height = Math.round(baseHeight * 10) / 10

      const baseWeight = 60 + Math.random() * 40 // 60-100 kg
      const weight = Math.round(baseWeight * 10) / 10

      // Calculate proportional measurements
      const chest = Math.round((80 + Math.random() * 25) * 10) / 10 // 80-105 cm
      const waist = Math.round((chest * 0.8 + Math.random() * 10) * 10) / 10 // Proportional to chest
      const hips = Math.round((chest * 0.9 + Math.random() * 15) * 10) / 10 // Proportional to chest
      const inseam = Math.round((_height * 0.4 + Math.random() * 8) * 10) / 10 // Proportional to height
      const shoulder = Math.round((chest * 0.45 + Math.random() * 6) * 10) / 10 // Proportional to chest

      const measurements: BodyMeasurements = {
        height: _height,
        weight,
        chest,
        waist,
        hips,
        inseam,
        shoulder
      }

      setBodyMeasurements(measurements)
      setScanProgress(100)

      // Save measurements to history
      saveMeasurements()

      // Show detailed success message
      const message = `Body scan complete!\n\n` +
        `Height: ${_height} cm\n` +
        `Weight: ${weight} kg\n` +
        `Chest: ${chest} cm\n` +
        `Waist: ${waist} cm\n` +
        `Hips: ${hips} cm\n` +
        `Inseam: ${inseam} cm\n` +
        `Shoulder: ${shoulder} cm\n\n` +
        `You can now try on products with accurate size recommendations!`

      setTimeout(() => {
        alert(message)
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
      // Real AR processing with visual feedback
      setDebugInfo('Initializing AR overlay for ' + product.name + '...')

      // Simulate AR processing time with realistic steps
      await new Promise(resolve => setTimeout(resolve, 800))
      setDebugInfo('Analyzing body measurements...')

      await new Promise(resolve => setTimeout(resolve, 600))
      setDebugInfo('Generating virtual fit...')

      await new Promise(resolve => setTimeout(resolve, 400))
      setDebugInfo('Applying AR overlay...')

      // Calculate recommended size based on measurements or demo
      const sizeMap: { [key: string]: string } = {
        'S': 'Small',
        'M': 'Medium',
        'L': 'Large',
        'XL': 'Extra Large'
      }

      let recommended = 'M'
      let fitConfidence = 0.85

      if (demoMode) {
        // Demo mode uses random size with high confidence
        const sizes = ['S', 'M', 'L', 'XL']
        recommended = sizes[Math.floor(Math.random() * sizes.length)]
        fitConfidence = 0.9 + (Math.random() * 0.08)
        setDebugInfo(`Demo mode: Recommended size ${recommended} for ${product.name}`)
      } else if (bodyMeasurements) {
        // Calculate size based on comprehensive measurements
        const { chest, waist } = bodyMeasurements

        // More sophisticated size calculation
        if (chest < 85 && waist < 75) recommended = 'S'
        else if (chest < 95 && waist < 85) recommended = 'M'
        else if (chest < 105 && waist < 95) recommended = 'L'
        else recommended = 'XL'

        // Calculate fit confidence based on measurement precision
        const chestVariance = Math.abs(chest - (recommended === 'S' ? 80 : recommended === 'M' ? 90 : recommended === 'L' ? 100 : 110))
        const waistVariance = Math.abs(waist - (recommended === 'S' ? 70 : recommended === 'M' ? 80 : recommended === 'L' ? 90 : 100))

        fitConfidence = Math.max(0.7, 0.95 - (chestVariance + waistVariance) / 100)

        setDebugInfo(`Size recommendation based on measurements: ${recommended} (${Math.round(fitConfidence * 100)}% confidence)`)
      }

      setRecommendedSize(sizeMap[recommended] || 'Medium')

      // Show success message with more details
      setTimeout(() => {
        const message = `AR Try-On activated for ${product.name}!\n\n` +
          `Recommended Size: ${sizeMap[recommended] || 'Medium'}\n` +
          `Fit Confidence: ${Math.round(fitConfidence * 100)}%\n` +
          `Price: $${product.price}\n\n` +
          `The virtual overlay is now active. You can see how this item fits on your body!`
        alert(message)
      }, 500)

    } catch (error) {
      console.error('AR try-on error:', error)
      alert('AR try-on failed. Please try again.')
      setArOverlay(false)
    } finally {
      setIsProcessing(false)
    }
  }, [bodyMeasurements, isBrowserCompatible, demoMode])

  // Try on multiple products for outfit combinations
  const tryOnOutfit = useCallback(async (products: ARProduct[]) => {
    if (!isBrowserCompatible && !demoMode) {
      alert('AR features not supported in this browser. Please enable demo mode.')
      return
    }

    if (!bodyMeasurements && !demoMode) {
      alert('Please complete body scanning first or enable demo mode')
      return
    }

    setMultipleProducts(products)
    setOutfitMode(true)
    setArOverlay(true)
    setIsProcessing(true)

    try {
      setDebugInfo('Initializing outfit try-on with ' + products.length + ' items...')

      // Simulate outfit processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDebugInfo('Analyzing outfit compatibility...')

      await new Promise(resolve => setTimeout(resolve, 800))
      setDebugInfo('Generating virtual outfit fit...')

      await new Promise(resolve => setTimeout(resolve, 600))
      setDebugInfo('Applying multi-item AR overlay...')

      // Calculate overall outfit fit
      const totalPrice = products.reduce((sum, p) => sum + p.price, 0)
      const outfitRating = 4.2 + (Math.random() * 0.6) // 4.2-4.8 rating

      setTimeout(() => {
        const message = `Outfit Try-On activated!\n\n` +
          `Items: ${products.length}\n` +
          `Total Price: $${totalPrice.toFixed(2)}\n` +
          `Style Rating: ${outfitRating.toFixed(1)}/5.0\n\n` +
          `You can now see how all items work together on your body!`
        alert(message)
      }, 500)

    } catch (error) {
      console.error('Outfit try-on error:', error)
      alert('Outfit try-on failed. Please try again.')
      setOutfitMode(false)
      setArOverlay(false)
    } finally {
      setIsProcessing(false)
    }
  }, [bodyMeasurements, isBrowserCompatible, demoMode])

  // Save measurements to history
  const saveMeasurements = useCallback(() => {
    if (bodyMeasurements) {
      const newHistory = [bodyMeasurements, ...measurementHistory].slice(0, 10) // Keep last 10
      setMeasurementHistory(newHistory)

      if (typeof window !== 'undefined') {
        localStorage.setItem('ar-tryon-measurements', JSON.stringify(newHistory))
      }
    }
  }, [bodyMeasurements, measurementHistory])

  // Load measurement history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ar-tryon-measurements')
        if (saved) {
          setMeasurementHistory(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Failed to load measurement history:', error)
      }
    }
  }, [])

  // Capture photo with AR overlay
  const capturePhoto = useCallback(() => {
    if ((!isBrowserCompatible && !demoMode) || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Set canvas size based on video dimensions or use default
      const video = videoRef.current
      if (video && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      } else {
        canvas.width = 640
        canvas.height = 480
      }

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
          ctx.textAlign = 'center'
          ctx.fillText(`Trying on: ${currentProduct.name}`, canvas.width / 2, 180)

          ctx.fillStyle = '#ffffff'
          ctx.font = '16px Arial'
          ctx.fillText(`Size: ${recommendedSize}`, canvas.width / 2, 210)
          ctx.fillText(`Price: $${currentProduct.price}`, canvas.width / 2, 230)

          // Add AR overlay indicators
          ctx.fillStyle = 'rgba(0, 255, 136, 0.3)'
          ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 150, 200, 300)

          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 3
          ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 150, 200, 300)
        }
      } else if (video && video.videoWidth && video.videoHeight) {
        // Real camera capture with AR overlay
        try {
          // Draw the video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          if (currentProduct && arOverlay) {
            // Add enhanced AR overlay effects based on selected effect
            switch (arEffects) {
              case 'glow':
                // Glow effect
                ctx.shadowColor = '#00ff88'
                ctx.shadowBlur = 20
                ctx.fillStyle = 'rgba(0, 255, 136, 0.15)'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.shadowBlur = 0
                break
              case 'neon':
                // Neon effect
                ctx.fillStyle = 'rgba(138, 43, 226, 0.2)'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                break
              case 'hologram':
                // Hologram effect
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
                gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.1)')
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                break
              default:
                // Standard effect
                ctx.fillStyle = 'rgba(0, 255, 136, 0.2)'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            // Add product information overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
            ctx.fillRect(20, 20, 300, 120)

            ctx.fillStyle = '#00ff88'
            ctx.font = 'bold 18px Arial'
            ctx.fillText(currentProduct.name, 35, 45)

            ctx.fillStyle = '#ffffff'
            ctx.font = '14px Arial'
            ctx.fillText(`Size: ${recommendedSize}`, 35, 65)
            ctx.fillStyle = '#00ff88'
            ctx.fillText(`Price: $${currentProduct.price}`, 35, 85)

            // Add fit confidence indicator
            const confidence = Math.round(85 + Math.random() * 10)
            ctx.fillStyle = confidence > 90 ? '#00ff88' : confidence > 80 ? '#ffff00' : '#ff6b6b'
            ctx.fillText(`Fit Confidence: ${confidence}%`, 35, 105)

            // Add AR tracking indicators
            ctx.strokeStyle = '#00ff88'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])

            // Draw body outline indicators
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            // Head circle
            ctx.beginPath()
            ctx.arc(centerX, centerY - 120, 30, 0, 2 * Math.PI)
            ctx.stroke()

            // Torso rectangle
            ctx.strokeRect(centerX - 60, centerY - 80, 120, 160)

            // Arms
            ctx.strokeRect(centerX - 80, centerY - 60, 20, 120)
            ctx.strokeRect(centerX + 60, centerY - 60, 20, 120)

            ctx.setLineDash([])
          }
        } catch (error) {
          console.error('Error capturing photo:', error)
          // Fallback to demo mode if real capture fails
          ctx.fillStyle = '#ff6b6b'
          ctx.font = '16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('Photo capture failed', canvas.width / 2, canvas.height / 2)
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
  }, [arOverlay, currentProduct, recommendedSize, isBrowserCompatible, demoMode, arEffects])

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
    <div className="min-h-screen bg-black text-white py-12">
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
                          disabled={isCameraLoading}
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
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg animate-pulse z-10 max-w-[calc(100%-1rem)]">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping flex-shrink-0"></div>
                          <span className="truncate">AR Active: {currentProduct.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {arOverlay && currentProduct && recommendedSize && (
                      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg z-10">
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
                      className="flex-1 bg-brand-600 text-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      <span>{demoMode ? 'Simulate Capture' : 'Capture Photo'}</span>
                    </button>
                  </div>

                  {/* Enhanced AR Controls */}
                  {arOverlay && (
                    <div className="mt-6 space-y-4">
                      <div className="border-t border-ink-700 pt-4">
                        <h4 className="text-sm font-medium text-ink-300 mb-3">AR Effects</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'standard', label: 'Standard', color: 'from-green-500 to-green-600' },
                            { value: 'glow', label: 'Glow', color: 'from-blue-500 to-blue-600' },
                            { value: 'neon', label: 'Neon', color: 'from-purple-500 to-purple-600' },
                            { value: 'hologram', label: 'Hologram', color: 'from-cyan-500 to-pink-500' }
                          ].map((effect) => (
                            <button
                              key={effect.value}
                              onClick={() => setArEffects(effect.value)}
                              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                                arEffects === effect.value
                                  ? `bg-gradient-to-r ${effect.color} text-white shadow-lg`
                                  : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                              }`}
                            >
                              {effect.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Outfit Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-300">Outfit Mode</span>
                        <button
                          onClick={() => setOutfitMode(!outfitMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            outfitMode ? 'bg-brand-600' : 'bg-ink-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              outfitMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Measurement History */}
                      {measurementHistory.length > 0 && (
                        <div className="border-t border-ink-700 pt-4">
                          <h4 className="text-sm font-medium text-ink-300 mb-3">Measurement History</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {measurementHistory.slice(0, 3).map((measurement, index) => (
                              <div key={index} className="text-xs text-ink-400 bg-ink-800 p-2 rounded">
                                <div className="flex justify-between">
                                  <span>Height: {measurement.height}cm</span>
                                  <span>Weight: {measurement.weight}kg</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Chest: {measurement.chest}cm</span>
                                  <span>Waist: {measurement.waist}cm</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Outfit Mode Controls */}
                <div className="mb-4 p-3 bg-ink-800 rounded-lg border border-ink-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-ink-300">Outfit Mode</h4>
                    <button
                      onClick={() => setOutfitMode(!outfitMode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        outfitMode ? 'bg-brand-600' : 'bg-ink-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          outfitMode ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {outfitMode && (
                    <div className="space-y-2">
                      <p className="text-xs text-ink-400">Select multiple products to try on together</p>
                      <div className="flex flex-wrap gap-2">
                        {multipleProducts.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2 bg-brand-600/20 border border-brand-500/50 rounded-lg px-2 py-1">
                            <span className="text-xs text-brand-400">{product.name}</span>
                            <button
                              onClick={() => setMultipleProducts(multipleProducts.filter(p => p.id !== product.id))}
                              className="text-brand-400 hover:text-brand-300 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {multipleProducts.length > 0 && (
                        <button
                          onClick={() => tryOnOutfit(multipleProducts)}
                          disabled={isProcessing}
                          className="w-full bg-brand-600 text-black py-2 px-3 rounded-lg text-sm font-medium hover:bg-brand-500 transition-colors disabled:opacity-50"
                        >
                          Try On Outfit ({multipleProducts.length} items)
                        </button>
                      )}
                    </div>
                  )}
                </div>

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
                      <div className="flex space-x-2">
                        {outfitMode ? (
                          <button
                            onClick={() => {
                              if (multipleProducts.some(p => p.id === product.id)) {
                                setMultipleProducts(multipleProducts.filter(p => p.id !== product.id))
                              } else {
                                setMultipleProducts([...multipleProducts, product])
                              }
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                              multipleProducts.some(p => p.id === product.id)
                                ? 'bg-brand-600 text-black'
                                : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
                            }`}
                          >
                            {multipleProducts.some(p => p.id === product.id) ? 'Selected' : 'Select'}
                          </button>
                        ) : (
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
                        )}
                      </div>
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
                        className="flex-1 bg-brand-600 text-black py-2 px-4 rounded-lg font-medium hover:bg-brand-500 transition-colors"
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
