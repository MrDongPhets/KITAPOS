// src/app/admin/store-requests/page.js
'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building
} from 'lucide-react'
import { toast } from "sonner"
import API_CONFIG from '@/config/api'

export default function StoreRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/store-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      } else {
        toast.error('Failed to fetch store requests')
      }
    } catch (error) {
      console.error('Fetch requests error:', error)
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (storeId) => {
    setProcessingId(storeId)
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/store-requests/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ store_id: storeId })
      })

      if (response.ok) {
        toast.success('Store approved successfully!')
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve store')
      }
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Network error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (storeId, reason) => {
    setProcessingId(storeId)
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/store-requests/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          store_id: storeId,
          reason: reason 
        })
      })

      if (response.ok) {
        toast.success('Store request rejected')
        fetchRequests()
        setRejectionReason('')
        setSelectedRequest(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to reject store')
      }
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Network error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        icon: Clock, 
        text: "Pending Review",
        className: "bg-yellow-100 text-yellow-800"
      },
      active: { 
        icon: CheckCircle, 
        text: "Approved",
        className: "bg-green-100 text-green-800"
      },
      cancelled: { 
        icon: XCircle, 
        text: "Rejected",
        className: "bg-red-100 text-red-800"
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
            <p className="mt-2 text-muted-foreground">Loading store requests...</p>
          </div>
        </div>
      </div>
    )
  }

  const pendingRequests = requests.filter(req => req.status === 'pending')
  const processedRequests = requests.filter(req => req.status !== 'pending')

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Store Requests</h1>
        <p className="text-muted-foreground">Review and approve new store requests</p>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-600">
            Pending Approval ({pendingRequests.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-600" />
                      <CardTitle className="text-lg">{request.name}</CardTitle>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{request.company_name}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {request.address}
                      </span>
                    </div>
                    
                    {request.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {request.phone}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {processingId === request.id ? 'Processing...' : 'Approve'}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setSelectedRequest(request)}
                            disabled={processingId === request.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Store Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Store Name</Label>
                              <p className="text-sm text-muted-foreground">{selectedRequest?.name}</p>
                            </div>
                            <div>
                              <Label htmlFor="reason">Rejection Reason</Label>
                              <Textarea
                                id="reason"
                                placeholder="Please provide a reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="destructive" 
                                onClick={() => handleReject(selectedRequest?.id, rejectionReason)}
                                disabled={!rejectionReason.trim() || processingId === selectedRequest?.id}
                              >
                                Confirm Rejection
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Recent Decisions ({processedRequests.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{request.name}</CardTitle>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.company_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Processed: {new Date(request.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No store requests</h3>
            <p className="text-muted-foreground">
              No store requests have been submitted yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}