import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Twitter, Linkedin, Instagram, FileText, Shield, QrCode } from "lucide-react";
import Scan2TapLogo from "@/components/Scan2TapLogo";

const Footer = () => {
  return (
    <footer className="bg-scan-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Scan2TapLogo />
            </Link>
            <p className="mt-4 text-sm text-gray-300 max-w-md">
              Your digital identity, one tap away. Scan2Tap helps professionals connect instantly with a smart business card that's as unique as you are.
            </p>
            <div className="mt-6 space-x-4 flex">
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Linkedin size={24} />
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Instagram size={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="/#features" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-gray-300 hover:text-scan-blue transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-scan-blue transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-2">
                    <Shield size={16} />
                    Privacy Policy
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl glassmorphism">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Shield size={20} className="text-scan-blue" />
                        Privacy Policy
                      </DialogTitle>
                      <DialogDescription className="mt-4">
                        <div className="text-left space-y-4">
                          <p>Last updated: May 16, 2025</p>
                          
                          <h3 className="text-lg font-semibold">1. Data Collection</h3>
                          <p>We collect personal information that you voluntarily provide when creating your ScanToTap profile, including your name, email address, profile image, contact information, and any links you choose to add to your profile.</p>
                          
                          <h3 className="text-lg font-semibold">2. QR Code Access</h3>
                          <p>When someone scans your QR code, we collect basic analytics data such as time of scan, approximate location (city/country level), and device type. This information is used to provide you with insights about your profile's visibility.</p>
                          
                          <h3 className="text-lg font-semibold">3. Data Usage</h3>
                          <p>The information we collect is used to provide and improve our services, process transactions, send notifications about your account, and provide customer support.</p>
                          
                          <h3 className="text-lg font-semibold">4. Third-Party Sharing</h3>
                          <p>We do not share your personal information with third parties except as necessary to provide our services (such as processing payments or shipping cards) or as required by law.</p>
                          
                          <h3 className="text-lg font-semibold">5. Data Security</h3>
                          <p>We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>
                          
                          <h3 className="text-lg font-semibold">6. Contact Us</h3>
                          <p>If you have questions about this Privacy Policy, please contact us at privacy@scantotap.com.</p>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-2">
                    <FileText size={16} />
                    Terms of Service
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl glassmorphism">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <FileText size={20} className="text-scan-blue" />
                        Terms of Service
                      </DialogTitle>
                      <DialogDescription className="mt-4">
                        <div className="text-left space-y-4">
                          <p>Last updated: May 16, 2025</p>
                          
                          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
                          <p>By accessing or using ScanToTap services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                          
                          <h3 className="text-lg font-semibold">2. User Accounts</h3>
                          <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must immediately notify ScanToTap of any unauthorized use of your account.</p>
                          
                          <h3 className="text-lg font-semibold">3. Identity Ownership</h3>
                          <p>You retain all rights to the content you add to your profile. By using our services, you grant us a license to display and process this content as needed to provide our services.</p>
                          
                          <h3 className="text-lg font-semibold">4. Prohibited Content</h3>
                          <p>You may not use ScanToTap to share illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content.</p>
                          
                          <h3 className="text-lg font-semibold">5. Service Modifications</h3>
                          <p>ScanToTap reserves the right to modify or discontinue the service at any time, with or without notice.</p>
                          
                          <h3 className="text-lg font-semibold">6. Termination</h3>
                          <p>ScanToTap may terminate your access to the service, without cause or notice, which may result in the deletion of all information associated with your account.</p>
                          
                          <h3 className="text-lg font-semibold">7. Contact</h3>
                          <p>If you have any questions about these Terms, please contact us at terms@scantotap.com.</p>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Scan2Tap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
