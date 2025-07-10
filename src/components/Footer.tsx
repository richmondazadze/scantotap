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
    <footer className="bg-scan-dark text-white py-8 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-10 lg:gap-16">
          <div className="mb-6 md:mb-0 md:col-span-2">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 mb-4 sm:mb-6">
              <Scan2TapLogo />
            </Link>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-md leading-relaxed">
              Your digital identity, one tap away. Scan2Tap helps professionals connect instantly with a smart business card that's as unique as you are.
            </p>
            <div className="mt-4 sm:mt-8 space-x-4 sm:space-x-6 flex">
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Twitter size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Linkedin size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </a>
              <a href="#" className="text-scan-blue-light hover:text-scan-blue transition-colors hover:scale-110 transform">
                <Instagram size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:gap-12 md:col-span-2">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6">Platform</h3>
            <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-sm sm:text-base">
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
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6">Company</h3>
            <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-sm sm:text-base">
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
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-1 sm:gap-2 text-left">
                    <Shield size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    Privacy Policy
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[85vh] bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-700/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-xl">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    
                    <div className="relative">
                      <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0">
                            <Shield size={16} className="sm:w-5 sm:h-5 text-white" />
                          </div>
                        Privacy Policy
                      </DialogTitle>
                        <DialogDescription className="sr-only">
                          Detailed privacy policy explaining how we collect, use, and protect your personal information
                        </DialogDescription>
                        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
                          Your privacy and data protection are our highest priorities
                        </p>
                      </DialogHeader>
                      
                      <div className="max-h-[55vh] overflow-y-auto p-4 sm:p-6">
                        <div className="space-y-6 sm:space-y-8">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Last updated:</span> June 20, 2025
                            </p>
                          </div>
                          
                          <div className="space-y-4 sm:space-y-6">
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                                Information We Collect
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                We collect information you provide directly to us, including:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Personal identification information (name, email address, phone number)</li>
                                <li>Profile information and content you choose to share</li>
                                <li>Account preferences and settings</li>
                                <li>Communication records when you contact our support</li>
                                <li>Payment information processed securely through third-party providers</li>
                              </ul>
                            </div>
                            
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                                Automatic Data Collection
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                We automatically collect certain information when you use our services:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Device information (IP address, browser type, operating system)</li>
                                <li>Usage analytics (pages visited, time spent, click patterns)</li>
                                <li>QR code scan data (timestamp, general location, device type)</li>
                                <li>Technical data for service optimization and security</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                                How We Use Your Information
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                We use collected information for legitimate business purposes including:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Providing and maintaining our digital identity services</li>
                                <li>Processing transactions and fulfilling orders</li>
                                <li>Improving our services and user experience</li>
                                <li>Providing customer support and responding to inquiries</li>
                                <li>Sending service-related communications and updates</li>
                                <li>Protecting against fraud and ensuring platform security</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">4</span>
                                Information Sharing and Disclosure
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                We do not sell or rent your personal information. We may share information only in these limited circumstances:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>With service providers who assist in business operations under strict confidentiality</li>
                                <li>When required by law or legal process</li>
                                <li>To protect our rights, property, or safety, or that of others</li>
                                <li>In connection with a business transfer or acquisition (with notice)</li>
                                <li>With your explicit consent for specific purposes</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">5</span>
                                Data Security and Retention
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                We implement appropriate technical and organizational measures to protect your information:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Industry-standard encryption for data transmission and storage</li>
                                <li>Regular security assessments and updates</li>
                                <li>Limited access controls and employee training</li>
                                <li>Data retention only for as long as necessary for stated purposes</li>
                                <li>Secure data deletion when no longer required</li>
                              </ul>
                            </div>

                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">6</span>
                                Your Rights and Choices
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                You have the following rights regarding your personal information:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Access and review your personal information</li>
                                <li>Request corrections to inaccurate data</li>
                                <li>Request deletion of your account and associated data</li>
                                <li>Control marketing communications preferences</li>
                                <li>Data portability where technically feasible</li>
                                <li>Withdraw consent for optional data processing</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">7</span>
                                Contact Information
                              </h3>
                              <div className="pl-7 sm:pl-8 lg:pl-10">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 text-xs sm:text-sm lg:text-base">
                                  For privacy-related questions, concerns, or to exercise your rights, please contact us:
                                </p>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                                  <p className="text-xs sm:text-sm lg:text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email: <a href="mailto:privacy@scan2tap.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">privacy@scan2tap.com</a>
                                  </p>
                                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400">
                                    We will respond to your inquiry within 30 days.
                                  </p>
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
                  <DialogTrigger className="text-gray-300 hover:text-scan-blue transition-colors flex items-center gap-1 sm:gap-2 text-left">
                    <FileText size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    Terms of Service
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[85vh] bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-700/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-xl">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    
                    <div className="relative">
                      <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg shadow-lg flex-shrink-0">
                            <FileText size={16} className="sm:w-5 sm:h-5 text-white" />
                          </div>
                        Terms of Service
                      </DialogTitle>
                        <DialogDescription className="sr-only">
                          Terms and conditions governing the use of our digital identity platform and services
                        </DialogDescription>
                        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
                          Please read these terms carefully before using our services
                        </p>
                      </DialogHeader>
                      
                      <div className="max-h-[55vh] overflow-y-auto p-4 sm:p-6">
                        <div className="space-y-6 sm:space-y-8">
                          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-emerald-200/50 dark:border-slate-600/50">
                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Last updated:</span> June 20, 2025
                            </p>
                          </div>
                          
                          <div className="space-y-4 sm:space-y-6">
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                                Acceptance and Agreement
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base">
                                By accessing or using Scan2Tap services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. These Terms constitute a legally binding agreement between you and Scan2Tap.
                              </p>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                                Service Description
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                Scan2Tap provides digital identity management services including:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Digital profile creation and management</li>
                                <li>QR code generation and analytics</li>
                                <li>Physical business card ordering and fulfillment</li>
                                <li>Contact information sharing and networking tools</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                                User Accounts and Responsibilities
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                When creating an account, you agree to:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized access</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Use the Service only for lawful purposes</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">4</span>
                                Intellectual Property Rights
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                Regarding intellectual property:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>You retain ownership of content you upload to your profile</li>
                                <li>You grant us a limited license to display and process your content</li>
                                <li>Scan2Tap owns all rights to the platform and underlying technology</li>
                                <li>You may not use our trademarks without written permission</li>
                                <li>You warrant you have rights to all content you upload</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">5</span>
                                Prohibited Uses and Content
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                You may not use our Service to share or promote:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>Illegal, harmful, or fraudulent activities</li>
                                <li>Harassment, discrimination, or hate speech</li>
                                <li>Copyrighted material without permission</li>
                                <li>Spam, malware, or security threats</li>
                                <li>False or misleading information</li>
                                <li>Content that violates others' privacy or rights</li>
                              </ul>
                            </div>

                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">6</span>
                                Payment Terms and Refunds
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base mb-3">
                                For paid services:
                              </p>
                              <ul className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base list-disc ml-4 space-y-1">
                                <li>All fees are charged in advance and non-refundable except as required by law</li>
                                <li>We reserve the right to change pricing with 30 days notice</li>
                                <li>Failed payments may result in service suspension</li>
                                <li>Refunds for defective products will be processed within 14 days</li>
                                <li>Subscription cancellations take effect at the end of the billing period</li>
                              </ul>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">7</span>
                                Limitation of Liability
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base">
                                To the maximum extent permitted by law, Scan2Tap shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities. Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
                              </p>
                            </div>

                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">8</span>
                                Termination
                              </h3>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 sm:pl-8 lg:pl-10 text-xs sm:text-sm lg:text-base">
                                Either party may terminate this agreement at any time. We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, your right to use the Service ceases immediately, and we may delete your account and data in accordance with our data retention policies.
                              </p>
                            </div>
                             
                            <div className="group">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">9</span>
                                Contact Information
                              </h3>
                              <div className="pl-7 sm:pl-8 lg:pl-10">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 text-xs sm:text-sm lg:text-base">
                                  For questions about these Terms or our Service, please contact us:
                                </p>
                                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 sm:p-4 rounded-lg border border-emerald-200/50 dark:border-slate-600/50">
                                  <p className="text-xs sm:text-sm lg:text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email: <a href="mailto:legal@scan2tap.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">legal@scan2tap.com</a>
                                  </p>
                                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400">
                                    We will respond to your inquiry within 5 business days.
                                  </p>
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

        <div className="mt-8 sm:mt-12 lg:mt-16 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-800 text-center">
          <p className="text-xs sm:text-sm lg:text-base text-gray-400 font-medium">
            © {new Date().getFullYear()} Scan2Tap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
