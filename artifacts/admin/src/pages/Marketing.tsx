import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Facebook, Twitter, MessageCircle, Music2,
  Link2, Copy, Share2, Plus, Send, BarChart2, Eye, MousePointerClick,
  CalendarClock, CheckCircle2, Clock, AlertCircle, XCircle, Wifi,
  WifiOff, Sparkles, TrendingUp, Users, ShoppingBag, ExternalLink, Loader2, Bot, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Campaign {
  id: string; spaId: string; title: string; caption: string; hashtags: string;
  cta: string; platforms: string[]; imageUrl: string; deepLink: string;
  scheduledAt?: string; status: string; reach: number; clicks: number; bookingsAttributed: number; createdAt: string;
}
interface Connection { spaId: string; platform: string; connected: boolean; handle?: string; connectedAt?: string; }
interface Service { id: string; name: string; price: number; }
interface Product { id: string; name: string; price: number; }
interface TrainingClass { id: string; title: string; fee: number; }

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C', bg: 'bg-pink-50 border-pink-200' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2', bg: 'bg-blue-50 border-blue-200' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000', bg: 'bg-gray-50 border-gray-200' },
  { key: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle, color: '#25D366', bg: 'bg-green-50 border-green-200' },
  { key: 'x', label: 'X (Twitter)', icon: Twitter, color: '#1DA1F2', bg: 'bg-sky-50 border-sky-200' },
];

const CTA_OPTIONS = [
  { value: 'book_now', label: 'Book Now' },
  { value: 'view_offer', label: 'View Offer' },
  { value: 'shop_products', label: 'Shop Products' },
  { value: 'register_class', label: 'Register for Class' },
];

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
  scheduled: { color: 'bg-blue-100 text-blue-700', icon: CalendarClock, label: 'Scheduled' },
  published: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Published' },
  failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
};

const BASE_URL = import.meta.env.VITE_CLIENT_URL || window.location.origin;

function generateDeepLink(type: string, spaId: string, entityId: string) {
  const paths: Record<string, string> = {
    spa: `/spa/${entityId}`,
    service: `/spa/${spaId}/service/${entityId}`,
    therapist: `/spa/${spaId}/therapist/${entityId}`,
    product: `/spa/${spaId}/product/${entityId}`,
    class: `/spa/${spaId}/class/${entityId}`,
  };
  return `${BASE_URL}${paths[type] || `/spa/${spaId}`}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Marketing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const spaId = user?.spaId || 's5';
  const [activeTab, setActiveTab] = useState<'channels' | 'create' | 'links' | 'campaigns' | 'analytics'>('channels');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  // Create Post form state
  const [form, setForm] = useState({
    title: '', caption: '', hashtags: '', cta: 'book_now',
    platforms: [] as string[], imageUrl: '', deepLink: '', scheduledAt: '',
    status: 'draft' as string,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/messages/campaigns?spaId=${spaId}`).then(r => r.json()),
      fetch(`/api/messages/connections?spaId=${spaId}`).then(r => r.json()),
      fetch(`/api/services?spaId=${spaId}`).then(r => r.json()),
      fetch(`/api/products?spaId=${spaId}`).then(r => r.json()),
      fetch(`/api/classes?spaId=${spaId}`).then(r => r.json()),
    ]).then(([camps, conns, srvs, prods, clss]) => {
      setCampaigns(Array.isArray(camps) ? camps : []);
      // Ensure all platforms have a connection record
      const allPlatforms = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'x'];
      const connMap: Record<string, Connection> = {};
      (Array.isArray(conns) ? conns : []).forEach((c: Connection) => { connMap[c.platform] = c; });
      setConnections(allPlatforms.map(p => connMap[p] || { spaId, platform: p, connected: false }));
      setServices(Array.isArray(srvs) ? srvs : []);
      setProducts(Array.isArray(prods) ? prods : []);
      setClasses(Array.isArray(clss) ? clss : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [spaId]);

  const toggleConnection = async (platform: string, current: boolean) => {
    const handle = current ? undefined : `@${platform}_demo_handle`;
    await fetch('/api/messages/connections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaId, platform, connected: !current, handle }),
    });
    setConnections(prev => prev.map(c => c.platform === platform ? { ...c, connected: !current, handle } : c));
    toast({ title: !current ? `${platform} connected! (Demo Mode)` : `${platform} disconnected`, description: !current ? 'This is a simulated connection for demo purposes.' : '' });
  };

  const submitCampaign = async () => {
    if (!form.title || !form.caption) { toast({ title: 'Title and caption are required', variant: 'destructive' }); return; }
    const res = await fetch('/api/messages/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, spaId }),
    });
    const newCamp = await res.json();
    setCampaigns(prev => [newCamp, ...prev]);
    setForm({ title: '', caption: '', hashtags: '', cta: 'book_now', platforms: [], imageUrl: '', deepLink: '', scheduledAt: '', status: 'draft' });
    toast({ title: 'Post saved as draft!', description: 'Demo Mode: No actual publishing occurs.' });
    setActiveTab('campaigns');
  };

  const publishCampaign = async (id: string) => {
    await fetch(`/api/messages/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published', reach: Math.floor(Math.random() * 3000 + 1000), clicks: Math.floor(Math.random() * 200 + 50) }),
    });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'published' } : c));
    toast({ title: 'Post published! (Demo Mode)', description: 'In a live environment, this would post to your connected social platforms.' });
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied!', description: link });
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: 'Please enter a prompt first', description: 'e.g. "Promote our Deep Tissue Massage for slow Mondays"', variant: 'destructive' });
      return;
    }
    setAiGenerating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/ai/generate-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const generated = await res.json();
      setForm(f => ({
        ...f,
        title: generated.title || f.title,
        caption: generated.caption || f.caption,
        hashtags: generated.hashtags || f.hashtags,
        cta: generated.cta || f.cta,
        platforms: generated.platforms || f.platforms,
      }));
      setShowAiPrompt(false);
      setAiPrompt('');
      toast({ title: '✨ Campaign generated!', description: 'The form has been filled with AI-generated content. Review and edit as needed.' });
    } catch (e: any) {
      toast({ title: 'AI generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  const tabs = [
    { key: 'channels', label: 'Channels' },
    { key: 'create', label: 'Create Post' },
    { key: 'links', label: 'Deep Links' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'analytics', label: 'Analytics' },
  ];

  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalBookings = campaigns.reduce((s, c) => s + c.bookingsAttributed, 0);
  const avgConversion = totalClicks > 0 ? ((totalBookings / totalClicks) * 100).toFixed(1) : '0.0';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing & Social Media</h1>
          <p className="text-muted-foreground mt-1">Manage social channels, create posts, and track performance</p>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 flex items-center gap-1">
          <Wifi className="w-3 h-3" /> Demo Mode
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.key ? 'bg-white border border-b-white border-gray-200 -mb-px text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CHANNELS TAB ─────────────────────────────────────────── */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground bg-orange-50 border border-orange-200 rounded-lg p-3">
            <strong>Demo Mode:</strong> Connecting channels is simulated. In a live deployment, OAuth flows would link your real social accounts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map(p => {
              const conn = connections.find(c => c.platform === p.key);
              const Icon = p.icon;
              return (
                <div key={p.key} className={`flex items-center justify-between p-4 rounded-xl border-2 ${conn?.connected ? p.bg : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.label}</p>
                      {conn?.connected
                        ? <p className="text-xs text-muted-foreground">{conn.handle}</p>
                        : <p className="text-xs text-muted-foreground">Not connected</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn?.connected ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                    <Button variant={conn?.connected ? 'outline' : 'default'} size="sm"
                      onClick={() => toggleConnection(p.key, conn?.connected || false)}>
                      {conn?.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CREATE POST TAB ──────────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            {/* AI Generate Button */}
            {!showAiPrompt ? (
              <button
                onClick={() => setShowAiPrompt(true)}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-700">✨ Generate with AI</p>
                  <p className="text-xs text-purple-500">Describe what you want to promote and Bea AI will write it for you</p>
                </div>
                <Sparkles className="h-4 w-4 text-purple-400 ml-auto group-hover:text-purple-600 transition-colors" />
              </button>
            ) : (
              <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-700">What do you want to promote?</p>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder='e.g. "Promote our Hot Stone Massage for couples this weekend with a 20% discount"'
                  className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="flex gap-2">
                  <Button onClick={generateWithAI} disabled={aiGenerating} className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white flex-1">
                    {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {aiGenerating ? 'Generating...' : 'Generate Campaign'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAiPrompt(false); setAiPrompt(''); }}>Cancel</Button>
                </div>
              </div>
            )}
            <div>
              <Label>Post Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. July Beach Glow Promo" className="mt-1" />
            </div>
            <div>
              <Label>Caption</Label>
              <textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write your post caption..." />
              <p className="text-xs text-muted-foreground mt-1">{form.caption.length}/2200</p>
            </div>
            <div>
              <Label>Hashtags</Label>
              <Input value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))} placeholder="#KilifiSpa #BeachGlow" className="mt-1" />
            </div>
            <div>
              <Label>Call to Action</Label>
              <select value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CTA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." className="mt-1" />
            </div>
            <div>
              <Label>Deep Link</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.deepLink} onChange={e => setForm(f => ({ ...f, deepLink: e.target.value }))} placeholder="beautybooker://spa/s5/service/srv11" />
                <Button variant="outline" size="sm" onClick={() => copyLink(form.deepLink)} disabled={!form.deepLink}><Copy className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {services.slice(0, 3).map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, deepLink: generateDeepLink('service', spaId, s.id) }))}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map(p => {
                  const sel = form.platforms.includes(p.key);
                  const Icon = p.icon;
                  return (
                    <button key={p.key} onClick={() => setForm(f => ({ ...f, platforms: sel ? f.platforms.filter(x => x !== p.key) : [...f.platforms, p.key] }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${sel ? 'text-white' : 'bg-white text-gray-600 border-gray-300'}`}
                      style={sel ? { backgroundColor: p.color, borderColor: p.color } : {}}>
                      <Icon className="w-3.5 h-3.5" /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value, status: e.target.value ? 'scheduled' : 'draft' }))} className="mt-1" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={submitCampaign}>Save as Draft</Button>
              <Button onClick={() => { submitCampaign(); }} className="flex items-center gap-2">
                <Send className="w-4 h-4" /> {form.scheduledAt ? 'Schedule Post' : 'Publish Now (Demo)'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Post Preview</h3>
            {/* Instagram Preview */}
            <div className="border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-white p-3 flex items-center gap-2 border-b">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div><p className="text-xs font-semibold">your_spa</p><p className="text-xs text-muted-foreground">Sponsored</p></div>
              </div>
              {form.imageUrl
                ? <img src={form.imageUrl} alt="Post" className="w-full aspect-square object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'; }} />
                : <div className="w-full aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center"><Sparkles className="w-12 h-12 text-pink-300" /></div>}
              <div className="p-3 bg-white">
                <p className="text-xs text-gray-800 font-medium">{form.caption || 'Your caption will appear here...'}</p>
                <p className="text-xs text-blue-500 mt-1">{form.hashtags || '#hashtags'}</p>
                {form.cta && <button className="mt-2 w-full text-xs py-2 rounded-lg bg-primary text-white font-semibold">{CTA_OPTIONS.find(o => o.value === form.cta)?.label}</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEEP LINKS TAB ──────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Generate shareable links for any part of your spa. Share via WhatsApp, copy, or use in social posts.</p>
          {/* Spa link */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Spa Profile</h3>
            <LinkRow label="Spa Homepage" link={generateDeepLink('spa', spaId, spaId)} onCopy={copyLink} />
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Services</h3>
            {services.map(s => <LinkRow key={s.id} label={`${s.name} — Ksh ${s.price.toLocaleString()}`} link={generateDeepLink('service', spaId, s.id)} onCopy={copyLink} />)}
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /> Products</h3>
            {products.map(p => <LinkRow key={p.id} label={`${p.name} — Ksh ${p.price.toLocaleString()}`} link={generateDeepLink('product', spaId, p.id)} onCopy={copyLink} />)}
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Classes</h3>
            {classes.map(c => <LinkRow key={c.id} label={`${c.title} — Ksh ${c.fee.toLocaleString()}`} link={generateDeepLink('class', spaId, c.id)} onCopy={copyLink} />)}
          </div>
        </div>
      )}

      {/* ── CAMPAIGNS TAB ───────────────────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total</p>
            <Button size="sm" onClick={() => setActiveTab('create')} className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Post</Button>
          </div>
          {campaigns.length === 0
            ? <div className="text-center py-16 text-muted-foreground"><Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No campaigns yet. Create your first post!</p></div>
            : campaigns.map(c => {
              const StatusIcon = STATUS_CONFIG[c.status]?.icon || Clock;
              return (
                <div key={c.id} className="bg-white rounded-xl border p-4 flex flex-col md:flex-row gap-4">
                  {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full md:w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.caption}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[c.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />{STATUS_CONFIG[c.status]?.label}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.reach.toLocaleString()} reach</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{c.clicks} clicks</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{c.bookingsAttributed} bookings</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => copyLink(c.deepLink)} className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Link</Button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(c.caption + ' ' + c.deepLink)}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 border-green-200"><Share2 className="w-3 h-3" /> WhatsApp</Button>
                      </a>
                      {c.status === 'draft' && <Button size="sm" onClick={() => publishCampaign(c.id)} className="flex items-center gap-1"><Send className="w-3 h-3" /> Publish</Button>}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ── ANALYTICS TAB ───────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground bg-orange-50 border border-orange-200 rounded-lg p-3">
            <strong>Demo Mode:</strong> These analytics are simulated. Live analytics would require connected platform accounts.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reach', value: totalReach.toLocaleString(), icon: Eye, color: 'text-blue-600 bg-blue-50' },
              { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-purple-600 bg-purple-50' },
              { label: 'Bookings Attributed', value: totalBookings.toLocaleString(), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
              { label: 'Conversion Rate', value: `${avgConversion}%`, icon: BarChart2, color: 'text-orange-600 bg-orange-50' },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl border p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.color} mb-3`}><Icon className="w-5 h-5" /></div>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              );
            })}
          </div>
          <div>
            <h3 className="font-semibold mb-3">Performance by Platform</h3>
            <div className="bg-white rounded-xl border p-4 space-y-3">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                const platformCamps = campaigns.filter(c => c.platforms.includes(p.key));
                const reach = platformCamps.reduce((s, c) => s + c.reach, 0);
                const clicks = platformCamps.reduce((s, c) => s + c.clicks, 0);
                const maxReach = Math.max(...PLATFORMS.map(pp => campaigns.filter(c => c.platforms.includes(pp.key)).reduce((s, c) => s + c.reach, 0)), 1);
                return (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-muted-foreground">{reach.toLocaleString()} reach · {clicks} clicks</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${(reach / maxReach) * 100}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Component ─────────────────────────────────────────────────────────
function LinkRow({ label, link, onCopy }: { label: string; link: string; onCopy: (l: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white mb-2 hover:border-primary/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{link}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={() => onCopy(link)}><Copy className="w-3 h-3" /></Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="text-green-600 border-green-200"><MessageCircle className="w-3 h-3" /></Button>
        </a>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3" /></Button>
        </a>
      </div>
    </div>
  );
}
