
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      console.log(values);
      setIsSubmitting(false);
      form.reset();
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll respond shortly.",
      });
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Get In <span className="bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Have questions about ScanToTap? We're here to help you connect with your audience better.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="lg:col-span-2">
              <div className="glassmorphism-card p-8">
                <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
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
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What's this regarding?" {...field} />
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
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us more about your inquiry..." 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      variant="gradient"
                      animation="glow"
                      size="lg"
                      radius="xl"
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            <div>
              <div className="glassmorphism-card p-8 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                        <Mail className="text-scan-blue h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Email Us</h3>
                        <p className="text-gray-600 dark:text-gray-300">support@scantotap.com</p>
                        <p className="text-gray-600 dark:text-gray-300">sales@scantotap.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                        <Phone className="text-scan-blue h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Call Us</h3>
                        <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                        <p className="text-gray-600 dark:text-gray-300">Mon-Fri, 9am-5pm ET</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                        <MapPin className="text-scan-blue h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Visit Us</h3>
                        <p className="text-gray-600 dark:text-gray-300">123 Innovation Way</p>
                        <p className="text-gray-600 dark:text-gray-300">San Francisco, CA 94103</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium text-lg mb-2">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-scan-blue hover:text-scan-blue-dark transition-colors hover:scale-110 transform">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="text-scan-blue hover:text-scan-blue-dark transition-colors hover:scale-110 transform">
                      <Linkedin size={20} />
                    </a>
                    <a href="#" className="text-scan-blue hover:text-scan-blue-dark transition-colors hover:scale-110 transform">
                      <Instagram size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
