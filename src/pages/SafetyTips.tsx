import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, MessageCircle, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SafetyTips = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Safety Tips</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your safety is our priority. Follow these guidelines to ensure secure and successful 
            transactions on DreamWeave marketplace.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-12 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Remember:</strong> DreamWeave staff will never ask for your password, PIN, or personal 
            financial information via phone, email, or messaging. Always verify suspicious communications.
          </AlertDescription>
        </Alert>

        {/* General Safety */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">General Safety Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-500" />
                  Meet in Public
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Choose busy, well-lit public locations</li>
                  <li>• Consider shopping malls or police stations</li>
                  <li>• Avoid isolated areas or private homes</li>
                  <li>• Bring a friend when possible</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-500" />
                  Verify Sellers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Check seller verification status</li>
                  <li>• Read reviews from other buyers</li>
                  <li>• Look for detailed product descriptions</li>
                  <li>• Ask for additional photos if needed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-500" />
                  Communicate Safely
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Use DreamWeave's messaging system</li>
                  <li>• Keep all communications on platform</li>
                  <li>• Never share personal information early</li>
                  <li>• Be wary of urgent or pressure tactics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Safety */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Payment Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  Safe Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li>• Cash on delivery (inspect first)</li>
                  <li>• Mobile money transfers</li>
                  <li>• Bank transfers with verification</li>
                  <li>• PayChangu and other verified platforms</li>
                  <li>• Never pay full amount upfront for unseen items</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  Payment Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-red-700">
                  <li>• Requests for wire transfers abroad</li>
                  <li>• Demands for immediate full payment</li>
                  <li>• Unusual payment methods or platforms</li>
                  <li>• Refusal to use secure payment options</li>
                  <li>• Pressure to pay outside the platform</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buying Tips */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Smart Buying Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Before You Buy</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Research the market price for similar items
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ask detailed questions about condition and history
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Request additional photos from different angles
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Verify seller's location and contact information
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">During The Transaction</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Inspect items thoroughly before payment
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Test electronic items if possible
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Bring the exact change to avoid complications
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Trust your instincts - walk away if something feels wrong
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selling Tips */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Safe Selling Practices</h2>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Protect Yourself</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Meet buyers in public locations</li>
                  <li>• Verify payment before handing over items</li>
                  <li>• Keep records of all transactions</li>
                  <li>• Be cautious of overpayment scams</li>
                  <li>• Don't accept checks from unknown buyers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Create Trust</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complete your seller verification</li>
                  <li>• Provide detailed, honest descriptions</li>
                  <li>• Take clear, high-quality photos</li>
                  <li>• Respond promptly to buyer questions</li>
                  <li>• Maintain a positive rating</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Common Scams */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Recognize Common Scams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Overpayment Scam</CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                <p className="mb-3">Buyer sends more money than agreed and asks for refund of difference.</p>
                <p className="font-semibold">Solution: Only accept exact payment amounts.</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Fake Payment Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                <p className="mb-3">Scammer shows fake mobile money or bank transfer screenshots.</p>
                <p className="font-semibold">Solution: Verify payments through official channels.</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Advance Fee Fraud</CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                <p className="mb-3">Requests upfront payment for shipping or processing fees.</p>
                <p className="font-semibold">Solution: Never pay fees to receive payments.</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Identity Theft</CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                <p className="mb-3">Requests for personal documents or sensitive information.</p>
                <p className="font-semibold">Solution: Only share necessary information through platform.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report Issues */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Report Issues</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            If you encounter any suspicious activity or have concerns about a transaction, 
            please report it immediately. Our team is here to help maintain a safe marketplace.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="default" onClick={() => window.location.href = '/contact'}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/report'}>
              Report an Issue
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SafetyTips;
