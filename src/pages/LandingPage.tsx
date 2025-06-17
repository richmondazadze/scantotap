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
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const LandingPage = () => {
  const featureCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true });

  // Smooth scroll utility
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Parallax effect for the hero section
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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

  useEffect(() => {
    // Scroll to section if hash is present in URL
    if (window.location.hash) {
      const sectionId = window.location.hash.replace('#', '');
      const section = document.getElementById(sectionId);
      if (section) {
        // Use setTimeout to ensure DOM is ready after navigation
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden scroll-smooth">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
        animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
        }}
        transition={{
            duration: 25,
          repeat: Infinity,
            ease: "linear"
        }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
      </div>

      <Navigation />
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative flex items-center min-h-[80vh] lg:min-h-screen pt-24 sm:pt-32 lg:pt-20 pb-8 sm:pb-10 lg:pb-20 px-4 sm:px-6 lg:px-8 z-10 overflow-x-hidden"
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ 
                duration: 1, 
                delay: 0.2,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="space-y-6 lg:space-y-8"
            >
            <br></br>
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center px-4 py-2 sm:mt-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
              >
                
                  <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    The Future of Networking
                  </span>
                
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-center lg:text-left"
              >
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
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed text-center lg:text-left"
            >
                Create your professional online profile, build the perfect link in bio page, and order premium business cards with QR codes. Everything you need to network like a pro, both online and offline.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start"
            >
              <Link to="/dashboard/profile" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-8"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">2-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Privacy first</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual */}
          <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ 
                duration: 1, 
                delay: 0.4,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="relative flex justify-center items-center overflow-hidden px-4 sm:px-0"
            >
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <motion.img
              src="/card_model.png"
                  alt="Scan2Tap Digital Card"
                  className="relative w-full h-auto object-contain rounded-xl shadow-l drop-shadow-2xl"
                  style={{ borderRadius: '12px' }}
              animate={{
                    y: [0, -20, 0],
                    rotateY: [0, 5, 0, -5, 0],
              }}
              transition={{
                    duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 15,
                  }}
                />

                {/* Floating elements - contained within image bounds */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white dark:bg-slate-800 rounded-full p-1.5 sm:p-2 md:p-3 shadow-lg"
                >
                  <QrCode className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-blue-500" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white dark:bg-slate-800 rounded-full p-1.5 sm:p-2 md:p-3 shadow-lg"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-500" />
          </motion.div>
              </div>
            </motion.div>
          </div>
              </div>
      </motion.section>

      {/* How it works section */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 md:pt-20 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6"
            >
              How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Get started in minutes with our simple three-step process
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-8 max-w-6xl mx-auto">
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
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="relative group"
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-blue-500/50 h-full flex flex-col relative overflow-hidden">
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <step.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                  </div>
                  
                  {/* Desktop number positioning */}
                  <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {i + 1}
                  </div>
                  
                  {/* Mobile number positioning */}
                  <div className="md:hidden absolute -top-10 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg z-20">
                    {i + 1}
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center relative z-10 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed flex-grow relative z-10 text-base sm:text-lg">
                  {step.description}
                </p>
                </div>
                
                {/* Desktop arrows */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-6 h-6 text-slate-400" />
                    </motion.div>
                  </div>
                )}
                
                {/* Mobile arrows - vertical */}
                {i < 2 && (
                  <div className="md:hidden absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500/20"
                    >
                      <ArrowRight className="w-5 h-5 text-blue-500 rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features section */}
      <motion.section 
        ref={featuresRef}
        id="features" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to create and share your digital identity professionally
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.03,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
                className="group relative"
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-transparent overflow-hidden h-full flex flex-col relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
                  <motion.div 
                    className={`flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-lg relative z-10`}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 5,
                      transition: { duration: 0.3, type: "spring", stiffness: 300 }
                    }}
                  >
                    <feature.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 relative z-10 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow relative z-10 text-base sm:text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              Loved by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              See what our users say about transforming their networking experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/30 relative overflow-hidden group"
              >
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-1 mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                        duration: 0.5, 
                        delay: i * 0.1 + 0.3,
                    type: "spring", 
                        stiffness: 200
                  }}
                      viewport={{ once: true }}
                >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed relative z-10 text-base sm:text-lg">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <motion.img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden"
      >
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full mb-6">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Ready to Transform Your Networking?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-10 leading-relaxed">
            Join thousands of professionals who are connecting smarter, not harder. Start building your digital presence today.
          </p>
          
                     <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             viewport={{ once: true }}
             className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
          >
                         <Link to="/dashboard/profile" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                 className="bg-white text-blue-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 font-semibold w-full sm:w-auto"
              >
                 <Rocket className="mr-2 w-5 h-5" />
                 Get Started Free
               </Button>
             </Link>
             <Link to="/pricing" className="w-full sm:w-auto">
               <Button
                 variant="outline"
                 size="lg"
                 className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 transition-colors px-8 font-semibold w-full sm:w-auto"
               >
                 View Pricing
              </Button>
            </Link>
          </motion.div>

                     <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             viewport={{ once: true }}
             className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-white/80 text-sm"
           >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Setup in 2 minutes</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default LandingPage;
