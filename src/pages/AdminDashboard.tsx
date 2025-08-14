/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import AdminKYC from '@/components/admin/AdminKYC';
import AdminListings from '@/components/admin/AdminListings';
import AdminBanners from '@/components/admin/AdminBanners';
import { Users, FileText, DollarSign, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingKYC: number;
  totalListings: number;
  pendingListings: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingKYC: 0,
    totalListings: 0,
    pendingListings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    fetchStats();
  }, [user, isAdmin, navigate, toast]);



  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch pending KYC count
      const { count: pendingKYCCount } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total listings count
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Fetch pending listings count
      const { count: pendingListingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval');

      // Fetch total revenue from payments
      const { data: revenueData } = await supabase
        .from('listing_payments')
        .select('amount')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        pendingKYC: pendingKYCCount || 0,
        totalListings: listingsCount || 0,
        pendingListings: pendingListingsCount || 0,
        totalRevenue
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

  if (!user || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, listings, and platform operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    MWK {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Manage Listings</TabsTrigger>
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="mt-6">
            <AdminListings />
          </TabsContent>
          
          <TabsContent value="kyc" className="mt-6">
            <AdminKYC />
          </TabsContent>

          <TabsContent value="banners" className="mt-6">
            <AdminBanners />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;