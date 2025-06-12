
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, MessageCircle, CreditCard, Shield, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">How DreamWeave Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting started on DreamWeave is simple and secure. Whether you're buying or selling, 
            our platform is designed to make your experience smooth and trustworthy.
          </p>
        </div>

        {/* For Buyers Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">For Buyers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Browse & Search</h3>
                <p className="text-gray-600 mb-4">
                  Explore thousands of products across various categories or use our search feature 
                  to find exactly what you need.
                </p>
                <ul className="text-sm text-gray-500 text-left">
                  <li>• Filter by category, price, and location</li>
                  <li>• View detailed product descriptions</li>
                  <li>• Check seller ratings and reviews</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Connect & Negotiate</h3>
                <p className="text-gray-600 mb-4">
                  Contact sellers directly through our secure messaging system to ask questions 
                  and negotiate terms.
                </p>
                <ul className="text-sm text-gray-500 text-left">
                  <li>• Direct messaging with sellers</li>
                  <li>• Share additional photos</li>
                  <li>• Arrange viewing or delivery</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Purchase Safely</h3>
                <p className="text-gray-600 mb-4">
                  Complete your purchase with confidence using our secure payment options 
                  and buyer protection policies.
                </p>
                <ul className="text-sm text-gray-500 text-left">
                  <li>• Multiple payment methods</li>
                  <li>• Secure transaction processing</li>
                  <li>• Dispute resolution support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Sellers Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">For Sellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Sign Up & Verify</h3>
                <p className="text-gray-600">
                  Create your account and complete our KYC verification process to build trust 
                  with potential buyers.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Pay Listing Fee</h3>
                <p className="text-gray-600">
                  Pay a small listing fee to ensure quality and reduce spam. This helps maintain 
                  a premium marketplace experience.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Create Listing</h3>
                <p className="text-gray-600">
                  Upload high-quality photos and detailed descriptions to showcase your products 
                  in the best light.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">4. Sell & Earn</h3>
                <p className="text-gray-600">
                  Respond to inquiries, manage your listings, and complete sales with interested 
                  buyers across Malawi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Safety & Trust Features</h2>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Seller Verification</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• KYC (Know Your Customer) verification required</li>
                  <li>• Government ID verification</li>
                  <li>• Phone number confirmation</li>
                  <li>• Address verification</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Secure Platform</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Encrypted messaging system</li>
                  <li>• Secure payment processing</li>
                  <li>• Admin monitoring and support</li>
                  <li>• Report and review system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of Malawians already using DreamWeave to buy and sell with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Start Selling Today
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3"
              onClick={() => navigate('/search')}
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
