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
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (kycError) throw kycError;

      // Update user profile to mark as seller with approved KYC
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_seller: true,
          kyc_status: 'approved'
        })
        .eq('id', submission.user_id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "KYC submission approved successfully. User can now create listings."
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">KYC Submissions</h2>
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No KYC submissions found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSubmission?.id === submission.id
                      ? 'border-primary'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{submission.full_name}</h3>
                        <p className="text-sm text-gray-500">{submission.profiles?.email}</p>
                        <p className="text-sm text-gray-500">{submission.phone_number}</p>
                      </div>
                      <Badge
                        variant={
                          submission.status === 'pending'
                            ? 'default'
                            : submission.status === 'approved'
                            ? 'success'
                            : 'destructive'
                        }
                      >
                        {submission.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submission Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Submission Details</h2>
          {selectedSubmission ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedSubmission.full_name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedSubmission.profiles?.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedSubmission.phone_number}</p>
                    <p><span className="text-gray-500">Address:</span> {selectedSubmission.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Document Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-500">Document Type:</span> {selectedSubmission.document_type}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedSubmission.document_url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Review Actions</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleApprove(selectedSubmission.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter reason for rejection"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleReject(selectedSubmission.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
                  <div>
                    <h3 className="font-medium">Rejection Reason</h3>
                    <p className="mt-2 text-gray-600">{selectedSubmission.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Select a submission to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKYC;
