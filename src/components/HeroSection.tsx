
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ShoppingCart, Users, TrendingUp, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="gradient-primary text-white py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-12 h-12 sm:w-24 sm:h-24 border border-white rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 sm:w-16 sm:h-16 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 sm:w-12 sm:h-12 border border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 sm:w-20 sm:h-20 border border-white rounded-lg rotate-12 animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Enhanced Left content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-fade-in text-center lg:text-left">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-semibold">🇲🇼 Malawi's #1 Trusted Marketplace</span>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-pulse">
                  DreamWeave
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Connecting every corner of Malawi through trusted commerce. Buy, sell, and discover amazing products from the warm heart of Africa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-blue-600 font-bold shadow-2xl hover:shadow-xl transition-all bg-white border-0 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto"
                onClick={() => navigate('/categories')}
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                Start Shopping
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 sm:border-3 border-white text-white bg-blue-700 hover:bg-white hover:text-blue-600 transition-all text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group font-bold w-full sm:w-auto"
                onClick={() => navigate('/create-listing')}
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                Sell Your Items
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Enhanced Stats with better responsiveness */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12">
              <div className="text-center group cursor-pointer">
                <div className="flex flex-col items-center mb-2 sm:mb-4 group-hover:scale-110 transition-all duration-300">
                  <div className="bg-white/25 backdrop-blur-sm rounded-full p-2 sm:p-4 mb-2 sm:mb-3 shadow-lg">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">15K+</span>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base font-semibold">Active Users</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="flex flex-col items-center mb-2 sm:mb-4 group-hover:scale-110 transition-all duration-300">
                  <div className="bg-white/25 backdrop-blur-sm rounded-full p-2 sm:p-4 mb-2 sm:mb-3 shadow-lg">
                    <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">8K+</span>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base font-semibold">Products Listed</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="flex flex-col items-center mb-2 sm:mb-4 group-hover:scale-110 transition-all duration-300">
                  <div className="bg-white/25 backdrop-blur-sm rounded-full p-2 sm:p-4 mb-2 sm:mb-3 shadow-lg">
                    <Star className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">4.9</span>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base font-semibold">Average Rating</p>
              </div>
            </div>

            {/* Enhanced trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 pt-6 sm:pt-8">
              <div className="flex items-center space-x-2 sm:space-x-3 text-blue-100 group cursor-pointer">
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-blue-100 group cursor-pointer">
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-blue-100 group cursor-pointer">
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Growing Daily</span>
              </div>
            </div>
          </div>

          {/* Enhanced Right content with better visual hierarchy */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main showcase with improved design */}
              <div className="w-full h-[400px] lg:h-[500px] xl:h-[550px] bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
                
                <div className="text-center space-y-6 lg:space-y-8 relative z-10">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-white/40 to-white/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm shadow-xl border border-white/50">
                    <ShoppingCart className="w-16 h-16 lg:w-20 lg:h-20 text-white drop-shadow-lg" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">Your Products Here</h3>
                    <p className="text-white/90 max-w-sm mx-auto text-base lg:text-lg leading-relaxed">Showcase your items to thousands of potential buyers across Malawi</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating product cards with better animations */}
              <div className="absolute -top-6 lg:-top-8 -left-6 lg:-left-8 w-36 h-20 lg:w-48 lg:h-28 bg-white rounded-2xl shadow-2xl p-3 lg:p-5 animate-pulse transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"></div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="w-16 h-2 lg:w-24 lg:h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-2 lg:w-20 lg:h-3 bg-gray-200 rounded"></div>
                    <div className="w-10 h-2 lg:w-16 lg:h-3 bg-blue-200 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 lg:-bottom-8 -right-6 lg:-right-8 w-36 h-20 lg:w-48 lg:h-28 bg-white rounded-2xl shadow-2xl p-3 lg:p-5 animate-pulse transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg"></div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="w-16 h-2 lg:w-24 lg:h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-2 lg:w-20 lg:h-3 bg-gray-200 rounded"></div>
                    <div className="w-10 h-2 lg:w-16 lg:h-3 bg-orange-200 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 -right-12 lg:-right-16 w-32 h-16 lg:w-44 lg:h-24 bg-white rounded-2xl shadow-2xl p-2 lg:p-4 animate-pulse transform rotate-6 hover:rotate-3 transition-transform duration-500">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg"></div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="w-14 h-2 lg:w-20 lg:h-3 bg-gray-200 rounded"></div>
                    <div className="w-10 h-1 lg:w-16 lg:h-2 bg-gray-200 rounded"></div>
                    <div className="w-12 h-2 lg:w-18 lg:h-3 bg-green-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
