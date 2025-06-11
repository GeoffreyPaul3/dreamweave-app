<<<<<<< HEAD

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  payment_verified: boolean;
  featured_image: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin_listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!seller_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
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

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject' | 'delete') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', listingId);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Listing deleted successfully"
        });
      } else {
        const updateData: any = {
          admin_approved: action === 'approve',
          admin_approved_by: user.id,
          admin_approved_at: new Date().toISOString(),
          status: action === 'approve' ? 'active' : 'rejected'
        };

        const { error } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', listingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Listing ${action}d successfully`
        });
      }

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, paymentVerified: boolean) => {
    if (status === 'payment_pending') {
      return <Badge variant="secondary">Payment Pending</Badge>;
    }
    if (status === 'pending_approval' && paymentVerified) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading listings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {listings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No listings found</p>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={listing.featured_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                  alt={listing.title}
                  className="w-16 h-16 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {listing.profiles?.full_name} ({listing.profiles?.email})
                  </p>
                  <p className="text-sm font-medium">MWK {listing.price.toLocaleString()}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(listing.status, listing.payment_verified)}
                    {listing.payment_verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {listing.status === 'pending_approval' && listing.payment_verified && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleListingAction(listing.id, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleListingAction(listing.id, 'delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminListings;
=======

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  payment_verified: boolean;
  featured_image: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin_listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!seller_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
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

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject' | 'delete') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', listingId);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Listing deleted successfully"
        });
      } else {
        const updateData: any = {
          admin_approved: action === 'approve',
          admin_approved_by: user.id,
          admin_approved_at: new Date().toISOString(),
          status: action === 'approve' ? 'active' : 'rejected'
        };

        const { error } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', listingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Listing ${action}d successfully`
        });
      }

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, paymentVerified: boolean) => {
    if (status === 'payment_pending') {
      return <Badge variant="secondary">Payment Pending</Badge>;
    }
    if (status === 'pending_approval' && paymentVerified) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading listings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {listings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No listings found</p>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={listing.featured_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                  alt={listing.title}
                  className="w-16 h-16 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {listing.profiles?.full_name} ({listing.profiles?.email})
                  </p>
                  <p className="text-sm font-medium">MWK {listing.price.toLocaleString()}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(listing.status, listing.payment_verified)}
                    {listing.payment_verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {listing.status === 'pending_approval' && listing.payment_verified && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleListingAction(listing.id, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleListingAction(listing.id, 'delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminListings;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
