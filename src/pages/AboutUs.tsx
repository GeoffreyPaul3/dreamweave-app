import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Shield, Target } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About DreamWeave</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're building Malawi's premier online marketplace, connecting buyers and sellers 
            across the warm heart of Africa with trust, innovation, and community at our core.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
              To empower every Malawian entrepreneur and consumer by providing a safe, reliable, 
              and user-friendly platform that facilitates commerce, builds trust, and strengthens 
              our local economy. We believe in the power of connection and the potential of every 
              individual to succeed in the digital marketplace.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trust className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Trust</h3>
                <p className="text-gray-600">
                  Building confidence through verified sellers, secure transactions, and transparent processes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-600">
                  Fostering connections and supporting local businesses to grow together.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Continuously improving our platform with cutting-edge technology and user feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Passion</h3>
                <p className="text-gray-600">
                  Driven by our love for Malawi and commitment to economic empowerment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="prose lg:prose-lg mx-auto text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
               Your Malawian Marketing Partner Since 2020. Based in Lilongwe, we understand Malawi consumers and effectively connect businessses with their target audience.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Our founders, passionate about technology and economic development, recognized that 
                traditional commerce methods, while valuable, needed to be complemented by digital 
                solutions that could scale and reach every corner of our beautiful country.
              </p>
              <p className="text-lg leading-relaxed">
                Today, DreamWeave continues to grow, driven by the success stories of our users – 
                from small business owners who have expanded their reach to families who have found 
                exactly what they needed at the right price. Every transaction on our platform is 
                a step toward a more connected and prosperous Malawi.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600">Verified Sellers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <p className="text-gray-600">Products Listed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">25</div>
              <p className="text-gray-600">Districts Served</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Simple Trust icon component since we don't have it in lucide-react
const Trust = ({ className }: { className?: string }) => (
  <Shield className={className} />
);

export default AboutUs;
