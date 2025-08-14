import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Download,
  MapPin
} from 'lucide-react';
import { amazonUAEService } from '@/integrations/amazon-uae/service';
import { AmazonOrder, OrderTracking } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AmazonReceiptPDF from '@/components/AmazonReceiptPDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AmazonOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AmazonOrder | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTracking[]>([]);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await amazonUAEService.getOrdersByUser(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTracking = async (order: AmazonOrder) => {
    try {
      const tracking = await amazonUAEService.getOrderTracking(order.id);
      setTrackingData(tracking);
      setSelectedOrder(order);
      setShowTrackingDialog(true);
    } catch (error) {
      console.error('Error fetching tracking:', error);
      toast({
        title: "Error",
        description: "Failed to load tracking information",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReceipt = async (order: AmazonOrder) => {
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
        pdf.save(`receipt-${order.order_number}.pdf`);
        
        toast({
          title: "PDF Receipt Downloaded",
          description: "Beautiful PDF receipt has been downloaded",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-600">Please login to view your orders</h2>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Amazon Orders</h1>
          <Button onClick={() => navigate('/amazon')} variant="outline">
            Continue Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button onClick={() => navigate('/amazon')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.order_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Product ID: {order.product_id}</p>
                            <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">Product: MWK {order.product_price.toLocaleString()}</div>
                          <div className="text-sm">Shipping: MWK {order.shipping_cost.toLocaleString()}</div>
                          <div className="font-semibold">Total: MWK {order.total_amount.toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{new Date(order.order_date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-600">
                            Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTracking(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(order)}
                            disabled={isGeneratingPDF}
                          >
                            <Download className="w-4 h-4" />
                            {isGeneratingPDF ? 'Generating...' : 'PDF'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Order Tracking Dialog */}
        <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Tracking</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Order Number:</span>
                      <p className="font-mono">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedOrder.status)}
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Order Date:</span>
                      <p>{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Estimated Delivery:</span>
                      <p>{new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </h3>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.delivery_address.full_name}</p>
                    <p>{selectedOrder.delivery_address.address_line1}</p>
                    {selectedOrder.delivery_address.address_line2 && (
                      <p>{selectedOrder.delivery_address.address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.postal_code}
                    </p>
                    <p>{selectedOrder.delivery_address.country}</p>
                    <p className="mt-2">Phone: {selectedOrder.delivery_address.phone}</p>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div>
                  <h3 className="font-semibold mb-4">Tracking Updates</h3>
                  {trackingData.length > 0 ? (
                    <div className="space-y-4">
                      {trackingData.map((tracking, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{tracking.status}</h4>
                              <span className="text-sm text-gray-500">
                                {new Date(tracking.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {tracking.location && (
                              <p className="text-sm text-gray-600">Location: {tracking.location}</p>
                            )}
                            <p className="text-sm text-gray-600">{tracking.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No tracking updates available yet.</p>
                      <p className="text-sm">Updates will appear here as your order progresses.</p>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {selectedOrder.admin_notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Admin Notes</h3>
                    <p className="text-sm text-gray-700">{selectedOrder.admin_notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default AmazonOrders;
