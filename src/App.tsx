import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/AuthContext";
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

// Dream Weave Dubai Integration
import AmazonStore from "./pages/AmazonStore";
import AmazonProductDetails from "./pages/AmazonProductDetails";
import AmazonCart from "./pages/AmazonCart";
import AmazonCheckout from "./pages/AmazonCheckout";
import AmazonOrderSuccess from "./pages/AmazonOrderSuccess";
import AmazonOrders from "./pages/AmazonOrders";
import AmazonAdminDashboard from "./pages/AmazonAdminDashboard";
import AmazonPaymentCallback from "./pages/AmazonPaymentCallback";
import { AmazonCartProvider } from "./contexts/AmazonCartContext";

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
      
             {/* Dream Weave Dubai Integration Routes */}
      <Route path="/amazon" element={<AmazonStore />} />
      <Route path="/amazon/product/:id" element={<AmazonProductDetails />} />
      <Route path="/amazon/cart" element={<AmazonCart />} />
      <Route path="/amazon/checkout" element={<AmazonCheckout />} />
      <Route path="/amazon/order-success" element={<AmazonOrderSuccess />} />
      <Route path="/amazon/orders" element={<AmazonOrders />} />
      <Route path="/amazon/admin" element={<AmazonAdminDashboard />} />
      <Route path="/amazon/payment-callback" element={<AmazonPaymentCallback />} />
      
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
          <AmazonCartProvider>
            <AppContent />
          </AmazonCartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
