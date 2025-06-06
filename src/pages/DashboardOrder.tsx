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
  RefreshCw
} from 'lucide-react';

// Card design options
const CARD_DESIGNS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and professional design',
    price: 15,
    features: ['QR Code', 'Contact Info', 'Social Links'],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Elegant design with premium materials',
    price: 25,
    features: ['QR Code', 'Contact Info', 'Social Links', 'Custom Colors', 'Premium Material'],
    popular: true
  },
  {
    id: 'metal',
    name: 'Metal',
    description: 'Luxury metal card with engraving',
    price: 45,
    features: ['QR Code', 'Contact Info', 'Social Links', 'Metal Material', 'Laser Engraving', 'Lifetime Warranty'],
    popular: false
  }
];

// Material options
const MATERIALS = [
  { id: 'plastic', name: 'Plastic', description: 'Durable PVC material', priceModifier: 0 },
  { id: 'metal', name: 'Metal', description: 'Premium stainless steel', priceModifier: 20 }
];

// Color schemes
const COLOR_SCHEMES = [
  { id: 'blue', name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF' },
  { id: 'purple', name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED' },
  { id: 'green', name: 'Forest Green', primary: '#10B981', secondary: '#059669' },
  { id: 'black', name: 'Midnight Black', primary: '#1F2937', secondary: '#111827' },
  { id: 'gold', name: 'Luxury Gold', primary: '#F59E0B', secondary: '#D97706' }
];

export default function DashboardOrder() {
  useAuthGuard(); // Ensure user is authenticated
  const { profile } = useProfile();
  
  // Check if we're editing an existing order
  const urlParams = new URLSearchParams(window.location.search);
  const editOrderId = urlParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editOrderId);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(!!editOrderId);
  
  const [selectedDesign, setSelectedDesign] = useState(CARD_DESIGNS[1]); // Default to Premium
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_SCHEMES[0]);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
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
          
          // Populate form with existing order data
          setSelectedDesign(CARD_DESIGNS.find(d => d.id === order.design_id) || CARD_DESIGNS[1]);
          setSelectedMaterial(MATERIALS.find(m => m.id === order.material_id) || MATERIALS[0]);
          setSelectedColor(COLOR_SCHEMES.find(c => c.id === order.color_scheme_id) || COLOR_SCHEMES[0]);
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
  const basePrice = selectedDesign.price;
  const materialPrice = selectedMaterial.priceModifier;
  const subtotal = (basePrice + materialPrice) * quantity;
  const shipping = quantity > 5 ? 0 : 5; // Free shipping for 5+ cards
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(100, quantity + change));
    setQuantity(newQuantity);
  };

  const handleOrderFormChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !orderForm[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmittingOrder(true);
    
    try {
      const orderData: OrderData = {
        // Design details
        design_id: selectedDesign.id,
        design_name: selectedDesign.name,
        design_price: selectedDesign.price,
        
        // Material details
        material_id: selectedMaterial.id,
        material_name: selectedMaterial.name,
        material_price_modifier: selectedMaterial.priceModifier,
        
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

  if (loadingOrder) {
    return (
      <div className="flex justify-center items-center h-full flex-1 pb-24 sm:pb-6 w-full px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading Order</h3>
            <p className="text-gray-600 mb-4">Please wait while we load your order details...</p>
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
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full mb-24 sm:mb-16 gap-8 mt-6 px-6">
      {!showOrderForm ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-scan-blue dark:text-scan-blue-light mb-3">
              {isEditMode ? 'Modify Your Order' : 'Order Your Digital Business Card'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isEditMode 
                ? 'Update your order details and retry payment'
                : 'Choose your design, customize your card, and get it delivered to your door'
              }
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8">
            {/* Left Column - Design Selection */}
            <div className="xl:col-span-2 lg:col-span-1 space-y-8">
              {/* Card Designs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Choose Your Design
                    </CardTitle>
                    <CardDescription>
                      Select the perfect design for your digital business card
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                      {CARD_DESIGNS.map((design) => (
                        <div
                          key={design.id}
                          className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                            selectedDesign.id === design.id
                              ? 'border-scan-blue bg-scan-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedDesign(design);
                            // Auto-select appropriate material based on design
                            if (design.id === 'metal') {
                              setSelectedMaterial(MATERIALS.find(m => m.id === 'metal') || MATERIALS[0]);
                            } else {
                              setSelectedMaterial(MATERIALS[0]); // Default to plastic for classic and premium
                            }
                          }}
                        >
                          {design.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-scan-purple">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          <CardDesignPreview 
                            design={design}
                            profile={profile}
                            colorScheme={selectedColor}
                            material={selectedMaterial}
                            className="mb-4"
                          />
                          <h3 className="font-semibold mb-2 text-lg">{design.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{design.description}</p>
                          <div className="text-xl font-bold text-scan-blue">₵{design.price}</div>
                          <div className="mt-2 space-y-1">
                            {design.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                                <Check className="w-3 h-3 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Material Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Material
                    </CardTitle>
                    <CardDescription>
                      Choose the material for your card
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                      {MATERIALS.map((material) => (
                        <div
                          key={material.id}
                          className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                            selectedMaterial.id === material.id
                              ? 'border-scan-blue bg-scan-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedMaterial(material)}
                        >
                          <CardMaterialShowcase 
                            material={material}
                            isSelected={selectedMaterial.id === material.id}
                            onClick={() => setSelectedMaterial(material)}
                          />
                          <h3 className="font-semibold mb-2 text-lg mt-4">{material.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                          <div className="text-base font-medium">
                            {material.priceModifier > 0 ? `+₵${material.priceModifier}` : 'Included'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>
                      Pick a color scheme that matches your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                      {COLOR_SCHEMES.map((color) => (
                        <div
                          key={color.id}
                          className={`cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all ${
                            selectedColor.id === color.id
                              ? 'border-scan-blue bg-scan-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedColor(color)}
                        >
                          <div className="flex justify-center gap-1 mb-2 sm:mb-3">
                            <div 
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                              style={{ backgroundColor: color.primary }}
                            />
                            <div 
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                              style={{ backgroundColor: color.secondary }}
                            />
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-center leading-tight">
                            {color.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Preview & Order */}
            <div className="space-y-8">
              {/* Card Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      How your card will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardDesignPreview 
                      design={selectedDesign}
                      profile={profile}
                      colorScheme={selectedColor}
                      material={selectedMaterial}
                    />
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4" />
                        {selectedMaterial.name} Material
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {selectedDesign.name} Design
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity</label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 100}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {quantity >= 5 && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Free shipping on 5+ cards!
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{selectedDesign.name} × {quantity}</span>
                        <span>${(basePrice * quantity).toFixed(2)}</span>
                      </div>
                      {materialPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{selectedMaterial.name} upgrade × {quantity}</span>
                          <span>${(materialPrice * quantity).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-scan-blue to-scan-purple"
                      onClick={() => setShowOrderForm(true)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      <div className="flex items-center justify-center gap-4">
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
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        /* Order Form */
      <motion.div
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full"
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
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
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

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <Input
                      value={orderForm.address}
                      onChange={(e) => handleOrderFormChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <Input
                        value={orderForm.city}
                        onChange={(e) => handleOrderFormChange('city', e.target.value)}
                        placeholder="Accra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State *</label>
                      <Input
                        value={orderForm.state}
                        onChange={(e) => handleOrderFormChange('state', e.target.value)}
                        placeholder="Greater Accra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                      <Input
                        value={orderForm.zipCode}
                        onChange={(e) => handleOrderFormChange('zipCode', e.target.value)}
                        placeholder="00233"
                      />
                    </div>
                  </div>
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

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                        <span>{selectedDesign.name} × {quantity}</span>
                        <span>₵{(basePrice * quantity).toFixed(2)}</span>
                      </div>
                      {materialPrice > 0 && (
                        <div className="flex justify-between">
                          <span>{selectedMaterial.name} upgrade</span>
                          <span>₵{(materialPrice * quantity).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `₵${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₵{tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₵{total.toFixed(2)}</span>
                      </div>
                </div>
              </div>

              {/* Payment Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your payment is processed securely through Paystack. We never store your payment information.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1"
                >
                  Back to Design
                </Button>
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-gradient-to-r from-scan-blue to-scan-purple"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Pay ₵{total.toFixed(2)} with Paystack
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
      </motion.div>
      )}

    </div>
  );
} 