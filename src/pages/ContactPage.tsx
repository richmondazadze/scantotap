import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Send, Loader2, MessageCircle, Clock, Users, Sparkles } from "lucide-react";
import Loading from '@/components/ui/loading';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully!", {
          description: `We'll get back to you soon. Reference: ${result.referenceId}`,
        });
        form.reset();
      } else {
        toast.error("Failed to send message", {
          description: result.error || "Please try again or contact us directly.",
        });
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
      </div>

      <Navigation />

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-24 sm:pt-32 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center relative z-10"
      >
        <div className="w-full max-w-7xl">
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-20 mb-12 sm:mb-16 lg:mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Get in Touch
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Have questions about our digital profiles? We're here to help.
              Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-1 space-y-6 order-2 lg:order-1"
            >
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 lg:p-10 relative overflow-hidden group"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-slate-900 dark:text-white relative z-10">Get in Touch</h2>
                
                <div className="space-y-8 relative z-10">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg shadow-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Email</h3>
                      <a href="mailto:info@scantotap.com" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base">
                        info@scantotap.com
                      </a>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-lg shadow-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Phone</h3>
                      <div className="space-y-1">
                        <a href="tel:+233203285781" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base">
                          +233 20 328 5781 (Ghana)
                        </a>
                        <a href="tel:+15126509818" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base">
                          +1 (512) 650-9818 (US)
                        </a>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Mon-Fri, 9am-5pm GMT</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-lg shadow-lg">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Live Chat</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-base">Available 24/7</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Instant support anytime you need it</p>
                  </div>
                  </motion.div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 relative z-10">
                  <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Business Hours</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-slate-600 dark:text-slate-300 text-base">Monday - Friday</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-slate-600 dark:text-slate-300 text-base">Weekend</span>
                      <span className="font-medium text-slate-900 dark:text-white text-base">Emergency only</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 relative z-10">
                  <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Connect with us</h3>
                  <div className="flex space-x-4">
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Twitter className="h-6 w-6 text-white" />
                    </motion.a>
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Linkedin className="h-6 w-6 text-white" />
                    </motion.a>
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Instagram className="h-6 w-6 text-white" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2 order-1 lg:order-2"
            >
              <motion.div 
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 lg:p-10 relative overflow-hidden group"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-slate-900 dark:text-white relative z-10">Send us a Message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                    <motion.div 
                      variants={itemVariants}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-900 dark:text-white text-base">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-900 dark:text-white text-base">Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="john@example.com" 
                                type="email" 
                                {...field} 
                                className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-900 dark:text-white text-base">Subject</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="How can we help you?" 
                              {...field} 
                              className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-900 dark:text-white text-base">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide details about your inquiry..."
                              className="resize-none h-32 rounded-lg border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border-0"
                      >
                        {isSubmitting ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center"
                          >
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending Message...
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center"
                          >
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      <Footer />
    </div>
  );
};

export default ContactPage;
