import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  User,
  QrCode,
  Link as LinkIcon,
  Globe,
  Phone,
  Shield,
  Smartphone,
  Share2,
  Star,
  Check,
  Clock,
  Zap,
  TrendingUp,
  Heart,
  Sparkles,
  CreditCard,
  Target,
  Rocket,
} from "lucide-react";
import { useMediaQuery } from 'react-responsive';
import { Helmet } from 'react-helmet-async';


const LandingPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const mockupRef = useRef<HTMLImageElement>(null);

  // Simple scroll utility
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Scroll twist effect for mockup
  useEffect(() => {
    const handleScroll = () => {
      if (mockupRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        const spinRate = scrolled * 0.1;
        mockupRef.current.style.transform = `rotate(2deg) rotateY(${rate}deg) rotateZ(${spinRate}deg)`;
      }
    };

    // Set initial transform
    if (mockupRef.current) {
      mockupRef.current.style.transform = 'rotate(2deg)';
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to section if hash is present in URL
    if (window.location.hash) {
      const sectionId = window.location.hash.replace('#', '');
      const section = document.getElementById(sectionId);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      company: "@sarahcreates",
      content: "Finally ditched Linktree! This is so much better - more customization, better analytics, and my audience loves it.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "Digital Marketer",
      company: "@marcusmarketing",
      content: "The analytics are incredible! I can see exactly which content my followers engage with most. Conversion rate up 40%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emily Johnson",
      role: "Small Business Owner",
      company: "@emilysboutique",
      content: "Perfect for my business! All my social links, shop, and contact info in one beautiful page. Customers find everything easily.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Setup",
      description: "Create your link in bio page in under 2 minutes. No technical skills required.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Choose exactly what to show and hide. Your data, your control.",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track clicks, views, and engagement to grow your audience effectively.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Smartphone,
      title: "Mobile First Design",
      description: "Beautiful, responsive design that looks perfect on every device.",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: Globe,
      title: "Unlimited Links",
      description: "Add as many links as you want. No limits, no restrictions.",
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: CreditCard,
      title: "Physical Business Cards",
      description: "Order premium business cards with your QR code for offline networking.",
      color: "from-pink-400 to-red-500"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden">
      <Helmet>
        <title>Digital Business Cards in Ghana | NFC & QR | Scan2Tap</title>
        <meta name="description" content="Create your digital business card in minutes. NFC & QR cards with analytics and beautiful profiles. Fast Ghana delivery." />
        <link rel="canonical" href={`${window.location.origin}/`} />
        <meta property="og:title" content="Scan2Tap — Your Digital Identity, One Tap Away" />
        <meta property="og:description" content="NFC & QR business cards in Ghana. Build a beautiful profile, track clicks, and share instantly." />
        <meta property="og:image" content={`${window.location.origin}/mockup.webp`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float animation-delay-1000" />
      </div>

      <Navigation />
      
      {/* Hero Section */}
      <section className="relative flex items-center min-h-[80vh] lg:min-h-screen pt-24 sm:pt-28 lg:pt-20 pb-12 lg:pb-20 px-6 sm:px-8 lg:px-12 z-10">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center px-4 py-3 mt-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 animate-fade-in-up">
                <Sparkles className="w-4 h-4 mr-2 text-blue-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  The Future of Networking
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-center lg:text-left animate-fade-in-up animation-delay-200">
                {/* Mobile version - shorter and more concise */}
                <span className="block sm:hidden">
                  Your{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Digital Identity
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                    Link in Bio
                  </span>
                  {" "}+{" "}
                  <span className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Cards
                  </span>
                </span>
                
                {/* Desktop version - full text */}
                <span className="hidden sm:block">
                  Your{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Online Profile
                  </span>
                  {" "}+{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                    Link in Bio
                  </span>
                  {" "}+{" "}
                  <span className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Business Cards
                  </span>
                </span>
              </h1>

              <p className="text-base sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed text-center lg:text-left font-medium animate-fade-in-up animation-delay-400">
                Create your professional online profile, build the perfect link in bio page, and order premium business cards with QR codes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-2 animate-fade-in-up animation-delay-600">
                <Link to="/dashboard/profile" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-6 animate-fade-in-up animation-delay-800">
                <div className="flex items-center gap-2 animate-fade-in-left animation-delay-900">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">Free forever</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in-left animation-delay-1000">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">2-minute setup</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in-left animation-delay-1100">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">Privacy first</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative flex justify-center items-center px-4 sm:px-0 animate-fade-in-right animation-delay-300">
              <div className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]">
                {isMobile ? (
                  <img
                    src="/mockup.webp"
                    alt="Scan2Tap Digital Profile Mockup"
                    className="relative w-full h-auto object-contain rounded-xl animate-fade-in-up animation-delay-500"
                    style={{ borderRadius: '12px' }}
                    ref={mockupRef}
                  />
                ) : (
                  <img
                    src="/mockup.webp"
                    alt="Scan2Tap Digital Profile Mockup"
                    className="relative w-full h-auto object-contain rounded-xl hover:scale-105 transition-transform duration-200 animate-fade-in-up animation-delay-500"
                    style={{ borderRadius: '12px' }}
                    ref={mockupRef}
                  />
                )}
                {/* Removed animated floating elements */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              {
                icon: User,
                title: "Create Your Page",
                description: "Build your personalized link in bio page with all your content, links, and social profiles in one place"
              },
              {
                icon: QrCode,
                title: "Share Everywhere",
                description: "Get your unique link, QR code, and order physical business cards to share both digitally and in person"
              },
              {
                icon: Rocket,
                title: "Grow Your Audience",
                description: "Track clicks, analyze your audience, and optimize your content to maximize engagement and growth"
              }
            ].map((step, i) => (
              <div 
                key={step.title}
                className="relative group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-blue-500/50 h-full flex flex-col relative overflow-hidden">
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 sm:mb-8 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-center relative z-10 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 text-center leading-relaxed flex-grow relative z-10 font-medium">
                  {step.description}
                </p>
                </div>
                
                {/* Desktop arrows */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <div className="animate-pulse">
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                  </div>
                )}
                
                {/* Mobile arrows - vertical */}
                {i < 2 && (
                  <div className="md:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500/20 animate-pulse">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Everything you need to create and share your digital identity professionally
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-transparent overflow-hidden h-full flex flex-col relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
                  <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl mb-6 sm:mb-8 shadow-lg relative z-10 hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 relative z-10 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed flex-grow relative z-10 font-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Loved by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              See what our users say about transforming their networking experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              {
                name: "Kwame Asante",
                role: "Marketing Director",
                company: "Tech Ghana",
                content: "Scan2Tap has completely transformed how I network at events. One tap and people have all my information instantly.",
                rating: 5
              },
              {
                name: "Sarah Johnson",
                role: "Business Development",
                company: "StartupLab",
                content: "The analytics feature helps me understand which content resonates most with my audience. It's incredibly valuable.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Creative Director",
                company: "Design Studio",
                content: "Professional, sleek, and so much more convenient than traditional business cards. My clients love it.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div
                key={testimonial.name}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/30 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-1 mb-4 sm:mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i}>
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed relative z-10 font-medium">
                  "{testimonial.content}"
                </p>
                <div className="relative z-10">
                  <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-6 sm:mb-8">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8">
            Ready to Transform Your Networking?
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed font-medium">
            Join thousands of professionals who are connecting smarter, not harder. Start building your digital presence today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full">
            <Link to="/dashboard/profile" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3 sm:px-10 sm:py-4 font-bold text-base sm:text-lg w-full sm:w-auto"
              >
                <Rocket className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 transition-colors px-8 py-3 sm:px-10 sm:py-4 font-bold text-base sm:text-lg w-full sm:w-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-white/80 text-sm sm:text-base">
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Free forever plan</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
