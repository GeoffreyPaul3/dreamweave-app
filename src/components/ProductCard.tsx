<<<<<<< HEAD

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star } from 'lucide-react';

interface ProductCardProps {
  id: number;
  title: string;
  price: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  featured?: boolean;
}

const ProductCard = ({ id, title, price, location, rating, reviews, image, featured }: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-gray-200 overflow-hidden">
          <img
            src={`https://images.unsplash.com/${image}?w=400&h=400&fit=crop`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{price}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
            <span className="text-sm text-gray-400">({reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        
        <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
=======

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star } from 'lucide-react';

interface ProductCardProps {
  id: number;
  title: string;
  price: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  featured?: boolean;
}

const ProductCard = ({ id, title, price, location, rating, reviews, image, featured }: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-gray-200 overflow-hidden">
          <img
            src={`https://images.unsplash.com/${image}?w=400&h=400&fit=crop`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{price}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
            <span className="text-sm text-gray-400">({reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        
        <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
