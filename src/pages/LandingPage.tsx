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
import { useLanguage } from "@/hooks/useLanguage";

const LandingPage = () => {
  const { t } = useLanguage();
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
      title: t('landing.features.fastSetup'),
      description: t('landing.features.fastSetupDesc'),
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: t('landing.features.privacy'),
      description: t('landing.features.privacyDesc'),
      color: "from-green-400 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: t('landing.features.analytics'),
      description: t('landing.features.analyticsDesc'),
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Smartphone,
      title: t('landing.features.mobile'),
      description: t('landing.features.mobileDesc'),
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: Globe,
      title: t('landing.features.unlimited'),
      description: t('landing.features.unlimitedDesc'),
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: CreditCard,
      title: t('landing.features.cards'),
      description: t('landing.features.cardsDesc'),
      color: "from-pink-400 to-red-500"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden scroll-smooth">
      {/* Animated background elements - contained and non-interfering */}
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
      
      {/* Hero Section - enhanced mobile layout */}
      <motion.section 
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative flex items-center min-h-[80vh] lg:min-h-screen pt-24 sm:pt-28 lg:pt-20 pb-12 lg:pb-20 px-6 sm:px-8 lg:px-12 z-10"
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center px-4 py-3 mt-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  The Future of Networking
                </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-center lg:text-left"
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
                className="text-base sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed text-center lg:text-left font-medium"
            >
                {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-2"
            >
              <Link to="/dashboard/profile" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                  >
                    {t('landing.hero.getStarted')}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-6"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">2-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">Privacy first</span>
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
              className="relative flex justify-center items-center px-4 sm:px-0"
            >
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
            <motion.img
              src="/card_model.png"
                  alt="Scan2Tap Digital Card"
                  className="relative w-full h-auto object-contain rounded-xl shadow-lg drop-shadow-2xl"
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

                {/* Floating elements - properly contained */}
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
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white dark:bg-slate-800 rounded-full p-2.5 shadow-lg"
                >
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
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
                  className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white dark:bg-slate-800 rounded-full p-2.5 shadow-lg"
                >
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          </motion.div>
              </div>
            </motion.div>
          </div>
              </div>
      </motion.section>

      {/* How it works section - optimized mobile typography */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12"
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
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6"
            >
              How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
            >
              Get started in minutes with our simple three-step process
            </motion.p>
          </motion.div>

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
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-blue-500/50 h-full flex flex-col relative overflow-hidden">
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 sm:mb-8 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                    {i + 1}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-center relative z-10 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 text-center leading-relaxed flex-grow relative z-10 font-medium">
                  {step.description}
                </p>
                </div>
                
                {/* Desktop arrows */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </motion.div>
                  </div>
                )}
                
                {/* Mobile arrows - vertical */}
                {i < 2 && (
                  <div className="md:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-6 h-6 sm:w-8 sm:h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500/20"
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features section - optimized mobile typography */}
      <motion.section 
        ref={featuresRef}
        id="features" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Everything you need to create and share your digital identity professionally
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
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
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-transparent overflow-hidden h-full flex flex-col relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
                  <motion.div 
                    className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl mb-6 sm:mb-8 shadow-lg relative z-10`}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 5,
                      transition: { duration: 0.3, type: "spring", stiffness: 300 }
                    }}
                  >
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 relative z-10 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed flex-grow relative z-10 font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section - optimized mobile typography */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Loved by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              See what our users say about transforming their networking experience
            </p>
          </motion.div>

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
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/30 relative overflow-hidden group"
              >
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-1 mb-4 sm:mb-6 relative z-10">
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
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                </motion.div>
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
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section - optimized mobile typography */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden"
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
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-6 sm:mb-8">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8">
            Ready to Transform Your Networking?
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed font-medium">
            Join thousands of professionals who are connecting smarter, not harder. Start building your digital presence today.
          </p>
          
                     <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             viewport={{ once: true }}
             className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full"
          >
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
          </motion.div>

                     <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             viewport={{ once: true }}
             className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-white/80 text-sm sm:text-base"
           >
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
          </motion.div>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default LandingPage;
