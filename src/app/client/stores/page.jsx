// src/app/client/stores/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause,
  Building
} from 'lucide-react'
import { toast } from "sonner"
import API_CONFIG from "@/config/api"

export default function ClientStores() {
  const router = useRouter()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: ''
  })

  useEffect(() => {
    fetchStores()
  }, [])

 const fetchStores = async () => {
  try {
    const token = localStorage.getItem('authToken') // ADD THIS
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/client/stores`, {
      headers: {
        'Authorization': `Bearer ${token}`, // ADD THIS
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      setStores(data.stores || [])
    } else {
      const errorData = await response.json()
      toast.error(errorData.error || 'Failed to fetch stores')
    }
  } catch (error) {
    console.error('Fetch stores error:', error)
    toast.error('Network error occurred')
  } finally {
    setLoading(false)
  }
}
  const handleSubmitRequest = async (e) => {
  e.preventDefault()
  setSubmitting(true)

  try {
    const token = localStorage.getItem('authToken') // ADD THIS LINE
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/client/stores/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // ADD THIS LINE
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (response.ok) {
      toast.success('Store request submitted successfully! Waiting for admin approval.')
      setShowRequestDialog(false)
      setFormData({ name: '', address: '', phone: '', description: '' })
      fetchStores()
    } else {
      toast.error(data.error || 'Failed to submit store request')
    }
  } catch (error) {
    console.error('Store request error:', error)
    toast.error('Network error occurred')
  } finally {
    setSubmitting(false)
  }
}

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        icon: CheckCircle, 
        text: "Active",
        className: "bg-green-100 text-green-800 hover:bg-green-200"
      },
      pending: { 
        icon: Clock, 
        text: "Pending Approval",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      },
      suspended: { 
        icon: Pause, 
        text: "Suspended",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
      },
      cancelled: { 
        icon: XCircle, 
        text: "Rejected",
        className: "bg-red-100 text-red-800 hover:bg-red-200"
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <Badge className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading stores...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Stores</h1>
          <p className="text-muted-foreground">Manage your store locations</p>
        </div>
        
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request New Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request New Store</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Submit a request for a new store. An admin will review and activate your store.
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter store name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter store address"
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  type="tel"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional details about the store"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No stores found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any stores yet. Request your first store to get started.
            </p>
            <Button onClick={() => setShowRequestDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                  </div>
                  {getStatusBadge(store.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {store.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {store.address}
                      </span>
                    </div>
                  )}
                  
                  {store.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {store.phone}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 text-xs text-muted-foreground">
                    Created: {new Date(store.created_at).toLocaleDateString()}
                  </div>

                  {store.status === 'active' && (
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => router.push(`/client/dashboard?store=${store.id}`)}
                      >
                        Access Dashboard
                      </Button>
                    </div>
                  )}

                  {store.status === 'pending' && (
                    <div className="pt-2">
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        ⏳ Waiting for admin approval
                      </div>
                    </div>
                  )}

                  {store.status === 'cancelled' && store.settings?.rejection_reason && (
                    <div className="pt-2">
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        ❌ Rejected: {store.settings.rejection_reason}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}