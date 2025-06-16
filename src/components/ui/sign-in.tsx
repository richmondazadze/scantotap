"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Scan2TapLogo from "@/components/Scan2TapLogo";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '@/components/ui/loading';

export const LightLogin = () => {
  const { signIn } = useAuth();
  const { refreshProfile } = useProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
    resetMessages();
  };

  // Handle password change with strength calculation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (isSignUp) {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    resetMessages();
  };

  // Enhanced error messages
  const getErrorMessage = (error: string) => {
    if (error.includes('Invalid login credentials') || error.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.includes('User not found') || error.includes('user_not_found')) {
      return 'No account found with this email address. Please check your email or sign up.';
    }
    if (error.includes('Email not confirmed') || error.includes('email_not_confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (error.includes('Password should be at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    if (error.includes('User already registered') || error.includes('user_already_exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (error.includes('Signup not allowed')) {
      return 'Account creation is currently disabled. Please contact support.';
    }
    if (error.includes('Too many requests')) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    return error;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!emailValid) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(getErrorMessage(error.message));
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (!emailValid) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    try {
      // Sign up the user
      const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });
      
      if (error) {
        setError(getErrorMessage(error.message));
        setLoading(false);
        return;
      }

      if (signUpData?.user) {
        // Use upsert to create profile (handles duplicates gracefully)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            user_id: signUpData.user.id,
            email: signUpData.user.email,
            name: '',
            onboarding_complete: false
          }, {
            onConflict: 'id'
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('Failed to create your profile. Please try again.');
          setLoading(false);
          return;
        }
        
        // Check if user is immediately confirmed (email confirmation disabled)
        if (signUpData.session) {
          // User is immediately logged in, redirect to onboarding
          setSuccess('Welcome to Scan2Tap! Setting up your account...');
          setTimeout(() => {
            window.location.reload(); // Force refresh to update contexts
          }, 1000);
        } else {
          // Email confirmation required
          setSuccess('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error('Signup error:', err);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    if (!emailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    resetMessages();
    
    try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(getErrorMessage(error.message));
      } else {
        setSuccess('Password reset instructions sent to your email!');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    resetMessages();

    try {
      console.log(`Initiating ${provider} OAuth...`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('popup')) {
          setError('Please allow popups for this site and try again.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(`Failed to connect with ${provider === 'google' ? 'Google' : 'Apple'}. Please try again.`);
        }
      } else if (data) {
        console.log('OAuth initiated successfully:', data);
        // Don't set loading to false here as the user will be redirected
        return;
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setError('Authentication service unavailable. Please try again later.');
    } finally {
      // Only set loading to false if there was an error
      // If successful, user will be redirected and component will unmount
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setError('Authentication failed. Please try again.');
      } else if (session) {
        console.log('User authenticated:', session);
      }
    };

    handleOAuthCallback();
  }, []);

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="w-full space-y-6">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <Scan2TapLogo />
      </motion.div>

      {/* Welcome Message */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Join Scan2Tap to create your digital identity' : 'Sign in to continue to your account'}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={isSignUp ? handleSignUp : handleSignIn} 
        className="space-y-5"
      >
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-4 w-4 transition-colors ${
                emailFocused ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            <Input
              id="email"
              type="email"
                  placeholder="Enter your email"
                  value={email}
              onChange={handleEmailChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
                  required
              className={`pl-10 transition-all duration-200 ${
                email && !emailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
                email && emailValid ? 'border-green-300 focus:border-green-500 focus:ring-green-500' :
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {emailValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
              </div>
            </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                disabled={loading}
              >
                Forgot password?
              </button>
          )}
              </div>
                <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-4 w-4 transition-colors ${
                passwordFocused ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            <Input
              id="password"
                    type={showPassword ? "text" : "password"}
              placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
                    required
              className="pl-10 pr-10 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
          </div>
          
          {/* Password Strength Indicator */}
          <AnimatePresence>
            {isSignUp && password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Password strength</span>
                  <span className={`font-medium ${
                    passwordStrength < 50 ? 'text-red-500' : 
                    passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-1.5 rounded-full transition-colors ${getPasswordStrengthColor()}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
              </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
                type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loading size="sm" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </motion.div>
      </motion.form>

      {/* Divider */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">or continue with</span>
            </div>
      </motion.div>

      {/* Google OAuth Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button 
              type="button"
          variant="outline"
              onClick={() => handleOAuth("google")}
          className="w-full border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              disabled={loading}
            >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </Button>
      </motion.div>

      {/* Toggle Sign Up/Sign In */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <span className="text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
        </span>
                  <button
                    type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetMessages();
            setPassword('');
            setPasswordStrength(0);
          }}
          className="text-blue-600 hover:text-blue-500 font-medium transition-colors hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
      </motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
              )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                {success}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};