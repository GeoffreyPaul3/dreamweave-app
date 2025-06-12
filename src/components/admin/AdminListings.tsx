import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2, Eye, Check, X } from 'lucide-react';

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
  location: string;
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {listings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No listings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <img
                      src={listing.featured_image}
                      alt={listing.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold truncate flex-1">{listing.title}</h3>
                      <Badge
                        variant={
                          listing.status === 'active'
                            ? 'default'
                            : listing.status === 'pending_approval'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="truncate">
                        <span className="font-medium">Seller:</span> {listing.profiles?.full_name}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Location:</span> {listing.location}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Price:</span> MWK {listing.price.toLocaleString()}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Listed:</span> {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {listing.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleListingAction(listing.id, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleListingAction(listing.id, 'reject')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleListingAction(listing.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminListings;
