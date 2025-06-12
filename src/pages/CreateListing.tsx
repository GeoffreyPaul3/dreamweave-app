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
import PayChanguPayment from '@/components/PayChanguPayment';
import KYCForm from '@/components/KYCForm';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  location: z.string().min(2, 'Location is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
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
  const [isFeatured, setIsFeatured] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [userProfile, setUserProfile] = useState<{ kyc_status: 'rejected' | 'pending' | 'verified'; phone: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOnlineStore, setIsOnlineStore] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [listingId, setListingId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema)
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchCategories();
    fetchUserProfile();
  }, [user, navigate]);

  useEffect(() => {
    const checkKYCStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (!profile || profile.kyc_status !== 'verified') {
        toast({
          title: "KYC Required",
          description: "You must complete KYC verification before creating a listing.",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    };

    checkKYCStatus();
  }, [navigate]);

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
    if (!user) return;

    try {
      // First check if user has an approved KYC submission
      const { data: kycData } = await supabase
        .from('kyc_submissions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'verified')
        .single();

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // If user has verified KYC but profile hasn't been updated, update it
      if (kycData && (!profile.is_seller || profile.kyc_status !== 'verified')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_seller: true,
            kyc_status: 'verified'
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
      if (!kycData && (!profile.is_seller || profile.kyc_status !== 'verified')) {
        setShowKYC(true);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive"
      });
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
      setFeaturedImage(images[0] || '');
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
          images: images,
          featured_image: featuredImage,
          is_featured: isFeatured,
          is_online_store: isOnlineStore,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setListingId(listing.id);
      setShowPayment(true);
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

  const handleKYCSuccess = () => {
    setShowKYC(false);
    fetchUserProfile();
  };

  if (showKYC) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Complete KYC Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <KYCForm onSuccess={handleKYCSuccess} />
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <PayChanguPayment
                amount={50}
                onSuccess={() => navigate('/dashboard')}
                onCancel={() => setShowPayment(false)}
                listingId={listingId}
              />
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="price">Price (MWK)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    onValueChange={(value) => setValue('condition', value)}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter detailed description"
                  className="min-h-[150px]"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Images</Label>
                <ImageUpload
                  bucketName="listing-images"
                  onImageUploaded={handleImageUpload}
                  onImageRemoved={handleImageRemove}
                  maxImages={5}
                  existingImages={images}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="featured">Feature this listing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="online-store"
                  checked={isOnlineStore}
                  onCheckedChange={setIsOnlineStore}
                />
                <Label htmlFor="online-store">This is an online store</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;
