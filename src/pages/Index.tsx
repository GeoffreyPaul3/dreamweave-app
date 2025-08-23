import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import BannerSlideshow from '@/components/BannerSlideshow';

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <img 
                   src="/dreamwave-logo.png"
                   alt="Dream Weave Logo"
                   width={100}
                   height={100}
                    />
          </div>
          <p className="text-gray-600">Loading DreamWeave...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <BannerSlideshow />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
