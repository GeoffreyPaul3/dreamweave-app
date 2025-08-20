import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, Package, ShoppingCart, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendRequestOrderSubmittedEmail } from '@/lib/email';

interface RequestOrderForm {
  item_name: string;
  description: string;
  quantity: number;
  preferred_brand: string;
  budget_range: string;
  delivery_address: string;
  phone_number: string;
  special_requirements: string;
}

const RequestOrder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<RequestOrderForm>({
    item_name: '',
    description: '',
    quantity: 1,
    preferred_brand: '',
    budget_range: '',
    delivery_address: '',
    phone_number: '',
    special_requirements: ''
  });

  const handleInputChange = (field: keyof RequestOrderForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if we already have 5 images
    if (imageUrls.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can upload up to 5 images maximum",
        variant: "destructive"
      });
      return;
    }

    // Process each file
    const newImages: string[] = [];
    let hasError = false;

    for (let i = 0; i < files.length && imageUrls.length + newImages.length < 5; i++) {
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB. Please select a smaller image.`,
          variant: "destructive"
        });
        hasError = true;
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file.`,
          variant: "destructive"
        });
        hasError = true;
        continue;
      }

      setUploadingImage(true);
      try {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          
          // If this is the last file, update state
          if (newImages.length === Math.min(files.length, 5 - imageUrls.length)) {
            setImageUrls(prev => [...prev, ...newImages]);
            setUploadingImage(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive"
        });
        hasError = true;
        setUploadingImage(false);
      }
    }

    if (hasError) {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a request",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.item_name || !formData.description || !formData.delivery_address || !formData.phone_number) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
                        const requestData = {
                    user_id: user.id,
                    item_name: formData.item_name,
                    description: formData.description,
                    quantity: formData.quantity,
                    preferred_brand: formData.preferred_brand,
                    budget_range: formData.budget_range,
                    delivery_address: formData.delivery_address,
                    phone_number: formData.phone_number,
                    special_requirements: formData.special_requirements,
                    image_urls: imageUrls,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };

      const { data, error } = await supabase
        .from('request_orders')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      try {
        await sendRequestOrderSubmittedEmail(
          user.email || '',
          user.user_metadata?.full_name || 'Valued Customer',
          formData.item_name,
          data.id
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the submission if email fails
      }

      toast({
        title: "Request Submitted Successfully",
        description: "Your request has been submitted and will be reviewed by our team. We'll contact you soon!",
      });

                        // Reset form
                  setFormData({
                    item_name: '',
                    description: '',
                    quantity: 1,
                    preferred_brand: '',
                    budget_range: '',
                    delivery_address: '',
                    phone_number: '',
                    special_requirements: ''
                  });
                  setImageUrls([]);

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Request Items from Dubai UAE</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Request any item from Dubai UAE and we'll source it for you. 
              Simply fill out the form below and we'll review your request.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Wide Selection</h3>
                <p className="text-gray-600">Request any item available in Dubai UAE markets</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                <p className="text-gray-600">We verify all items before shipping to ensure quality</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Secure Delivery</h3>
                <p className="text-gray-600">Safe and reliable delivery to your doorstep</p>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Request Form
              </CardTitle>
              <p className="text-sm text-gray-600">
                Fill out the form below to request items from Dubai UAE. Our team will review your request and get back to you with pricing and availability.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="item_name" className="text-sm font-medium">
                      Item Name *
                    </Label>
                    <Input
                      id="item_name"
                      placeholder="e.g., Samsung Galaxy S23, Nike Air Jordan"
                      value={formData.item_name}
                      onChange={(e) => handleInputChange('item_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the item you want, including specifications, features, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="preferred_brand" className="text-sm font-medium">
                      Preferred Brand
                    </Label>
                    <Input
                      id="preferred_brand"
                      placeholder="e.g., Samsung, Apple, Nike"
                      value={formData.preferred_brand}
                      onChange={(e) => handleInputChange('preferred_brand', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_range" className="text-sm font-medium">
                      Budget Range (MWK)
                    </Label>
                    <Input
                      id="budget_range"
                      placeholder="e.g., 500,000 - 1,000,000"
                      value={formData.budget_range}
                      onChange={(e) => handleInputChange('budget_range', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone_number" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone_number"
                      placeholder="e.g., +265 999 123 456"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_address" className="text-sm font-medium">
                      Delivery Address *
                    </Label>
                    <Input
                      id="delivery_address"
                      placeholder="Full delivery address"
                      value={formData.delivery_address}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="special_requirements" className="text-sm font-medium">
                    Special Requirements
                  </Label>
                  <Textarea
                    id="special_requirements"
                    placeholder="Any special requirements, color preferences, size specifications, etc."
                    value={formData.special_requirements}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-sm font-medium">Item Images (Optional - Up to 5)</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage || imageUrls.length >= 5}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          (uploadingImage || imageUrls.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading...' : `Upload Images (${imageUrls.length}/5)`}
                      </label>
                      {uploadingImage && <span className="text-sm text-gray-500">Processing...</span>}
                      {imageUrls.length >= 5 && (
                        <span className="text-sm text-gray-500">Maximum images reached</span>
                      )}
                    </div>
                    
                    {/* Image Previews */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {imageUrls.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Uploaded item ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 text-lg"
                  >
                    {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Submit Request</h4>
                  <p className="text-sm text-gray-600">Fill out the form above with your item details</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Review & Pricing</h4>
                  <p className="text-sm text-gray-600">Our team reviews your request and provides pricing</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Payment & Delivery</h4>
                  <p className="text-sm text-gray-600">Pay 50% deposit and we'll source and deliver your item</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RequestOrder;
