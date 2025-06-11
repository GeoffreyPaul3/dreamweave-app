<<<<<<< HEAD

import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
               <Link to="/" className="flex items-center space-x-2">
                  <img 
                   src="/dreamwave-logo.png"
                   alt="Dream Weave Logo"
                   width={100}
                   height={100}
                    />
                </Link>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Connecting buyers and sellers across the warm heart of Africa. Your trusted marketplace for quality products and services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">About Us</Link>
              <Link to="/how-it-works" className="block text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link to="/safety-tips" className="block text-gray-300 hover:text-white transition-colors">Safety Tips</Link>
              <Link to="/success-stories" className="block text-gray-300 hover:text-white transition-colors">Success Stories</Link>
              <Link to="/blog" className="block text-gray-300 hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2">
              <Link to="/categories/Electronics" className="block text-gray-300 hover:text-white transition-colors">Electronics</Link>
              <Link to="/categories/Fashion" className="block text-gray-300 hover:text-white transition-colors">Fashion</Link>
              <Link to="/categories/Home & Garden" className="block text-gray-300 hover:text-white transition-colors">Home & Garden</Link>
              <Link to="/categories/Motors" className="block text-gray-300 hover:text-white transition-colors">Motors</Link>
              <Link to="/categories/Jobs" className="block text-gray-300 hover:text-white transition-colors">Jobs</Link>
              <Link to="/categories/Services" className="block text-gray-300 hover:text-white transition-colors">Services</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Lilongwe, Malawi</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">+265 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">hello@dreamweave.mw</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DreamWeave Marketplace. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>in Malawi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
=======

import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
               <Link to="/" className="flex items-center space-x-2">
                  <img 
                   src="/dreamwave-logo.png"
                   alt="Dream Weave Logo"
                   width={100}
                   height={100}
                    />
                </Link>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Connecting buyers and sellers across the warm heart of Africa. Your trusted marketplace for quality products and services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">About Us</Link>
              <Link to="/how-it-works" className="block text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link to="/safety-tips" className="block text-gray-300 hover:text-white transition-colors">Safety Tips</Link>
              <Link to="/success-stories" className="block text-gray-300 hover:text-white transition-colors">Success Stories</Link>
              <Link to="/blog" className="block text-gray-300 hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2">
              <Link to="/categories/Electronics" className="block text-gray-300 hover:text-white transition-colors">Electronics</Link>
              <Link to="/categories/Fashion" className="block text-gray-300 hover:text-white transition-colors">Fashion</Link>
              <Link to="/categories/Home & Garden" className="block text-gray-300 hover:text-white transition-colors">Home & Garden</Link>
              <Link to="/categories/Motors" className="block text-gray-300 hover:text-white transition-colors">Motors</Link>
              <Link to="/categories/Jobs" className="block text-gray-300 hover:text-white transition-colors">Jobs</Link>
              <Link to="/categories/Services" className="block text-gray-300 hover:text-white transition-colors">Services</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Lilongwe, Malawi</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">+265 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">hello@dreamweave.mw</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DreamWeave Marketplace. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>in Malawi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
