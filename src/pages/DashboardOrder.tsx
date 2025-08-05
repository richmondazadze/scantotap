import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
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
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Eye
} from 'lucide-react';
import Loading from '@/components/ui/loading';
import GhanaLocationSelector from '@/components/GhanaLocationSelector';
import DeliveryLocationNotice from '@/components/DeliveryLocationNotice';

// Card type ID mapping (UUID to string names for frontend)
const CARD_TYPE_MAPPING = {
  "classic": "ab889570-cd24-45a8-a8aa-9b64e7f047c9",
  "premium": "2455d29b-d7de-4dcd-aa54-95d9ceaa8f3f", 
  "elite": "6eebcc1a-b072-40fa-90e7-a11ac13708a1"
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
      return [
        'Plastic NFC Card',
        'QR Code',
        'Contact Info',
        'Social Links',
        'Durable, Water Resistant',
        'Standard Print'
      ];
    case 'premium':
      return [
        'Plastic NFC Card',
        'QR Code',
        'Contact Info',
        'Social Links',
        'Custom Colors',
        'Premium Card Print',
        'Glossy Finish',
        'Gift Packaging'
      ];
    case 'elite':
    case 'metal':
      return [
        'MFC Metallic Card',
        'NFC + QR Code',
        'Contact Info',
        'Social Links',
        'Laser Engraving',
        'Lifetime Warranty',
        'Premium Gift Box',
        'Scratch & Water Resistant',
        'Top-tier Finish'
      ];
    default:
      return ['QR Code', 'Contact Info', 'Social Links'];
  }
};

// Helper function to get stock status display
const getStockStatusBadge = (item: { isAvailable: boolean; hasStockLimit: boolean; stockQuantity: number | null; isOutOfStock: boolean }) => {
  if (!item.isAvailable || item.isOutOfStock) {
    return (
      <Badge variant="destructive" className="absolute top-2 left-2 bg-red-500 text-white z-20">
        Out of Stock
      </Badge>
    );
  }
  
  if (item.hasStockLimit && item.stockQuantity !== null && item.stockQuantity <= 5) {
    return (
      <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-500 text-white z-20">
        {item.stockQuantity} left
      </Badge>
    );
  }
  
  return null;
};

export default function DashboardOrder() {
  useAuthGuard(); // Ensure user is authenticated
  const { profile } = useProfile();
  
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
  const [checkoutStep, setCheckoutStep] = useState<'location' | 'shipping'>(isEditMode ? 'shipping' : 'location');
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

  // Animation state
  const [showOrderAnimation, setShowOrderAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationData, setAnimationData] = useState(null);

  // Load animation data
  useEffect(() => {
    const loadAnimationData = async () => {
      try {
        const response = await fetch('/order.json');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading animation data:', error);
      }
    };
    loadAnimationData();
  }, []);

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
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory data');
      } finally {
        setLoadingInventory(false);
      }
    };

    loadInventory();
  }, []); // Initial load only

  // Update selections when editing order
  useEffect(() => {
    if (editingOrder && isEditMode && cardDesigns.length > 0 && colorSchemes.length > 0) {
      const design = cardDesigns.find(d => d.id === editingOrder.design_id);
      const color = colorSchemes.find(c => c.id === editingOrder.color_scheme_id);
      
      if (design) setSelectedDesign(design);
      if (color) setSelectedColor(color);
    }
  }, [editingOrder, isEditMode, cardDesigns, colorSchemes]);
        
        // Check if currently selected items are still available
  useEffect(() => {
    if (cardDesigns.length > 0 && colorSchemes.length > 0) {
      const availableDesigns = cardDesigns.filter(d => d.isAvailable && !d.isOutOfStock);
      const availableColors = colorSchemes.filter(c => c.isAvailable && !c.isOutOfStock);
      
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
    }
  }, [selectedDesign, selectedColor, cardDesigns, colorSchemes]);

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
          
          // Pre-fill order form with existing data
          setOrderForm({
            firstName: order.customer_first_name || '',
            lastName: order.customer_last_name || '',
            email: order.customer_email || '',
            phone: order.customer_phone || '',
            address: order.shipping_address || '',
            city: order.shipping_city || '',
            state: order.shipping_state || '',
            zipCode: order.shipping_zip_code || '',
            country: order.shipping_country || 'Ghana',
            specialInstructions: order.special_instructions || ''
          });
          
          // Set quantity
          setQuantity(order.quantity);
          
          // Show order form
          setShowOrderForm(true);
        } else {
          toast.error(result.error || 'Order not found');
          window.location.href = '/dashboard/shipping';
        }
      } catch (error) {
        console.error('Error loading order for edit:', error);
        toast.error('Failed to load order details');
        window.location.href = '/dashboard/shipping';
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrderForEdit();
  }, [editOrderId]);

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleOrderFormChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGhanaLocationSelect = (city: string, region: string, shippingCost: number, deliveryDays: string) => {
    setGhanaLocation({
      city,
      region,
      shippingCost,
      deliveryDays
    });
    
    // Update order form with location data
    setOrderForm(prev => ({
      ...prev,
      city,
      state: region
    }));
  };

  const handleLocationStepContinue = () => {
    if (!ghanaLocation.city || !ghanaLocation.region) {
      toast.error('Please select your delivery location');
      return;
    }
    
    setCheckoutStep('shipping');
    setShowOrderForm(true);
  };

  const handleBackToLocation = () => {
    setCheckoutStep('location');
    setShowOrderForm(false);
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
        // Redirect to shipping page
          window.location.href = '/dashboard/shipping';
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
    if (!selectedDesign || !selectedColor) {
      toast.error('Please select a design and color');
      return;
    }
    
    // Basic form validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !orderForm[field as keyof typeof orderForm]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmittingOrder(true);
    
    try {
      const getMaterialForCardType = (cardTypeName: string) => {
        switch (cardTypeName.toLowerCase()) {
          case 'classic':
            return 'plastic';
          case 'premium':
            return 'premium_plastic';
          case 'elite':
          case 'metal':
            return 'metal';
          default:
            return 'plastic';
        }
      };

      const orderData: OrderData = {
        design_id: selectedDesign.id,
        design_name: selectedDesign.name,
        design_price: selectedDesign.price,
        material_id: selectedDesign.id, // Using design ID as material is inherent to design
        material_name: getMaterialForCardType(selectedDesign.name),
        color_scheme_id: selectedColor.id,
        color_scheme_name: selectedColor.name,
        color_primary: selectedColor.primary,
        color_secondary: selectedColor.secondary || selectedColor.primary,
        quantity,
        subtotal: selectedDesign.price * quantity,
        shipping: ghanaLocation.shippingCost,
        tax: 0, // No tax for now
        total: (selectedDesign.price * quantity) + ghanaLocation.shippingCost,
        currency: 'GHS',
        customer_first_name: orderForm.firstName,
        customer_last_name: orderForm.lastName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phone,
        shipping_address: orderForm.address,
        shipping_city: orderForm.city,
        shipping_state: orderForm.state,
        shipping_zip_code: orderForm.zipCode,
        shipping_country: orderForm.country,
        special_instructions: orderForm.specialInstructions
      };

      let result;
      
      if (isEditMode && editingOrder) {
        // Update existing order
        result = await orderService.updateOrder(editingOrder.id, orderData);
      } else {
        // Create new order
        result = await orderService.createOrder(orderData);
      }

      if (result.success && result.order) {
        const order = result.order;
        
        // Calculate total amount (base price + quantity + shipping)
        const basePrice = selectedDesign.price || 0;
        const totalAmount = (basePrice * quantity) + ghanaLocation.shippingCost;

        // Prepare PaymentData
        const paymentData = {
        email: orderForm.email,
          amount: paymentService.toPesewas(totalAmount),
        currency: 'GHS',
          reference: paymentService.generateReference(),
          orderId: order.id,
        customerName: `${orderForm.firstName} ${orderForm.lastName}`,
          phone: orderForm.phone
      };

      const paymentResult = await paymentService.processPayment(paymentData);
      
      if (paymentResult.success) {
          // Trigger order completion animation
          setShowOrderAnimation(true);
          setAnimationKey(prev => prev + 1);
          
          // Hide animation after 6 seconds (smooth animation)
          setTimeout(() => {
            setShowOrderAnimation(false);
            // Reset to first order page screen after animation
            setShowOrderForm(false);
            setCheckoutStep('location');
          }, 6000);
          
          // Show success message
          toast.success('Payment completed!');
        } else {
          toast.error(paymentResult.error || 'Failed to initiate payment');
        }
      } else {
        toast.error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} order`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loadingInventory || (loadingOrder && isEditMode)) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" text={loadingInventory ? "Loading inventory..." : "Loading order..."} />
      </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-20 lg:pb-8 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden">
            {/* Order Completion Animation */}
      {showOrderAnimation && (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
          
          {/* Main Animation Container */}
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-col items-center"
          >
            {/* Animation Card */}
            <div className="relative">
              <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6 sm:p-8 lg:p-10 border border-gray-100">
                {animationData && (
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 sm:mt-10 lg:mt-12 text-center max-w-md mx-auto px-4"
            >
              {/* Success Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Payment Successful
              </div>
              
              {/* Main Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Order Confirmed! 🎉
              </h2>
              
              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 leading-relaxed">
                Your premium business cards are being prepared with care
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href="/dashboard/shipping"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Track Your Order
                </a>
                
                <button
                  onClick={() => setShowOrderAnimation(false)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base font-medium"
                >
                  Continue Shopping
                </button>
              </div>
              
              {/* Additional Info */}
              <p className="text-gray-500 text-xs sm:text-sm mt-6">
                You'll receive an email confirmation shortly
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {isEditMode ? 'Edit Order' : 'Order Physical Cards'}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              {isEditMode ? 'Modify your pending order details' : 'Get your digital profile printed on premium business cards'}
            </p>
          </div>
        </div>
          </motion.div>

      {!showOrderForm ? (
        <>
          {/* Split Layout for Large Screens */}
          <div className="grid grid-cols-1 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
            {/* Left Side - Card Design Selection (4/7 width) */}
            <div className="xl:col-span-4 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Card Design Selection - stacked vertically on large screens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                      <span>Choose Your Card Design</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                      Select the perfect card design for your business needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                    <div className="flex flex-col gap-4">
                  {cardDesigns.map((design) => {
                        const getCardImage = (designName: string) => {
                          switch (designName.toLowerCase()) {
                            case 'classic':
                              return '/classic-card.png';
                            case 'premium':
                              return '/prem_card.png';
                            case 'elite':
                            case 'metal':
                              return '/metal_card.png';
                            default:
                              return '/classic-card.png';
                          }
                        };
                    return (
                      <div
                        key={design.id}
                        className={`relative cursor-pointer rounded-xl border-2 transition-all p-3 sm:p-4 lg:p-6 flex flex-col md:flex-row gap-4 items-center ${
                                selectedDesign?.id === design.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                            } ${!design.isAvailable || design.isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ paddingTop: '2.5rem' }} // Add extra top padding for mobile so price badge doesn't cover content
                        onClick={() => {
                              if (design.isAvailable && !design.isOutOfStock) {
                          setSelectedDesign(design);
                              }
                        }}
                      >
                      {getStockStatusBadge(design)}
                        {/* Popular Ribbon Badge */}
                        {design.popular && (
                          <div className="absolute -top-3 -left-3 z-30">
                            <div className="transform -rotate-12">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 shadow-xl text-white font-bold text-xs tracking-wide border-2 border-white dark:border-gray-900 drop-shadow-lg animate-pulse">
                                <Star className="w-3 h-3 mr-1 text-white animate-bounce" />
                          Popular
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Price at top right, floating above content */}
                        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-none select-none">
                          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 shadow-lg text-white font-bold text-sm tracking-wide border-2 border-white dark:border-gray-900 drop-shadow-md">
                            ₵{design.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="ml-1 text-xs font-medium text-blue-100">GHS</span>
                          </span>
                        </div>
                        {/* Card image and content */}
                        <div className="aspect-[1.6/1] w-64 min-w-[240px] max-w-[320px] mb-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          <img
                            src={getCardImage(design.name)}
                            alt={`${design.name} card design`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 text-left space-y-2">
                          <div className="text-lg font-semibold">{design.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{design.description}</div>
                          <div className="flex flex-wrap gap-1">
                            {design.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            </div>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            {/* Right Side - Card Preview, Color, Order Summary (3/7 width) */}
            <div className="xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Card Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden sticky top-4">
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                      <span>Card Preview</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                      Preview of your selected design
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                    {selectedDesign ? (
                      <div className="space-y-4">
                        {/* Card Image Preview */}
                        <div className="aspect-[1.6/1] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={selectedDesign.name.toLowerCase() === 'classic' ? '/classic-card.png' :
                                 selectedDesign.name.toLowerCase() === 'premium' ? '/prem_card.png' :
                                 selectedDesign.name.toLowerCase() === 'elite' || selectedDesign.name.toLowerCase() === 'metal' ? '/metal_card.png' :
                                 '/classic-card.png'}
                            alt={`${selectedDesign.name} preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          </div>
                          
                        {/* Selected Details */}
                        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Design:</span>
                            <span className="font-medium">{selectedDesign.name}</span>
                                </div>
                          {selectedColor && (
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Color:</span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: selectedColor.primary }}
                                />
                                <span className="font-medium">{selectedColor.name}</span>
                              </div>
                          </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[1.6/1] rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs sm:text-sm">Select a design to preview</p>
                    </div>
                </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                      <span>Select Color Scheme</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                      Choose the color that represents your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                      {colorSchemes.map((color) => (
                      <div
                        key={color.id}
                          className={`relative cursor-pointer rounded-xl border-2 transition-all p-3 sm:p-4 ${
                                selectedColor?.id === color.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                          } ${!color.isAvailable || color.isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                            if (color.isAvailable && !color.isOutOfStock) {
                              setSelectedColor(color);
                          }
                        }}
                      >
                      {getStockStatusBadge(color)}
                          <div className="text-center space-y-2">
                        <div 
                              className="w-full h-8 sm:h-10 lg:h-12 rounded-lg mx-auto"
                          style={{ backgroundColor: color.primary }}
                        />
                            <div className="text-xs sm:text-sm font-medium">{color.name}</div>
                      </div>
                      </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Continue Button - Only show when design and color are selected */}
              {selectedDesign && selectedColor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="xl:col-span-4"
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            Ready to Continue?
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            You've selected {selectedDesign.name} in {selectedColor.name}. 
                            Click continue to set your delivery location.
                          </p>
                        </div>
                        
                        {/* Order Summary Preview */}
                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span>Selected Design:</span>
                              <span className="font-medium">{selectedDesign.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Color Scheme:</span>
                              <span className="font-medium">{selectedColor.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span className="font-medium">₵{(selectedDesign.price * quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setShowOrderForm(true)}
                          className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm sm:text-base"
                        >
                          Continue to Delivery
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {checkoutStep === 'location' && !isEditMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span>Delivery Location</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                    Select your delivery location to calculate shipping costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                  <div className="space-y-4 sm:space-y-6">
                    <DeliveryLocationNotice />
                    <GhanaLocationSelector
                      onLocationSelect={handleGhanaLocationSelect}
                      orderTotal={selectedDesign ? selectedDesign.price * quantity : 0}
                      quantity={quantity}
                    />
                    
                    {ghanaLocation.city && (
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{ghanaLocation.city}, {ghanaLocation.region}</span>
                    </div>
                          <div className="flex justify-between">
                            <span>Shipping Cost:</span>
                            <span className="font-medium">₵{ghanaLocation.shippingCost}</span>
                  </div>
                          <div className="flex justify-between">
                            <span>Estimated Delivery:</span>
                            <span className="font-medium">{ghanaLocation.deliveryDays}</span>
                    </div>
                  </div>
                </div>
                    )}

                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowOrderForm(false)}
                        className="flex-1 h-10 sm:h-12 font-medium rounded-lg"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleLocationStepContinue}
                        disabled={!ghanaLocation.city}
                        className="flex-1 h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                          </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {checkoutStep === 'shipping' && (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span>Shipping Information</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                    Enter your shipping details for delivery
              </CardDescription>
            </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                  <div className="space-y-4 sm:space-y-6">
                  {/* Personal Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">First Name *</label>
                        <Input
                          value={orderForm.firstName}
                          onChange={(e) => handleOrderFormChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Last Name *</label>
                        <Input
                          value={orderForm.lastName}
                          onChange={(e) => handleOrderFormChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={orderForm.email}
                          onChange={(e) => handleOrderFormChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Phone *</label>
                        <Input
                          type="tel"
                          value={orderForm.phone}
                          onChange={(e) => handleOrderFormChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                    </div>
                  </div>

                    {/* Address Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Address *</label>
                        <Input
                          value={orderForm.address}
                          onChange={(e) => handleOrderFormChange('address', e.target.value)}
                          placeholder="Enter street address"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">City</label>
                          <Input
                            value={orderForm.city}
                            onChange={(e) => handleOrderFormChange('city', e.target.value)}
                            placeholder="City"
                            className="h-10 sm:h-12 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">Region</label>
                          <Input
                            value={orderForm.state}
                            onChange={(e) => handleOrderFormChange('state', e.target.value)}
                            placeholder="Region"
                            className="h-10 sm:h-12 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">Postal Code</label>
                        <Input
                          value={orderForm.zipCode}
                          onChange={(e) => handleOrderFormChange('zipCode', e.target.value)}
                            placeholder="Postal code"
                            className="h-10 sm:h-12 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Special Instructions (Optional)</label>
                    <Textarea
                      value={orderForm.specialInstructions}
                      onChange={(e) => handleOrderFormChange('specialInstructions', e.target.value)}
                      placeholder="Any special delivery instructions..."
                        className="min-h-[80px] text-xs sm:text-sm resize-none"
                      />
              </div>

              {/* Order Summary */}
                    {selectedDesign && selectedColor && (
                      <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 sm:space-y-3">
                        <h4 className="text-sm sm:text-base font-semibold">Order Summary</h4>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                            <span>{quantity}x {selectedDesign.name} ({selectedColor.name})</span>
                            <span>₵{(selectedDesign.price * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₵{ghanaLocation.shippingCost.toFixed(2)}</span>
                      </div>
                      <Separator />
                          <div className="flex justify-between font-semibold">
                        <span>Total</span>
                            <span>₵{((selectedDesign.price * quantity) + ghanaLocation.shippingCost).toFixed(2)}</span>
                      </div>
                </div>
              </div>
                    )}

              {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      {!isEditMode && (
                <Button 
                  variant="outline" 
                          onClick={handleBackToLocation}
                          className="flex-1 h-10 sm:h-12 font-medium rounded-lg"
                >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                </Button>
                      )}
                      
                <Button 
                  onClick={handlePlaceOrder}
                        disabled={isSubmittingOrder}
                        className={`${!isEditMode ? 'flex-1' : 'w-full'} h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg`}
                >
                  {isSubmittingOrder ? (
                    <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEditMode ? 'Updating...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                            {isEditMode ? 'Update Order' : 'Place Order & Pay'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
                    {isEditMode && editingOrder && (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelOrder(editingOrder.id)}
                        disabled={isCancellingOrder}
                        className="w-full h-10 sm:h-12 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg"
                      >
                        {isCancellingOrder ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Order'
                        )}
                      </Button>
                    )}
                  </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
} 