import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import Index from "./pages/Index";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import SearchListings from "./pages/SearchListings";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import Categories from "./pages/Categories";
import AboutUs from "./pages/AboutUs";
import HowItWorks from "./pages/HowItWorks";
import SafetyTips from "./pages/SafetyTips";
import SuccessStories from "./pages/SuccessStories";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import ListingDetails from "./pages/ListingDetails";
import PaymentCallback from "./pages/payment-callback";

const queryClient = new QueryClient();

const AppContent = () => {
  useAdminSetup();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/edit-listing/:id" element={<EditListing />} />
      <Route path="/search" element={<SearchListings />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:categoryName" element={<Categories />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/safety-tips" element={<SafetyTips />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/payment-callback" element={<PaymentCallback />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
