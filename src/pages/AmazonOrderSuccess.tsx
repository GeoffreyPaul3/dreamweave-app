import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Download, Copy, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { amazonUAEService } from '@/integrations/amazon-uae/service';
import { AmazonOrder } from '@/integrations/amazon-uae/types';
import AmazonReceiptPDF from '@/components/AmazonReceiptPDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AmazonOrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<AmazonOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Get orderId from either query params (payment callback) or state (direct navigation)
  const orderId = searchParams.get('orderId') || location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          // Fetch order details by ID using the new method
          const foundOrder = await amazonUAEService.getOrderById(orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            console.error('Order not found with ID:', orderId);
            // Fallback: try to get from all orders for debugging
            const allOrders = await amazonUAEService.getAllOrders();
            console.log('Available orders:', allOrders.map(o => ({ id: o.id, order_number: o.order_number })));
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      } else {
        console.log('No orderId found in URL params or state');
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('Location state:', location.state);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, searchParams, location.state]);

  const handleDownloadReceipt = async () => {
    if (!order || !receiptRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create a temporary container for the receipt
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);
      
      // Render the receipt component
      const receiptElement = (
        <AmazonReceiptPDF order={order} />
      );
      
      // Use ReactDOM to render the component
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      root.render(receiptElement);
      
      // Wait for the component to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the receipt element
      const receiptDiv = tempContainer.querySelector('#receipt-pdf') as HTMLElement;
      
      if (receiptDiv) {
        // Convert to canvas
        const canvas = await html2canvas(receiptDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Download PDF
        pdf.save(`order-receipt-${order.order_number}.pdf`);
        
        toast({
          title: "PDF Receipt Downloaded",
          description: "Your beautiful PDF receipt has been downloaded",
        });
      }
      
      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyOrderNumber = () => {
    const numberToCopy = order?.order_number || orderNumber;
    navigator.clipboard.writeText(numberToCopy);
    toast({
      title: "Order Number Copied",
      description: "Order number copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order && !orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-600">No order found</h2>
            <Button onClick={() => navigate('/amazon')} className="mt-4">
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hidden receipt container for PDF generation */}
      <div 
        ref={receiptRef}
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '0',
          visibility: 'hidden'
        }}
      >
        {order && <AmazonReceiptPDF order={order} />}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your order. We'll notify you about the progress.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Number:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {order?.order_number || orderNumber}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOrderNumber}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Date:</span>
                <span>{order ? new Date(order.order_date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant="secondary">{order?.status || 'Pending'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Delivery:</span>
                <span>{order ? new Date(order.estimated_delivery).toLocaleDateString() : '10-15 days'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Order Processing</h4>
                  <p className="text-sm text-gray-600">
                    We'll process your order and purchase the product from Amazon UAE on your behalf.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Shipping & Tracking</h4>
                  <p className="text-sm text-gray-600">
                    Once purchased, we'll ship your order to Malawi and provide tracking updates.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to your specified address within 10-15 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  You will receive email notifications about your order status updates.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Keep your order number safe for tracking and customer support.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  For any questions, contact our support team with your order number.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex-1 flex items-center gap-2"
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Receipt'}
            </Button>
            
            <Button
              onClick={() => navigate('/amazon/orders')}
              className="flex-1 flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              View My Orders
            </Button>
          </div>

          <div className="text-center mt-6">
            <Button
              onClick={() => navigate('/amazon')}
              variant="ghost"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AmazonOrderSuccess;
