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
import { Twitter, Linkedin, Instagram, FileText, Shield, QrCode, X } from "lucide-react";
import Scan2TapLogo from "@/components/Scan2TapLogo";

const Footer = () => {
  return (
    <footer className="bg-scan-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0 md:col-span-2">
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

          <div className="grid grid-cols-2 gap-8 md:col-span-2">
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
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-2 text-left">
                    <Shield size={16} />
                    Privacy Policy
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-700/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-xl">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    
                    <div className="relative p-4 sm:p-1">
                      <DialogHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
                        <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                            <Shield size={20} className="sm:w-6 sm:h-6 text-white" />
                          </div>
                        Privacy Policy
                      </DialogTitle>
                        <p className="text-slate-600 dark:text-slate-300 mt-2 text-base sm:text-lg">
                          Your privacy and data protection are our top priorities
                        </p>
                      </DialogHeader>
                      
                      <div className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent pr-2">
                        <div className="space-y-8">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 p-4 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Last updated:</span> May 16, 2025
                            </p>
                          </div>
                          
                          <div className="space-y-6">
                                                         <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
                                 Data Collection
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 We collect personal information that you voluntarily provide when creating your Scan2Tap profile, including your name, email address, profile image, contact information, and any links you choose to add to your profile.
                               </p>
                             </div>
                            
                                                         <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
                                 QR Code Access
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 When someone scans your QR code, we collect basic analytics data such as time of scan, approximate location (city/country level), and device type. This information is used to provide you with insights about your profile's visibility.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
                                 Data Usage
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 The information we collect is used to provide and improve our services, process transactions, send notifications about your account, and provide customer support.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">4</span>
                                 Third-Party Sharing
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 We do not share your personal information with third parties except as necessary to provide our services (such as processing payments or shipping cards) or as required by law.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">5</span>
                                 Data Security
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">6</span>
                                 Contact Us
                               </h3>
                               <div className="pl-8 sm:pl-10">
                                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">
                                   If you have questions about this Privacy Policy, please contact us at:
                                 </p>
                                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                                   <a href="mailto:privacy@scantotap.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm sm:text-base">
                                     privacy@scantotap.com
                                   </a>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-2 text-left">
                    <FileText size={16} />
                    Terms of Service
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-700/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-xl">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    
                    <div className="relative p-4 sm:p-1">
                      <DialogHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
                        <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg shadow-lg">
                            <FileText size={20} className="sm:w-6 sm:h-6 text-white" />
                          </div>
                        Terms of Service
                      </DialogTitle>
                        <p className="text-slate-600 dark:text-slate-300 mt-2 text-base sm:text-lg">
                          Please read these terms carefully before using our services
                        </p>
                      </DialogHeader>
                      
                      <div className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent pr-2">
                        <div className="space-y-8">
                          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 p-4 rounded-lg border border-emerald-200/50 dark:border-slate-600/50">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Last updated:</span> May 16, 2025
                            </p>
                          </div>
                          
                          <div className="space-y-6">
                                                         <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
                                 Acceptance of Terms
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 By accessing or using Scan2Tap services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
                                 User Accounts
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must immediately notify Scan2Tap of any unauthorized use of your account.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
                                 Identity Ownership
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 You retain all rights to the content you add to your profile. By using our services, you grant us a license to display and process this content as needed to provide our services.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">4</span>
                                 Prohibited Content
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 You may not use Scan2Tap to share illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">5</span>
                                 Service Modifications
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 Scan2Tap reserves the right to modify or discontinue the service at any time, with or without notice.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">6</span>
                                 Termination
                               </h3>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8 sm:pl-10 text-sm sm:text-base">
                                 Scan2Tap may terminate your access to the service, without cause or notice, which may result in the deletion of all information associated with your account.
                               </p>
                             </div>
                             
                             <div className="group">
                               <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                 <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">7</span>
                                 Contact
                               </h3>
                               <div className="pl-8 sm:pl-10">
                                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">
                                   If you have any questions about these Terms, please contact us at:
                                 </p>
                                 <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-emerald-200/50 dark:border-slate-600/50">
                                   <a href="mailto:terms@scantotap.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-sm sm:text-base">
                                     terms@scantotap.com
                                   </a>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
            </div>
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
