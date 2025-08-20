import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Edit, 
  Eye, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';
import { AmazonProduct, AmazonOrder, AmazonUser, RequestOrder } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AmazonReceiptPDF from '@/components/AmazonReceiptPDF';
import Footer from '@/components/Footer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AmazonAdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [users, setUsers] = useState<AmazonUser[]>([]);
  const [requestOrders, setRequestOrders] = useState<RequestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<AmazonProduct | null>(null);
  const [editingOrder, setEditingOrder] = useState<AmazonOrder | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [conversionRate, setConversionRate] = useState<string>('1000');
  const [currentConversionRate, setCurrentConversionRate] = useState<number | null>(null);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdatingBrands, setIsUpdatingBrands] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeletingProducts, setIsDeletingProducts] = useState(false);
  const [editingRequestOrder, setEditingRequestOrder] = useState<RequestOrder | null>(null);
  const [showRequestOrderDialog, setShowRequestOrderDialog] = useState(false);
  const [requestOrderSearchTerm, setRequestOrderSearchTerm] = useState('');
  const [selectedRequestStatus, setSelectedRequestStatus] = useState<string>('');
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    shipping_cost: '',
    description: ''
  });
  const [editingProductData, setEditingProductData] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    shipping_cost: '',
    description: ''
  });
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      window.location.href = '/dashboard';
      return;
    }
    
    fetchData();
  }, [user, isAdmin, toast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('rapidAPIAmazonService:', rapidAPIAmazonService);
      console.log('fetchProducts method:', rapidAPIAmazonService.fetchProducts);
      
      const [productsData, ordersData, usersData, requestOrdersData, conversionSettings] = await Promise.all([
        rapidAPIAmazonService.fetchProducts(),
        rapidAPIAmazonService.getAllOrders(),
        rapidAPIAmazonService.getVerifiedUsers(),
        rapidAPIAmazonService.getAllRequestOrders(),
        rapidAPIAmazonService.getCurrencyConversionSettings()
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);
      setRequestOrders(requestOrdersData);
      
      if (conversionSettings) {
        setCurrentConversionRate(conversionSettings.conversion_rate);
        setConversionRate(conversionSettings.conversion_rate.toString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      toast({
        title: "Syncing Products",
                 description: "Syncing Dream Weave Dubai products by category...",
      });
      
      await rapidAPIAmazonService.syncProductsFromAmazon();
      
      toast({
        title: "Products Synced Successfully",
                 description: "Dream Weave Dubai products have been synced and organized by categories",
      });
      
      fetchData();
    } catch (error) {
      console.error('Sync error:', error);
      
      // Provide specific error messages based on the error type
             let errorMessage = "Failed to sync products from Dream Weave Dubai. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = "API rate limit exceeded. Please try again in a few minutes or upgrade your RapidAPI plan.";
        } else if (error.message.includes('API')) {
          errorMessage = "Amazon API is currently unavailable. Please try again later.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
      }
      
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateBrands = async () => {
    setIsUpdatingBrands(true);
    try {
      toast({
        title: "Updating Brands",
        description: "Analyzing existing products and updating brand information...",
      });
      
      const result = await rapidAPIAmazonService.updateExistingProductBrands();
      
      if (result.success) {
        toast({
          title: "Brands Updated Successfully",
          description: result.message,
        });
        fetchData(); // Refresh the data to show updated brands
      } else {
        toast({
          title: "Brand Update Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Brand update error:', error);
      toast({
        title: "Brand Update Error",
        description: "An error occurred while updating product brands",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingBrands(false);
    }
  };

  const handleUpdateConversionRate = async () => {
    const rate = parseFloat(conversionRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid conversion rate greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingRate(true);
    try {
      // First update the conversion rate
             const success = await rapidAPIAmazonService.updateCurrencyConversionRate(rate);
      
      if (success) {
        // Then update all existing product prices with the new rate
        toast({
          title: "Updating Product Prices",
          description: "Updating all product prices with the new conversion rate...",
        });

                 const pricesUpdated = await rapidAPIAmazonService.updateAllProductPricesWithNewRate(rate);
        
        if (pricesUpdated) {
          toast({
            title: "Conversion Rate & Prices Updated",
            description: `UAE Dirham to Kwacha conversion rate updated to ${rate}. All product prices have been updated accordingly.`,
          });
          setCurrentConversionRate(rate);
          // Refresh only the products data to show updated prices, without re-fetching conversion rate
          const productsData = await rapidAPIAmazonService.fetchProducts();
          setProducts(productsData);
        } else {
          toast({
            title: "Partial Update",
            description: `Conversion rate updated to ${rate}, but some product prices may not have been updated.`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update conversion rate. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating conversion rate:', error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating the conversion rate and product prices",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      // If all are selected, deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all products
      setSelectedProducts(new Set(products.map(product => product.id)));
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to delete",
        variant: "destructive"
      });
      return;
    }

    setIsDeletingProducts(true);
    try {
      // If all products are selected, use the clearAllProducts method
      if (selectedProducts.size === products.length) {
                 const success = await rapidAPIAmazonService.deleteAllProducts();
        if (success) {
          toast({
            title: "All Products Deleted",
            description: "All products have been deleted successfully",
          });
          setSelectedProducts(new Set());
          fetchData();
        } else {
          toast({
            title: "Delete Failed",
            description: "Failed to delete all products. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Delete selected products individually
                         const deletePromises = Array.from(selectedProducts).map(productId =>
          rapidAPIAmazonService.deleteProduct(productId)
        );
        
        const results = await Promise.all(deletePromises);
        const successCount = results.filter(Boolean).length;
        
        if (successCount === selectedProducts.size) {
          toast({
            title: "Products Deleted",
            description: `${successCount} products have been deleted successfully`,
          });
        } else {
          toast({
            title: "Partial Delete",
            description: `${successCount} out of ${selectedProducts.size} products were deleted successfully`,
            variant: "destructive"
          });
        }
        
        setSelectedProducts(new Set());
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Delete Error",
        description: "An error occurred while deleting the selected products",
        variant: "destructive"
      });
    } finally {
      setIsDeletingProducts(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      // Validate required fields
      if (!editingProductData.title || !editingProductData.brand || !editingProductData.category || !editingProductData.price || !editingProductData.shipping_cost || !editingProductData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create updated product data
      const updatedProductData = {
        ...editingProduct,
        title: editingProductData.title,
        brand: editingProductData.brand,
        category: editingProductData.category,
        price: parseFloat(editingProductData.price),
        shipping_cost: parseFloat(editingProductData.shipping_cost),
        description: editingProductData.description,
        image_url: productImages[0] || editingProduct.image_url,
      };

      // Update product using the service
             await rapidAPIAmazonService.upsertProduct(updatedProductData);
      
      toast({
        title: "Product Updated",
        description: "Product details have been updated",
      });
      
      setShowEditDialog(false);
      setEditingProduct(null);
      setProductImages([]);
      setEditingProductData({
        title: '',
        brand: '',
        category: '',
        price: '',
        shipping_cost: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validate required fields
      if (!newProduct.title || !newProduct.brand || !newProduct.category || !newProduct.price || !newProduct.shipping_cost || !newProduct.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create product data
      const productData = {
        asin: `B${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        title: newProduct.title,
        brand: newProduct.brand,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        shipping_cost: parseFloat(newProduct.shipping_cost),
        description: newProduct.description,
        image_url: productImages[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        currency: 'MWK',
        rating: 4.0,
        review_count: 0,
        availability: true
      };

      // Add product using the service
             await rapidAPIAmazonService.upsertProduct(productData);
      
      toast({
        title: "Product Added",
        description: "New product has been added successfully",
      });
      
      // Reset form
      setNewProduct({
        title: '',
        brand: '',
        category: '',
        price: '',
        shipping_cost: '',
        description: ''
      });
      setProductImages([]);
      setShowAddDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Add Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length + productImages.length > 5) {
      toast({
        title: "Too Many Images",
        description: "You can only upload up to 5 images per product",
        variant: "destructive"
      });
      return;
    }

    setUploadingImages(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Convert file to base64 for demo purposes
        // In production, you'd upload to a cloud storage service
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          if (newImages.length === files.length) {
            setProductImages(prev => [...prev, ...newImages]);
            setUploadingImages(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: AmazonOrder['status'], notes?: string) => {
    try {
      // Show loading toast
      toast({
        title: "Updating Order Status",
        description: `Updating order status to ${status} and sending email notification...`,
      });

             const result = await rapidAPIAmazonService.updateOrderStatus(orderId, status, notes);
      
      if (result) {
        toast({
          title: "Order Updated Successfully",
          description: `Order status updated to ${status}. Email notification sent to customer.`,
        });
      } else {
        toast({
          title: "Order Updated",
          description: `Order status updated to ${status}, but email notification failed.`,
          variant: "destructive"
        });
      }
      
      setShowOrderDialog(false);
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const debouncedSave = (requestId: string, status: string, adminPrice?: number, adminNotes?: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(async () => {
      try {
        const result = await rapidAPIAmazonService.updateRequestOrderStatus(requestId, status, adminPrice, adminNotes);
        if (result) {
          fetchData();
        }
      } catch (error) {
        console.error('Error saving request order:', error);
      }
    }, 1000); // Save after 1 second of no typing
    
    setSaveTimeout(timeout);
  };

  const handleUpdateRequestOrderStatus = async (requestId: string, status: string, adminPrice?: number, adminNotes?: string, closeDialog: boolean = false) => {
    try {
      const result = await rapidAPIAmazonService.updateRequestOrderStatus(requestId, status, adminPrice, adminNotes);
      
      if (result) {
        if (closeDialog) {
          toast({
            title: "Request Updated Successfully",
            description: `Request status updated to ${status}. ${adminPrice ? `Price set to MWK ${adminPrice.toLocaleString()}` : ''}`,
          });
          setShowRequestOrderDialog(false);
          setEditingRequestOrder(null);
        }
        fetchData();
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update request status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating request order status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRequestOrderDeposit = async (requestId: string, depositPaid: boolean, paymentId?: string) => {
    try {
      toast({
        title: "Updating Deposit Status",
        description: `Marking deposit as ${depositPaid ? 'paid' : 'unpaid'}...`,
      });

      const result = await rapidAPIAmazonService.updateRequestOrderDeposit(requestId, depositPaid, paymentId);
      
      if (result) {
        toast({
          title: "Deposit Status Updated",
          description: `Deposit marked as ${depositPaid ? 'paid' : 'unpaid'}`,
        });
        fetchData();
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update deposit status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update deposit status",
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
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);
      
      // Render the receipt component
      const receiptElement = (
        <AmazonReceiptPDF order={order} />
      );
      
      // Use ReactDOM to render the component
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      root.render(receiptElement);
      
      // Wait for the component to render and images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the receipt element
      const receiptDiv = tempContainer.querySelector('#receipt-pdf') as HTMLElement;
      
      if (!receiptDiv) {
        throw new Error('Receipt element not found');
      }
      
      // Wait for any images to load
      const images = receiptDiv.querySelectorAll('img');
      if (images.length > 0) {
        await Promise.all(
          Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
          })
        );
      }
      
      // Convert to canvas with better settings
      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: receiptDiv.scrollHeight,
        scrollX: 0,
        scrollY: 0
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

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'priced': return 'bg-purple-100 text-purple-800';
      case 'deposit_paid': return 'bg-green-100 text-green-800';
      case 'sourcing': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.delivery_address.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredRequestOrders = requestOrders.filter(request => {
    const matchesSearch = request.item_name.toLowerCase().includes(requestOrderSearchTerm.toLowerCase()) ||
                         request.phone_number.toLowerCase().includes(requestOrderSearchTerm.toLowerCase());
    const matchesStatus = selectedRequestStatus === 'all' || !selectedRequestStatus || request.status === selectedRequestStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.filter(o => o.status !== 'payment_pending').reduce((sum, o) => sum + o.total_amount, 0),
    totalProducts: products.length
  };

  // Don't render anything if user is not admin or not authenticated
  if (!user || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
                     <h1 className="text-3xl font-bold">Dream Weave Dubai Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncProducts} 
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {isSyncing ? 'Syncing...' : 'Sync Products'}
            </Button>
            <Button 
              onClick={handleUpdateBrands} 
              disabled={isUpdatingBrands}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {isUpdatingBrands ? 'Updating...' : 'Update Brands'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">MWK {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

                     <Card>
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Products</p>
                   <p className="text-2xl font-bold">{stats.totalProducts}</p>
                 </div>
                 <Package className="w-8 h-8 text-purple-600" />
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Main Content Tabs */}
                 <Tabs defaultValue="orders" className="space-y-6">
           <TabsList>
             <TabsTrigger value="orders">Orders</TabsTrigger>
             <TabsTrigger value="products">Products</TabsTrigger>
             <TabsTrigger value="request-orders">Request Orders</TabsTrigger>
             <TabsTrigger value="settings">Settings</TabsTrigger>
           </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                                     <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                     <SelectTrigger className="w-48">
                       <SelectValue placeholder="Filter by status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All Status</SelectItem>
                       <SelectItem value="pending">Pending</SelectItem>
                       <SelectItem value="processing">Processing</SelectItem>
                       <SelectItem value="shipped">Shipped</SelectItem>
                       <SelectItem value="delivered">Delivered</SelectItem>
                       <SelectItem value="cancelled">Cancelled</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>{order.delivery_address.full_name}</TableCell>
                        <TableCell>MWK {order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingOrder(order);
                                setShowOrderDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
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
          </TabsContent>

                     {/* Products Tab */}
           <TabsContent value="products" className="space-y-6">
             <Card>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle>Product Management</CardTitle>
                   <div className="flex gap-2">
                     {selectedProducts.size > 0 && (
                       <Button 
                         variant="destructive" 
                         onClick={handleDeleteSelectedProducts}
                         disabled={isDeletingProducts}
                         className="flex items-center gap-2"
                       >
                         <Trash2 className="w-4 h-4" />
                         {isDeletingProducts ? 'Deleting...' : `Delete Selected (${selectedProducts.size})`}
                       </Button>
                     )}
                     <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                       <Plus className="w-4 h-4" />
                       Add Product
                     </Button>
                   </div>
                 </div>
               </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.size === products.length && products.length > 0}
                            onChange={handleSelectAllProducts}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span>Select All</span>
                        </div>
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-gray-600">{product.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">MWK {product.price.toLocaleString()}</div>
                            {product.price_aed && (
                              <div className="text-sm text-gray-600">AED {product.price_aed.toLocaleString()}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Badge variant={product.availability ? "default" : "secondary"}>
                            {product.availability ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                                                 <TableCell>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setEditingProduct(product);
                                 setProductImages([product.image_url]);
                                 setEditingProductData({
                                   title: product.title,
                                   brand: product.brand,
                                   category: product.category,
                                   price: product.price.toString(),
                                   shipping_cost: product.shipping_cost.toString(),
                                   description: product.description
                                 });
                                 setShowEditDialog(true);
                               }}
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                                                           <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                                                         const success = await rapidAPIAmazonService.deleteProduct(product.id);
                                    if (success) {
                                      toast({
                                        title: "Product Deleted",
                                        description: `"${product.title}" has been deleted successfully`,
                                      });
                                      // Refresh the products list
                                      fetchData();
                                    } else {
                                      toast({
                                        title: "Delete Failed",
                                        description: "Failed to delete product. Please try again.",
                                        variant: "destructive"
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Error deleting product:', error);
                                    toast({
                                      title: "Delete Error",
                                      description: "An error occurred while deleting the product",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Request Orders Tab */}
          <TabsContent value="request-orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Orders Management</CardTitle>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search requests..."
                      value={requestOrderSearchTerm}
                      onChange={(e) => setRequestOrderSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRequestStatus} onValueChange={setSelectedRequestStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="priced">Priced</SelectItem>
                      <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                      <SelectItem value="sourcing">Sourcing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequestOrders.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.item_name}</div>
                            <div className="text-sm text-gray-600">Qty: {request.quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.delivery_address.split(',')[0]}</div>
                            <div className="text-sm text-gray-600">{request.phone_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.phone_number}</TableCell>
                        <TableCell>
                          <Badge className={getRequestStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.admin_price ? (
                            <div>
                              <div className="font-medium">MWK {request.admin_price.toLocaleString()}</div>
                              {request.deposit_amount && (
                                <div className="text-sm text-gray-600">
                                  Deposit: MWK {request.deposit_amount.toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not priced</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                                                             onClick={() => {
                                 setEditingRequestOrder(request);
                                 setEditingPrice(request.admin_price?.toString() || '');
                                 setEditingNotes(request.admin_notes || '');
                                 setShowRequestOrderDialog(true);
                               }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Conversion Settings</CardTitle>
                                 <p className="text-sm text-gray-600">
                   Set the conversion rate from UAE Dirhams (AED) to Malawian Kwacha (MWK) for Dream Weave Dubai products.
                 </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Current Conversion Rate</label>
                      <div className="text-lg font-semibold text-blue-600">
                        {currentConversionRate ? `1 AED = ${currentConversionRate} MWK` : 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Conversion Rate</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter conversion rate (e.g., 1000)"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        className="flex-1"
                        min="0"
                        step="0.01"
                      />
                      <Button 
                        onClick={handleUpdateConversionRate}
                        disabled={isUpdatingRate}
                        className="flex items-center gap-2"
                      >
                        {isUpdatingRate ? 'Updating...' : 'Update Rate'}
                      </Button>
                    </div>
                                         <p className="text-xs text-gray-500">
                       Example: If 1 AED = 1000 MWK, enter 1000. This rate will be applied when syncing products from Dream Weave Dubai.
                     </p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                                         <ul className="text-sm text-blue-800 space-y-1">
                       <li>• Dream Weave Dubai products are priced in UAE Dirhams (AED)</li>
                       <li>• The conversion rate is applied to convert AED prices to Malawian Kwacha (MWK)</li>
                       <li>• Updated rates take effect when you sync products from Dream Weave Dubai</li>
                       <li>• All prices displayed to customers will be in MWK</li>
                     </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>

                                   {/* Edit Product Dialog */}
         <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Edit Product</DialogTitle>
             </DialogHeader>
             {editingProduct && (
               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium">Title</label>
                   <Input 
                     value={editingProductData.title}
                     onChange={(e) => setEditingProductData(prev => ({ ...prev, title: e.target.value }))}
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Brand</label>
                   <Input 
                     value={editingProductData.brand}
                     onChange={(e) => setEditingProductData(prev => ({ ...prev, brand: e.target.value }))}
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Category</label>
                   <Select value={editingProductData.category} onValueChange={(value) => setEditingProductData(prev => ({ ...prev, category: value }))}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select category" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Electronics">Electronics</SelectItem>
                       <SelectItem value="Fashion">Fashion</SelectItem>
                       <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                       <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                       <SelectItem value="Books & Toys">Books & Toys</SelectItem>
                       <SelectItem value="Beauty & Health">Beauty & Health</SelectItem>
                       <SelectItem value="Automotive">Automotive</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Price (MWK)</label>
                     <Input 
                       value={editingProductData.price}
                       onChange={(e) => setEditingProductData(prev => ({ ...prev, price: e.target.value }))}
                       type="number" 
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Shipping Cost (MWK)</label>
                     <Input 
                       value={editingProductData.shipping_cost}
                       onChange={(e) => setEditingProductData(prev => ({ ...prev, shipping_cost: e.target.value }))}
                       type="number" 
                     />
                   </div>
                 </div>
                 <div>
                   <label className="text-sm font-medium">Description</label>
                   <Textarea 
                     value={editingProductData.description}
                     onChange={(e) => setEditingProductData(prev => ({ ...prev, description: e.target.value }))}
                     rows={4} 
                   />
                 </div>
                 
                 {/* Image Upload Section */}
                 <div>
                   <label className="text-sm font-medium">Product Images (Max 5)</label>
                   <div className="mt-2 space-y-4">
                     <div className="flex items-center gap-4">
                       <input
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                         className="hidden"
                         id="edit-image-upload"
                         disabled={productImages.length >= 5}
                       />
                       <label
                         htmlFor="edit-image-upload"
                         className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                           productImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                         }`}
                       >
                         <Upload className="w-4 h-4" />
                         Upload Images
                       </label>
                       {uploadingImages && <span className="text-sm text-gray-500">Uploading...</span>}
                     </div>
                     
                     {/* Display uploaded images */}
                     {productImages.length > 0 && (
                       <div className="grid grid-cols-5 gap-2">
                         {productImages.map((image, index) => (
                           <div key={index} className="relative">
                             <img
                               src={image}
                               alt={`Product ${index + 1}`}
                               className="w-full h-20 object-cover rounded-lg"
                             />
                             <button
                               onClick={() => removeImage(index)}
                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <div className="flex gap-2">
                   <Button onClick={handleUpdateProduct}>
                     Update Product
                   </Button>
                   <Button variant="outline" onClick={() => {
                     setShowEditDialog(false);
                     setProductImages([]);
                     setEditingProductData({
                       title: '',
                       brand: '',
                       category: '',
                       price: '',
                       shipping_cost: '',
                       description: ''
                     });
                   }}>
                     Cancel
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

                   {/* Add Product Dialog */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Add New Product</DialogTitle>
             </DialogHeader>
             <div className="space-y-4">
               <div>
                 <label className="text-sm font-medium">Title</label>
                 <Input 
                   placeholder="Enter product title" 
                   value={newProduct.title}
                   onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                 />
               </div>
               <div>
                 <label className="text-sm font-medium">Brand</label>
                 <Input 
                   placeholder="Enter brand name" 
                   value={newProduct.brand}
                   onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                 />
               </div>
               <div>
                 <label className="text-sm font-medium">Category</label>
                 <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select category" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Electronics">Electronics</SelectItem>
                     <SelectItem value="Fashion">Fashion</SelectItem>
                     <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                     <SelectItem value="Sports">Sports</SelectItem>
                     <SelectItem value="Books">Books</SelectItem>
                     <SelectItem value="Toys">Toys</SelectItem>
                     <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                     <SelectItem value="Automotive">Automotive</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium">Price (MWK)</label>
                   <Input 
                     placeholder="0" 
                     type="number" 
                     value={newProduct.price}
                     onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Shipping Cost (MWK)</label>
                   <Input 
                     placeholder="0" 
                     type="number" 
                     value={newProduct.shipping_cost}
                     onChange={(e) => setNewProduct(prev => ({ ...prev, shipping_cost: e.target.value }))}
                   />
                 </div>
               </div>
               <div>
                 <label className="text-sm font-medium">Description</label>
                 <Textarea 
                   placeholder="Enter product description" 
                   rows={4} 
                   value={newProduct.description}
                   onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                 />
               </div>
               
               {/* Image Upload Section */}
               <div>
                 <label className="text-sm font-medium">Product Images (Max 5)</label>
                 <div className="mt-2 space-y-4">
                   <div className="flex items-center gap-4">
                     <input
                       type="file"
                       multiple
                       accept="image/*"
                       onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                       className="hidden"
                       id="add-image-upload"
                       disabled={productImages.length >= 5}
                     />
                     <label
                       htmlFor="add-image-upload"
                       className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                         productImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                     >
                       <Upload className="w-4 h-4" />
                       Upload Images
                     </label>
                     {uploadingImages && <span className="text-sm text-gray-500">Uploading...</span>}
                   </div>
                   
                   {/* Display uploaded images */}
                   {productImages.length > 0 && (
                     <div className="grid grid-cols-5 gap-2">
                       {productImages.map((image, index) => (
                         <div key={index} className="relative">
                           <img
                             src={image}
                             alt={`Product ${index + 1}`}
                             className="w-full h-20 object-cover rounded-lg"
                           />
                           <button
                             onClick={() => removeImage(index)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                           >
                             <X className="w-3 h-3" />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="flex gap-2">
                 <Button onClick={handleAddProduct}>
                   Add Product
                 </Button>
                 <Button variant="outline" onClick={() => {
                   setShowAddDialog(false);
                   setProductImages([]);
                   setNewProduct({
                     title: '',
                     brand: '',
                     category: '',
                     price: '',
                     shipping_cost: '',
                     description: ''
                   });
                 }}>
                   Cancel
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>

                 {/* Edit Order Dialog */}
         <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Update Order Status</DialogTitle>
             </DialogHeader>
             {editingOrder && (
               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium">Order Number</label>
                   <Input value={editingOrder.order_number} disabled />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Status</label>
                   <Select 
                     value={editingOrder.status} 
                     onValueChange={(value) => handleUpdateOrderStatus(editingOrder.id, value as AmazonOrder['status'])}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="pending">Pending</SelectItem>
                       <SelectItem value="processing">Processing</SelectItem>
                       <SelectItem value="shipped">Shipped</SelectItem>
                       <SelectItem value="delivered">Delivered</SelectItem>
                       <SelectItem value="successful">Successful</SelectItem>
                       <SelectItem value="cancelled">Cancelled</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <label className="text-sm font-medium">Admin Notes</label>
                   <Textarea placeholder="Add notes about order progress..." />
                 </div>
                 <div className="flex gap-2">
                   <Button onClick={() => setShowOrderDialog(false)}>
                     Update Order
                   </Button>
                   <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                     Cancel
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
                  </Dialog>

                   {/* Edit Request Order Dialog */}
          <Dialog open={showRequestOrderDialog} onOpenChange={setShowRequestOrderDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Update Request Order</DialogTitle>
             </DialogHeader>
             {editingRequestOrder && (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Item Name</label>
                     <Input value={editingRequestOrder.item_name} disabled />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Quantity</label>
                     <Input value={editingRequestOrder.quantity.toString()} disabled />
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-sm font-medium">Description</label>
                   <Textarea value={editingRequestOrder.description} disabled rows={3} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Preferred Brand</label>
                     <Input value={editingRequestOrder.preferred_brand || ''} disabled />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Budget Range</label>
                     <Input value={editingRequestOrder.budget_range || ''} disabled />
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-sm font-medium">Delivery Address</label>
                   <Textarea value={editingRequestOrder.delivery_address} disabled rows={2} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Phone Number</label>
                     <Input value={editingRequestOrder.phone_number} disabled />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Current Status</label>
                     <Input value={editingRequestOrder.status.replace('_', ' ')} disabled />
                   </div>
                 </div>
                 
                 {editingRequestOrder.special_requirements && (
                   <div>
                     <label className="text-sm font-medium">Special Requirements</label>
                     <Textarea value={editingRequestOrder.special_requirements} disabled rows={2} />
                   </div>
                 )}
                 
                 {(editingRequestOrder.image_urls && editingRequestOrder.image_urls.length > 0) && (
                   <div>
                     <label className="text-sm font-medium">Item Images</label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                       {editingRequestOrder.image_urls.map((imageUrl, index) => (
                         <div key={index} className="relative">
                           <img 
                             src={imageUrl} 
                             alt={`Requested item ${index + 1}`} 
                             className="w-full h-32 object-cover rounded-lg border"
                           />
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 {/* Fallback for old single image_url field */}
                 {(!editingRequestOrder.image_urls || editingRequestOrder.image_urls.length === 0) && editingRequestOrder.image_url && (
                   <div>
                     <label className="text-sm font-medium">Item Image</label>
                     <img 
                       src={editingRequestOrder.image_url} 
                       alt="Requested item" 
                       className="w-32 h-32 object-cover rounded-lg border"
                     />
                   </div>
                 )}
                 
                 <div className="border-t pt-4">
                   <h4 className="font-medium mb-3">Admin Actions</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium">Set Price (MWK)</label>
                                               <Input 
                          type="number"
                          placeholder="Enter price"
                          value={editingPrice}
                          onChange={(e) => {
                            setEditingPrice(e.target.value);
                            const price = parseFloat(e.target.value);
                            if (!isNaN(price) && price > 0) {
                              debouncedSave(
                                editingRequestOrder.id, 
                                'priced', 
                                price, 
                                editingNotes
                              );
                            }
                          }}
                        />
                     </div>
                     <div>
                       <label className="text-sm font-medium">Update Status</label>
                                               <Select 
                          value={editingRequestOrder.status}
                          onValueChange={(value) => {
                            const price = parseFloat(editingPrice);
                            handleUpdateRequestOrderStatus(
                              editingRequestOrder.id, 
                              value, 
                              !isNaN(price) && price > 0 ? price : editingRequestOrder.admin_price, 
                              editingNotes,
                              true // Close dialog when status is changed
                            );
                          }}
                        >
                         <SelectTrigger>
                           <SelectValue placeholder="Select status" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="pending">Pending</SelectItem>
                           <SelectItem value="reviewed">Reviewed</SelectItem>
                           <SelectItem value="priced">Priced</SelectItem>
                           <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                           <SelectItem value="sourcing">Sourcing</SelectItem>
                           <SelectItem value="shipped">Shipped</SelectItem>
                           <SelectItem value="delivered">Delivered</SelectItem>
                           <SelectItem value="cancelled">Cancelled</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   
                   <div className="mt-4">
                     <label className="text-sm font-medium">Admin Notes</label>
                                           <Textarea 
                        placeholder="Add notes about this request..."
                        value={editingNotes}
                        onChange={(e) => {
                          setEditingNotes(e.target.value);
                          const price = parseFloat(editingPrice);
                          debouncedSave(
                            editingRequestOrder.id, 
                            editingRequestOrder.status, 
                            !isNaN(price) && price > 0 ? price : editingRequestOrder.admin_price, 
                            e.target.value
                          );
                        }}
                        rows={3}
                      />
                   </div>
                   
                                       {(editingRequestOrder.admin_price || parseFloat(editingPrice) > 0) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Payment Information</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Price:</span>
                            <div className="font-medium">MWK {(parseFloat(editingPrice) || editingRequestOrder.admin_price || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Deposit Required (50%):</span>
                            <div className="font-medium">MWK {((parseFloat(editingPrice) || editingRequestOrder.admin_price || 0) * 0.5).toLocaleString()}</div>
                          </div>
                        </div>
                       <div className="mt-3">
                         <Button
                           variant={editingRequestOrder.deposit_paid ? "outline" : "default"}
                           onClick={() => handleUpdateRequestOrderDeposit(
                             editingRequestOrder.id, 
                             !editingRequestOrder.deposit_paid
                           )}
                         >
                           {editingRequestOrder.deposit_paid ? 'Mark Deposit as Unpaid' : 'Mark Deposit as Paid'}
                         </Button>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex gap-2">
                   <Button variant="outline" onClick={() => setShowRequestOrderDialog(false)}>
                     Close
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>
       </div>
       <Footer />
     </div>
   );
};

export default AmazonAdminDashboard;
