import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Check, X, Star, Zap, Shield, Crown, Sparkles, ArrowRight, Users, Infinity, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { PaystackService } from "@/services/paystackService";
import { toast } from "sonner";

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
  badge?: string;
  icon?: any;
  gradient?: string;
}

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { profile } = useProfile();
  const [upgrading, setUpgrading] = useState(false);
  const location = useLocation();

  // Check if user came from an upgrade prompt
  const source = searchParams.get('source');
  const feature = searchParams.get('feature');
  
  // Get state passed from onboarding/auth flow
  const welcomeMessage = location.state?.message;
  const highlightPro = location.state?.highlightPro;
  const autoTriggerUpgrade = location.state?.autoTriggerUpgrade;
  const preferredBilling = location.state?.billingCycle;

  // Set billing cycle based on preference from auth flow
  useEffect(() => {
    if (preferredBilling === 'annually') {
      setIsAnnual(true);
    } else if (preferredBilling === 'monthly') {
      setIsAnnual(false);
    }
  }, [preferredBilling]);

  // Handle subscription upgrade
  const handleUpgrade = useCallback(async (planType: 'monthly' | 'annually') => {
    if (!session?.user || !profile) {
      // Redirect to auth with plan parameter
      window.location.href = `/auth?plan=pro&billing=${planType}`;
      return;
    }

    // User is signed in - redirect to dashboard settings for subscription management
    window.location.href = `/dashboard/settings?tab=subscription&plan=${planType}`;
  }, [session, profile]);

  // Auto-trigger upgrade if requested
  useEffect(() => {
    if (autoTriggerUpgrade && session?.user && profile?.onboarding_complete) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        handleUpgrade(isAnnual ? 'annually' : 'monthly');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerUpgrade, session, profile, isAnnual, handleUpgrade]);

  const pricingPlans: PricingPlan[] = [
    {
      name: "Free Plan",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use and getting started with digital networking.",
      icon: Users,
      gradient: "from-gray-500 to-gray-600",
      features: [
        { name: "Create a digital profile", included: true, description: "Build your personalized digital profile" },
        { name: "Custom scan2tap link", included: true, description: "Get your own scan2tap.vercel.app/username URL" },
        { name: "Add up to 7 social or custom links", included: true, description: "Instagram, LinkedIn, website, etc." },
        { name: "Dynamic QR code & download", included: true, description: "Generate and download your QR code" },
        { name: "Basic profile layout", included: true, description: "Clean, professional design" },
        { name: "Show/hide contact info", included: true, description: "Control what information is visible" },
        { name: "Manage profile from dashboard", included: true, description: "Easy-to-use profile management" },
        { name: "Unlimited links", included: false, description: "Limited to 7 links total" },
        { name: "Profile analytics", included: false, description: "Coming soon for Pro users" },
        { name: "Custom themes", included: false, description: "Coming soon for Pro users" },
      ],
      ctaText: "Start Free",
      ctaLink: "/auth",
    },
    {
      name: "Pro Plan",
      price: isAnnual ? "$40" : "$4",
      originalPrice: isAnnual ? "$48" : undefined,
      period: isAnnual ? "per year" : "per month",
      description: "Ideal for professionals, creators, and businesses who want advanced features.",
      icon: Crown,
      gradient: "from-scan-blue to-scan-purple",
      features: [
        { name: "Everything in Free Plan", included: true, description: "All free features included" },
        { name: "Unlimited links", included: true, description: "Add as many links as you want" },
        { name: "All profile layout options", included: true, description: "Grid, horizontal, and custom layouts" },
        { name: "Coming soon: Profile analytics", included: true, description: "Detailed insights on profile visits and clicks" },
        { name: "Coming soon: Custom themes", included: true, description: "Personalize your profile appearance" },
        { name: "Coming soon: Custom domains", included: true, description: "Use your own domain name" },
        { name: "Coming soon: vCard download", included: true, description: "Let visitors save your contact instantly" },
        { name: "Coming soon: Team access & support", included: true, description: "Manage multiple profiles and priority support" },
      ],
      ctaText: "Upgrade to Pro",
      ctaLink: "/auth?plan=pro",
      highlighted: true,
      badge: "Most Popular",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Welcome Message */}
      {welcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 border border-scan-blue/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-scan-blue to-scan-purple rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {autoTriggerUpgrade ? 'Setting up your Pro subscription...' : 'Ready to upgrade?'}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{welcomeMessage}</p>
              {autoTriggerUpgrade && (
                <div className="flex items-center gap-2 text-scan-blue">
                  <div className="animate-spin h-4 w-4 border-2 border-scan-blue border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">Initializing payment...</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-5 sm:px-6 lg:px-8 text-center relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-scan-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-scan-purple/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-scan-blue/10 dark:bg-scan-blue/20 text-scan-blue px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6"
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent">
              Digital Identity
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Start free and upgrade when you're ready for advanced features. No contracts, cancel anytime.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-scan-blue focus:ring-offset-2 ${
                isAnnual ? 'bg-scan-blue' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold"
              >
                Save 17%
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pb-12 sm:pb-16 lg:pb-20 px-5 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                whileHover={{ scale: 1.01, y: -4 }}
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ${
                  plan.highlighted 
                    ? 'ring-2 ring-scan-blue/50 shadow-xl shadow-scan-blue/10' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && plan.highlighted && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                    {plan.badge}
                    </div>
                  </motion.div>
                )}

                <div className={`relative p-4 sm:p-6 lg:p-8 h-full flex flex-col ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/50' 
                    : 'bg-white/95 dark:bg-gray-800/95'
                } backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50`}>
                  
                  {/* Plan Header */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                      <plan.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Perfect for {plan.name.toLowerCase().includes('free') ? 'personal use' : 'professionals'}</p>
                            </div>
                            </div>

                  {/* Pricing */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-end gap-1.5 sm:gap-2 mb-2">
                      {plan.originalPrice && (
                        <span className="text-lg sm:text-xl text-gray-400 line-through">{plan.originalPrice}</span>
                      )}
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-1">/{plan.period}</span>
                        </div>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{plan.description}</p>
                    </div>
                    
                  {/* CTA Button */}
                  <div className="mb-4 sm:mb-6 lg:mb-8">
                    {plan.highlighted ? (
                      <Button
                        onClick={() => handleUpgrade(isAnnual ? 'annually' : 'monthly')}
                        disabled={upgrading}
                        className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue-dark hover:to-scan-purple/90 text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {upgrading ? 'Processing...' : plan.ctaText}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </Button>
                    ) : (
                      <Link to={plan.ctaLink} className="block">
                        <Button
                          className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                      >
                        {plan.ctaText}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </Button>
                    </Link>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-scan-blue" />
                      What's included
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * featureIndex }}
                          className="flex items-start gap-2.5 sm:gap-3 group"
                        >
                          <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            feature.included 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                          }`}>
                            {feature.included ? (
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            ) : (
                              <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm lg:text-base font-medium ${
                              feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {feature.name}
                            </span>
                            {feature.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {feature.description}
                              </p>
                            )}
                  </div>
                </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enterprise Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-scan-blue/20 to-scan-purple/20"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Infinity className="w-4 h-4" />
                  Enterprise Solutions
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Need something bigger?</h3>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Custom solutions for teams, organizations, and enterprises. Bulk pricing, white-label options, 
                  custom integrations, and dedicated support.
            </p>
            <Link to="/contact">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-2xl">
                    Contact Sales
                    <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section - Modern Grid Design */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="py-12 sm:py-16 lg:py-20 px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-800/60 relative overflow-hidden"
      >
        {/* Subtle animated background patterns */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Cpath d='M32 32V16h-16v16h16zm-16-16V0H0v16h16z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating orbs for depth */}
        <div className="absolute top-16 left-8 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-16 right-8 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-400/15 to-pink-500/15 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Got Questions? We've Got Answers
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
            Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about our digital profiles
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 xl:px-20"
          >
            {/* Mobile & Tablet: Single Column Accordion */}
            <div className="lg:hidden">
            <Accordion 
              type="single" 
              collapsible 
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden space-y-0"
            >
                {[
                  {
                    question: "How does the digital profile work?",
                    answer: "Your digital profile is a personalized web page that contains all your professional information. You can share it via QR code, link, or NFC technology. When someone visits your profile, they can instantly access your contact info, social media, and links.",
                    icon: QrCode,
                    gradient: "from-blue-500 to-blue-600"
                  },
                  {
                    question: "Can I update my profile after creating it?",
                    answer: "Yes! That's the beauty of digital profiles. You can update your information, add new links, change your photo, and modify your profile anytime from your dashboard. All changes are reflected immediately.",
                    icon: Users,
                    gradient: "from-green-500 to-green-600"
                  },
                  {
                    question: "What's the difference between Free and Pro?",
                    answer: "Free gives you the essentials: a digital profile, 7 links, and basic features. Pro unlocks unlimited links, advanced analytics, custom themes, priority support, and upcoming features like custom domains.",
                    icon: Star,
                    gradient: "from-purple-500 to-purple-600"
                  },
                  {
                    question: "Can I cancel my Pro subscription anytime?",
                    answer: "Absolutely! You can cancel your Pro subscription anytime from your dashboard. If you cancel, you'll keep Pro features until the end of your billing period, then automatically switch to the free plan.",
                    icon: Shield,
                    gradient: "from-orange-500 to-orange-600"
                  },
                  {
                    question: "Is my data secure and private?",
                    answer: "Yes! We take privacy seriously. You have full control over what information is displayed on your profile with our privacy settings. Your data is encrypted and securely stored, and we never share your personal information with third parties.",
                    icon: Shield,
                    gradient: "from-red-500 to-red-600"
                  },
                  {
                    question: "How do I share my digital profile?",
                    answer: "Multiple ways! You can share your profile link directly, generate a QR code for people to scan, use NFC technology for tap-to-share, or even embed your profile link in email signatures and social media bios.",
                    icon: Zap,
                    gradient: "from-cyan-500 to-cyan-600"
                  },
                  {
                    question: "What analytics do I get with Pro?",
                    answer: "Pro users get detailed insights including total profile views, link click tracking, visitor demographics, top-performing links, and engagement trends over time. Perfect for understanding how your network is growing.",
                    icon: Crown,
                    gradient: "from-indigo-500 to-indigo-600"
                  },
                  {
                    question: "Can I use this for my business or team?",
                    answer: "Absolutely! Many businesses use Scan2Tap for their teams. Each team member gets their own profile while maintaining brand consistency. For larger organizations, we offer enterprise solutions with bulk pricing and custom branding.",
                    icon: Users,
                    gradient: "from-pink-500 to-pink-600"
                  }
                ].map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index + 1}`} 
                    className="border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left px-3 sm:px-4 py-3 sm:py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors [&[data-state=open]]:bg-slate-50/50 dark:[&[data-state=open]]:bg-slate-700/30">
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${faq.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm`}>
                          <faq.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">
                          {faq.question}
                        </span>
                      </div>
                </AccordionTrigger>
                    <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                      <div className="pl-8 sm:pl-11">
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                </AccordionContent>
              </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Large Screens: Grid Layout with Individual Accordions */}
            <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-2 gap-6 xl:gap-8">
              {[
                {
                  question: "How does the digital profile work?",
                  answer: "Your digital profile is a personalized web page that contains all your professional information. You can share it via QR code, link, or NFC technology. When someone visits your profile, they can instantly access your contact info, social media, and links.",
                  icon: QrCode,
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  question: "Can I update my profile after creating it?",
                  answer: "Yes! That's the beauty of digital profiles. You can update your information, add new links, change your photo, and modify your profile anytime from your dashboard. All changes are reflected immediately.",
                  icon: Users,
                  gradient: "from-green-500 to-green-600"
                },
                {
                  question: "What's the difference between Free and Pro?",
                  answer: "Free gives you the essentials: a digital profile, 7 links, and basic features. Pro unlocks unlimited links, advanced analytics, custom themes, priority support, and upcoming features like custom domains.",
                  icon: Star,
                  gradient: "from-purple-500 to-purple-600"
                },
                {
                  question: "Can I cancel my Pro subscription anytime?",
                  answer: "Absolutely! You can cancel your Pro subscription anytime from your dashboard. If you cancel, you'll keep Pro features until the end of your billing period, then automatically switch to the free plan.",
                  icon: Shield,
                  gradient: "from-orange-500 to-orange-600"
                },
                {
                  question: "Is my data secure and private?",
                  answer: "Yes! We take privacy seriously. You have full control over what information is displayed on your profile with our privacy settings. Your data is encrypted and securely stored, and we never share your personal information with third parties.",
                  icon: Shield,
                  gradient: "from-red-500 to-red-600"
                },
                {
                  question: "How do I share my digital profile?",
                  answer: "Multiple ways! You can share your profile link directly, generate a QR code for people to scan, use NFC technology for tap-to-share, or even embed your profile link in email signatures and social media bios.",
                  icon: Zap,
                  gradient: "from-cyan-500 to-cyan-600"
                },
                {
                  question: "What analytics do I get with Pro?",
                  answer: "Pro users get detailed insights including total profile views, link click tracking, visitor demographics, top-performing links, and engagement trends over time. Perfect for understanding how your network is growing.",
                  icon: Crown,
                  gradient: "from-indigo-500 to-indigo-600"
                },
                {
                  question: "Can I use this for my business or team?",
                  answer: "Absolutely! Many businesses use Scan2Tap for their teams. Each team member gets their own profile while maintaining brand consistency. For larger organizations, we offer enterprise solutions with bulk pricing and custom branding.",
                  icon: Users,
                  gradient: "from-pink-500 to-pink-600"
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 + (0.1 * index), duration: 0.5 }}
                  className="h-full"
                >
                  <Accordion 
                    type="single" 
                    collapsible 
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl xl:rounded-3xl shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50 transition-shadow duration-300 h-full"
                  >
                    <AccordionItem value={`faq-${index + 1}`} className="border-0">
                      <AccordionTrigger className="text-left px-6 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors [&[data-state=open]]:bg-slate-50/50 dark:[&[data-state=open]]:bg-slate-700/30 rounded-2xl xl:rounded-3xl">
                        <div className="flex items-center gap-3 w-full">
                          <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${faq.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                            <faq.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                            {faq.question}
                          </span>
                        </div>
                </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 pt-0">
                        <div className="pl-13">
                          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4 }}
            className="text-center mt-8 sm:mt-12 lg:mt-16"
          >
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-blue-200/50 dark:border-blue-700/50">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Still have questions?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default PricingPage;

