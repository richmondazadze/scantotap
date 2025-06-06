import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import { ProfileProvider } from "./contexts/ProfileContext";
import React from "react";
import ScrollToTop from "./ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import QRCodePage from './pages/QRCodePage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardProfile from './pages/DashboardProfile';
import DashboardQR from './pages/DashboardQR';
import DashboardOrder from './pages/DashboardOrder';
import DashboardShipping from './pages/DashboardShipping';
import DashboardSettings from './pages/DashboardSettings';

// Create a client
const queryClient = new QueryClient();

// Add global styles for scroll behavior
const globalStyles = `
  html {
    scroll-behavior: smooth;
  }
  
  body {
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
  }
  
  /* Enhanced mobile scroll behavior */
  @supports (scroll-behavior: smooth) {
    * {
      scroll-behavior: smooth;
    }
  }
  
  /* Improve webkit scrolling on iOS */
  * {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Add momentum scrolling for mobile */
  .overflow-y-auto, .overflow-auto {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  
  /* Ensure proper bottom padding for mobile nav */
  @media (max-width: 1023px) {
    .lg\\:pb-8 {
      padding-bottom: 6rem !important;
    }
  }
`;

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <ProfileProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider>
                <style>{globalStyles}</style>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                  <ScrollToTop />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route path="profile" element={<DashboardProfile />} />
                      <Route path="qr" element={<DashboardQR />} />
                      <Route path="order" element={<DashboardOrder />} />
                      <Route path="shipping" element={<DashboardShipping />} />
                      <Route path="settings" element={<DashboardSettings />} />
                    </Route>
                  <Route path="/dashboard" element={<Navigate to="/dashboard/profile" replace />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
