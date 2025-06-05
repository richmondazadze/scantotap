import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Mail
} from 'lucide-react';

export default function DashboardShipping() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  // Filter orders based on search
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(trackingSearch.toLowerCase()) ||
    (order.tracking_number && order.tracking_number.toLowerCase().includes(trackingSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full flex-1 pb-6 w-full px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600">Loading your orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full pb-12 sm:pb-16 gap-8 mt-6 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-scan-blue dark:text-scan-blue-light mb-2">
              Order Tracking & Shipping
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track your digital business card orders and shipping status
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Orders
            </CardTitle>
            <CardDescription>
              Search by order number or tracking number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number or tracking number..."
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => setTrackingSearch('')}
                disabled={!trackingSearch}
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
                    <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
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
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
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
                      window.location.href = `mailto:support@tapverse.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
      <div className="block sm:hidden border-b border-gray-200 mb-12"></div>
      <br></br>
      
    </div>
  );
} 