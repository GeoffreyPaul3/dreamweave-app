<<<<<<< HEAD

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

const kycSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Address is required'),
});

type KYCFormData = z.infer<typeof kycSchema>;

interface KYCFormProps {
  onSuccess?: () => void;
}

const KYCForm = ({ onSuccess }: KYCFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema)
  });

  const documentType = watch('documentType');

  const onSubmit = async (data: KYCFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit KYC",
        variant: "destructive"
      });
      return;
    }

    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a document image",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .insert({
          user_id: user.id,
          document_type: data.documentType,
          document_url: documentUrl,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          address: data.address,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "KYC submission successful! Your account will be reviewed within 24-48 hours."
      });

      if (onSuccess) onSuccess();
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <p className="text-sm text-gray-600">
          Complete your Know Your Customer verification to start selling on DreamWeave
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select onValueChange={(value) => setValue('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-sm text-red-500">{errors.documentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter your full address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Document Image</Label>
            <p className="text-sm text-gray-600">
              Upload a clear photo of your {documentType || 'selected document'}
            </p>
            <ImageUpload
              bucketName="kyc-documents"
              onImageUploaded={setDocumentUrl}
              maxImages={1}
              existingImages={documentUrl ? [documentUrl] : []}
              onImageRemoved={() => setDocumentUrl('')}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit KYC Verification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default KYCForm;
=======

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

const kycSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Address is required'),
});

type KYCFormData = z.infer<typeof kycSchema>;

interface KYCFormProps {
  onSuccess?: () => void;
}

const KYCForm = ({ onSuccess }: KYCFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema)
  });

  const documentType = watch('documentType');

  const onSubmit = async (data: KYCFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit KYC",
        variant: "destructive"
      });
      return;
    }

    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a document image",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .insert({
          user_id: user.id,
          document_type: data.documentType,
          document_url: documentUrl,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          address: data.address,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "KYC submission successful! Your account will be reviewed within 24-48 hours."
      });

      if (onSuccess) onSuccess();
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <p className="text-sm text-gray-600">
          Complete your Know Your Customer verification to start selling on DreamWeave
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select onValueChange={(value) => setValue('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-sm text-red-500">{errors.documentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter your full address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Document Image</Label>
            <p className="text-sm text-gray-600">
              Upload a clear photo of your {documentType || 'selected document'}
            </p>
            <ImageUpload
              bucketName="kyc-documents"
              onImageUploaded={setDocumentUrl}
              maxImages={1}
              existingImages={documentUrl ? [documentUrl] : []}
              onImageRemoved={() => setDocumentUrl('')}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit KYC Verification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default KYCForm;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
