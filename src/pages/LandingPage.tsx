
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Card3D from "@/components/Card3D";
import {
  ArrowRight,
  User,
  CreditCard,
  QrCode,
  Link as LinkIcon,
  Globe,
  Phone,
  Shield,
  Smartphone,
  Share2,
} from "lucide-react";

const LandingPage = () => {
  const featureCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    featureCardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureCardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-scan-mint/20">
      <Navigation />
      
      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 lg:pr-12">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-scan-blue/10 text-scan-blue">
                  Digital Identity Platform
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Your Digital Identity, <br />
                <span className="bg-gradient-to-r from-scan-blue via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  One Tap Away
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Connect offline to online in one scan. Bridge your physical and 
                digital presence seamlessly.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-scan-blue to-scan-blue-dark hover:opacity-90 rounded-xl shadow-lg shadow-scan-blue/20"
                  >
                    Reserve Your Card
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-xl">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
              <div className="relative w-80 h-48">
                <Card3D className="absolute animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Three simple steps to connect your offline and online presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <User className="text-indigo-500" size={24} />,
                title: "Create your profile",
                description: "Build your digital identity with links, bio, and contact information"
              },
              {
                icon: <CreditCard className="text-indigo-500" size={24} />,
                title: "Get your QR card",
                description: "Receive your personalized card with a unique QR code"
              },
              {
                icon: <Share2 className="text-indigo-500" size={24} />,
                title: "Share your identity in 1 scan",
                description: "Connect with anyone instantly by having them scan your card"
              }
            ].map((step, i) => (
              <div 
                key={step.title}
                className="glass-card p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to create and share your digital identity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <User className="text-scan-blue" size={24} />, 
                title: "Clean UI",
                description: "Intuitive and modern interface for easy profile management"
              },
              { 
                icon: <Smartphone className="text-scan-blue" size={24} />, 
                title: "Mobile Optimized",
                description: "Perfect experience on any device, especially on mobile"
              },
              { 
                icon: <Shield className="text-scan-blue" size={24} />, 
                title: "Secure",
                description: "End-to-end encryption and privacy controls for your data"
              },
              { 
                icon: <QrCode className="text-scan-blue" size={24} />, 
                title: "QR/NFC Technology",
                description: "Multiple scanning options for maximum compatibility"
              },
              { 
                icon: <CreditCard className="text-scan-blue" size={24} />, 
                title: "Printed Card",
                description: "High-quality physical cards delivered to your door"
              },
              { 
                icon: <Globe className="text-scan-blue" size={24} />, 
                title: "Global Sharing",
                description: "Connect with anyone, anywhere in the world instantly"
              }
            ].map((feature, i) => (
              <div
                key={feature.title}
                ref={(el) => (featureCardRefs.current[i] = el)}
                className="glass-card p-6 opacity-0 transition-all duration-300 hover:shadow-lg hover:border-scan-blue/30 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-scan-blue/10 w-14 h-14 rounded-full flex items-center justify-center mb-5 group-hover:bg-scan-blue/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-scan-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Networking?</h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands of professionals who are connecting in a smarter way
          </p>
          <div className="mt-10">
            <Link to="/dashboard">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-indigo-600 hover:bg-white hover:text-indigo-700 transition-colors rounded-xl"
              >
                Reserve Your Card
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
