<<<<<<< HEAD

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      name: "Grace Banda",
      location: "Lilongwe",
      category: "Fashion & Accessories",
      image: "",
      story: "I started selling traditional Malawian fabrics on DreamWeave just 6 months ago. Today, I have over 500 satisfied customers and my business has grown beyond my dreams. The platform's verification system helped build trust with my customers.",
      achievement: "500+ Sales in 6 Months",
      rating: 4.9
    },
    {
      id: 2,
      name: "James Phiri",
      location: "Blantyre",
      category: "Electronics",
      image: "",
      story: "As a small electronics repair shop owner, DreamWeave opened up new markets for me. I can now sell refurbished phones and laptops to customers across Malawi. The messaging system makes it easy to explain technical details to buyers.",
      achievement: "Expanded to 5 Districts",
      rating: 4.8
    },
    {
      id: 3,
      name: "Mary Chirwa",
      location: "Mzuzu",
      category: "Home & Garden",
      image: "",
      story: "I was struggling to sell my handmade furniture locally. DreamWeave connected me with customers who appreciate quality craftsmanship. I've been able to quit my day job and focus on what I love - creating beautiful furniture.",
      achievement: "Full-time Business Owner",
      rating: 5.0
    },
    {
      id: 4,
      name: "Peter Mwale",
      location: "Zomba",
      category: "Agriculture",
      image: "",
      story: "Our farm produces quality maize and groundnuts. Through DreamWeave, we found direct buyers and eliminated middlemen. This increased our profit margins by 40% and helped us invest in better farming equipment.",
      achievement: "40% Profit Increase",
      rating: 4.7
    },
    {
      id: 5,
      name: "Esther Mkandawire",
      location: "Kasungu",
      category: "Fashion",
      image: "",
      story: "I love finding unique vintage clothes and accessories. DreamWeave helped me turn this passion into a profitable business. I now source items from various locations and sell them to fashion enthusiasts nationwide.",
      achievement: "200+ Unique Items Sold",
      rating: 4.9
    },
    {
      id: 6,
      name: "Charles Ng'oma",
      location: "Dedza",
      category: "Automotive",
      image: "",
      story: "As a mechanic, I started selling car parts on DreamWeave. The platform's search functionality makes it easy for customers to find exactly what they need. My parts business now generates more income than my repair services.",
      achievement: "Primary Income Source",
      rating: 4.8
    }
  ];

  const buyerStories = [
    {
      name: "Linda Kamoto",
      location: "Mangochi",
      story: "I found my dream wedding dress on DreamWeave at an amazing price. The seller was professional and the dress was exactly as described. The platform made my special day perfect!",
      category: "Wedding Dress"
    },
    {
      name: "David Tembo",
      location: "Karonga",
      story: "Living in a remote area, finding quality electronics was always a challenge. DreamWeave connected me with verified sellers and I got a laptop for my studies at a great price.",
      category: "Electronics"
    },
    {
      name: "Agnes Mvula",
      location: "Salima",
      story: "I needed farming equipment urgently for the planting season. Through DreamWeave, I found a seller who could deliver quickly and the equipment has boosted my harvest significantly.",
      category: "Agriculture Equipment"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how DreamWeave has transformed lives and businesses across Malawi. 
            These are real stories from real people who found success on our platform.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <p className="text-gray-600">Success Stories</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600">Business Growth</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">250+</div>
            <p className="text-gray-600">Full-time Sellers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
            <p className="text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Seller Success Stories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Seller Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{story.name}</h3>
                      <p className="text-gray-500 text-sm">{story.location}</p>
                      <Badge variant="secondary" className="mt-1">
                        {story.category}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{story.rating}</span>
                    </div>
                  </div>
                  
                  <div className="relative mb-4">
                    <Quote className="w-8 h-8 text-gray-300 absolute -top-2 -left-2" />
                    <p className="text-gray-700 italic pl-6">"{story.story}"</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-green-800">{story.achievement}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Buyer Success Stories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Happy Buyer Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buyerStories.map((story, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{story.name}</h4>
                      <p className="text-gray-500 text-sm">{story.location}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">"{story.story}"</p>
                  
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {story.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Economic Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">MWK 50M+</div>
              <p className="text-gray-700">Total Transaction Value</p>
              <p className="text-sm text-gray-500 mt-1">Facilitated through our platform</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
              <p className="text-gray-700">Jobs Created</p>
              <p className="text-sm text-gray-500 mt-1">Direct and indirect employment</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">25</div>
              <p className="text-gray-700">Districts Reached</p>
              <p className="text-sm text-gray-500 mt-1">Connecting rural and urban markets</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Success Story Today</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful sellers and happy buyers who have found their success on DreamWeave. 
            Your story could be featured next!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Selling Now
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Browse Products
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SuccessStories;
=======

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      name: "Grace Banda",
      location: "Lilongwe",
      category: "Fashion & Accessories",
      image: "",
      story: "I started selling traditional Malawian fabrics on DreamWeave just 6 months ago. Today, I have over 500 satisfied customers and my business has grown beyond my dreams. The platform's verification system helped build trust with my customers.",
      achievement: "500+ Sales in 6 Months",
      rating: 4.9
    },
    {
      id: 2,
      name: "James Phiri",
      location: "Blantyre",
      category: "Electronics",
      image: "",
      story: "As a small electronics repair shop owner, DreamWeave opened up new markets for me. I can now sell refurbished phones and laptops to customers across Malawi. The messaging system makes it easy to explain technical details to buyers.",
      achievement: "Expanded to 5 Districts",
      rating: 4.8
    },
    {
      id: 3,
      name: "Mary Chirwa",
      location: "Mzuzu",
      category: "Home & Garden",
      image: "",
      story: "I was struggling to sell my handmade furniture locally. DreamWeave connected me with customers who appreciate quality craftsmanship. I've been able to quit my day job and focus on what I love - creating beautiful furniture.",
      achievement: "Full-time Business Owner",
      rating: 5.0
    },
    {
      id: 4,
      name: "Peter Mwale",
      location: "Zomba",
      category: "Agriculture",
      image: "",
      story: "Our farm produces quality maize and groundnuts. Through DreamWeave, we found direct buyers and eliminated middlemen. This increased our profit margins by 40% and helped us invest in better farming equipment.",
      achievement: "40% Profit Increase",
      rating: 4.7
    },
    {
      id: 5,
      name: "Esther Mkandawire",
      location: "Kasungu",
      category: "Fashion",
      image: "",
      story: "I love finding unique vintage clothes and accessories. DreamWeave helped me turn this passion into a profitable business. I now source items from various locations and sell them to fashion enthusiasts nationwide.",
      achievement: "200+ Unique Items Sold",
      rating: 4.9
    },
    {
      id: 6,
      name: "Charles Ng'oma",
      location: "Dedza",
      category: "Automotive",
      image: "",
      story: "As a mechanic, I started selling car parts on DreamWeave. The platform's search functionality makes it easy for customers to find exactly what they need. My parts business now generates more income than my repair services.",
      achievement: "Primary Income Source",
      rating: 4.8
    }
  ];

  const buyerStories = [
    {
      name: "Linda Kamoto",
      location: "Mangochi",
      story: "I found my dream wedding dress on DreamWeave at an amazing price. The seller was professional and the dress was exactly as described. The platform made my special day perfect!",
      category: "Wedding Dress"
    },
    {
      name: "David Tembo",
      location: "Karonga",
      story: "Living in a remote area, finding quality electronics was always a challenge. DreamWeave connected me with verified sellers and I got a laptop for my studies at a great price.",
      category: "Electronics"
    },
    {
      name: "Agnes Mvula",
      location: "Salima",
      story: "I needed farming equipment urgently for the planting season. Through DreamWeave, I found a seller who could deliver quickly and the equipment has boosted my harvest significantly.",
      category: "Agriculture Equipment"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how DreamWeave has transformed lives and businesses across Malawi. 
            These are real stories from real people who found success on our platform.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <p className="text-gray-600">Success Stories</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600">Business Growth</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">250+</div>
            <p className="text-gray-600">Full-time Sellers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
            <p className="text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Seller Success Stories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Seller Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{story.name}</h3>
                      <p className="text-gray-500 text-sm">{story.location}</p>
                      <Badge variant="secondary" className="mt-1">
                        {story.category}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{story.rating}</span>
                    </div>
                  </div>
                  
                  <div className="relative mb-4">
                    <Quote className="w-8 h-8 text-gray-300 absolute -top-2 -left-2" />
                    <p className="text-gray-700 italic pl-6">"{story.story}"</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-green-800">{story.achievement}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Buyer Success Stories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Happy Buyer Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buyerStories.map((story, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{story.name}</h4>
                      <p className="text-gray-500 text-sm">{story.location}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">"{story.story}"</p>
                  
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {story.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Economic Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">MWK 50M+</div>
              <p className="text-gray-700">Total Transaction Value</p>
              <p className="text-sm text-gray-500 mt-1">Facilitated through our platform</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
              <p className="text-gray-700">Jobs Created</p>
              <p className="text-sm text-gray-500 mt-1">Direct and indirect employment</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">25</div>
              <p className="text-gray-700">Districts Reached</p>
              <p className="text-sm text-gray-500 mt-1">Connecting rural and urban markets</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Success Story Today</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful sellers and happy buyers who have found their success on DreamWeave. 
            Your story could be featured next!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Selling Now
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Browse Products
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SuccessStories;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
