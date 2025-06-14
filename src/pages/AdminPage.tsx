import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { adminService } from '@/lib/adminService';
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
import AdminQRViewer from '@/components/AdminQRViewer';
import type { Json } from '@/types/supabase';
import {
  AreaChart,
  BarChart,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Metric,
  Grid,
  Col,
  Flex,
  ProgressBar,
  List,
  ListItem
} from '@tremor/react';
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
  Filter,
  LogOut,
  Timer,
  QrCode,
  Search,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { Chart } from 'react-google-charts';

interface Profile {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  phone?: string;
  avatar_url?: string;
  slug: string;
  links?: Json;
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
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Search and filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'slug'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
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

  // Custom color schemes for charts
  const chartColors = {
    revenue: ["#1e3a8a", "#2563eb", "#0e7490"], // deep blue, blue, teal
    status: ["#059669", "#0ea5e9", "#2563eb", "#1e3a8a", "#334155", "#64748b"], // green, blue, navy, slate
    design: [
      "#1e3a8a", // blue-900
      "#2563eb", // blue-600
      "#0e7490", // teal-700
      "#059669", // green-600
      "#334155", // slate-800
      "#64748b", // slate-500
      "#0ea5e9", // sky-500
      "#0369a1"  // cyan-800
    ]
  };

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

  // Check authentication status and setup session timer
  useEffect(() => {
    let lastAsyncCheck = 0; // Track last async validation time

    const checkAuth = async () => {
      // Use sync check for immediate UI update
      const isSyncAuth = adminService.isAuthenticatedSync();
      setIsAuthenticated(isSyncAuth);
      
      if (isSyncAuth) {
        setSessionTimeRemaining(adminService.getSessionTimeRemaining());
        
        // Then do async validation
        const isAsyncAuth = await adminService.isAuthenticated();
        setIsAuthenticated(isAsyncAuth);
        
        if (isAsyncAuth) {
          loadAdminData();
        }
      }
    };

    checkAuth();

    // Set up session timer
    const sessionTimer = setInterval(async () => {
      // Use sync check first for immediate response
      if (adminService.isAuthenticatedSync()) {
        const timeRemaining = adminService.getSessionTimeRemaining();
        setSessionTimeRemaining(timeRemaining);
        
        // Auto-extend session if needed
        if (adminService.needsRenewal()) {
          await adminService.extendSession();
          toast.success('Session extended automatically');
        }
        
        // Warn when session is about to expire
        if (timeRemaining <= 5 && timeRemaining > 0) {
          toast.warning(`Session expires in ${timeRemaining} minutes`);
        }
        
        // Do async validation periodically (every 5 minutes)
        const now = Date.now();
        if (!lastAsyncCheck || now - lastAsyncCheck > 5 * 60 * 1000) {
          const isValid = await adminService.isAuthenticated();
          if (!isValid) {
            setIsAuthenticated(false);
            setSessionTimeRemaining(0);
          }
          lastAsyncCheck = now;
        }
      } else {
        setIsAuthenticated(false);
        setSessionTimeRemaining(0);
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionTimer);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await adminService.login(username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setSessionTimeRemaining(adminService.getSessionTimeRemaining());
        toast.success(`Welcome, ${adminService.getCurrentUser()?.username}!`);
        loadAdminData();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminService.logout();
    setIsAuthenticated(false);
    setSessionTimeRemaining(0);
    setUsername('');
    setPassword('');
  };

  const extendSession = async () => {
    await adminService.extendSession();
    setSessionTimeRemaining(adminService.getSessionTimeRemaining());
  };

  // Search and filtering functions
  const filteredAndSortedProfiles = () => {
    let filtered = profiles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(query) ||
        profile.slug.toLowerCase().includes(query) ||
        (profile.title && profile.title.toLowerCase().includes(query)) ||
        (profile.bio && profile.bio.toLowerCase().includes(query)) ||
        (profile.phone && profile.phone.includes(query))
      );
    }

    // Apply activity filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(profile => {
        const profileLinks = Array.isArray(profile.links) ? profile.links : [];
        const isActive = profileLinks.length > 0;
        return filterBy === 'active' ? isActive : !isActive;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'slug':
          aValue = a.slug.toLowerCase();
          bValue = b.slug.toLowerCase();
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSortBy('created_at');
    setSortOrder('desc');
    setFilterBy('all');
    setOrderSearchQuery('');
  };

  const getSearchResultsText = () => {
    const filtered = filteredAndSortedProfiles();
    const total = profiles.length;
    
    if (searchQuery.trim() || filterBy !== 'all') {
      return `Showing ${filtered.length} of ${total} users`;
    }
    return `${total} users total`;
  };

  // Order filtering function
  const filteredOrders = () => {
    if (!orderSearchQuery.trim()) {
      return orders;
    }

    const query = orderSearchQuery.toLowerCase().trim();
    return orders.filter(order => {
      const userProfile = getUserProfile(order.user_id);
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer_first_name.toLowerCase().includes(query) ||
        order.customer_last_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        (order.customer_phone && order.customer_phone.includes(query)) ||
        order.design_name.toLowerCase().includes(query) ||
        (order.material_name && order.material_name.toLowerCase().includes(query)) ||
        order.status.toLowerCase().includes(query) ||
        (userProfile && userProfile.name.toLowerCase().includes(query)) ||
        (userProfile && userProfile.slug.toLowerCase().includes(query))
      );
    });
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
      
      const activeProfiles = profilesData?.filter(p => {
        const profileLinks = Array.isArray(p.links) ? p.links : [];
        return profileLinks.length > 0;
      }).length || 0;
      
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
      const result = await orderService.adminUpdateOrderStatus(selectedOrder.id, newOrderStatus as any);
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
      <div className="min-h-screen bg-gradient-to-br from-scan-blue/5 via-white to-scan-purple/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-scan-blue to-scan-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent font-serif">
                Admin Access
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-12 text-base border-2 focus:border-scan-blue transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 text-base border-2 focus:border-scan-blue transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={loading || !username || !password}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue/90 hover:to-scan-purple/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Secure admin access • Session expires after 8 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <AdminNavbar onLogout={handleLogout} />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 overflow-x-hidden">
        
        {/* Enhanced Header with Session Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white font-serif">Analytics Overview</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage and monitor your digital business card platform</p>
            
            {/* Session Info */}
            <div className="flex items-center gap-4 mt-3 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Welcome, {adminService.getCurrentUser()?.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Timer className="w-4 h-4" />
                <span>{sessionTimeRemaining}m remaining</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {sessionTimeRemaining < 60 && (
              <Button
                variant="outline"
                onClick={extendSession}
                className="w-full sm:w-auto border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Extend Session
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => loadAdminData()}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 sm:gap-6 mb-6 mt-6 sm:mt-0">
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOrders}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₵{stats.totalRevenue.toFixed(2)}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                    <Activity className="w-6 h-6 text-orange-600" />
              </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Profiles</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeProfiles}</Metric>
                </Flex>
            </CardContent>
          </Card>
          </Col>
        </Grid>

        {/* Order Status Cards */}
        <div className="mb-2 sm:mb-4 mt-4 sm:mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">General Order Status Overview</h3>
        </div>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 sm:gap-6 mb-6">
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Confirmed</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderStatusData.find(s => s.name === 'Confirmed')?.value || 0}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Orders</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderStatusData.find(s => s.name === 'Processing')?.value || 0}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipped Orders</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderStatusData.find(s => s.name === 'Shipped')?.value || 0}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
          <div className="block sm:hidden w-full flex justify-center my-2">
            <div className="h-6 border-l-2 border-gray-200" style={{ height: 32 }} />
          </div>
          <Col numColSpan={1} className="flex flex-col items-center text-center">
            <Card className="h-full w-full">
              <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
                <Flex className="flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered Orders</Text>
                  <Metric className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderStatusData.find(s => s.name === 'Delivered')?.value || 0}</Metric>
                </Flex>
              </CardContent>
            </Card>
          </Col>
        </Grid>

        {/* Analytics Charts */}
        <Grid numItems={1} numItemsLg={2} className="gap-4 sm:gap-6 mb-6">
          <Col numColSpan={1}>
            <Card className="h-full">
              <CardHeader>
                <Title className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Timeline</Title>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Daily revenue over the last 30 days</Text>
              </CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <Chart
                    chartType="LineChart"
                    width="100%"
                    height="100%"
                    data={[
                      ["Date", "Revenue"],
                      ...revenueTimelineData.map(d => [d.date, d.revenue])
                    ]}
                    options={{
                      legend: { position: 'bottom', textStyle: { color: '#222', fontSize: 14 } },
                      hAxis: { title: 'Date', textStyle: { color: '#222' }, titleTextStyle: { color: '#222' } },
                      vAxis: { title: 'Revenue (₵)', textStyle: { color: '#222' }, titleTextStyle: { color: '#222' } },
                      backgroundColor: 'transparent',
                      colors: ['#6366f1'],
                      chartArea: { left: 60, top: 40, width: '80%', height: '70%' },
                      pointSize: 5,
                      lineWidth: 3,
                      fontName: 'inherit',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Col>
          <Col numColSpan={1}>
            <Card className="h-full">
              <CardHeader>
                <Title className="text-lg font-semibold text-gray-900 dark:text-white">Most Popular Designs</Title>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Order count by design</Text>
              </CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="100%"
                    data={[
                      ["Design", "Orders"],
                      ...designPopularityData.map(d => [d.name, d.value])
                    ]}
                    options={{
                      legend: { position: 'bottom', textStyle: { color: '#222', fontSize: 14 } },
                      backgroundColor: 'transparent',
                      chartArea: { left: 20, top: 20, width: '90%', height: '80%' },
                      fontName: 'inherit',
                      slices: designPopularityData.reduce((acc, d, i) => {
                        acc[i] = { color: chartColors.design[i % chartColors.design.length] };
                        return acc;
                      }, {}),
                      pieSliceText: 'percentage',
                      pieSliceTextStyle: {
                        color: '#fff',
                        fontSize: 20,
                        bold: true,
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Col>
        </Grid>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          
          {/* User Profiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
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
                      onClick={() => exportData(filteredAndSortedProfiles(), 'user_profiles')}
                      disabled={profiles.length === 0}
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search users by name, slug, title, bio, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Filter and Sort Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {/* Activity Filter */}
                      <Select value={filterBy} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterBy(value)}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active Profiles</SelectItem>
                          <SelectItem value="inactive">Inactive Profiles</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sort By */}
                      <Select value={sortBy} onValueChange={(value: 'name' | 'created_at' | 'slug') => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">Sort by Date</SelectItem>
                          <SelectItem value="name">Sort by Name</SelectItem>
                          <SelectItem value="slug">Sort by Username</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sort Order */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="w-full sm:w-auto gap-2"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      </Button>

                      {/* Clear Filters */}
                      {(searchQuery || filterBy !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="w-full sm:w-auto gap-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{getSearchResultsText()}</span>
                      {(searchQuery || filterBy !== 'all') && (
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {filteredAndSortedProfiles().length === 0 ? (
                    <div className="text-center py-8">
                      {searchQuery || filterBy !== 'all' ? (
                        <div className="space-y-2">
                          <p className="text-gray-500 text-sm">No users match your search criteria</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSearch}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No users found</p>
                      )}
                    </div>
                  ) : (
                    filteredAndSortedProfiles().map((profile) => (
                      <div key={profile.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-scan-blue to-scan-purple rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm sm:text-base truncate">{profile.name}</h4>
                                {(() => {
                                  const profileLinks = Array.isArray(profile.links) ? profile.links : [];
                                  return profileLinks.length > 0 ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Inactive
                                    </Badge>
                                  );
                                })()}
                              </div>
                              {profile.title && (
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{profile.title}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 flex-shrink-0" />
                                  /{profile.slug}
                                </span>
                                {profile.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    {profile.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <AdminQRViewer profile={profile} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/profile/${profile.slug}`, '_blank')}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Profile
                            </Button>
                          </div>
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
                <div className="flex flex-col gap-4">
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
                      onClick={() => exportData(filteredOrders(), 'orders')}
                      disabled={filteredOrders().length === 0}
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>

                  {/* Order Search */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search orders by number, customer, email, design, status, or profile..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-10"
                      />
                      {orderSearchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Order Results Summary */}
                    {orderSearchQuery && (
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Showing {filteredOrders().length} of {orders.length} orders</span>
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {filteredOrders().length === 0 ? (
                    <div className="text-center py-8">
                      {orderSearchQuery ? (
                        <div className="space-y-2">
                          <p className="text-gray-500 text-sm">No orders match your search criteria</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrderSearchQuery('')}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear search
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No orders found</p>
                      )}
                    </div>
                  ) : (
                    filteredOrders().map((order) => {
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
                                <DialogTitle>Update Order Status</DialogTitle>
                                <DialogDescription>
                                  Change the status of this order for tracking and fulfillment.
                                </DialogDescription>
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
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/profile/${userProfile.slug}`, '_blank')}
                                className="text-xs gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View Profile
                              </Button>
                            )}
                            
                            {userProfile && (
                              <AdminQRViewer profile={userProfile} />
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
