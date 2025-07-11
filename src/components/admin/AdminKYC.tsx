/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, Download } from 'lucide-react';

interface KYCSubmission {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
  } | null;
}

const AdminKYC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCSubmissions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('kyc_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_submissions'
        },
        () => {
          fetchKYCSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKYCSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select(`
          *,
          profiles!user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data?.map(item => ({
        ...item,
        profiles: item.profiles ? {
          email: (item.profiles as any).email || ''
        } : { email: '' }
      })) || [];
      
      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      // Update KYC submission status
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (kycError) throw kycError;

      // Update user profile to mark as seller with verified KYC
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_seller: true,
          kyc_status: 'verified'
        })
        .eq('id', submission.user_id);

      if (profileError) throw profileError;

      // Get user email and name for notification
      const { data: userData } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', submission.user_id)
        .single();

      const EMAIL_FUNCTION_URL = import.meta.env.VITE_EMAIL_FUNCTION_URL || 'http://localhost:54321/functions/v1';

      if (userData) {
        // Get the user's JWT for the Authorization header
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData?.session?.access_token;

        await fetch(`${EMAIL_FUNCTION_URL}/email-notifications`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            event: 'kyc_approved',
            userEmail: userData.email,
            userName: userData.full_name
          })
        });
      }

      toast({
        title: "Success",
        description: "KYC submission verified successfully. User can now create listings."
      });

      fetchKYCSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      if (!rejectionReason.trim()) {
        toast({
          title: "Error",
          description: "Please provide a reason for rejection",
          variant: "destructive"
        });
        return;
      }

      // Update KYC submission status
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (kycError) throw kycError;

      // Get user email and name for notification
      const { data: userData } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', submission.user_id)
        .single();

      const EMAIL_FUNCTION_URL = import.meta.env.VITE_EMAIL_FUNCTION_URL || 'http://localhost:54321/functions/v1';

      if (userData) {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData?.session?.access_token;

        await fetch(`${EMAIL_FUNCTION_URL}/email-notifications`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            event: 'kyc_rejected',
            userEmail: userData.email,
            userName: userData.full_name,
            reason: rejectionReason // make sure this variable holds the rejection reason
          })
        });
      }

      toast({
        title: "Success",
        description: "KYC submission rejected successfully"
      });

      fetchKYCSubmissions();
      setSelectedSubmission(null);
      setRejectionReason('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (documentUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .download(documentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentUrl.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KYC Submissions List */}
      <div className="lg:col-span-2 space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No KYC submissions found</p>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{submission.full_name}</h3>
                      <Badge
                        variant={
                          submission.status === 'pending'
                            ? 'default'
                            : submission.status === 'verified'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="truncate">
                        <span className="font-medium">Email:</span> {submission.profiles?.email}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Phone:</span> {submission.phone_number}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Address:</span> {submission.address}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Document:</span> {submission.document_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(submission.document_url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Panel */}
      {selectedSubmission && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Review Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Submission Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {selectedSubmission.full_name}</p>
                <p><span className="font-medium">Email:</span> {selectedSubmission.profiles?.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedSubmission.phone_number}</p>
                <p><span className="font-medium">Address:</span> {selectedSubmission.address}</p>
                <p><span className="font-medium">Document:</span> {selectedSubmission.document_type}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(selectedSubmission.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedSubmission.status === 'pending' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleApprove(selectedSubmission.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleReject(selectedSubmission.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </>
            )}

            {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
              <div className="space-y-2">
                <h3 className="font-medium">Rejection Reason</h3>
                <p className="text-sm text-gray-600">{selectedSubmission.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminKYC;
