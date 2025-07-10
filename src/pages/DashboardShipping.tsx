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
  Loader2
} from 'lucide-react';
import Loading from '@/components/ui/loading';

export default function DashboardShipping() {
  useAuthGuard(); // Ensure user is authenticated
  
  // Card styles - consistent with other dashboard pages
  const cardBase = 'relative rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/60 dark:hover:border-scan-blue/30';
  const cardTitle = 'text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent';
  const cardDesc = 'text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed';
  
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
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-12 sm:pb-16 gap-8 mt-6 px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text="Loading shipping information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-8 sm:pb-18 gap-6 sm:gap-8 lg:gap-10 mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent mb-3">
              Order Tracking & Shipping
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Track your physical business card orders and shipping status
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="w-full sm:w-auto h-12 px-6 border-2 border-scan-blue/20 hover:border-scan-blue/40 hover:bg-scan-blue/5 transition-all rounded-xl font-medium"
          >
            {refreshing ? (
              <Loading size="sm" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cardBase}
      >
        <h2 className={cardTitle}>Search Orders</h2>
        <p className={cardDesc}>Search by order number or tracking number</p>
        
        <div className="flex gap-3 sm:gap-4">
          <Input
            placeholder="Enter order number or tracking number..."
            value={trackingSearch}
            onChange={(e) => setTrackingSearch(e.target.value)}
            className="flex-1 bg-white/95 dark:bg-[#1A1D24]/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-2 focus:ring-scan-blue/30 focus:border-scan-blue/50 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
          />
          <Button 
            variant="outline" 
            onClick={() => setTrackingSearch('')}
            disabled={!trackingSearch}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Clear
          </Button>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6"
      >
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {trackingSearch ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {trackingSearch 
                  ? 'Try searching with a different order number or tracking number'
                  : 'Place your first order to see tracking information here'
                }
              </p>
              {!trackingSearch && (
                <Button onClick={() => window.location.href = '/dashboard/order'}>
                  Place Your First Order
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(order.status)} text-white`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ordered on {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <span className="text-lg font-bold">₵{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Details
                    </h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>{order.design_name} Design</div>
                      <div>{order.material_name} Material</div>
                      <div>Quantity: {order.quantity}</div>
                      <div>{order.color_scheme_name}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="text-sm text-gray-600">
                      <div>{order.customer_first_name} {order.customer_last_name}</div>
                      <div>{order.shipping_address}</div>
                      <div>{order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}</div>
                      <div>{order.shipping_country}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing
                    </h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₵{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{order.shipping === 0 ? 'Free' : `₵${order.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₵{order.tax.toFixed(2)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₵{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {order.tracking_number && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Tracking Information
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Tracking Number:</div>
                        <div className="font-mono text-lg font-semibold">{order.tracking_number}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(order.tracking_number!)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => openTrackingLink(order.tracking_number!)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Track Package
                        </Button>
                      </div>
                    </div>
                    
                    {/* Shipping Timeline */}
                    {(order.shipped_at || order.delivered_at) && (
                      <div className="mt-4 space-y-2">
                        <h5 className="font-medium">Shipping Timeline:</h5>
                        <div className="space-y-1 text-sm">
                          {order.shipped_at && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Truck className="w-3 h-3" />
                              Shipped on {new Date(order.shipped_at).toLocaleDateString()}
                            </div>
                          )}
                          {order.delivered_at && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(order.order_number)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Order Number
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const subject = `Order ${order.order_number} - Support Request`;
                      const body = `Hi, I have a question about my order ${order.order_number}. `;
                      window.location.href = `mailto:support@scan2tap.vercel.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Contact Support
                  </Button>
                  
                  {order.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/order?edit=${order.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Modify Order
                    </Button>
                  )}
                  
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      {cancellingOrderId === order.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
} 