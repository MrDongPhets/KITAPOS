// src/components/inventory/ProductActionsModals.jsx - View, Edit, Delete Product modals
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Eye,
  Calendar,
  DollarSign,
  BarChart3
} from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import API_CONFIG from "@/config/api"

// 1. VIEW PRODUCT DETAILS MODAL
export function ViewProductModal({ product, open, onOpenChange }) {
  if (!product) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStockStatus = (product) => {
    if (product.stock_quantity <= 0) {
      return { status: 'out-of-stock', color: 'bg-red-100 text-red-800 border-red-200', text: 'Out of Stock' }
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { status: 'low-stock', color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Low Stock' }
    } else {
      return { status: 'in-stock', color: 'bg-green-100 text-green-800 border-green-200', text: 'In Stock' }
    }
  }

  const stockStatus = getStockStatus(product)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Viewing details for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {product.image_url && (
            <div className="flex justify-center">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="max-w-32 max-h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Product Name</Label>
                <p className="text-sm font-semibold">{product.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">SKU</Label>
                <p className="text-sm font-mono">{product.sku || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Barcode</Label>
                <p className="text-sm font-mono">{product.barcode || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Category</Label>
                <p className="text-sm">{product.categories?.name || 'Uncategorized'}</p>
              </div>
            </div>
            {product.description && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm text-gray-800">{product.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Default Price</Label>
                <p className="text-sm font-semibold">{formatCurrency(product.default_price)}</p>
              </div>
              {product.manila_price && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Manila Price</Label>
                  <p className="text-sm font-semibold">{formatCurrency(product.manila_price)}</p>
                </div>
              )}
              {product.delivery_price && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Delivery Price</Label>
                  <p className="text-sm font-semibold">{formatCurrency(product.delivery_price)}</p>
                </div>
              )}
              {product.wholesale_price && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Wholesale Price</Label>
                  <p className="text-sm font-semibold">{formatCurrency(product.wholesale_price)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stock Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Stock</Label>
                <p className="text-lg font-bold">{product.stock_quantity}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Min Level</Label>
                <p className="text-sm">{product.min_stock_level || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Max Level</Label>
                <p className="text-sm">{product.max_stock_level || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge variant="secondary" className={stockStatus.color}>
                  {stockStatus.text}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Unit</Label>
                <p className="text-sm">{product.unit || 'pcs'}</p>
              </div>
              {product.weight && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Weight</Label>
                  <p className="text-sm">{product.weight}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Created</Label>
                <p className="text-sm">{formatDate(product.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-sm">{formatDate(product.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 2. EDIT PRODUCT MODAL
export function EditProductModal({ product, open, onOpenChange, onProductUpdated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [stores, setStores] = useState([])
  
  // Success modal state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Form data initialized with product data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    category_id: "",
    store_id: "",
    default_price: "",
    manila_price: "",
    delivery_price: "",
    wholesale_price: "",
    stock_quantity: "",
    min_stock_level: "",
    max_stock_level: "",
    unit: "pcs",
    weight: "",
    image_url: ""
  })

  // Initialize form data when product changes
  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        category_id: product.category_id || "",
        store_id: product.store_id || "",
        default_price: product.default_price || "",
        manila_price: product.manila_price || "",
        delivery_price: product.delivery_price || "",
        wholesale_price: product.wholesale_price || "",
        stock_quantity: product.stock_quantity || "",
        min_stock_level: product.min_stock_level || "",
        max_stock_level: product.max_stock_level || "",
        unit: product.unit || "pcs",
        weight: product.weight || "",
        image_url: product.image_url || ""
      })
      fetchCategories()
      fetchStores()
    }
  }, [product, open])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setError("")
    }
  }, [open])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const makeApiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: getAuthHeaders(),
        ...options
      })

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json()
        if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'INVALID_TOKEN') {
          alert('Your session has expired. Please log in again.')
          window.location.href = '/login'
          return null
        }
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await makeApiCall('/client/products/categories')
      if (data) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchStores = async () => {
    try {
      const data = await makeApiCall('/client/dashboard/stores')
      if (data) {
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error)
      setStores([{ id: 'store1', name: 'Main Store' }])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required")
      return false
    }
    
    if (!formData.default_price || parseFloat(formData.default_price) <= 0) {
      setError("Default price must be greater than 0")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log('📦 Updating product:', product.id)
      
      // Clean and prepare data for API - handle numeric fields properly
      const cleanData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        sku: formData.sku?.trim() || null,
        barcode: formData.barcode?.trim() || null,
        category_id: formData.category_id || null,
        store_id: formData.store_id,
        unit: formData.unit || 'pcs',
        image_url: formData.image_url?.trim() || null,
        weight: formData.weight?.trim() || null,
        
        // Handle numeric fields - convert empty strings to null
        default_price: formData.default_price && formData.default_price !== '' ? parseFloat(formData.default_price) : null,
        manila_price: formData.manila_price && formData.manila_price !== '' ? parseFloat(formData.manila_price) : null,
        delivery_price: formData.delivery_price && formData.delivery_price !== '' ? parseFloat(formData.delivery_price) : null,
        wholesale_price: formData.wholesale_price && formData.wholesale_price !== '' ? parseFloat(formData.wholesale_price) : null,
        stock_quantity: formData.stock_quantity && formData.stock_quantity !== '' ? parseInt(formData.stock_quantity) : null,
        min_stock_level: formData.min_stock_level && formData.min_stock_level !== '' ? parseInt(formData.min_stock_level) : null,
        max_stock_level: formData.max_stock_level && formData.max_stock_level !== '' ? parseInt(formData.max_stock_level) : null,
      }
      
      console.log('📦 Clean data being sent:', cleanData)

      const response = await fetch(`${API_CONFIG.BASE_URL}/client/products/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanData)
      })

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json()
        if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'INVALID_TOKEN') {
          alert('Your session has expired. Please log in again.')
          window.location.href = '/login'
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Product updated:', data)

      if (data && data.product) {
        // Show success dialog instead of alert
        setSuccessMessage(`Product "${data.product.name}" has been updated successfully!`)
        setShowSuccessDialog(true)
        
        if (onProductUpdated) {
          onProductUpdated(data.product)
        }

        // Close edit modal
        onOpenChange(false)
      }

    } catch (error) {
      console.error('Update product error:', error)
      setError(error.message || 'Failed to update product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Product
          </DialogTitle>
          <DialogDescription>
            Update the details for {product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Coca Cola 500ml"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Product SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_id">Store *</Label>
                <Select 
                  value={formData.store_id} 
                  onValueChange={(value) => handleInputChange('store_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Pricing</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_price">Default Price *</Label>
                <Input
                  id="default_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.default_price}
                  onChange={(e) => handleInputChange('default_price', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manila_price">Manila Price</Label>
                <Input
                  id="manila_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.manila_price}
                  onChange={(e) => handleInputChange('manila_price', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_price">Delivery Price</Label>
                <Input
                  id="delivery_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.delivery_price}
                  onChange={(e) => handleInputChange('delivery_price', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wholesale_price">Wholesale Price</Label>
                <Input
                  id="wholesale_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.wholesale_price}
                  onChange={(e) => handleInputChange('wholesale_price', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Stock Management</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Current Stock</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  placeholder="0"
                  value={formData.min_stock_level}
                  onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_stock_level">Max Stock Level</Label>
                <Input
                  id="max_stock_level"
                  type="number"
                  placeholder="0"
                  value={formData.max_stock_level}
                  onChange={(e) => handleInputChange('max_stock_level', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="g">Gram</SelectItem>
                    <SelectItem value="L">Liter</SelectItem>
                    <SelectItem value="ml">Milliliter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  placeholder="Product weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Product Image - Replace old URL input */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Product Image</h4>
            
            <div className="space-y-2">
              <Label htmlFor="product-image">Product Image</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => handleInputChange('image_url', url)}
                disabled={loading}
                maxSize={5 * 1024 * 1024} // 5MB
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Additional Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="Product barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
              />
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Success Dialog */}
    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <AlertDialogContent className="sm:max-w-[400px] text-center">
        <AlertDialogHeader className="items-center space-y-6">
          {/* Green checkmark circle */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Edit className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-3">
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Product Updated Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base">
              {successMessage || "Your product has been updated."}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        
        <div className="flex justify-center pt-4">
          <AlertDialogAction className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md">
            OK
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

// 3. DELETE PRODUCT CONFIRMATION DIALOG
export function DeleteProductDialog({ product, open, onOpenChange, onProductDeleted }) {
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const handleDelete = async () => {
    if (!product) return

    setLoading(true)

    try {
      console.log('🗑️ Deleting product:', product.id)

      const response = await fetch(`${API_CONFIG.BASE_URL}/client/products/${product.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json()
        if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'INVALID_TOKEN') {
          alert('Your session has expired. Please log in again.')
          window.location.href = '/login'
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Show success dialog instead of alert
      setSuccessMessage(`Product "${product.name}" has been deleted successfully.`)
      setShowSuccessDialog(true)
      
      if (onProductDeleted) {
        onProductDeleted(product.id)
      }

      // Close delete dialog
      onOpenChange(false)

    } catch (error) {
      console.error('Delete product error:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete <strong>"{product.name}"</strong>?
            <br />
            <br />
            This action cannot be undone. The product will be removed from your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Success Dialog */}
    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <AlertDialogContent className="sm:max-w-[400px] text-center">
        <AlertDialogHeader className="items-center space-y-6">
          {/* Green checkmark circle */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-3">
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Product Deleted Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base">
              {successMessage || "The product has been deleted."}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        
        <div className="flex justify-center pt-4">
          <AlertDialogAction className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md">
            OK
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}