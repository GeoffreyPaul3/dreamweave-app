<<<<<<< HEAD
=======

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
<<<<<<< HEAD
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import PayChanguPayment from '@/components/PayChanguPayment';
import KYCForm from '@/components/KYCForm';
=======
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  location: z.string().min(2, 'Location is required'),
<<<<<<< HEAD
=======
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
});

type ListingFormData = z.infer<typeof listingSchema>;

interface Category {
  id: string;
  name: string;
}

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
<<<<<<< HEAD
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [listingId, setListingId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showKYC, setShowKYC] = useState(false);
=======
  const [isFeatured, setIsFeatured] = useState(false);
	const [showKYC, setShowKYC] = useState(false);
  const [userProfile, setUserProfile] = useState<{ kyc_status: string; phone: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOnlineStore, setIsOnlineStore] = useState(false);
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
<<<<<<< HEAD
    watch
=======
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema)
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
<<<<<<< HEAD
    
=======

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    fetchCategories();
    fetchUserProfile();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchUserProfile = async () => {
<<<<<<< HEAD
    if (!user) return;

    try {
      // First check if user has an approved KYC submission
      const { data: kycData } = await supabase
        .from('kyc_submissions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // If user has approved KYC but profile hasn't been updated, update it
      if (kycData && (!profile.is_seller || profile.kyc_status !== 'approved')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_seller: true,
            kyc_status: 'approved'
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        } else {
          // Refetch the updated profile
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUserProfile(updatedProfile);
        }
      } else {
        setUserProfile(profile);
      }

      // Check if user needs KYC for first-time selling
      if (!kycData && (!profile.is_seller || profile.kyc_status !== 'approved')) {
        setShowKYC(true);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
=======
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, phone')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (data.kyc_status !== 'verified') {
        setShowKYC(true);
      } else {
        setUserProfile(data);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'verified' })
        .eq('id', user?.id);

      if (updateError) {
        console.error('Error updating KYC status:', updateError);
      }

      // Fetch profile again after update
      const { data: updatedData } = await supabase
        .from('profiles')
        .select('kyc_status, phone')
        .eq('id', user?.id)
        .single();

      if (updatedData && updatedData.kyc_status === 'verified') {
        setUserProfile(updatedData);
        setShowKYC(false);
      } else {
        setShowKYC(true);
      }
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    }
  };

  const handleImageUpload = (url: string) => {
    setImages(prev => [...prev, url]);
    if (!featuredImage) {
      setFeaturedImage(url);
    }
  };

  const handleImageRemove = (url: string) => {
    setImages(prev => prev.filter(img => img !== url));
    if (featuredImage === url) {
      setFeaturedImage(images.find(img => img !== url) || '');
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
<<<<<<< HEAD
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          category_id: data.categoryId,
          condition: data.condition,
          location: data.location,
          seller_id: user.id,
          featured_image: featuredImage,
          images: images,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setListingId(listing.id);
      setShowPayment(true);

=======
      // Update user profile with phone number
      await supabase
        .from('profiles')
        .update({ phone: data.phone })
        .eq('id', user.id);

      // Check if the user needs to pay the listing commission
      const commissionRate = 0.05; // 5% commission
      const commissionAmount = data.price * commissionRate;

      // Create a new listing
      const { data: listing, error } = await supabase
        .from('listings')
        .insert([
          {
            title: data.title,
            description: data.description,
            price: data.price,
            category_id: data.categoryId,
            condition: data.condition,
            location: data.location,
            featured_image: featuredImage,
            images: images,
            seller_id: user.id,
            is_featured: isFeatured,
            is_online_store: isOnlineStore,
            commission_amount: commissionAmount,
            status: commissionAmount > 0 ? 'payment_pending' : 'active',
            phone: data.phone
          }
        ])
        .select()

      if (error) throw error;

      if (commissionAmount > 0) {
        // Redirect to payment page or show payment modal
        toast({
          title: "Commission Payment Required",
          description: `A commission of MWK ${commissionAmount.toLocaleString()} is required to list this item.`,
        });
        navigate(`/payment/${listing[0].id}`);
      } else {
        toast({
          title: "Success",
          description: "Listing created successfully!"
        });
        navigate('/dashboard');
      }
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast({
      title: "Success",
      description: "Your listing has been submitted and is pending approval!"
    });
    navigate('/dashboard');
  };

  const handleKYCSuccess = () => {
    setShowKYC(false);
    fetchUserProfile();
  };

=======
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
  if (!user) {
    return null;
  }

<<<<<<< HEAD
  if (showKYC) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <KYCForm onSuccess={handleKYCSuccess} />
        </div>
      </div>
    );
  }

  // Calculate listing fee (10% of price)
  const price = watch('price') || 0;
  const listingFee = Math.round(price * 0.1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Listing</CardTitle>
            <p className="text-sm text-gray-600">
              Fill out the details below to create your listing. A 10% commission fee will be charged.
            </p>
          </CardHeader>
          
          <CardContent>
            {showPayment ? (
              <PayChanguPayment
                amount={listingFee}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
                listingId={listingId}
              />
=======
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create Listing</CardTitle>
            <p className="text-sm text-gray-600">
              List your item for sale by providing the details below.
            </p>
          </CardHeader>

          <CardContent>
            {showKYC ? (
              <div className="relative">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Account Not Verified <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Account Not Verified</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account is not verified. Please verify your account to create a listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => navigate('/kyc')}>Verify Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Enter listing title"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <Select onValueChange={(value) => setValue('categoryId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && (
                        <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (MWK)</Label>
                        <Input
                          id="price"
                          type="number"
                          {...register('price', { valueAsNumber: true })}
                          placeholder="0"
                        />
                        {errors.price && (
                          <p className="text-sm text-red-500">{errors.price.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select onValueChange={(value) => setValue('condition', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="like_new">Like New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.condition && (
                          <p className="text-sm text-red-500">{errors.condition.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="Enter location"
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">{errors.location.message}</p>
                      )}
                    </div>

<<<<<<< HEAD
                    {price > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900">Fee Summary</h3>
                        <div className="text-blue-800 space-y-1">
                          <p>Listing Price: MWK {price.toLocaleString()}</p>
                          <p>Commission (10%): MWK {listingFee.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
=======
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <p className="text-sm text-gray-600">
                        Upload up to 5 images. The first image will be the featured image.
                      </p>
                      <ImageUpload
                        bucketName="listing-images"
                        onImageUploaded={handleImageUpload}
                        onImageRemoved={handleImageRemove}
                        maxImages={5}
                        existingImages={images}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your item in detail..."
                    rows={6}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

<<<<<<< HEAD
=======
                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Feature this listing</Label>
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={(checked) => setIsFeatured(checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isOnlineStore">List as online store item</Label>
                  <Switch
                    id="isOnlineStore"
                    checked={isOnlineStore}
                    onCheckedChange={(checked) => setIsOnlineStore(checked)}
                  />
                </div>

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || images.length === 0}
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create Listing'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
<<<<<<< HEAD
=======

      <Footer />
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    </div>
  );
};

export default CreateListing;
