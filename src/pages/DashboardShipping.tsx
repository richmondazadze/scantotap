import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { orderService, type Order, formatOrderStatus, getStatusColor } from '@/lib/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  ExternalLink,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Copy,
  Mail,
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import Loading from '@/components/ui/loading';

export default function DashboardShipping() {
  useAuthGuard(); // Ensure user is authenticated
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Load user orders
  const loadOrders = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.orders) {
        setOrders(result.orders);
      } else {
        toast.error(result.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'processing':
        return <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'shipped':
        return <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'delivered':
        return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const openTrackingLink = (trackingNumber: string) => {
    // Generic tracking link - in production, this would be carrier-specific
    const trackingUrl = `https://www.google.com/search?q=track+package+${trackingNumber}`;
    window.open(trackingUrl, '_blank');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrderId(orderId);
    
    try {
      const result = await orderService.cancelOrder(orderId);
      
      if (result.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders to show updated status
        await loadOrders();
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('An unexpected error occurred while cancelling the order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(trackingSearch.toLowerCase()) ||
    (order.tracking_number && order.tracking_number.toLowerCase().includes(trackingSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading shipping information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Order Tracking & Shipping
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Track your physical business card orders and shipping status
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="flex-shrink-0 h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-lg font-medium text-xs sm:text-sm"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            )}
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
        </div>
      </motion.div>

      {/* Search Orders Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span>Search Orders</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
              Search by order number or tracking number
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
            <div className="flex gap-2 sm:gap-3 lg:gap-4 min-w-0">
              <Input
                placeholder="Enter order number or tracking number..."
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                className="flex-1 h-10 sm:h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-xs sm:text-sm shadow-sm hover:shadow-md min-w-0"
              />
              <Button 
                variant="outline" 
                onClick={() => setTrackingSearch('')}
                disabled={!trackingSearch}
                className="flex-shrink-0 h-10 sm:h-12 px-3 sm:px-4 lg:px-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-xs sm:text-sm"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredOrders.length === 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {trackingSearch ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                {trackingSearch 
                  ? 'Try searching with a different order number or tracking number'
                  : 'Place your first order to see tracking information here'
                }
              </p>
              {!trackingSearch && (
                <Button 
                  onClick={() => window.location.href = '/dashboard/order'}
                  className="h-10 sm:h-12 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Place Your First Order
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status)} text-white flex-shrink-0`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {order.order_number}
                            </CardTitle>
                            <Badge 
                              variant="secondary" 
                              className={`${getStatusColor(order.status)} text-white text-xs px-2 py-1 font-medium`}
                            >
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                                 <Badge variant="outline" className="text-xs px-2 py-1">
                           ₵{order.total?.toFixed(2) || '0.00'}
                         </Badge>
                        {order.status === 'pending' && (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/dashboard/order?edit=${order.id}`}
                              className="h-7 sm:h-8 px-2 sm:px-3 text-xs border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="h-7 sm:h-8 px-2 sm:px-3 text-xs border-red-200 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              {cancellingOrderId === order.id ? (
                                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              )}
                              <span className="hidden sm:inline ml-1">Cancel</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Order Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Quantity</span>
                          <div className="font-semibold text-gray-900 dark:text-white">{order.quantity} cards</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Design</span>
                          <div className="font-semibold text-gray-900 dark:text-white">{order.design_name || 'N/A'}</div>
                        </div>
                                                 <div className="space-y-1">
                           <span className="text-gray-500 dark:text-gray-400 font-medium">Material</span>
                           <div className="font-semibold text-gray-900 dark:text-white capitalize">{order.material_name?.replace('_', ' ') || 'N/A'}</div>
                         </div>
                         <div className="space-y-1">
                           <span className="text-gray-500 dark:text-gray-400 font-medium">Total</span>
                           <div className="font-semibold text-gray-900 dark:text-white">₵{order.total?.toFixed(2) || '0.00'}</div>
                         </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            <div>{order.customer_first_name} {order.customer_last_name}</div>
                            <div>{order.shipping_address}</div>
                            <div>{order.shipping_city}, {order.shipping_state}</div>
                            <div>{order.shipping_country} {order.shipping_zip_code}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span>{order.customer_email}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(order.customer_email)}
                                className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tracking Information */}
                      {order.tracking_number && (
                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Tracking Number</span>
                              </div>
                              <div className="text-sm sm:text-base font-mono font-semibold text-blue-800 dark:text-blue-200">
                                {order.tracking_number}
                              </div>
                            </div>
                            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(order.tracking_number!)}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              >
                                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline ml-1">Copy</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openTrackingLink(order.tracking_number!)}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline ml-1">Track</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {order.special_instructions && (
                        <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300 block mb-1">Special Instructions</span>
                              <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 leading-relaxed">
                                {order.special_instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 