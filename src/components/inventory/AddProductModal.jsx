// src/components/inventory/AddProductModal.jsx - With centered success modal
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SuccessModal } from "@/components/ui/success-modal"  // Import the success modal
import { Loader2, Plus, Package, AlertCircle } from "lucide-react"
import API_CONFIG from "@/config/api"

export function AddProductModal({ onProductAdded, trigger }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Form data
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
  
  // Options for dropdowns
  const [categories, setCategories] = useState([])
  const [stores, setStores] = useState([])

  // Load categories and stores when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchStores()
    }
  }, [open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
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
      setError("")
      setSuccessMessage("")
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
      // Fallback - if no stores endpoint, create a default store option
      const companyData = localStorage.getItem('companyData')
      if (companyData) {
        const company = JSON.parse(companyData)
        setStores([{ id: 'store1', name: 'Main Store' }])
      }
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
    
    if (!formData.store_id) {
      setError("Please select a store")
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
      console.log('📦 Creating product:', formData.name)

      const data = await makeApiCall('/client/products', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (data) {
        // Set success message and show success modal
        setSuccessMessage(`Product "${data.product.name}" has been successfully added to your inventory!`)
        setShowSuccessModal(true)
        
        // Notify parent component to refresh products list
        if (onProductAdded) {
          onProductAdded(data.product)
        }

        // Close the main modal
        setOpen(false)
      }

    } catch (error) {
      console.error('Create product error:', error)
      const errorMessage = error.message || 'Failed to create product. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    setSuccessMessage("")
  }

  return (
    <>
      {/* Main Add Product Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Add New Product
            </DialogTitle>
            <DialogDescription>
              Create a new product for your inventory. Fill in the details below.
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
                  <Select onValueChange={(value) => handleInputChange('category_id', value)}>
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
                  <Select onValueChange={(value) => handleInputChange('store_id', value)}>
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
                  <Select onValueChange={(value) => handleInputChange('unit', value)} defaultValue="pcs">
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

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700">Additional Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    placeholder="Product barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                  />
                </div>

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
                onClick={() => setOpen(false)}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessModalClose}
        title="Product Added Successfully!"
        description={successMessage || "Your product has been added to the inventory."}
        buttonText="OK"
      />
    </>
  )
}