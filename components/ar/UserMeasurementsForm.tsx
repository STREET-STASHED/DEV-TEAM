'use client'

import { useState } from 'react'
import { useSession } from '@/hooks/useSupabase'
import { SimpleUserMeasurements } from '@/lib/ar/virtualTryOnSimple'
import { Ruler, Save, X, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserMeasurementsFormProps {
  onClose: () => void
  onSave: (_measurements: SimpleUserMeasurements) => void
  initialMeasurements?: SimpleUserMeasurements
}

export default function UserMeasurementsForm({ 
  onClose, onSave, _initialMeasurements 
}:UserMeasurementsFormProps) {
  const { session } = useSession()
  const user = session?.user
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  
  const [measurements, setMeasurements] = useState<SimpleUserMeasurements>(
    _initialMeasurements || {
      height: 0,
      weight: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      shoulders: 0,
      inseam: 0,
      bodyType: 'regular'
    }
  )

  const bodyTypes = [
    { value: 'athletic', label: 'Athletic', description: 'Muscular build with broad shoulders' },
    { value: 'slim', label: 'Slim', description: 'Lean build with narrow frame' },
    { value: 'regular', label: 'Regular', description: 'Average build and proportions' },
    { value: 'plus', label: 'Plus', description: 'Fuller build with wider proportions' }
  ]

  const handleInputChange = (field: keyof SimpleUserMeasurements, value: number | string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Save to database
      const { error } = await fetch('/api/user-measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurements),
      }).then(res => res.json())

      if (error) throw new Error(error)

      onSave(measurements)
      onClose()
    } catch (err) {
      console.error('Failed to save measurements:', err)
      alert('Failed to save measurements. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = measurements.height > 0 && 
                  measurements.weight > 0 && 
                  measurements.chest > 0 && 
                  measurements.waist > 0

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-ink-900 rounded-2xl p-8 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-ink-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Body Measurements</h2>
              <p className="text-ink-300 text-sm">For accurate AR fit calculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-ink-800 rounded-full flex items-center justify-center hover:bg-ink-700 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Info Button */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-ink-300 hover:text-white transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm">How to measure</span>
          </button>
          
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 left-0 bg-ink-800 rounded-lg p-4 border border-ink-600 z-10 max-w-sm"
            >
              <h4 className="font-semibold text-white mb-2">Measurement Guide:</h4>
              <ul className="text-sm text-ink-300 space-y-1">
                <li><strong>Chest:</strong> Around the fullest part of your chest</li>
                <li><strong>Waist:</strong> Around your natural waistline</li>
                <li><strong>Hips:</strong> Around the fullest part of your hips</li>
                <li><strong>Shoulders:</strong> Across the back from shoulder to shoulder</li>
                <li><strong>Inseam:</strong> From crotch to desired pant length</li>
              </ul>
            </motion.div>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Height (inches)
              </label>
              <input
                type="number"
                value={measurements.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="70"
                min="48"
                max="84"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Weight (pounds)
              </label>
              <input
                type="number"
                value={measurements.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="160"
                min="80"
                max="400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Body Type
              </label>
              <select
                value={measurements.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {bodyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Measurements</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Chest (inches)
              </label>
              <input
                type="number"
                value={measurements.chest || ''}
                onChange={(e) => handleInputChange('chest', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="38"
                min="28"
                max="60"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Waist (inches)
              </label>
              <input
                type="number"
                value={measurements.waist || ''}
                onChange={(e) => handleInputChange('waist', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="32"
                min="24"
                max="50"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Hips (inches)
              </label>
              <input
                type="number"
                value={measurements.hips || ''}
                onChange={(e) => handleInputChange('hips', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="40"
                min="30"
                max="60"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Shoulders (inches)
              </label>
              <input
                type="number"
                value={measurements.shoulders || ''}
                onChange={(e) => handleInputChange('shoulders', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="17"
                min="12"
                max="25"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-2">
                Inseam (inches)
              </label>
              <input
                type="number"
                value={measurements.inseam || ''}
                onChange={(e) => handleInputChange('inseam', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="32"
                min="24"
                max="40"
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-ink-800/50 rounded-lg border border-ink-600">
          <p className="text-sm text-ink-300">
            <strong>Privacy:</strong> Your measurements are stored securely and only used to provide accurate fit recommendations. 
            We never share this information with third parties.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-ink-800 text-white rounded-lg hover:bg-ink-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Measurements
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
