import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, ExternalLink, Star, Zap, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GalleryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [galleries, setGalleries] = useState<string[]>([]);
  const [isSponsored, setIsSponsored] = useState(false);
  const [rankingScore, setRankingScore] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (!user?.spaId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/spas/${user.spaId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(r => r.json())
      .then(data => {
        setGalleries(data.galleries ?? []);
        setIsSponsored(data.isSponsored ?? false);
        setRankingScore(data.rankingScore ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed || galleries.includes(trimmed)) return;
    setGalleries(prev => [...prev, trimmed]);
    setNewImageUrl('');
  };

  const removeImage = (url: string) => {
    setGalleries(prev => prev.filter(u => u !== url));
  };

  const save = async () => {
    if (!user?.spaId) return;
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/spas/${user.spaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ galleries })
      });
      toast({ title: 'Gallery saved!', description: 'Your photo gallery has been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save gallery.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Gallery & Discovery</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your photo gallery and understand how you rank in the marketplace.</p>
      </div>

      {/* Ranking Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Ranking Score</p>
              <p className="text-2xl font-bold text-amber-900">{loading ? '—' : rankingScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={isSponsored ? 'border-primary bg-primary/5' : ''}>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Sponsored</p>
              <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                {isSponsored ? 'Active — You appear first!' : 'Not active'}
              </p>
            </div>
            {isSponsored && <Badge className="bg-primary text-white">Live</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Gallery Photos</p>
              <p className="text-2xl font-bold text-neutral-900">{galleries.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Your Ranking Score Works</CardTitle>
          <CardDescription>Beauty Booker uses an automated algorithm to rank spas fairly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-neutral-50 border">
              <p className="font-semibold text-neutral-900 mb-1">⭐ Rating (40%)</p>
              <p className="text-neutral-500">Your average review rating from clients.</p>
            </div>
            <div className="p-4 rounded-lg bg-neutral-50 border">
              <p className="font-semibold text-neutral-900 mb-1">📅 Completed Bookings (30%)</p>
              <p className="text-neutral-500">More completed bookings = higher rank. Reliable spas are rewarded.</p>
            </div>
            <div className="p-4 rounded-lg bg-neutral-50 border">
              <p className="font-semibold text-neutral-900 mb-1">❌ Cancellation Rate (-30%)</p>
              <p className="text-neutral-500">High cancellations or no-shows hurt your rank.</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Pro Tip:</strong> Sponsored spas always appear first, regardless of score. Contact our team to activate sponsorship for your spa.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo Gallery</CardTitle>
          <CardDescription>Upload photos of your spa to attract more clients. High-quality images significantly improve booking rates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label>Add Image URL</Label>
              <Input
                placeholder="https://example.com/your-spa-photo.jpg"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addImage()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addImage} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>

          {galleries.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-xl">
              <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No gallery photos yet. Add some to showcase your spa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleries.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border aspect-video bg-neutral-100">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeImage(url)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Gallery'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
