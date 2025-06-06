import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { orderService } from '@/lib/orderService';
import AdminNavbar from '@/components/AdminNavbar';
import AdminFooter from '@/components/AdminFooter';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  Users,
  Package,
  TrendingUp,
  Shield,
  Eye,
  Download,
  RefreshCw,
  User,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Activity,
  Copy,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Filter
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  phone?: string;
  avatar_url?: string;
  slug: string;
  links?: any[];
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  total: number;
  status: string;
  created_at: string;
  updated_at?: string;
  design_name: string;
  material_name: string;
  quantity: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
}

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProfiles: 0,
    topDesigns: [] as { design_name: string; count: number }[],
    recentSignups: 0,
    avgOrderValue: 0,
    paidOrders: 0,
    pendingOrders: 0,
    pendingRevenue: 0
  });

  // Chart data states
  const [revenueTimelineData, setRevenueTimelineData] = useState<Array<{date: string, revenue: number}>>([]);
  const [orderStatusData, setOrderStatusData] = useState<Array<{name: string, value: number, fill: string}>>([]);
  const [userGrowthData, setUserGrowthData] = useState<Array<{date: string, newUsers: number, totalUsers: number}>>([]);
  const [designPopularityData, setDesignPopularityData] = useState<Array<{name: string, value: number, fill: string}>>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState('');

  // Helper function to get user profile for an order
  const getUserProfile = (userId: string) => {
    return profiles.find(profile => profile.id === userId);
  };

  // Helper function to format order status for display
  const formatOrderStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Payment';
      case 'confirmed': return 'Payment Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Available status options for updating orders
  const statusOptions = [
    { value: 'pending', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Payment Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Check if already authenticated on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleLogin = () => {
    setLoading(true);
    
    // Get credentials from environment variables
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      toast.success('Welcome, Admin!');
      loadAdminData();
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
    toast.success('Logged out successfully');
  };

  const loadAdminData = async () => {
    setRefreshing(true);
    try {
      // Load profiles with error handling
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load orders with error handling  
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        toast.error('Failed to load user profiles');
      } else if (profilesData) {
        setProfiles(profilesData);
      }

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        toast.error('Failed to load orders');
      } else if (ordersData) {
        setOrders(ordersData);
      }

      // Calculate stats
      const totalUsers = profilesData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      
      // FIXED: Only count revenue from successfully paid orders
      const paidStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
      const paidOrders = ordersData?.filter(order => paidStatuses.includes(order.status)) || [];
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      
      const activeProfiles = profilesData?.filter(p => p.links && p.links.length > 0).length || 0;
      
      // Calculate top designs from real order data (still use all orders for design popularity)
      const designCounts = ordersData?.reduce((acc, order) => {
        const design = order.design_name || 'Unknown';
        const quantity = Number(order.quantity) || 1;
        acc[design] = (acc[design] || 0) + quantity;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topDesigns = Object.entries(designCounts)
        .map(([design_name, count]) => ({ design_name, count: Number(count) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = profilesData?.filter(p => 
        new Date(p.created_at) > thirtyDaysAgo
      ).length || 0;

      // FIXED: Calculate average order value from paid orders only
      const avgOrderValue = paidOrders.length > 0 ? Number(totalRevenue) / paidOrders.length : 0;

      setStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        activeProfiles,
        topDesigns,
        recentSignups,
        avgOrderValue,
        paidOrders: paidOrders.length,
        pendingOrders: ordersData?.filter(order => order.status === 'pending').length || 0,
        pendingRevenue: ordersData?.filter(order => order.status === 'pending').reduce((sum, order) => sum + order.total, 0) || 0
      });

      // Process chart data
      processChartData(ordersData || [], profilesData || []);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0] || {}).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} exported successfully`);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus) return;
    
    setUpdatingOrderStatus(true);
    try {
      const result = await orderService.updateOrderStatus(selectedOrder.id, newOrderStatus as any);
      
      if (result.success) {
        toast.success(`Order ${selectedOrder.order_number} status updated to ${newOrderStatus}`);
        setSelectedOrder(null);
        setNewOrderStatus('');
        loadAdminData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to shorten order number for display
  const shortenOrderNumber = (orderNumber: string) => {
    if (orderNumber.length > 20) {
      // Show first 10 characters + "..." + last 4 characters for better readability
      return orderNumber.substring(0, 10) + '...' + orderNumber.substring(orderNumber.length - 4);
    }
    return orderNumber;
  };

  // Helper function to copy order number
  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied to clipboard');
  };

  // Process data for charts
  const processChartData = (orders: Order[], profiles: Profile[]) => {
    // 1. Revenue Timeline - Group orders by date and calculate daily revenue
    const revenueByDate = orders
      .filter(order => ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status))
      .reduce((acc, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + order.total;
        return acc;
      }, {} as Record<string, number>);

    const revenueTimeline = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    setRevenueTimelineData(revenueTimeline);

    // 2. Order Status Pipeline - Count orders by status
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      pending: '#fbbf24',
      confirmed: '#3b82f6', 
      processing: '#8b5cf6',
      shipped: '#6366f1',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    const orderStatus = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: statusColors[name as keyof typeof statusColors] || '#6b7280'
    }));

    setOrderStatusData(orderStatus);

    // 3. User Growth Chart - Track new signups over time
    const userGrowthByDate = profiles.reduce((acc, profile) => {
      const date = new Date(profile.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(userGrowthByDate).sort();
    let cumulativeUsers = 0;
    
    const userGrowth = sortedDates
      .slice(-30) // Last 30 days
      .map(date => {
        const newUsers = userGrowthByDate[date];
        cumulativeUsers += newUsers;
        return {
          date,
          newUsers,
          totalUsers: cumulativeUsers
        };
      });

    setUserGrowthData(userGrowth);

    // 4. Design Popularity Pie Chart
    const designCounts = orders.reduce((acc, order) => {
      const design = order.design_name || 'Unknown';
      acc[design] = (acc[design] || 0) + (order.quantity || 1);
      return acc;
    }, {} as Record<string, number>);

    const designColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    
    const designPopularity = Object.entries(designCounts)
      .map(([name, value], index) => ({
        name,
        value,
        fill: designColors[index % designColors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 designs

    setDesignPopularityData(designPopularity);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-scan-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={loading || !username || !password}
                className="w-full bg-scan-blue hover:bg-scan-blue/90"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AdminNavbar onLogout={handleLogout} />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage and monitor your digital business card platform</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => loadAdminData()}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold">₵{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active Profiles</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.activeProfiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8"
        >
          {/* Revenue Timeline */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5 text-scan-blue" />
                Revenue Timeline
              </CardTitle>
              <CardDescription className="text-sm">
                Daily revenue over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tickFormatter={(value) => `₵${value}`} />
                    <Tooltip 
                      formatter={(value) => [`₵${value}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Pipeline */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Filter className="w-5 h-5 text-scan-blue" />
                Order Status Pipeline
              </CardTitle>
              <CardDescription className="text-sm">
                Distribution of orders by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6">
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="w-5 h-5 text-scan-blue" />
                User Growth
              </CardTitle>
              <CardDescription className="text-sm">
                New signups vs total users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalUsers" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Total Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newUsers" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.8}
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Design Popularity Pie Chart */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <PieChartIcon className="w-5 h-5 text-scan-blue" />
                Design Popularity
              </CardTitle>
              <CardDescription className="text-sm">
                Most popular design choices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={designPopularityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {designPopularityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
        </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          
          {/* User Profiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Users className="w-5 h-5 text-scan-blue" />
                      User Profiles
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Manage all user profiles and their information
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportData(profiles, 'user_profiles')}
                    disabled={profiles.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {profiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 text-sm">No profiles found</p>
                  ) : (
                    profiles.map((profile) => (
                      <div key={profile.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h4 className="font-semibold truncate text-sm sm:text-base">{profile.name}</h4>
                              {profile.links && profile.links.length > 0 && (
                                <Badge variant="secondary" className="text-xs w-fit">
                                  {profile.links.length} links
                                </Badge>
                              )}
                            </div>
                            {profile.title && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{profile.title}</p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1 truncate">
                                <Globe className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">/{profile.slug}</span>
                              </span>
                              {profile.phone && (
                                <span className="flex items-center gap-1 truncate">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{profile.phone}</span>
                            </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                {new Date(profile.created_at).toLocaleDateString()}
                            </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/profile/${profile.slug}`, '_blank')}
                            className="flex-shrink-0"
                          >
                            <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Package className="w-5 h-5 text-scan-blue" />
                      Orders
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track and manage all orders
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportData(orders, 'orders')}
                    disabled={orders.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 text-sm">No orders found</p>
                  ) : (
                    orders.map((order) => {
                      const userProfile = getUserProfile(order.user_id);
                      return (
                      <div key={order.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col gap-4">
                          {/* Order Header */}
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-sm sm:text-base truncate flex-shrink-0" title={order.order_number}>
                                    {shortenOrderNumber(order.order_number)}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyOrderNumber(order.order_number)}
                                    className="text-xs h-6 px-2 flex-shrink-0"
                                    title="Copy full order number"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {order.customer_first_name} {order.customer_last_name}
                                </p>
                                {userProfile && (
                                  <p className="text-xs text-blue-600 truncate">
                                    Profile: {userProfile.name} (@{userProfile.slug})
                                  </p>
                                )}
                              </div>
                              <div className="text-left sm:text-right flex-shrink-0">
                                <Badge className={`text-xs mb-1 ${getStatusColor(order.status || 'pending')}`}>
                                  {formatOrderStatus(order.status || 'pending')}
                                </Badge>
                                <p className="font-semibold text-sm sm:text-base">₵{Number(order.total).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {/* Product Details */}
                            <div className="space-y-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Product</h5>
                              <p className="text-gray-600">Design: {order.design_name}</p>
                              <p className="text-gray-600">Material: {order.material_name || 'Standard'}</p>
                              <p className="text-gray-600">Quantity: {order.quantity}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Contact</h5>
                              <p className="text-gray-600 truncate">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {order.customer_email}
                              </p>
                              {order.customer_phone && (
                                <p className="text-gray-600">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  {order.customer_phone}
                                </p>
                              )}
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Shipping</h5>
                              <p className="text-gray-600">{order.shipping_address}</p>
                              <p className="text-gray-600">
                                {order.shipping_city}, {order.shipping_state}
                              </p>
                              <p className="text-gray-600">{order.shipping_country}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewOrderStatus(order.status || 'pending');
                                  }}
                                  className="text-xs"
                                >
                                  <Package className="w-3 h-3 mr-1" />
                                  Update Status
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Update Order Status</h4>
                                    <p className="text-sm text-gray-600">
                                      Order: {order.order_number}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Customer: {order.customer_first_name} {order.customer_last_name}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">New Status</label>
                                    <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statusOptions.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={updateOrderStatus}
                                      disabled={updatingOrderStatus || newOrderStatus === order.status}
                                      className="flex-1"
                                    >
                                      {updatingOrderStatus ? 'Updating...' : 'Update Status'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {userProfile && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/profile/${userProfile.slug}`, '_blank')}
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const orderInfo = `Order: ${order.order_number}\nCustomer: ${order.customer_first_name} ${order.customer_last_name}\nEmail: ${order.customer_email}\nTotal: ₵${order.total.toFixed(2)}`;
                                navigator.clipboard.writeText(orderInfo);
                                toast.success('Order details copied to clipboard');
                              }}
                              className="text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )})
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="w-5 h-5 text-scan-blue" />
                System Information
              </CardTitle>
              <CardDescription className="text-sm">
                Platform analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Top Designs</h4>
                  <div className="space-y-2">
                    {stats.topDesigns.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500">No orders yet</p>
                    ) : (
                      stats.topDesigns.map((design) => (
                        <div key={design.design_name} className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="truncate mr-2">{design.design_name}</span>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">{design.count} sold</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Analytics</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <p>• {stats.totalUsers} total users</p>
                    <p>• {stats.recentSignups} new users (30 days)</p>
                    <p className="text-green-600 font-medium">• ₵{stats.totalRevenue.toFixed(2)} confirmed revenue ({stats.paidOrders} orders)</p>
                    <p className="text-yellow-600">• ₵{stats.pendingRevenue.toFixed(2)} pending revenue ({stats.pendingOrders} orders)</p>
                    <p>• ₵{stats.avgOrderValue.toFixed(2)} avg order value</p>
                    <p>• {stats.activeProfiles} active profiles</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Platform Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="truncate mr-2">Profile Completion</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {stats.totalUsers > 0 ? Math.round((stats.activeProfiles / stats.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="truncate mr-2">Conversion Rate</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {stats.totalUsers > 0 ? Math.round((stats.totalOrders / stats.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="truncate mr-2">Growth (30d)</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        +{stats.recentSignups} users
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminPage;
