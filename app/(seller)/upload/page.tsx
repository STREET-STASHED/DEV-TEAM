'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import { createSupabaseBrowser } from '@/app/lib/supabase/browser'

interface ItemForm {
  name: string
  description: string
  price: number
  category: string
  subcategory: string
  condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair'
  brand: string
  size: string
  color: string
  tags: string[]
  images: File[]
  inventory_quantity: number
  shipping_weight: number
  is_featured: boolean
  requires_authentication: boolean
  authentication_details: string
}

const itemSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  price: z.number().min(0.01, 'Price must be greater than $0').max(10000, 'Price too high'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  condition: z.enum(['new', 'like_new', 'excellent', 'good', 'fair']),
  brand: z.string().min(1, 'Brand is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags'),
  inventory_quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000, 'Quantity too high'),
  shipping_weight: z.number().min(0.1, 'Weight must be at least 0.1 lbs').max(50, 'Weight too high'),
  is_featured: z.boolean(),
  requires_authentication: z.boolean(),
  authentication_details: z.string().optional(),
})

const categories = {
  'Sneakers': ['Basketball', 'Running', 'Lifestyle', 'Skateboarding', 'Limited Edition', 'Vintage'],
  'Streetwear': ['Hoodies', 'T-Shirts', 'Jackets', 'Pants', 'Shorts', 'Accessories'],
  'Accessories': ['Bags', 'Hats', 'Jewelry', 'Belts', 'Watches', 'Sunglasses'],
  'Vintage': ['Clothing', 'Sneakers', 'Accessories', 'Collectibles', 'Art'],
  'Limited Edition': ['Collaborations', 'Artist Series', 'Seasonal', 'Anniversary', 'Exclusive'],
  'Street Art': ['Prints', 'Canvas', 'Sculptures', 'Installations', 'Digital']
}

const conditions = [
  { value: 'new', label: 'New with Tags', description: 'Never worn, original tags attached' },
  { value: 'like_new', label: 'Like New', description: 'Worn once or twice, no visible wear' },
  { value: 'excellent', label: 'Excellent', description: 'Minimal wear, looks almost new' },
  { value: 'good', label: 'Good', description: 'Some wear but still in great condition' },
  { value: 'fair', label: 'Fair', description: 'Visible wear but functional and stylish' }
]

const popularBrands = [
  'Nike', 'Adidas', 'Supreme', 'Palace', 'Off-White', 'Bape', 'Stussy', 'Carhartt',
  'Champion', 'Nike SB', 'Jordan Brand', 'Yeezy', 'Travis Scott', 'Fear of God'
]

const popularTags = [
  'Streetwear', 'Hype', 'Limited', 'Vintage', 'Retro', 'Y2K', 'Minimalist', 'Bold',
  'Statement', 'Classic', 'Trendy', 'Exclusive', 'Collaboration', 'Artist Series'
]

export default function SellerUploadPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ItemForm>({
    name: '',
    description: '',
    price: 0,
    category: 'Streetwear',
    subcategory: 'T-Shirts',
    condition: 'excellent',
    brand: '',
    size: '',
    color: '',
    tags: [],
    images: [],
    inventory_quantity: 1,
    shipping_weight: 1,
    is_featured: false,
    requires_authentication: false,
    authentication_details: ''
  })

  const [newTag, setNewTag] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  // Image dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = [...formData.images, ...acceptedFiles]
    setFormData({ ...formData, images: newImages })
    
    // Create preview URLs
    const newUrls = acceptedFiles.map(file => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls])
  }, [formData, imagePreviewUrls])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  // Remove image
  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    setImagePreviewUrls(newUrls)
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) stepErrors.name = 'Name is required'
        if (!formData.description.trim()) stepErrors.description = 'Description is required'
        if (formData.price <= 0) stepErrors.price = 'Price must be greater than $0'
        if (!formData.category) stepErrors.category = 'Category is required'
        if (!formData.subcategory) stepErrors.subcategory = 'Subcategory is required'
        break
      
      case 2:
        if (!formData.brand.trim()) stepErrors.brand = 'Brand is required'
        if (!formData.size.trim()) stepErrors.size = 'Size is required'
        if (!formData.color.trim()) stepErrors.color = 'Color is required'
        if (formData.tags.length === 0) stepErrors.tags = 'At least one tag is required'
        break
      
      case 3:
        if (formData.images.length === 0) stepErrors.images = 'At least one image is required'
        if (formData.inventory_quantity <= 0) stepErrors.inventory_quantity = 'Quantity must be at least 1'
        if (formData.shipping_weight <= 0) stepErrors.shipping_weight = 'Weight must be at least 0.1 lbs'
        break
    }
    
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  // Next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  // Previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Validate entire form
      const validatedData = itemSchema.parse(formData)
      
      // Upload images to Supabase Storage
      const imageUrls = await uploadImages(formData.images)
      
      // Create item in database
      const user = await supabase.auth.getUser()
      const { data: item, error } = await supabase.from('items')
        .insert({
          ...validatedData,
          image: imageUrls[0], // Use first image as main image
          seller_id: user.data.user?.id!,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Success
      router.push(`/seller/seller-dashboard?success=true&itemId=${item.id}`)
      
    } catch (error) {
      console.error('Upload error:', error)
      if (error instanceof z.ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach(err => {
          if (err.path) {
            zodErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(zodErrors)
      } else {
        alert(`Failed to upload item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // Upload images to Supabase Storage
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `seller-uploads/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath)
      
      urls.push(publicUrl)
      setUploadProgress(((i + 1) / files.length) * 100)
    }
    
    return urls
  }

  // Auto-save form data to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sellerUploadDraft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
      } catch (_e) {
        console.error('Failed to parse saved draft')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sellerUploadDraft', JSON.stringify(formData))
  }, [formData])

  return (
    <div className="min-h-screen bg-ink-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Upload New Item</h1>
          <p className="text-ink-300">
            Create professional listings that showcase your streetwear items. High-quality images and detailed descriptions increase sales.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-brand-600 text-ink-black' 
                    : 'bg-ink-700 text-ink-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-brand-600' : 'bg-ink-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-ink-400">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Media & Inventory</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.name ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                    placeholder="e.g., Vintage Nike Air Jordan 1 Retro High OG"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.price ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                    placeholder="299.99"
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                    errors.description ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                  }`}
                  placeholder="Describe the item's condition, style, unique features, and why someone should buy it..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                <p className="text-ink-400 text-sm mt-1">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        category: e.target.value,
                        subcategory: Object.keys(categories[e.target.value as keyof typeof categories])[0] || ''
                      })
                    }}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white focus:ring-1 focus:ring-brand-500 ${
                      errors.category ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                  >
                    {Object.keys(categories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Subcategory *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white focus:ring-1 focus:ring-brand-500 ${
                      errors.subcategory ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                  >
                    {categories[formData.category as keyof typeof categories]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                  {errors.subcategory && <p className="text-red-400 text-sm mt-1">{errors.subcategory}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Condition *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {conditions.map(condition => (
                    <label key={condition.value} className="flex items-center p-3 bg-ink-800 rounded-lg border border-ink-700 hover:border-brand-500 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value={condition.value}
                        checked={formData.condition === condition.value}
                        onChange={(e) => setFormData({...formData, condition: e.target.value as ItemForm['condition']})}
                        className="mr-2"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">{condition.label}</div>
                        <div className="text-ink-400 text-xs">{condition.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.brand ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                    placeholder="e.g., Nike, Supreme"
                    list="brands"
                  />
                  <datalist id="brands">
                    {popularBrands.map(brand => <option key={brand} value={brand} />)}
                  </datalist>
                  {errors.brand && <p className="text-red-400 text-sm mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Size *
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.size ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                    placeholder="e.g., M, 10, One Size"
                  />
                  {errors.size && <p className="text-red-400 text-sm mt-1">{errors.size}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.color ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                    placeholder="e.g., Black, Red, Multi"
                  />
                  {errors.color && <p className="text-red-400 text-sm mt-1">{errors.color}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags * (Max 10)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-600 text-ink-black">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-ink-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 bg-ink-800 border border-ink-700 rounded-md text-white placeholder-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="Add a tag..."
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim() || formData.tags.length >= 10}
                    className="px-4 py-2 bg-brand-600 text-ink-black rounded-md hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
                <p className="text-ink-400 text-sm mt-1">
                  Popular tags: {popularTags.slice(0, 6).join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-4 h-4 text-brand-600 bg-ink-800 border-ink-700 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="is_featured" className="text-white">
                    Feature this item (increases visibility)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="requires_authentication"
                    checked={formData.requires_authentication}
                    onChange={(e) => setFormData({...formData, requires_authentication: e.target.checked})}
                    className="w-4 h-4 text-brand-600 bg-ink-800 border-ink-700 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="requires_authentication" className="text-white">
                    Requires authentication verification
                  </label>
                </div>
              </div>

              {formData.requires_authentication && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Authentication Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.authentication_details}
                    onChange={(e) => setFormData({...formData, authentication_details: e.target.value})}
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded-md text-white placeholder-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="Describe how this item can be authenticated (e.g., serial number, hologram, specific details)..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Media & Inventory */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Images * (Max 10, 10MB each)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-ink-600 hover:border-ink-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mx-auto h-16 w-16 text-ink-500 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">
                    {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                  </p>
                  <p className="text-ink-400 text-sm">
                    or click to select files
                  </p>
                  <p className="text-ink-500 text-xs mt-2">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                </div>
                {errors.images && <p className="text-red-400 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Image Previews</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Inventory Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.inventory_quantity}
                    onChange={(e) => setFormData({...formData, inventory_quantity: parseInt(e.target.value) || 1})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.inventory_quantity ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                  />
                  {errors.inventory_quantity && <p className="text-red-400 text-sm mt-1">{errors.inventory_quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Shipping Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={formData.shipping_weight}
                    onChange={(e) => setFormData({...formData, shipping_weight: parseFloat(e.target.value) || 1})}
                    className={`w-full px-3 py-2 bg-ink-800 border rounded-md text-white placeholder-ink-400 focus:ring-1 focus:ring-brand-500 ${
                      errors.shipping_weight ? 'border-red-500' : 'border-ink-700 focus:border-brand-500'
                    }`}
                  />
                  {errors.shipping_weight && <p className="text-red-400 text-sm mt-1">{errors.shipping_weight}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-ink-700">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-ink-600 text-ink-300 rounded-lg hover:bg-ink-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            <div className="flex space-x-4 ml-auto">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-brand-600 text-ink-black rounded-lg hover:bg-brand-500 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-brand-600 text-ink-black rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-hover transform hover:scale-105"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Item'}
                </button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isSubmitting && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">Uploading images...</span>
                <span className="text-ink-400 text-sm">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-ink-700 rounded-full h-2">
                <div 
                  className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {/* Auto-save indicator */}
        <div className="mt-8 p-4 bg-ink-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-ink-300 text-sm">Auto-saving your progress...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
