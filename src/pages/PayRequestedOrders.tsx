import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';
import { RequestOrder } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import RequestOrderPayChanguPayment from '@/components/RequestOrderPayChanguPayment';

const PayRequestedOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requestOrders, setRequestOrders] = useState<RequestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RequestOrder | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    fetchUserRequestOrders();
  }, [user]);

  const fetchUserRequestOrders = async () => {
    setLoading(true);
    try {
      const orders = await rapidAPIAmazonService.getUserRequestOrders(user?.id || '');
      // Filter to only show priced orders that need payment
      const pricedOrders = orders.filter(order => 
        order.status === 'priced' || 
        (order.status === 'deposit_paid' && !order.deposit_paid) ||
        (order.status === 'shipped' && order.deposit_paid)
      );
      setRequestOrders(pricedOrders);
    } catch (error) {
      console.error('Error fetching request orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your request orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
    fetchUserRequestOrders(); // Refresh the list
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'priced': return 'bg-purple-100 text-purple-800';
      case 'deposit_paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatus = (order: RequestOrder) => {
    if (order.status === 'priced') {
      return { type: 'deposit', text: 'Pay Deposit (50%)', amount: (order.admin_price || 0) * 0.5 };
    } else if (order.status === 'deposit_paid' && !order.deposit_paid) {
      return { type: 'deposit', text: 'Pay Deposit (50%)', amount: (order.admin_price || 0) * 0.5 };
    } else if (order.status === 'shipped' && order.deposit_paid) {
      return { type: 'full', text: 'Pay Remaining Balance', amount: (order.admin_price || 0) * 0.5 };
    }
    return null;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold">Pay Requested Orders</h1>
          <Button 
            onClick={() => window.location.href = '/request-order'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Request New Item
          </Button>
        </div>

        {requestOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders to Pay</h3>
              <p className="text-gray-600 mb-4">
                You don't have any priced request orders that require payment.
              </p>
              <Button 
                onClick={() => window.location.href = '/request-order'}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Request New Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Request Orders</CardTitle>
              <p className="text-sm text-gray-600">
                View and pay for your priced request orders
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Payment Required</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestOrders.map((order) => {
                    const paymentInfo = getPaymentStatus(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.item_name}</div>
                            <div className="text-sm text-gray-600">Qty: {order.quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">MWK {order.admin_price?.toLocaleString() || 'Not set'}</div>
                          {order.deposit_amount && (
                            <div className="text-sm text-gray-600">
                              Deposit: MWK {order.deposit_amount.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {paymentInfo ? (
                            <div className="font-medium text-blue-600">
                              MWK {paymentInfo.amount.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-500">No payment required</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowPaymentDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                            {paymentInfo && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setPaymentType(paymentInfo.type as 'deposit' | 'full');
                                  setShowPaymentDialog(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                {paymentInfo.text}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <RequestOrderPayChanguPayment
              order={selectedOrder}
              paymentType={paymentType}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PayRequestedOrders;
