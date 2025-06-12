
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Star, Users, Lock, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Sellers',
    description: 'All sellers go through our KYC verification process to ensure safe transactions'
  },
  {
    icon: Star,
    title: 'Rated & Reviewed',
    description: 'Read genuine reviews from real buyers to make informed purchasing decisions'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join thousands of Malawians buying and selling in a trusted marketplace'
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'PayChangu integration ensures your payments are processed safely and securely'
  }
];

const TrustSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DreamWeave?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to providing a safe, secure, and reliable marketplace for all Malawians
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 shadow-soft">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to start selling?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of successful sellers on DreamWeave. Create your account today and start reaching customers across Malawi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all group"
                  onClick={() => navigate('/create-listing')}
                >
                  Start Selling Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors group"
                  onClick={() => navigate('/how-it-works')}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <Users className="w-24 h-24 text-primary/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
