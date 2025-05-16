
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Card3D from "@/components/Card3D";
import {
  ArrowRight,
  Smartphone,
  CreditCard,
  QrCode,
  Link as LinkIcon,
  User,
  Globe,
  Phone,
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
    <div className="min-h-screen bg-gradient-to-b from-white to-scan-mint/20">
      <Navigation />
      
      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 lg:pr-12">
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Your Digital Identity, <br />
                <span className="text-gradient">One Tap Away</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Connect instantly with a smart business card that blends physical elegance with digital convenience. 
                Share your full professional profile with a simple tap or scan.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="group">
                    Create Your Profile
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-scan-blue/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform how you network and connect with others
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/50 transform hover:translate-y-[-5px] transition-all">
              <div className="bg-scan-blue/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <User className="text-scan-blue" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-600">
                Build your digital identity with links, bio, contact info, and personalization options.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/50 transform hover:translate-y-[-5px] transition-all">
              <div className="bg-scan-blue/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <QrCode className="text-scan-blue" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your QR Code</h3>
              <p className="text-gray-600">
                We generate a unique QR code that links directly to your professional profile.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/50 transform hover:translate-y-[-5px] transition-all">
              <div className="bg-scan-blue/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="text-scan-blue" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive Your Card</h3>
              <p className="text-gray-600">
                Get a premium smart business card with your QR code elegantly printed on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Powerful Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to make lasting connections in the digital age
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <QrCode className="text-scan-blue" size={24} />, 
                title: "Dynamic QR Codes",
                description: "Update your information anytime without needing a new physical card."
              },
              { 
                icon: <LinkIcon className="text-scan-blue" size={24} />, 
                title: "All Your Links",
                description: "Display your social media, portfolio, resume, and custom links in one place."
              },
              { 
                icon: <Smartphone className="text-scan-blue" size={24} />, 
                title: "Mobile Optimization",
                description: "Your profile looks perfect on any device, ensuring a great experience."
              },
              { 
                icon: <Globe className="text-scan-blue" size={24} />, 
                title: "Custom Domain",
                description: "Use your own domain for a truly professional touchpoint."
              },
              { 
                icon: <Phone className="text-scan-blue" size={24} />, 
                title: "Contact Integration",
                description: "Visitors can save your contact details directly to their phone."
              },
              { 
                icon: <CreditCard className="text-scan-blue" size={24} />, 
                title: "Premium Materials",
                description: "High-quality cards that make a lasting impression with NFC technology."
              }
            ].map((feature, i) => (
              <div
                key={feature.title}
                ref={(el) => (featureCardRefs.current[i] = el)}
                className="glass-card p-6 opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-scan-blue/10 w-12 h-12 rounded-full flex items-center justify-center mb-5">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-scan-blue to-scan-blue-light text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform How You Connect?</h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands of professionals who are making meaningful connections with ScanToTap's smart business cards.
          </p>
          <div className="mt-10">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-scan-blue">
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
