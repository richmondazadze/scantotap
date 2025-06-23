import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { orderService, type OrderData, type Order } from '@/lib/orderService';
import { paymentService, type PaymentData } from '@/lib/paymentService';
import { CardDesignPreview } from '@/components/CardDesignPreview';
import { CardMaterialShowcase } from '@/components/CardMaterialShowcase';
import inventoryService, { type CardType, type ColorScheme } from '@/services/inventoryService';

import { 
  CreditCard, 
  Truck, 
  Star, 
  Check, 
  Plus, 
  Minus,
  User,
  Package,
  Zap,
  Shield,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Loading from '@/components/ui/loading';
import GhanaLocationSelector from '@/components/GhanaLocationSelector';
import DeliveryLocationNotice from '@/components/DeliveryLocationNotice';

// Card type ID mapping (UUID to string names for frontend)
const CARD_TYPE_MAPPING = {
  "classic": "ab889570-cd24-45a8-a8aa-9b64e7f047c9",
  "premium": "2455d29b-d7de-4dcd-aa54-95d9ceaa8f3f", 
  "metal": "6eebcc1a-b072-40fa-90e7-a11ac13708a1"
};

// Helper to get string name from UUID
const getCardTypeNameFromId = (id: string): string => {
  const entry = Object.entries(CARD_TYPE_MAPPING).find(([name, uuid]) => uuid === id);
  return entry ? entry[0] : id;
};

// Convert inventory data to display format
const convertCardTypeToDesign = (cardType: CardType) => ({
  id: cardType.id,
  name: cardType.name,
  description: cardType.description || '',
  price: cardType.price_modifier,
  features: getFeatures(cardType.name),
  popular: cardType.name === 'Premium',
  isAvailable: cardType.is_available,
  hasStockLimit: cardType.has_stock_limit,
  stockQuantity: cardType.stock_quantity,
  isOutOfStock: cardType.has_stock_limit && (cardType.stock_quantity || 0) <= 0,
  // Add string name for easier identification
  stringId: getCardTypeNameFromId(cardType.id)
});

const convertColorSchemeToOption = (colorScheme: ColorScheme) => ({
  id: colorScheme.id,
  name: colorScheme.name,
  primary: colorScheme.primary_color,
  secondary: colorScheme.secondary_color || colorScheme.primary_color,
  isAvailable: colorScheme.is_available,
  hasStockLimit: colorScheme.has_stock_limit,
  stockQuantity: colorScheme.stock_quantity,
  isOutOfStock: colorScheme.has_stock_limit && (colorScheme.stock_quantity || 0) <= 0
});

// Helper function to get features based on card type name
const getFeatures = (cardTypeName: string): string[] => {
  switch (cardTypeName.toLowerCase()) {
    case 'classic':
      return ['QR Code', 'Contact Info', 'Social Links'];
    case 'premium':
      return ['QR Code', 'Contact Info', 'Social Links', 'Custom Colors', 'Premium Material'];
    case 'metal':
      return ['QR Code', 'Contact Info', 'Social Links', 'Metal Material', 'Laser Engraving', 'Lifetime Warranty'];
    default:
      return ['QR Code', 'Contact Info', 'Social Links'];
  }
};

// Helper function to get stock status display
const getStockStatusBadge = (item: { isAvailable: boolean; hasStockLimit: boolean; stockQuantity: number | null; isOutOfStock: boolean }) => {
  if (!item.isAvailable || item.isOutOfStock) {
    return (
      <Badge variant="destructive" className="absolute top-2 left-2 bg-red-500 text-white">
        Out of Stock
      </Badge>
    );
  }
  
  if (item.hasStockLimit && item.stockQuantity !== null && item.stockQuantity <= 5) {
    return (
      <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-500 text-white">
        {item.stockQuantity} left
      </Badge>
    );
  }
  
  return null;
};

// Materials are now inherent to each card type - no validation needed

export default function DashboardOrder() {
  useAuthGuard(); // Ensure user is authenticated
  const { profile } = useProfile();
  
  // Card styles - consistent with other dashboard pages
  const cardBase = 'relative rounded-xl shadow-lg p-6 sm:p-8 md:p-6 lg:p-10 bg-white/95 dark:bg-[#1A1D24]/95 border border-gray-200/50 dark:border-scan-blue/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-[#1A1D24] hover:border-gray-300/60 dark:hover:border-scan-blue/30';
  const cardTitle = 'text-xl sm:text-2xl md:text-xl lg:text-3xl font-bold mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent';
  const cardDesc = 'text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 md:mb-6 lg:mb-8 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed';
  
  // Inventory data state
  const [cardDesigns, setCardDesigns] = useState<Array<ReturnType<typeof convertCardTypeToDesign>>>([]);
  const [colorSchemes, setColorSchemes] = useState<Array<ReturnType<typeof convertColorSchemeToOption>>>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  
  // Check if we're editing an existing order
  const urlParams = new URLSearchParams(window.location.search);
  const editOrderId = urlParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editOrderId);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(!!editOrderId);
  
  const [selectedDesign, setSelectedDesign] = useState<ReturnType<typeof convertCardTypeToDesign> | null>(null);
  const [selectedColor, setSelectedColor] = useState<ReturnType<typeof convertColorSchemeToOption> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana',
    specialInstructions: ''
  });

  // Ghana location state
  const [ghanaLocation, setGhanaLocation] = useState({
    city: '',
    region: '',
    shippingCost: 0,
    deliveryDays: ''
  });

  // Load inventory data
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoadingInventory(true);
        const inventory = await inventoryService.getAvailableInventory();
        
        const designs = inventory.cardTypes.map(convertCardTypeToDesign);
        const colors = inventory.colorSchemes.map(convertColorSchemeToOption);
        
        setCardDesigns(designs);
        setColorSchemes(colors);
        
        // Filter available items for default selection
        const availableDesigns = designs.filter(d => d.isAvailable && !d.isOutOfStock);
        const availableColors = colors.filter(c => c.isAvailable && !c.isOutOfStock);
        
        // Set defaults if not already set (only from available items)
        if (!selectedDesign && availableDesigns.length > 0) {
          const defaultDesign = availableDesigns.find(d => d.name === 'Premium') || availableDesigns[0];
          setSelectedDesign(defaultDesign);
        }
        if (!selectedColor && availableColors.length > 0) {
          setSelectedColor(availableColors[0]);
        }
        
        // Check if currently selected items are still available
        if (selectedDesign && (!selectedDesign.isAvailable || selectedDesign.isOutOfStock)) {
          const fallback = availableDesigns.find(d => d.name === 'Premium') || availableDesigns[0];
          setSelectedDesign(fallback || null);
          if (!fallback) {
            toast.warning('Your selected design is no longer available');
          }
        }
        if (selectedColor && (!selectedColor.isAvailable || selectedColor.isOutOfStock)) {
          const fallback = availableColors[0];
          setSelectedColor(fallback || null);
          if (!fallback) {
            toast.warning('Your selected color is no longer available');
          }
        }
        
        // If editing an order, set selections based on order data
        if (editingOrder && isEditMode) {
          const design = designs.find(d => d.id === editingOrder.design_id);
          const color = colors.find(c => c.id === editingOrder.color_scheme_id);
          
          if (design) setSelectedDesign(design);
          if (color) setSelectedColor(color);
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory data');
      } finally {
        setLoadingInventory(false);
      }
    };

    loadInventory();
  }, []);

  // Load order if in edit mode
  useEffect(() => {
    const loadOrderForEdit = async () => {
      if (!editOrderId) {
        setLoadingOrder(false);
        return;
      }

      try {
        const result = await orderService.getOrder(editOrderId);
        if (result.success && result.order) {
          const order = result.order;
          setEditingOrder(order);
          
          // Only allow editing pending orders
          if (order.status !== 'pending') {
            toast.error('Only pending orders can be modified');
            window.location.href = '/dashboard/shipping';
            return;
          }
          
          // Populate form with existing order data (will be set once inventory loads)
          // Note: Selection will be updated when inventory loads in the effect above
          setQuantity(order.quantity);
          
          setOrderForm({
            firstName: order.customer_first_name,
            lastName: order.customer_last_name,
            email: order.customer_email,
            phone: order.customer_phone || '',
            address: order.shipping_address,
            city: order.shipping_city,
            state: order.shipping_state,
            zipCode: order.shipping_zip_code,
            country: order.shipping_country,
            specialInstructions: order.special_instructions || ''
          });
          
          // Go directly to order form
          setShowOrderForm(true);
        } else {
          toast.error('Order not found');
          window.location.href = '/dashboard/shipping';
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order');
        window.location.href = '/dashboard/shipping';
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrderForEdit();
  }, [editOrderId]);

  // Calculate total price
  const basePrice = selectedDesign?.price || 0;
  const subtotal = basePrice * quantity;
  const shipping = ghanaLocation.shippingCost; // Use Ghana location-based shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(100, quantity + change));
    setQuantity(newQuantity);
  };

  const handleOrderFormChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle Ghana location selection
  const handleGhanaLocationSelect = (city: string, region: string, shippingCost: number, deliveryDays: string) => {
    setGhanaLocation({ city, region, shippingCost, deliveryDays });
    
    // Update order form with location
    setOrderForm(prev => ({
      ...prev,
      city,
      state: region,
      country: 'Ghana'
    }));
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setIsCancellingOrder(true);
    
    try {
      const result = await orderService.cancelOrder(orderId);
      
      if (result.success) {
        toast.success('Order cancelled successfully');
        // Redirect to shipping page to see updated status
        setTimeout(() => {
          window.location.href = '/dashboard/shipping';
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('An unexpected error occurred while cancelling the order');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !orderForm[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate selections
    if (!selectedDesign || !selectedColor) {
      toast.error('Please complete your card selection');
      return;
    }

    setIsSubmittingOrder(true);
    
    try {
      // Determine material based on card type
      const getMaterialForCardType = (cardTypeName: string) => {
        const name = cardTypeName.toLowerCase();
        if (name === 'metal') {
          return { id: 'metal', name: 'Metal' };
        } else {
          return { id: 'plastic', name: 'Plastic' };
        }
      };

      const material = getMaterialForCardType(selectedDesign.name);

      const orderData: OrderData = {
        // Design details
        design_id: selectedDesign.id,
        design_name: selectedDesign.name,
        design_price: selectedDesign.price,
        
        // Material details (auto-selected based on card type)
        material_id: material.id,
        material_name: material.name,
        
        // Color scheme
        color_scheme_id: selectedColor.id,
        color_scheme_name: selectedColor.name,
        color_primary: selectedColor.primary,
        color_secondary: selectedColor.secondary,
        
        // Quantity and pricing
        quantity,
        subtotal,
        shipping,
        tax,
        total,
        
        // Customer information
        customer_first_name: orderForm.firstName,
        customer_last_name: orderForm.lastName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phone || undefined,
        
        // Shipping address
        shipping_address: orderForm.address,
        shipping_city: orderForm.city,
        shipping_state: orderForm.state,
        shipping_zip_code: orderForm.zipCode,
        shipping_country: orderForm.country,
        special_instructions: orderForm.specialInstructions || undefined,
      };

      let orderResult;
      
      if (isEditMode && editingOrder) {
        // Update existing order
        orderResult = await orderService.updateOrder(editingOrder.id, orderData);
        if (!orderResult.success || !orderResult.order) {
          toast.error(orderResult.error || 'Failed to update order. Please try again.');
          return;
        }
      } else {
        // Create new order
        orderResult = await orderService.createOrder(orderData);
        if (!orderResult.success || !orderResult.order) {
          toast.error(orderResult.error || 'Failed to create order. Please try again.');
          return;
        }
      }

      // Prepare payment data
      const paymentReference = paymentService.generateReference();
      const paymentData: PaymentData = {
        email: orderForm.email,
        amount: paymentService.toPesewas(total), // Convert to pesewas
        currency: 'GHS',
        reference: paymentReference,
        orderId: orderResult.order.id,
        customerName: `${orderForm.firstName} ${orderForm.lastName}`,
        phone: orderForm.phone,
      };

      // Process payment with Paystack
      const paymentResult = await paymentService.processPayment(paymentData);
      
      if (paymentResult.success) {
        // Payment successful - verify payment
        const verificationResult = await paymentService.verifyPayment(paymentResult.reference!);
        
        if (verificationResult.success) {
          // Update order status to confirmed
          await orderService.updateOrderStatus(orderResult.order.id, 'confirmed');
          
          const actionText = isEditMode ? 'updated and confirmed' : 'confirmed';
          toast.success(`Payment successful! Order ${orderResult.order.order_number} has been ${actionText}. You will receive a confirmation email shortly.`);
          
          // Reset form and edit mode
          setShowOrderForm(false);
          setIsEditMode(false);
          setEditingOrder(null);
          setOrderForm({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Ghana',
            specialInstructions: ''
          });
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to shipping page to track order
          setTimeout(() => {
            window.location.href = '/dashboard/shipping';
          }, 2000);
        } else {
          toast.error('Payment verification failed. Please contact support.');
        }
      } else {
        // Payment failed or cancelled
        if (paymentResult.error !== 'Payment was cancelled') {
          toast.error(paymentResult.error || 'Payment processing failed. Please try again.');
        }
        // Order remains in pending status for retry
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loadingOrder || loadingInventory) {
    return (
      <div className="flex justify-center items-center h-full flex-1 pb-24 sm:pb-6 w-full px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loading size="lg" text={loadingOrder ? "Loading order details..." : "Loading inventory..."} />
            <h3 className="text-lg font-semibold mb-2">{loadingOrder ? "Loading Order" : "Loading Inventory"}</h3>
            <p className="text-gray-600 mb-4">{loadingOrder ? "Please wait while we load your order details..." : "Please wait while we load available options..."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-full flex-1 pb-24 sm:pb-6 w-full px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Profile Required</h3>
            <p className="text-gray-600 mb-4">Please complete your profile before ordering a card.</p>
            <Button onClick={() => window.location.href = '/dashboard/profile'}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full mb-8 sm:mb-16 md:mb-8 lg:mb-16 gap-6 sm:gap-8 md:gap-6 lg:gap-10 mt-4 sm:mt-6 md:mt-4 lg:mt-8 px-4 sm:px-6 md:px-4 lg:px-8 xl:px-12 2xl:px-16">
      {!showOrderForm ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
                          <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-5xl font-black bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent mb-3 px-2">
              {isEditMode ? 'Modify Your Order' : 'Order Your Digital Business Card'}
            </h1>
            <p className="text-base sm:text-lg md:text-base lg:text-xl text-gray-600 dark:text-gray-300 px-2 leading-relaxed">
              {isEditMode 
                ? 'Update your order details and retry payment'
                : 'Choose your design, customize your card, and get it delivered to your door'
              }
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {/* Left Column - Design Selection */}
            <div className="xl:col-span-2 lg:col-span-1 md:col-span-1 space-y-6 sm:space-y-8">
              {/* Card Designs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cardBase}
              >
                <h2 className={cardTitle}>Choose Your Design</h2>
                <p className={cardDesc}>Select the perfect design for your digital business card</p>
                
                <div className="space-y-4 sm:space-y-6">
                  {cardDesigns.map((design) => {
                    const isUnavailable = !design.isAvailable || design.isOutOfStock;
                    return (
                      <div
                        key={design.id}
                        className={`relative rounded-2xl border-2 p-4 sm:p-6 transition-all duration-300 ${
                          isUnavailable 
                            ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800' 
                            : `cursor-pointer hover:shadow-lg ${
                                selectedDesign?.id === design.id
                                  ? 'border-scan-blue bg-scan-blue/5 dark:bg-scan-blue/10 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`
                        }`}
                        onClick={() => {
                          if (isUnavailable) {
                            toast.error(`${design.name} design is currently out of stock`);
                            return;
                          }
                          setSelectedDesign(design);
                        }}
                      >
                      {/* Stock Status Badge */}
                      {getStockStatusBadge(design)}
                      
                      {design.popular && !isUnavailable && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-scan-blue to-scan-purple text-white shadow-lg">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      )}
                      
                      {/* Row layout with card preview on left and details on right */}
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                        {/* Card Preview */}
                        <div className="w-full sm:w-48 md:w-full lg:w-48 sm:flex-shrink-0 md:flex-shrink lg:flex-shrink-0">
                          <CardDesignPreview 
                            design={design}
                            profile={profile}
                            colorScheme={selectedColor}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Card Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:items-start md:items-start lg:items-start sm:justify-between md:justify-start lg:justify-between gap-3 sm:gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg sm:text-xl md:text-lg lg:text-xl text-gray-900 dark:text-white mb-2">{design.name}</h3>
                              <p className="text-sm sm:text-base md:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{design.description}</p>
                            </div>
                            <div className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-bold font-mono bg-gradient-to-r from-scan-blue via-scan-purple to-scan-blue bg-clip-text text-transparent sm:text-right md:text-left lg:text-right tracking-wider">₵{design.price}</div>
                          </div>
                          
                          {/* Features in a more compact layout */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                            {design.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm sm:text-base md:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="leading-tight">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );})}
                </div>
              </motion.div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cardBase}
              >
                <h2 className={cardTitle}>Color Scheme</h2>
                <p className={cardDesc}>Pick a color scheme that matches your brand</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {colorSchemes.map((color) => {
                    const isUnavailable = !color.isAvailable || color.isOutOfStock;
                    return (
                      <div
                        key={color.id}
                        className={`relative rounded-2xl border-2 p-3 sm:p-4 md:p-3 lg:p-4 transition-all duration-300 ${
                          isUnavailable 
                            ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800' 
                            : `cursor-pointer hover:shadow-md ${
                                selectedColor?.id === color.id
                                  ? 'border-scan-blue bg-scan-blue/5 dark:bg-scan-blue/10 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`
                        }`}
                        onClick={() => {
                          if (isUnavailable) {
                            toast.error(`${color.name} color is currently out of stock`)
                            return
                          }
                          setSelectedColor(color)
                        }}
                      >
                      {/* Stock Status Badge */}
                      {getStockStatusBadge(color)}
                      
                      <div className="flex justify-center gap-1 mb-2 sm:mb-3 md:mb-2 lg:mb-3">
                        <div 
                          className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full shadow-sm border border-white/20"
                          style={{ backgroundColor: color.primary }}
                        />
                        <div 
                          className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full shadow-sm border border-white/20"
                          style={{ backgroundColor: color.secondary }}
                        />
                      </div>
                      <div className="text-xs sm:text-sm md:text-xs lg:text-sm font-medium text-center leading-tight text-gray-900 dark:text-white">
                        {color.name}
                      </div>
                    </div>
                  );})}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Preview & Order */}
            <div className="space-y-6 sm:space-y-8 md:space-y-6 lg:space-y-8">
              {/* Card Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cardBase}
              >
                <h2 className={cardTitle}>Preview</h2>
                <p className={cardDesc}>How your card will look</p>
                
                <CardDesignPreview 
                  design={selectedDesign}
                  profile={profile}
                  colorScheme={selectedColor}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-8 h-8 bg-scan-blue/10 dark:bg-scan-blue/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-scan-blue" />
                    </div>
                    <span>{selectedColor?.name || 'No Color'} Color</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-8 h-8 bg-scan-blue/10 dark:bg-scan-blue/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-scan-blue" />
                    </div>
                    <span>{selectedDesign?.name || 'No Design'} Design</span>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cardBase}
              >
                <h2 className={cardTitle}>Order Summary</h2>
                
                <div className="space-y-6">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">Quantity</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 rounded-xl border-2"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 100}
                        className="h-10 w-10 rounded-xl border-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {quantity >= 5 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <Truck className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          Free shipping on 5+ cards!
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">{selectedDesign?.name || 'Design'} × {quantity}</span>
                      <span className="font-medium font-mono text-gray-900 dark:text-white tracking-wide">₵{(basePrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="font-medium font-mono text-gray-900 dark:text-white tracking-wide">{shipping === 0 ? 'Free' : `₵${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="font-medium font-mono text-gray-900 dark:text-white tracking-wide">₵{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="font-mono bg-gradient-to-r from-scan-blue via-scan-purple to-scan-blue bg-clip-text text-transparent font-bold tracking-wider">₵{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Out of Stock Warning */}
                  {(selectedDesign?.isOutOfStock || selectedColor?.isOutOfStock) && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Some selected items are out of stock. Please choose different options to continue.
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-scan-blue to-scan-purple text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      // Check if all required selections are available
                      if (!selectedDesign || !selectedColor) {
                        toast.error('Please complete your card selection');
                        return;
                      }
                      
                      if (selectedDesign.isOutOfStock || !selectedDesign.isAvailable) {
                        toast.error('Selected design is out of stock');
                        return;
                      }
                      
                      if (selectedColor.isOutOfStock || !selectedColor.isAvailable) {
                        toast.error('Selected color is out of stock');
                        return;
                      }
                      
                      setShowOrderForm(true);
                    }}
                    disabled={
                      !selectedDesign || !selectedColor ||
                      selectedDesign.isOutOfStock || !selectedDesign.isAvailable ||
                      selectedColor.isOutOfStock || !selectedColor.isAvailable
                    }
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Secure Payment
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Fast Shipping
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        /* Order Form */
      <motion.div
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full px-2 sm:px-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Update Order' : 'Checkout'}</CardTitle>
              <CardDescription>
                {isEditMode 
                  ? 'Modify your order details and complete payment'
                  : 'Complete your order information'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              {/* International User Notice */}
              <DeliveryLocationNotice />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Customer Information */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <Input
                          value={orderForm.firstName}
                          onChange={(e) => handleOrderFormChange('firstName', e.target.value)}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <Input
                          value={orderForm.lastName}
                          onChange={(e) => handleOrderFormChange('lastName', e.target.value)}
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <Input
                          type="email"
                          value={orderForm.email}
                          onChange={(e) => handleOrderFormChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <Input
                          type="tel"
                          value={orderForm.phone}
                          onChange={(e) => handleOrderFormChange('phone', e.target.value)}
                          placeholder="+233 20 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ghana Delivery Address */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Ghana Delivery Address</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                        🇬🇭 Ghana Only
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Street Address *</label>
                        <Input
                          value={orderForm.address}
                          onChange={(e) => handleOrderFormChange('address', e.target.value)}
                          placeholder="123 Main Street, Neighborhood"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                        <Input
                          value={orderForm.zipCode}
                          onChange={(e) => handleOrderFormChange('zipCode', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      {/* Show selected location */}
                      {ghanaLocation.city && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-sm text-green-700 dark:text-green-300">
                            📍 <strong>Delivering to:</strong> {ghanaLocation.city}, {ghanaLocation.region}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Instructions</label>
                    <Textarea
                      value={orderForm.specialInstructions}
                      onChange={(e) => handleOrderFormChange('specialInstructions', e.target.value)}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right Column - Ghana Location Selection */}
                <div>
                  <GhanaLocationSelector
                    onLocationSelect={handleGhanaLocationSelect}
                    orderTotal={subtotal}
                    quantity={quantity}
                    currentCity={ghanaLocation.city}
                    currentRegion={ghanaLocation.region}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-3 text-sm sm:text-base">Order Summary</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                        <span>{selectedDesign?.name || 'Design'} × {quantity}</span>
                        <span className="font-mono text-gray-900 dark:text-white tracking-wide">₵{(basePrice * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping {ghanaLocation.city && `to ${ghanaLocation.city}`}
                          {ghanaLocation.deliveryDays && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({ghanaLocation.deliveryDays})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white tracking-wide">
                          {shipping === 0 ? 'FREE' : `₵${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      {shipping === 0 && ghanaLocation.city && (
                        <div className="text-xs text-green-600 dark:text-green-400 pl-4">
                          🎉 {quantity >= 5 ? 'Free shipping for 5+ cards!' : 'Free shipping applied!'}
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-mono text-gray-900 dark:text-white tracking-wide">₵{tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="font-mono bg-gradient-to-r from-scan-blue via-scan-purple to-scan-blue bg-clip-text text-transparent font-bold tracking-wider">₵{total.toFixed(2)}</span>
                      </div>
                </div>
              </div>

              {/* Payment Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">Secure Payment</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  Your payment is processed securely through Paystack. We never store your payment information.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderForm(false)}
                  className="w-full sm:flex-1 order-2 sm:order-1"
                >
                  Back to Design
                </Button>
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmittingOrder || !ghanaLocation.city}
                  className="w-full sm:flex-1 bg-gradient-to-r from-scan-blue to-scan-purple order-1 sm:order-2"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loading size="sm" />
                      <span className="hidden sm:inline">Processing Payment...</span>
                      <span className="sm:hidden">Processing...</span>
                    </>
                  ) : !ghanaLocation.city ? (
                    'Select Location to Continue'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline font-mono tracking-wide">Pay ₵{total.toFixed(2)} with Paystack</span>
                      <span className="sm:hidden font-mono tracking-wide">Pay ₵{total.toFixed(2)}</span>
                    </>
                  )}
                </Button>
              </div>
              
              {!ghanaLocation.city && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Please select your city to calculate shipping costs and continue
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
} 