
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  highlighted?: boolean;
}

const PricingPage = () => {
  const pricingPlans: PricingPlan[] = [
    {
      name: "Digital",
      price: "Free",
      description: "Perfect for casual networking",
      features: [
        { name: "Digital profile page", included: true },
        { name: "Custom QR code", included: true },
        { name: "Up to 5 social links", included: true },
        { name: "Basic analytics", included: true },
        { name: "Email support", included: true },
        { name: "Physical smart card", included: false },
        { name: "Premium materials", included: false },
        { name: "Custom branding", included: false },
      ],
      ctaText: "Get Started",
    },
    {
      name: "Premium",
      price: "$49",
      description: "One-time payment for professionals",
      features: [
        { name: "Digital profile page", included: true },
        { name: "Custom QR code", included: true },
        { name: "Unlimited social links", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Physical smart card", included: true },
        { name: "Premium materials", included: true },
        { name: "Custom branding", included: true },
      ],
      ctaText: "Order Your Card",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$199",
      description: "Perfect for small teams (5 cards)",
      features: [
        { name: "Digital profile pages", included: true },
        { name: "Custom QR codes", included: true },
        { name: "Unlimited social links", included: true },
        { name: "Team analytics", included: true },
        { name: "Dedicated support", included: true },
        { name: "Physical smart cards (5)", included: true },
        { name: "Premium materials", included: true },
        { name: "Custom branding", included: true },
      ],
      ctaText: "Contact Sales",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-scan-mint/20">
      <Navigation />

      {/* Pricing header */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Choose the perfect plan for your networking needs. No subscriptions, just a one-time payment for your premium smart business card.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-scan-blue to-scan-blue-dark text-white scale-105 shadow-xl"
                    : "bg-white/50 backdrop-blur-sm border border-white/50 shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-scan-blue-dark text-white text-center py-1 text-xs font-semibold">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-8 pt-12">
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-end mb-5">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Free" && (
                      <span className={plan.highlighted ? "text-white/70" : "text-gray-500"}>
                        &nbsp;one-time
                      </span>
                    )}
                  </div>
                  <p className={`mb-6 ${plan.highlighted ? "text-white/80" : "text-gray-600"}`}>
                    {plan.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center">
                        {feature.included ? (
                          <Check 
                            className={`mr-3 ${plan.highlighted ? "text-white" : "text-scan-blue"}`} 
                            size={18} 
                          />
                        ) : (
                          <X className="mr-3 text-gray-400" size={18} />
                        )}
                        <span className={feature.included ? "" : "text-gray-400"}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/dashboard">
                    <Button
                      className={`w-full ${
                        plan.highlighted 
                          ? "bg-white hover:bg-gray-100 text-scan-blue" 
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "default"}
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Need custom solutions?</h3>
            <p className="text-gray-600">
              Looking for bulk orders of 10+ cards or custom designs for your organization?
              We offer special enterprise packages tailored to your needs.
            </p>
            <Button variant="outline" className="mt-6">
              Contact Our Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-scan-blue/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-2">How does the smart card work?</h3>
              <p className="text-gray-600">
                Our smart business cards feature a QR code that can be scanned with any smartphone camera. 
                When scanned, it opens your digital profile page where you can showcase all your professional information.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-2">Can I update my profile after ordering the card?</h3>
              <p className="text-gray-600">
                Yes! That's one of the biggest advantages. Your card links to your digital profile which you can update 
                anytime without needing a new physical card.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-2">How long does shipping take?</h3>
              <p className="text-gray-600">
                Standard shipping takes 7-10 business days. We also offer expedited options at checkout for faster delivery.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-2">Is there a subscription fee?</h3>
              <p className="text-gray-600">
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
