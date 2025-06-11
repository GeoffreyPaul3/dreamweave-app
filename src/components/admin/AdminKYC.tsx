
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, Download } from 'lucide-react';
=======
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8

interface KYCSubmission {
  id: string;
  user_id: string;
<<<<<<< HEAD
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
=======
  address: string;
  document_type: string;
  document_url: string;
  full_name: string;
  phone_number: string;
  rejection_reason: string | null;
  status: string; // Changed from strict union to string
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  updated_at: string;
}

const AdminKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
<<<<<<< HEAD
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      // Update KYC submission status
      const { error: kycError } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'approved',
=======
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'verified',
          reviewed_by: user?.id,
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

<<<<<<< HEAD
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
=======
      if (error) throw error;

      // Update user's kyc_status in profiles table
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ kyc_status: 'verified' })
          .eq('id', submission.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: "KYC submission approved successfully",
      });

      fetchSubmissions();
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (submissionId: string) => {
<<<<<<< HEAD
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
=======
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

<<<<<<< HEAD
      toast({
        title: "Success",
        description: "KYC submission rejected"
      });

      fetchKYCSubmissions();
      setSelectedSubmission(null);
      setRejectionReason('');
=======
      // Optionally, you might want to update the user's profile as well
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ kyc_status: 'rejected' })
          .eq('id', submission.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: "KYC submission rejected successfully",
      });
      fetchSubmissions();
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

<<<<<<< HEAD
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{submission.full_name}</h4>
                      <p className="text-sm text-gray-600">
                        {submission.profiles?.email || 'No email available'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No KYC submissions found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedSubmission ? 'Review Submission' : 'Select a Submission'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubmission ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedSubmission.full_name}</p>
                    <p><strong>Email:</strong> {selectedSubmission.profiles?.email || 'No email available'}</p>
                    <p><strong>Phone:</strong> {selectedSubmission.phone_number}</p>
                    <p><strong>Address:</strong> {selectedSubmission.address}</p>
                    <p><strong>Document Type:</strong> {selectedSubmission.document_type}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Document</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.document_url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedSubmission.document_url;
                        link.download = `${selectedSubmission.full_name}_${selectedSubmission.document_type}`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove(selectedSubmission.id)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedSubmission.id)}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSubmission.rejection_reason && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {selectedSubmission.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Select a submission to review
              </p>
            )}
          </CardContent>
        </Card>
=======
  if (loading) {
    return <div>Loading KYC Submissions...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">KYC Submissions</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of KYC submissions for user verification.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.user_id}</TableCell>
                <TableCell>{submission.full_name}</TableCell>
                <TableCell>{submission.phone_number}</TableCell>
                <TableCell>{submission.document_type}</TableCell>
                <TableCell>
                  <Badge variant={
                    submission.status === 'pending' ? 'secondary' :
                    submission.status === 'verified' ? 'default' : 'destructive'
                  }>
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {submission.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(submission.id)}
                        className="mr-2"
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(submission.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                {submissions.length} Total Submissions
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
      </div>
    </div>
  );
};

export default AdminKYC;
