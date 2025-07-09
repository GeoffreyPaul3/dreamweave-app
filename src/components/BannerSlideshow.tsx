// Requires: framer-motion for animation
import { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_BUCKET = 'banners';

const BannerSlideshow = () => {
  const [banners, setBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  const fetchBanners = async () => {
    const { data, error } = await supabase.storage.from(BANNER_BUCKET).list('', { limit: 20 });
    if (error) {
      setBanners([]);
      setLoading(false);
      return;
    }
    const urls = (data || [])
      .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((file) => supabase.storage.from(BANNER_BUCKET).getPublicUrl(file.path || file.name).data.publicUrl);
    setBanners(urls);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchBanners, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (!carouselApi || !banners.length) return;
    const interval = setInterval(() => {
      if (carouselApi) {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext();
        } else {
          carouselApi.scrollTo(0); // Loop to first slide
        }
      }
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [carouselApi, banners.length]);

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 flex justify-center items-center h-48">
          <div className="animate-pulse w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <Carousel className="relative rounded-xl overflow-hidden shadow-lg" setApi={setCarouselApi}>
          <CarouselContent>
            <AnimatePresence initial={false}>
              {banners.map((url, idx) => (
                <CarouselItem key={url} className="h-48 md:h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <motion.img
                    src={url}
                    alt={`Banner ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl shadow-md"
                    loading="lazy"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                  />
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
          <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </section>
  );
};

export default BannerSlideshow; 