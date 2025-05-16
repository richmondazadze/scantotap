
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Check
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-scan-dark dark:to-indigo-950/40">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about ScanToTap? We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg p-8 h-full">
              <h3 className="text-2xl font-semibold mb-6 text-scan-blue dark:text-scan-blue-light">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                      <Mail className="w-5 h-5 text-scan-blue dark:text-scan-blue-light" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                    <a href="mailto:hello@scantotap.com" className="text-gray-800 dark:text-white hover:text-scan-blue dark:hover:text-scan-blue-light">
                      hello@scantotap.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                      <Phone className="w-5 h-5 text-scan-blue dark:text-scan-blue-light" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h4>
                    <a href="tel:+1234567890" className="text-gray-800 dark:text-white hover:text-scan-blue dark:hover:text-scan-blue-light">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-scan-blue/10 dark:bg-scan-blue/20 p-3 rounded-full">
                      <MapPin className="w-5 h-5 text-scan-blue dark:text-scan-blue-light" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Office</h4>
                    <p className="text-gray-800 dark:text-white">
                      123 Innovation Drive<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Social Media</h4>
                <div className="flex space-x-4">
                  {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                    <a 
                      key={social}
                      href={`#${social}`} 
                      className="bg-scan-blue/10 dark:bg-scan-blue/20 p-2 rounded-full hover:bg-scan-blue hover:text-white transition-colors"
                      aria-label={social}
                    >
                      <div className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-scan-purple dark:text-scan-purple-light">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your inquiry..."
                    required
                    rows={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-gradient-to-r from-scan-blue to-scan-purple hover:opacity-90 rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing <Check className="ml-2 animate-pulse" size={16} /></>
                    ) : (
                      <>Send Message <Send className="ml-2" size={16} /></>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Google Map */}
        <div className="mt-12 rounded-2xl overflow-hidden shadow-lg border border-white/20 h-96 bg-white/20 dark:bg-gray-800/20 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MapPin className="mx-auto h-10 w-10 mb-3" />
            <p>Google Maps would be embedded here</p>
            <p className="text-sm">123 Innovation Drive, San Francisco, CA 94103</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
