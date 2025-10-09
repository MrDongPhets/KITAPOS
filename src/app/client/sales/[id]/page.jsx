// src/app/client/sales/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Printer,
  XCircle,
  Loader2,
  AlertCircle,
  Receipt,
  User,
  Store,
  CreditCard,
  Package,
  Calendar,
  Hash
} from 'lucide-react';
import API_CONFIG from '@/config/api';

export default function SaleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sale, setSale] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && saleId) {
      fetchSaleDetails();
    }
  }, [user, saleId]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  };

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/sales/${saleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sale not found');
        }
        throw new Error('Failed to fetch sale details');
      }

      const data = await response.json();
      setSale(data.sale);

    } catch (err) {
      console.error('Error fetching sale:', err);
      setError(err.message || 'Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleVoidSale = async () => {
    if (!voidReason.trim()) {
      alert('Please provide a reason for voiding this sale');
      return;
    }

    try {
      setVoidLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/sales/${saleId}/void`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: voidReason })
      });

      if (!response.ok) throw new Error('Failed to void sale');

      setVoidDialogOpen(false);
      fetchSaleDetails(); // Refresh data
      alert('Sale voided successfully');

    } catch (err) {
      console.error('Error voiding sale:', err);
      alert('Failed to void sale: ' + err.message);
    } finally {
      setVoidLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentBadgeColor = (method) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      gcash: 'bg-purple-100 text-purple-800',
      bank: 'bg-orange-100 text-orange-800'
    };
    return colors[method?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar userType="client" user={user} />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar userType="client" user={user} />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <h2 className="text-2xl font-bold">Error Loading Sale</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/client/sales')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!sale) return null;

  const isVoided = sale.notes?.includes('VOIDED');

  return (
    <SidebarProvider>
      <AppSidebar userType="client" user={user} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/client">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/client/sales">Sales</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sale Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sale Details</h1>
                <p className="text-muted-foreground mt-1 font-mono">
                  {sale.receipt_number}
                </p>
              </div>
              {isVoided && (
                <Badge variant="destructive" className="ml-4">VOIDED</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {!isVoided && (
                <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Void Sale
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Void Sale</DialogTitle>
                      <DialogDescription>
                        This action will void/cancel this sale transaction. Please provide a reason.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for voiding</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter reason..."
                          value={voidReason}
                          onChange={(e) => setVoidReason(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setVoidDialogOpen(false)}
                        disabled={voidLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleVoidSale}
                        disabled={voidLoading || !voidReason.trim()}
                      >
                        {voidLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Voiding...
                          </>
                        ) : (
                          'Void Sale'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Sale Information */}
            <div className="md:col-span-2 space-y-4">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Receipt Number</Label>
                    <p className="text-lg font-mono">{sale.receipt_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                    <p className="text-sm">{formatDate(sale.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Payment Method</Label>
                    <Badge className={`${getPaymentBadgeColor(sale.payment_method)} mt-1`}>
                      {sale.payment_method?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Items Count</Label>
                    <p className="text-sm">{sale.items_count} items</p>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items ({sale.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.products?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  SKU: {item.products?.sku}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.discount_amount > 0 ? (
                                <span className="text-orange-600">
                                  -{formatCurrency(item.discount_amount)}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {sale.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{sale.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Total Amount */}
              <Card>
                <CardHeader>
                  <CardTitle>Amount Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(sale.subtotal || sale.total_amount)}</span>
                  </div>
                  {sale.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-orange-600">
                        -{formatCurrency(sale.discount_amount)}
                      </span>
                    </div>
                  )}
                  {sale.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(sale.tax_amount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(sale.total_amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium">
                      {sale.customer_name || 'Walk-in Customer'}
                    </p>
                  </div>
                  {sale.customer_phone && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="text-sm">{sale.customer_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Store Info */}
              {sale.stores && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Store className="h-4 w-4" />
                      Store Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Store Name</Label>
                      <p className="text-sm font-medium">{sale.stores.name}</p>
                    </div>
                    {sale.stores.address && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <p className="text-sm">{sale.stores.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Staff Info */}
              {sale.staff && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Staff Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Staff Name</Label>
                      <p className="text-sm font-medium">{sale.staff.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Staff ID</Label>
                      <p className="text-sm font-mono">{sale.staff.staff_id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <Badge variant="outline">{sale.staff.role}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}