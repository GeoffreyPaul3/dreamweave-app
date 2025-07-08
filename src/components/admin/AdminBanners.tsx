import { useState, useEffect, useRef } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Pencil, X, RefreshCw, Plus, Loader2 } from 'lucide-react';

const BANNER_BUCKET = 'banners';
const MAX_BANNERS = 5;

const AdminBanners = () => {
  const [banners, setBanners] = useState<{ url: string; path: string }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase.storage.from(BANNER_BUCKET).list('', { limit: 100 });
    if (error) {
      setBanners([]);
      return;
    }
    const banners = (data || [])
      .map((file) => ({
        url: supabase.storage.from(BANNER_BUCKET).getPublicUrl(file.path || file.name).data.publicUrl + `?t=${Date.now()}`,
        path: file.path || file.name
      }));
    setBanners(banners);
  };

  const handleImageUploaded = async () => {
    setUploading(true);
    await fetchBanners();
    setUploading(false);
    setShowUpload(false);
    toast({ title: 'Banner uploaded', description: 'Banner image uploaded successfully.' });
    setEditingIndex(null);
  };

  const handleImageRemoved = async (path: string, idx: number) => {
    setDeletingIndex(idx);
    const { error } = await supabase.storage.from(BANNER_BUCKET).remove([path]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDeletingIndex(null);
      return;
    }
    setTimeout(async () => {
      await fetchBanners();
      setDeletingIndex(null);
      toast({ title: 'Banner removed', description: 'Banner image removed successfully.' });
    }, 500);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
  };

  const handleRefresh = async () => {
    await fetchBanners();
    toast({ title: 'Refreshed', description: 'Banner list updated.' });
  };

  // Add Banner Card always visible at the top
  const canAddBanner = banners.length < MAX_BANNERS && editingIndex === null && !showUpload;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Promotional Banners</CardTitle>
          <p className="text-gray-500 text-sm">Upload, edit, or remove up to {MAX_BANNERS} banners for the homepage slideshow. Recommended size: 1200x400px.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh banners">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Add Banner always at the top as a visible card/button */}
        <div className="flex flex-col gap-6">
          {canAddBanner && (
            <button
              type="button"
              className="flex items-center justify-between border-2 border-dashed border-primary/40 rounded-lg px-4 py-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative focus:outline-none"
              onClick={() => setShowUpload(true)}
              aria-label="Add Banner"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-primary" />
                <span className="text-primary font-semibold">Add Banner</span>
              </div>
            </button>
          )}
          {showUpload && (
            <div ref={uploadRef} className="border-2 border-primary/40 rounded-lg px-4 py-6 bg-white shadow flex flex-col items-center">
              <ImageUpload
                bucketName={BANNER_BUCKET}
                onImageUploaded={handleImageUploaded}
                maxImages={1}
                existingImages={[]}
                className="mb-2"
              />
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
            </div>
          )}
          {banners.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No banners uploaded yet.</div>
          ) : (
            banners.map((banner, idx) => (
              <div key={banner.path} className="relative group rounded-lg overflow-hidden shadow border flex flex-row items-center p-4">
                <img
                  src={banner.url}
                  alt={`Banner ${idx + 1}`}
                  className={`w-32 h-20 object-cover rounded-md transition-transform duration-500 group-hover:scale-105 ${deletingIndex === idx ? 'opacity-50' : ''}`}
                />
                <div className="flex-1 ml-6">
                  <div className="font-mono text-sm text-gray-700 break-all">{banner.path}</div>
                </div>
                <div className="flex flex-row gap-2 ml-4 z-10">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(idx)} title="Edit banner" disabled={deletingIndex === idx}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleImageRemoved(banner.path, idx)} title="Delete banner" disabled={deletingIndex === idx}>
                    {deletingIndex === idx ? <Loader2 className="animate-spin w-4 h-4" /> : <X className="w-4 h-4" />}
                  </Button>
                </div>
                {editingIndex === idx && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <p className="mb-2 text-sm">Replace this banner:</p>
                      <ImageUpload
                        bucketName={BANNER_BUCKET}
                        onImageUploaded={handleImageUploaded}
                        maxImages={1}
                        existingImages={[]}
                      />
                      <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setEditingIndex(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBanners; 