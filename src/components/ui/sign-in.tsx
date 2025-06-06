"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Shield } from "lucide-react";

export const LightLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot'>('sign-in');
  const [agreed, setAgreed] = useState(false);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else setSuccess('Check your email to confirm your account!');
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSuccess('Password reset email sent! Check your inbox.');
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    resetMessages();
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-100 via-blue-50 to-transparent opacity-40 blur-3xl -mt-20"></div>
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <Scan2TapLogo />
            </div>
            <div className="p-0">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {mode === 'sign-in' && 'Welcome Back'}
                {mode === 'sign-up' && 'Create Account'}
                {mode === 'forgot' && 'Forgot Password'}
              </h2>
              <p className="text-center text-gray-500 mt-2">
                {mode === 'sign-in' && 'Sign in to continue to your account'}
                {mode === 'sign-up' && 'Sign up to get started with your account'}
                {mode === 'forgot' && 'Enter your email to reset your password'}
              </p>
            </div>
          </div>

          {mode === 'sign-in' && (
            <form className="space-y-6 p-0" onSubmit={handleSignIn}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                  Email
              </label>
              <input
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => { setMode('forgot'); resetMessages(); }}
                  >
                  Forgot password?
                  </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-50 border-gray-200 text-gray-900 pr-12 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm text-center">{success}</div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}

          {mode === 'sign-up' && (
            <form className="space-y-6 p-0" onSubmit={handleSignUp}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="bg-gray-50 border-gray-200 text-gray-900 pr-12 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <span className="text-xs text-gray-600 select-none">
                  I agree to the{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-blue-600 hover:underline mx-1 inline-flex items-center gap-1">
                        Terms and Conditions
                      </button>
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
                              <p>By accessing or using Scan2Tap services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                            <h3 className="text-lg font-semibold">2. User Accounts</h3>
                              <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must immediately notify Scan2Tap of any unauthorized use of your account.</p>
                            <h3 className="text-lg font-semibold">3. Identity Ownership</h3>
                            <p>You retain all rights to the content you add to your profile. By using our services, you grant us a license to display and process this content as needed to provide our services.</p>
                            <h3 className="text-lg font-semibold">4. Prohibited Content</h3>
                              <p>You may not use Scan2Tap to share illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content.</p>
                            <h3 className="text-lg font-semibold">5. Service Modifications</h3>
                              <p>Scan2Tap reserves the right to modify or discontinue the service at any time, with or without notice.</p>
                            <h3 className="text-lg font-semibold">6. Termination</h3>
                              <p>Scan2Tap may terminate your access to the service, without cause or notice, which may result in the deletion of all information associated with your account.</p>
                            <h3 className="text-lg font-semibold">7. Contact</h3>
                            <p>If you have any questions about these Terms, please contact us at terms@scantotap.com.</p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  {' '}and{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-blue-600 hover:underline mx-1 inline-flex items-center gap-1">
                        Privacy Policy
                      </button>
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
                              <p>We collect personal information that you voluntarily provide when creating your Scan2Tap profile, including your name, email address, profile image, contact information, and any links you choose to add to your profile.</p>
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
                  .
                </span>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm text-center">{success}</div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading || !agreed}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form className="space-y-6 p-0" onSubmit={handleForgotPassword}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm text-center">{success}</div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Email"}
            </button>
            </form>
          )}

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg flex items-center justify-center gap-2 border bg-background inline-flex whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleOAuth("google")}
              disabled={loading}
            >
                {/* Google SVG */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-700"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="whitespace-nowrap">Google</span>
              </button>

            <button
              type="button"
              className="h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg flex items-center justify-center gap-2 border bg-background inline-flex whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleOAuth("apple")}
              disabled={loading}
            >
                {/* Apple logo from public directory */}
                <img src="/Apple_logo_black.svg" alt="Apple logo" className="w-5 h-5 object-contain" />
                <span className="whitespace-nowrap">Apple ID</span>
            </button>
          </div>

          <div className="p-0 mt-6">
            <p className="text-sm text-center text-gray-500 w-full">
              {mode === 'sign-in' && (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => { setMode('sign-up'); resetMessages(); }}
                  >
                Sign up
                  </button>
                </>
              )}
              {mode === 'sign-up' && (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => { setMode('sign-in'); resetMessages(); }}
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === 'forgot' && (
                <>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => { setMode('sign-in'); resetMessages(); }}
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};