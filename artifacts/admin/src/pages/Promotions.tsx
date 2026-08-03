import { useState } from "react";
import { Plus, Search, Tag, Calendar as CalendarIcon, Edit2, Trash2, X, Save, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Promotion {
  id: number;
  name: string;
  code: string;
  discount: string;
  appliesTo: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
  minSpend: number;
}

const INITIAL_PROMOTIONS: Promotion[] = [
  { id: 1, name: "Summer Glow Specials", code: "SUMMER20", discount: "20% OFF", appliesTo: "All Facials", startDate: "2026-06-01", endDate: "2026-08-31", status: "Active", minSpend: 2000 },
  { id: 2, name: "Mother's Day Package", code: "MOM500", discount: "KSH 500 OFF", appliesTo: "All Packages", startDate: "2026-05-01", endDate: "2026-05-15", status: "Expired", minSpend: 3000 },
  { id: 3, name: "Product Bundle Deal", code: "BUNDLE3", discount: "Buy 2 Get 1", appliesTo: "Skincare Products", startDate: "2026-07-01", endDate: "2026-07-31", status: "Active", minSpend: 0 },
  { id: 4, name: "Holiday Relaxation", code: "HOLIDAY15", discount: "15% OFF", appliesTo: "All Massages", startDate: "2026-12-01", endDate: "2026-12-31", status: "Scheduled", minSpend: 2500 },
];

const APPLIES_OPTIONS = ["All Services", "All Facials", "All Massages", "All Packages", "Skincare Products", "Haircare", "Nail Services", "Body Treatments"];

const EMPTY_PROMO = { name: "", code: "", discount: "", appliesTo: "All Services", startDate: "", endDate: "", status: "Scheduled" as const, minSpend: 0 };

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [search, setSearch] = useState("");
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPromo, setNewPromo] = useState({ ...EMPTY_PROMO });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = promotions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = promotions.filter(p => p.status === "Active").length;
  const scheduledCount = promotions.filter(p => p.status === "Scheduled").length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveEdit = () => {
    if (!editingPromo) return;
    setPromotions(prev => prev.map(p => p.id === editingPromo.id ? editingPromo : p));
    setEditingPromo(null);
  };

  const handleAddPromo = () => {
    if (!newPromo.name.trim() || !newPromo.code.trim()) return;
    const newId = Math.max(...promotions.map(p => p.id)) + 1;
    setPromotions(prev => [...prev, { ...newPromo, id: newId }]);
    setNewPromo({ ...EMPTY_PROMO });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const PromoForm = ({ data, onChange, onSave, onCancel, title }: any) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Campaign Name</Label>
              <Input placeholder="e.g. New Year Special" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Promo Code</Label>
              <Input placeholder="e.g. NEWYEAR25" value={data.code} onChange={e => onChange({ ...data, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input placeholder="e.g. 20% OFF or KSH 500 OFF" value={data.discount} onChange={e => onChange({ ...data, discount: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Applies To</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={data.appliesTo} onChange={e => onChange({ ...data, appliesTo: e.target.value })}>
                {APPLIES_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Min Spend (KSH)</Label>
              <Input type="number" placeholder="0" value={data.minSpend || ""} onChange={e => onChange({ ...data, minSpend: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={data.status} onChange={e => onChange({ ...data, status: e.target.value })}>
                <option>Active</option><option>Scheduled</option><option>Expired</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={data.startDate} onChange={e => onChange({ ...data, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={data.endDate} onChange={e => onChange({ ...data, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" /> Save Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Promotions & Discounts</h2>
          <p className="text-muted-foreground mt-1 text-sm">Create and manage marketing campaigns and offers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Campaigns</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{scheduledCount}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{promotions.length}</div></CardContent>
        </Card>
      </div>

      {isAdding && <PromoForm title="Create Campaign" data={newPromo} onChange={setNewPromo} onSave={handleAddPromo} onCancel={() => setIsAdding(false)} />}
      {editingPromo && <PromoForm title="Edit Campaign" data={editingPromo} onChange={setEditingPromo} onSave={handleSaveEdit} onCancel={() => setEditingPromo(null)} />}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-destructive">Confirm Delete</CardTitle>
              <CardDescription>This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Delete campaign <strong>{promotions.find(p => p.id === deleteConfirm)?.name}</strong>?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteConfirm!)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your seasonal offers and discount codes</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search promotions..." className="pl-9 bg-white/50 border-white/60 focus:bg-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 bg-white/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Min Spend</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-white/60 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        {promo.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="flex items-center gap-1.5 font-mono text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 transition-colors cursor-pointer"
                        onClick={() => handleCopyCode(promo.code)}
                      >
                        {promo.code}
                        {copiedCode === promo.code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{promo.discount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{promo.appliesTo}</TableCell>
                    <TableCell className="text-sm">{promo.minSpend > 0 ? `Ksh ${promo.minSpend.toLocaleString()}` : "None"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(promo.startDate).toLocaleDateString()} – {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={promo.status === "Active" ? "default" : promo.status === "Scheduled" ? "secondary" : "outline"}
                        className={promo.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : promo.status === "Expired" ? "opacity-50" : ""}
                      >
                        {promo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditingPromo(promo)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteConfirm(promo.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No campaigns found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
