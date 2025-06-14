import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
  badge?: string;
}

const PricingPage = () => {
  const pricingPlans: PricingPlan[] = [
    {
      name: "Free Plan",
      price: "$0",
      period: "forever",
      description: "Perfect for students, job seekers, or anyone getting started with digital networking.",
      features: [
        { name: "Basic digital profile", included: true },
        { name: "5 link slots", included: true },
        { name: "Standard QR code", included: true },
        { name: "Public profile page", included: true },
        { name: "Mobile optimized", included: true },
        { name: "Downloadable QR", included: true },
        { name: "Basic analytics (coming soon)", included: true },
        { name: "Card delivery", included: false },
        { name: "NFC functionality", included: false },
        { name: "Profile customization", included: false },
      ],
      ctaText: "Start Free",
      ctaLink: "/dashboard",
    },
    {
      name: "Premium Card",
      price: "$15",
      period: "one-time",
      description: "Ideal for pros and creators who want a polished, branded presence.",
      features: [
        { name: "All Free features", included: true },
        { name: "Unlimited links", included: true },
        { name: "Custom QR card", included: true },
        { name: "NFC-compatible smart card", included: true },
        { name: "Priority support", included: true },
        { name: "Profile themes", included: true },
        { name: "Custom CTA buttons", included: true },
        { name: "Link click analytics", included: true },
        { name: "Editable card info", included: true },
        { name: "Custom domain (coming soon)", included: true },
      ],
      ctaText: "Upgrade to Premium",
      ctaLink: "/dashboard",
      highlighted: true,
      badge: "Popular",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90">
      <Navigation />

      {/* Pricing header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold font-serif"
          >
            Simple, Transparent <span className="bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent">Pricing</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-lg text-gray-600 dark:text-gray-300"
          >
            Choose the perfect plan for your networking needs. No subscriptions, just a one-time payment for your premium smart business card.
          </motion.p>
        </div>
      </motion.section>

      {/* Pricing cards */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pb-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                style={{ position: 'relative' }}
                className="h-full flex flex-col"
              >
                {plan.badge && plan.highlighted && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-3 right-4 z-20 bg-gradient-to-r from-scan-blue to-scan-purple text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg border border-white/20"
                  >
                    {plan.badge}
                  </motion.span>
                )}
                <motion.div 
                  whileHover={{ y: -8 }}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 glassmorphism-card p-8 flex-1 flex flex-col`}
                >
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <div className="flex items-end mb-5">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={plan.highlighted ? "text-gray-400 ml-1" : "text-gray-500 ml-1"}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`mb-6 ${plan.highlighted ? "text-gray-600 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                      {plan.description}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-center">
                          {feature.included ? (
                            <div className="p-1 rounded-full mr-3 bg-scan-blue/10">
                              <Check className="text-scan-blue" size={16} />
                            </div>
                          ) : (
                            <div className="p-1 rounded-full mr-3 bg-gray-100 dark:bg-gray-800">
                              <X className="text-gray-400" size={16} />
                            </div>
                          )}
                          <span className={feature.included ? "" : "text-gray-400"}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Link to={plan.ctaLink}>
                      <Button
                        radius="xl"
                        animation="scale"
                        className={`w-full ${
                          plan.highlighted 
                            ? "bg-scan-purple hover:bg-scan-purple-dark text-white" 
                            : "bg-gradient-to-r from-scan-blue to-scan-indigo text-white"
                        }`}
                        variant={plan.highlighted ? "default" : "default"}
                      >
                        {plan.ctaText}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-3xl mx-auto text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Need custom solutions?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Looking for bulk orders of 10+ cards or custom designs for your organization?
              We offer special enterprise packages tailored to your needs.
            </p>
            <Link to="/contact">
              <Button 
              variant="outline" 
              animation="glow"
              className="mt-6 rounded-xl border-scan-blue text-scan-blue hover:bg-scan-blue/10"
            >
              Contact Our Sales Team
            </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Custom Gradient Divider before FAQ Section */}
      <div className="w-full h-3 -mt-3 relative z-10">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-[#6366F1] dark:to-[#6366F1]" />
      </div>

      {/* FAQ Section with Animated Background */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-white/5 backdrop-blur-sm relative overflow-hidden"
      >
        {/* Animated SVG Blob/Gradient */}
        <svg className="absolute -top-32 -left-32 w-[600px] h-[400px] opacity-20 blur-2xl z-0 pointer-events-none" viewBox="0 0 600 400" fill="none">
          <ellipse cx="300" cy="200" rx="300" ry="200" fill="url(#faq-gradient)" >
            <animate attributeName="rx" values="300;320;300" dur="8s" repeatCount="indefinite" />
            <animate attributeName="ry" values="200;220;200" dur="8s" repeatCount="indefinite" />
          </ellipse>
          <defs>
            <radialGradient id="faq-gradient" cx="0" cy="0" r="1" gradientTransform="translate(300 200) scale(300 200)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-3xl font-bold text-center mb-12 font-serif"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Accordion 
              type="single" 
              collapsible 
              className="glassmorphism-card rounded-3xl shadow-2xl border-0 overflow-hidden"
            >
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-lg md:text-xl font-bold px-6 py-5 md:py-6 rounded-2xl flex items-center">
                  <span>How does the smart card work?</span>
                </AccordionTrigger>
                <AccordionContent 
                  className="px-6 pb-6 pt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                  Our smart business cards feature a QR code and NFC technology that can be scanned with any smartphone. When scanned, it opens your digital profile page where you can showcase all your professional information.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-lg md:text-xl font-bold px-6 py-5 md:py-6 rounded-2xl flex items-center">
                  <span>Can I update my profile after ordering the card?</span>
                </AccordionTrigger>
                <AccordionContent 
                  className="px-6 pb-6 pt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                  Yes! That's one of the biggest advantages. Your card links to your digital profile which you can update anytime without needing a new physical card.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-lg md:text-xl font-bold px-6 py-5 md:py-6 rounded-2xl flex items-center">
                  <span>How long does shipping take?</span>
                </AccordionTrigger>
                <AccordionContent 
                  className="px-6 pb-6 pt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                  Standard shipping takes 5-7 business days. We also offer expedited options at checkout for faster delivery.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-lg md:text-xl font-bold px-6 py-5 md:py-6 rounded-2xl flex items-center">
                  <span>Is there a subscription fee?</span>
                </AccordionTrigger>
                <AccordionContent 
                  className="px-6 pb-6 pt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                  No, we offer a one-time payment model. Pay once for your card and digital profile, and it's yours for life with no recurring fees.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default PricingPage;
