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
import {
  Users,
  Package,
  TrendingUp,
  Shield,
  Eye,
  Download,
  RefreshCw,
  LogOut,
  User,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Activity
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
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  design_name: string;
  quantity: number;
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
    avgOrderValue: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState('');

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
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;
      const activeProfiles = profilesData?.filter(p => p.links && p.links.length > 0).length || 0;
      
      // Calculate top designs from real order data
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

      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? Number(totalRevenue) / totalOrders : 0;

      setStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        activeProfiles,
        topDesigns,
        recentSignups,
        avgOrderValue
      });

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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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
                    orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{order.order_number}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {order.customer_first_name} {order.customer_last_name}
                            </p>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0 flex flex-col gap-2">
                            <p className="font-semibold text-sm sm:text-base">₵{Number(order.total).toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getStatusColor(order.status || 'pending')}`}>
                                {order.status || 'pending'}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setNewOrderStatus(order.status || 'pending');
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Update
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Order Status</DialogTitle>
                                    <DialogDescription>
                                      Update the status for order {order.order_number}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Order Status</label>
                                      <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="confirmed">Confirmed</SelectItem>
                                          <SelectItem value="processing">Processing</SelectItem>
                                          <SelectItem value="shipped">Shipped</SelectItem>
                                          <SelectItem value="delivered">Delivered</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{order.customer_email}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <Package className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{order.design_name} x{order.quantity}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {new Date(order.created_at).toLocaleDateString()}
                            </span>
                        </div>
                      </div>
                    ))
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
                    <p>• ₵{stats.totalRevenue.toFixed(2)} total revenue</p>
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
    </div>
  );
};

export default AdminPage;
