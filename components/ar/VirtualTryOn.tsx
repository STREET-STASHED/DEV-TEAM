'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { simpleARVirtualTryOn, SimpleFitResult, SimpleUserMeasurements, SimpleARProduct } from '@/lib/ar/virtualTryOnSimple'
import { Camera, Palette, Ruler, CheckCircle, X, Download, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VirtualTryOnProps {
  productId: string
  productName: string
  productImage: string
  onClose: () => void
  onAddToCart?: (_size: string) => void
}

export default function VirtualTryOn({ 
  productId, productName, productImage, onClose, _onAddToCart 
}:VirtualTryOnProps) {
  const { user } = useSupabase()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [_isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSize, setCurrentSize] = useState('m')
  const [currentColor, setCurrentColor] = useState('Black')
  const [fitResult, setFitResult] = useState<SimpleFitResult | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showFitResults, setShowFitResults] = useState(false)
  const [userMeasurements, setUserMeasurements] = useState<SimpleUserMeasurements | null>(null)

  const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl']
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#000080' }
  ]

  // Load user measurements
  const loadUserMeasurements = useCallback(async () => {
    if (!user) return

    try {
      // In a real app, you'd fetch from database
      // For demo, using default measurements
      setUserMeasurements({
        height: 70,
        weight: 160,
        chest: 38,
        waist: 32,
        hips: 40,
        shoulders: 17,
        inseam: 32,
        bodyType: 'regular'
      })
    } catch (err) {
      console.error('Failed to load measurements:', err)
    }
  }, [user])

  // Initialize AR session
  const initializeAR = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user) return

    try {
      setIsLoading(true)
      setError(null)

      const success = await simpleARVirtualTryOn.initializeAR(videoRef.current, canvasRef.current)
      if (!success) {
        throw new Error('Failed to initialize camera')
      }

      // Create simple product object
      const simpleProduct: SimpleARProduct = {
        id: productId,
        name: productName,
        category: 'clothing',
        image: productImage,
        price: 0
      }

      // Start try-on session
      await simpleARVirtualTryOn.startTryOnSession(productId, user.id, simpleProduct)
      
      // Load user measurements
      await loadUserMeasurements()
      
      setIsInitialized(true)
    } catch (err) {
      console.error('AR initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize AR')
    } finally {
      setIsLoading(false)
    }
  }, [productId, productName, productImage, user, loadUserMeasurements])

  // Calculate fit
  const calculateFit = useCallback(async () => {
    if (!userMeasurements || !user) return

    try {
      const result = simpleARVirtualTryOn.calculateFit(userMeasurements, currentSize)
      setFitResult(result)
      setShowFitResults(true)
    } catch (err) {
      console.error('Failed to calculate fit:', err)
    }
  }, [userMeasurements, currentSize, user])

  // Capture preview
  const capturePreview = async () => {
    try {
      const preview = await simpleARVirtualTryOn.capturePreview()
      setPreviewImage(preview)
    } catch (err) {
      console.error('Failed to capture preview:', err)
    }
  }

  // Change color
  const changeColor = async (colorName: string) => {
    setCurrentColor(colorName)
    // In simplified version, just update the state
  }

  // Change size
  const changeSize = async (size: string) => {
    setCurrentSize(size)
    // In simplified version, just update the state
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(currentSize)
    }
    onClose()
  }

  // Download preview
  const downloadPreview = () => {
    if (!previewImage) return

    const link = document.createElement('a')
    link.href = previewImage
    link.download = `${productName}-tryon.jpg`
    link.click()
  }

  // Share preview
  const sharePreview = async () => {
    if (!previewImage) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out this ${productName} on me!`,
          text: 'I just tried this on with StreetStashed AR!',
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }

  // Initialize on mount
  useEffect(() => {
    initializeAR()
  }, [initializeAR])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      simpleARVirtualTryOn.endSession()
    }
  }, [])

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AR Not Available</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-500"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-ink-black rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Virtual Try-On</h2>
                <p className="text-ink-300 text-sm">{productName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-full">
          {/* AR View */}
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white">Initializing AR...</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                
                {/* AR Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <p className="text-white font-semibold text-center">{productName}</p>
                      <p className="text-white/80 text-sm text-center">Virtual Try-On Active</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-ink-900 border-l border-ink-700 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Size
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => changeSize(size)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentSize === size
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color
                </h3>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => changeColor(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        currentColor === color.name
                          ? 'border-white scale-110'
                          : 'border-ink-600 hover:border-ink-500'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Fit Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Fit Analysis
                </h3>
                <button
                  onClick={calculateFit}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all font-medium"
                >
                  Calculate Fit
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={capturePreview}
                  className="w-full bg-ink-800 text-white py-3 px-4 rounded-lg hover:bg-ink-700 transition-colors font-medium"
                >
                  Capture Preview
                </button>
                
                {previewImage && (
                  <div className="space-y-2">
                    <button
                      onClick={downloadPreview}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={sharePreview}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                )}

                {onAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-500 transition-colors font-medium"
                  >
                    Add to Cart (Size {currentSize.toUpperCase()})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fit Results Modal */}
        <AnimatePresence>
          {showFitResults && fitResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ink-900 rounded-2xl p-6 max-w-md mx-4 border border-ink-700"
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    fitResult.fit === 'perfect' ? 'bg-green-500' :
                    fitResult.fit === 'good' ? 'bg-blue-500' :
                    fitResult.fit === 'loose' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {fitResult.fit.charAt(0).toUpperCase() + fitResult.fit.slice(1)} Fit
                  </h3>
                  <p className="text-ink-300">
                    {Math.round(fitResult.confidence)}% confidence
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {fitResult.recommendations.map((rec, index) => (
                    <div key={index} className="bg-ink-800 rounded-lg p-3">
                      <p className="text-white text-sm">{rec}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowFitResults(false)}
                  className="w-full bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-500 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
