// src/app/client/sales/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Receipt
} from 'lucide-react';
import API_CONFIG from '@/config/api';

export default function SalesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stores, setStores] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user, page, selectedStore, selectedStaff, selectedPayment, dateRange]);

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

  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday.setHours(0, 0, 0, 0));
        end = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      case 'all':
        return {};
      default:
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
    }

    return {
      start_date: start.toISOString(),
      end_date: end.toISOString()
    };
  };

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch stores and staff for filters
      const [storesRes, staffRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/stores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/staff`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (storesRes.ok) {
        const storesData = await storesRes.json();
        setStores(storesData.stores || []);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.staff || []);
      }

      // Fetch summary
      fetchSummary();
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const { start_date, end_date } = getDateRange();
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (selectedStore !== 'all') params.append('store_id', selectedStore);
      if (selectedStaff !== 'all') params.append('staff_id', selectedStaff);
      if (selectedPayment !== 'all') params.append('payment_method', selectedPayment);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/sales?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch sales');

      const data = await response.json();
      setSales(data.sales || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);

    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { start_date, end_date } = getDateRange();

      const params = new URLSearchParams();
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      if (selectedStore !== 'all') params.append('store_id', selectedStore);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/sales/summary?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchSales();
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
      month: 'short',
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

  if (loading && !sales.length) {
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Sales</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales Transactions</h1>
              <p className="text-muted-foreground mt-1">
                Manage and view all sales transactions
              </p>
            </div>
          </div>

          {/* Summary Cards - Only show if there's data */}
          {summary && summary.total_transactions > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.total_sales)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.total_transactions} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.average_transaction)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.total_items} items sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.total_transactions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total count
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Discounts</CardTitle>
                  <Receipt className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.total_discount)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Given to customers
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="search"
                        placeholder="Search receipt, customer..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Date Range */}
                <Select value={dateRange} onValueChange={(value) => {
                  setDateRange(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                {/* Store Filter */}
                <Select value={selectedStore} onValueChange={(value) => {
                  setSelectedStore(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Payment Method Filter */}
                <Select value={selectedPayment} onValueChange={(value) => {
                  setSelectedPayment(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Transactions</CardTitle>
                  <CardDescription>
                    Showing {sales.length} of {totalCount} transactions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                        </TableCell>
                      </TableRow>
                    ) : sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No sales found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">
                            {sale.receipt_number}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(sale.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {sale.customer_name || 'Walk-in Customer'}
                              </p>
                              {sale.customer_phone && (
                                <p className="text-muted-foreground text-xs">
                                  {sale.customer_phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sale.items_count} items</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentBadgeColor(sale.payment_method)}>
                              {sale.payment_method?.toUpperCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {sale.staff?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(sale.total_amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Link href={`/client/sales/${sale.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}