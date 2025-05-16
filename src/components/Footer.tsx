
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

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <footer className="bg-scan-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-gradient">ScanToTap</h2>
            </Link>
            <p className="mt-4 text-sm text-gray-300 max-w-md">
              Your digital identity, one tap away. ScanToTap helps professionals connect instantly with a smart business card that's as unique as you are.
            </p>
            <div className="mt-6 space-x-4 flex">
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
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
                <a href="#features" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-300 hover:text-scan-blue transition-colors">
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
                <a href="#" className="text-gray-300 hover:text-scan-blue transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors">
                    Privacy Policy
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
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
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors">
                    Terms of Service
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
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
            © {new Date().getFullYear()} ScanToTap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
