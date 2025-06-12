/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Eye, MapPin, Calendar, User, Mail, Phone, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  featured_image: string;
  location: string;
}

interface Transaction {
  id: string;
  listing_id: string;
  amount: number;
  status: string;
  created_at: string;
  listing_title: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  kyc_status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user profile with real-time KYC status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          status,
          created_at,
          featured_image,
          location,
          admin_approved
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      
      const formattedListings = listingsData || [];
      setListings(formattedListings);

      // Fetch commission payments (listing_payments table)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('listing_payments')
        .select(`
          id,
          amount,
          payment_status,
          created_at,
          listing_id,
          listings (
            title
          )
        `)
        .eq('user_id', user?.id)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching commission payments:', paymentsError);
        setTransactions([]);
      } else {
        const formattedTransactions = paymentsData?.map(payment => ({
          id: payment.id,
          listing_id: payment.listing_id,
          amount: payment.amount,
          status: payment.payment_status,
          created_at: payment.created_at,
          listing_title: (payment.listings as any)?.title || 'Unknown Listing'
        })) || [];
        setTransactions(formattedTransactions);
      }

      // Calculate stats
      const totalListings = formattedListings?.length || 0;
      const activeListings = formattedListings?.filter(l => l.status === 'active').length || 0;
      const soldItems = formattedListings?.filter(l => l.status === 'sold').length || 0;
      
      // Total earnings = commission paid for listings
      const totalEarnings = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setStats({
        totalListings,
        activeListings,
        soldItems,
        totalEarnings
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing marked as sold successfully"
      });

      // Refresh data to show updated stats
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditProfile = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Profile editing functionality will be available soon."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PlusCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-sm font-medium text-gray-600">Sold Items</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.soldItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">MWK {stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="transactions">Commission History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>My Listings</CardTitle>
                <Button onClick={() => navigate('/create-listing')} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Listing
                </Button>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't created any listings yet.</p>
                    <Button onClick={() => navigate('/create-listing')} className="mt-4">
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                          <img 
                            src={listing.featured_image} 
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{listing.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {listing.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(listing.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-green-600">
                              MWK {listing.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                          <Badge variant={listing.status === 'sold' ? 'secondary' : listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status.toUpperCase()}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewListing(listing.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditListing(listing.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {listing.status !== 'sold' && listing.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsSold(listing.id)}
                            >
                              Mark as Sold
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Commission Payment History</CardTitle>
                <p className="text-sm text-gray-600">Commission fees paid for your listings</p>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No commission payments yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">Listing Commission</h3>
                          <p className="text-sm text-gray-600 truncate">{transaction.listing_title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-lg font-semibold">
                            MWK {transaction.amount.toLocaleString()}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Profile Information</CardTitle>
                <Button onClick={handleEditProfile} className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-lg truncate">{profile?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg truncate">{profile?.email}</p>
                      </div>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-lg truncate">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">KYC Status</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            profile.kyc_status === 'pending'
                              ? 'default'
                              : profile.kyc_status === 'verified'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {profile.kyc_status === 'verified' ? 'Verified' : profile.kyc_status}
                        </Badge>
                        {profile.kyc_status === 'pending' && (
                          <span className="text-sm text-muted-foreground">
                            Your KYC submission is being reviewed
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-lg">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                      <p className="text-sm text-gray-600">Total Listings</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                      <p className="text-sm text-gray-600">Active Listings</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.soldItems}</p>
                      <p className="text-sm text-gray-600">Items Sold</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">MWK {stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
