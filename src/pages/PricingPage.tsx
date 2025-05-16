
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
      name: "Free Card",
      price: "$0",
      period: "forever",
      description: "Perfect for casual networking",
      features: [
        { name: "Basic digital profile", included: true },
        { name: "Standard QR code", included: true },
        { name: "Up to 5 social links", included: true },
        { name: "Basic analytics", included: true },
        { name: "Email support", included: true },
        { name: "Physical smart card", included: false },
        { name: "Premium materials", included: false },
        { name: "Custom branding", included: false },
      ],
      ctaText: "Start Free",
      ctaLink: "/dashboard",
    },
    {
      name: "Premium Card",
      price: "$15",
      period: "one-time",
      description: "One-time payment for professionals",
      features: [
        { name: "Advanced digital profile", included: true },
        { name: "Custom QR design", included: true },
        { name: "Unlimited social links", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Physical smart card", included: true },
        { name: "Premium materials", included: true },
        { name: "NFC compatibility", included: true },
      ],
      ctaText: "Upgrade to Premium",
      ctaLink: "/dashboard",
      highlighted: true,
      badge: "Popular",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90">
      <Navigation />

      {/* Pricing header */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Simple, Transparent <span className="bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Choose the perfect plan for your networking needs. No subscriptions, just a one-time payment for your premium smart business card.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={plan.highlighted ? "premium-card" : ""}
              >
                <div 
                  className={`relative rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${
                    plan.highlighted 
                      ? "premium-card-inner"
                      : "glassmorphism-card p-8"
                  }`}
                >
                  {plan.badge && (
                    <Badge 
                      variant="gradient" 
                      className="absolute top-4 right-4 hover:bg-white/90 z-10 py-1 px-3"
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className={plan.highlighted ? "p-6" : ""}>
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
                            <div className={`p-1 rounded-full mr-3 ${plan.highlighted ? "bg-scan-purple/10" : "bg-scan-blue/10"}`}>
                              <Check 
                                className={plan.highlighted ? "text-scan-purple" : "text-scan-blue"} 
                                size={16} 
                              />
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
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Need custom solutions?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Looking for bulk orders of 10+ cards or custom designs for your organization?
              We offer special enterprise packages tailored to your needs.
            </p>
            <Button 
              variant="outline" 
              animation="glow"
              className="mt-6 rounded-xl border-scan-blue text-scan-blue hover:bg-scan-blue/10"
            >
              Contact Our Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="glassmorphism-card p-6">
              <h3 className="text-lg font-semibold mb-2">How does the smart card work?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our smart business cards feature a QR code and NFC technology that can be scanned with any smartphone. 
                When scanned, it opens your digital profile page where you can showcase all your professional information.
              </p>
            </div>
            
            <div className="glassmorphism-card p-6">
              <h3 className="text-lg font-semibold mb-2">Can I update my profile after ordering the card?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! That's one of the biggest advantages. Your card links to your digital profile which you can update 
                anytime without needing a new physical card.
              </p>
            </div>
            
            <div className="glassmorphism-card p-6">
              <h3 className="text-lg font-semibold mb-2">How long does shipping take?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Standard shipping takes 5-7 business days. We also offer expedited options at checkout for faster delivery.
              </p>
            </div>
            
            <div className="glassmorphism-card p-6">
              <h3 className="text-lg font-semibold mb-2">Is there a subscription fee?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                No, we offer a one-time payment model. Pay once for your card and digital profile, and it's yours for life with no recurring fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
