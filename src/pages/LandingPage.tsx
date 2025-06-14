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
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const LandingPage = () => {
  const featureCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true });

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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-blue-50/50 to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 overflow-x-hidden" style={{ overscrollBehavior: 'none', backgroundColor: 'inherit' }}>
      {/* Top/Bottom overlay fade */}
      {/* Optional mesh blob */}
      <motion.svg 
        className="absolute -top-20 -left-32 w-[300px] h-[250px] sm:w-[500px] sm:h-[400px] opacity-20 z-0" 
        viewBox="0 0 500 400" 
        fill="none"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ellipse cx="250" cy="200" rx="250" ry="200" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(250 200) scale(250 200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </motion.svg>
      <Navigation />
      
      {/* Hero section */}
      <motion.section 
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="flex items-center min-h-screen pt-24 sm:pt-20 md:pt-16 pb-2 px-4 sm:px-6 lg:px-8 relative z-20 overflow-x-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center justify-center w-full max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center lg:items-start justify-center w-full"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-4 w-full flex justify-center lg:justify-start"
            >
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-scan-blue/10 text-scan-blue dark:bg-scan-blue/20 dark:text-scan-blue-light">
                  Digital Identity Platform
                </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-center lg:text-left w-full font-serif"
            >
                Your Digital Identity, <br />
                <span className="bg-gradient-to-r from-scan-blue via-indigo-500 to-scan-purple bg-clip-text text-transparent">
                  One Tap Away
                </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl text-center lg:text-left w-full"
            >
              Connect offline to online in one scan. Bridge your physical and digital presence seamlessly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full justify-center lg:justify-start"
            >
              <Link to="/dashboard/profile" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    radius="xl"
                    variant="gradient"
                    animation="glow"
                  className="group shadow-lg hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-scan-blue/30 transition-transform w-full sm:w-auto"
                  >
                  <span className="flex items-center justify-center">
                    Reserve Your Card
                    <motion.span
                      whileHover={{ x: 6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="ml-1 inline-block"
                    >
                      <ArrowRight size={18} />
                    </motion.span>
                  </span>
                  </Button>
                </Link>
              <Link to="#how-it-works" className="w-full sm:w-auto" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    radius="xl"
                    animation="scale"
                  className="hover:scale-105 hover:shadow-md hover:ring-1 hover:ring-scan-blue/30 transition-transform w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center items-center w-full mt-8 lg:mt-0"
          >
            <motion.img
              src="/card_model.png"
              alt="Scan2Tap 3D Card Model"
              className="relative w-64 h-40 sm:w-80 sm:h-52 lg:w-96 lg:h-64 xl:w-[520px] xl:h-[340px] object-contain rounded-2xl shadow-sm max-w-full"
              whileHover={{ rotate: -6, scale: 1.15 }}
              style={{ cursor: 'pointer' }}
              animate={{
                y: [0, -16, 0, 16, 0],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            />
          </motion.div>
              </div>
      </motion.section>

      {/* 3D Aesthetic Futuristic Gradient Divider (after hero) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 flex justify-center -mt-10"
      >
        <div className="w-full max-w-5xl h-8 flex items-center">
          <svg width="100%" height="32" viewBox="0 0 1200 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="futuristic-gradient" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFFF" />
                <stop offset="0.25" stopColor="#4F46E5" />
                <stop offset="0.5" stopColor="#9333EA" />
                <stop offset="0.75" stopColor="#4F46E5" />
                <stop offset="1" stopColor="#00FFFF" />
              </linearGradient>
            </defs>
            <ellipse cx="600" cy="16" rx="580" ry="10" fill="url(#futuristic-gradient)" filter="url(#blur)" opacity="0.85" />
            <filter id="blur">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </svg>
        </div>
      </motion.div>

      {/* How it works section */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 bg-white/40 dark:bg-scan-dark/40"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to connect your offline and online presence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><User className="text-scan-purple w-10 h-10" /></div>,
                title: "Create your profile",
                description: "Build your digital identity with links, bio, and contact information"
              },
              {
                icon: <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><CreditCard className="text-scan-purple w-10 h-10" /></div>,
                title: "Get your QR card",
                description: "Receive your personalized card with a unique QR code"
              },
              {
                icon: <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><Share2 className="text-scan-purple w-10 h-10" /></div>,
                title: "Share your ID in 1 scan",
                description: "Connect with anyone instantly by having them scan your card"
              }
            ].map((step, i) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glassmorphism-card p-8 transition-all duration-300 shadow-xl rounded-2xl flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-base md:text-lg">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA below cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <Link to="/dashboard/profile">
              <Button 
                size="lg" 
                variant="gradient" 
                radius="xl"
                animation="glow"
                className="shadow-lg hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-scan-blue/30 transition-transform"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 3D Aesthetic Futuristic Gradient Divider (before features) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 flex justify-center -mt-10"
      >
        <div className="w-full max-w-5xl h-8 flex items-center">
          <svg width="100%" height="32" viewBox="0 0 1200 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="futuristic-gradient-2" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFFF" />
                <stop offset="0.25" stopColor="#4F46E5" />
                <stop offset="0.5" stopColor="#9333EA" />
                <stop offset="0.75" stopColor="#4F46E5" />
                <stop offset="1" stopColor="#00FFFF" />
              </linearGradient>
            </defs>
            <ellipse cx="600" cy="16" rx="580" ry="10" fill="url(#futuristic-gradient-2)" filter="url(#blur)" opacity="0.85" />
            <filter id="blur">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </svg>
        </div>
      </motion.div>

      {/* Features section */}
      <motion.section 
        ref={featuresRef}
        id="features" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="pt-10 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">Features</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create and share your digital identity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><User className="text-scan-blue w-8 h-8" /></div>, 
                title: "Clean UI",
                description: "Intuitive and modern interface for easy profile management"
              },
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><Smartphone className="text-scan-blue w-8 h-8" /></div>, 
                title: "Mobile Optimized",
                description: "Perfect experience on any device, especially on mobile"
              },
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><Shield className="text-scan-blue w-8 h-8" /></div>, 
                title: "Secure",
                description: "End-to-end encryption and privacy controls for your data"
              },
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><QrCode className="text-scan-blue w-8 h-8" /></div>, 
                title: "QR/NFC Technology",
                description: "Multiple scanning options for maximum compatibility"
              },
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><CreditCard className="text-scan-blue w-8 h-8" /></div>, 
                title: "Printed Card",
                description: "High-quality physical cards delivered to your door"
              },
              { 
                icon: <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-scan-blue/20 to-scan-purple/30 shadow-md mb-4 mx-auto"><Globe className="text-scan-blue w-8 h-8" /></div>, 
                title: "Global Sharing",
                description: "Connect with anyone, anywhere in the world instantly"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glassmorphism-card p-8 transition-all duration-300 shadow-xl rounded-2xl flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-base md:text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Gradient Fade Divider for Smooth Transition to CTA */}
      <div className="w-full h-3 -mt-3 relative z-10">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-[#6366F1] dark:to-[#6366F1]" />
      </div>

      {/* CTA section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-scan-blue via-scan-indigo to-scan-purple text-white"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif">Ready to Transform Your Networking?</h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands of professionals who are connecting in a smarter way
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Link to="/dashboard/profile">
              <Button 
                size="lg" 
                variant="default"
                radius="xl"
                className="bg-white text-scan-blue font-bold shadow-xl hover:bg-scan-white hover:text-blue hover:scale-105 hover:shadow-2xl transition-transform px-10 py-5 text-1.5xs border border-scan-blue"
              >
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center"
              >
                Reserve Your Card
                  <ArrowRight className="ml-2 text-scan-blue" size={24} />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Gradient Fade Divider for Smooth Transition to Footer */}
      <div className="w-full h-3 -mt-3 relative z-10">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-[#111827] dark:to-[#0a0a23]" />
        </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
