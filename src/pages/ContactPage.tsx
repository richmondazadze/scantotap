import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
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

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success("Message sent successfully!", {
      description: "We'll get back to you as soon as possible.",
    });
    form.reset();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 flex flex-col overflow-x-hidden">
      <Navigation />
      {/* Animated Gradient Blob */}
      <motion.svg 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[400px] blur-2xl z-0 pointer-events-none" 
        viewBox="0 0 600 400" 
        fill="none"
      >
        <ellipse cx="300" cy="200" rx="300" ry="200" fill="url(#contact-gradient)" >
          <animate attributeName="rx" values="300;320;300" dur="8s" repeatCount="indefinite" />
          <animate attributeName="ry" values="200;220;200" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <defs>
          <radialGradient id="contact-gradient" cx="0" cy="0" r="1" gradientTransform="translate(300 200) scale(300 200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </motion.svg>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-32 md:pt-40 pb-24 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center relative z-10"
      >
        <div className="w-full max-w-7xl">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-scan-blue dark:text-scan-blue-light font-serif">Contact Us</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions about our digital business cards? We're here to help.
              Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-1 space-y-6 order-2 lg:order-1"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="glassmorphism-card rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 text-scan-blue dark:text-scan-blue-light">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-scan-blue/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-scan-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a href="mailto:info@scantotap.com" className="text-gray-600 dark:text-gray-300 hover:text-scan-blue transition-colors">
                        info@scantotap.com
                      </a>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-scan-blue/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-scan-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <a href="tel:+15551234567" className="text-gray-600 dark:text-gray-300 hover:text-scan-blue transition-colors">
                        +1 (555) 123-4567
                      </a>
                      <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm EST</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-xl font-semibold mb-4">Connect with us</h3>
                  <div className="flex space-x-4">
                    <Link to="#" className="transition-colors hover:scale-110 hover:text-blue-500">
                      <Twitter className="h-7 w-7" />
                    </Link>
                    <Link to="#" className="transition-colors hover:scale-110 hover:text-blue-700">
                      <Linkedin className="h-7 w-7" />
                    </Link>
                    <Link to="#" className="transition-colors hover:scale-110 hover:text-pink-500">
                      <Instagram className="h-7 w-7" />
                    </Link>
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
                whileHover={{ y: -5 }}
                className="glassmorphism-card rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 text-scan-blue dark:text-scan-blue-light">Send us a Message</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <motion.div 
                      variants={itemVariants}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="John Doe" {...field} className="pl-10 focus:ring-2 focus:ring-scan-blue/40" />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-scan-blue">
                                  <Mail className="h-5 w-5" />
                                </span>
                              </div>
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
                            <FormLabel className="font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="john@example.com" type="email" {...field} className="pl-10 focus:ring-2 focus:ring-scan-blue/40" />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-scan-blue">
                                  <Mail className="h-5 w-5" />
                                </span>
                              </div>
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
                          <FormLabel className="font-semibold">Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help you?" {...field} className="focus:ring-2 focus:ring-scan-blue/40" />
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
                          <FormLabel className="font-semibold">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide details about your inquiry..."
                              className="resize-none h-32 focus:ring-2 focus:ring-scan-blue/40"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-scan-blue to-scan-purple hover:opacity-90 transition-all rounded-2xl shadow-lg"
                      >
                        {isSubmitting ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center"
                          >
                            <Loading size="sm" />
                            Sending...
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
