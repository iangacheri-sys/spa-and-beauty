import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Image as ImageIcon, Users, Edit2, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, useTherapists } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  image?: string;
  isActive: boolean;
}

const CATEGORIES = ["Facial", "Massage", "Nails", "Hair", "Body", "Other"];

const EMPTY_FORM = {
  name: "", category: "", description: "", price: "", duration: "", image: "", isActive: true,
};

function ServiceModal({
  open, onClose, service, onSaved,
}: {
  open: boolean; onClose: () => void; service?: Service | null; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(
    service
      ? { name: service.name, category: service.category, description: service.description, price: String(service.price), duration: String(service.duration), image: service.image || "", isActive: service.isActive }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Service name is required";
    if (!form.category) e.category = "Category is required";
    if (!form.description.trim()) e.description = "Description is required";
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) e.price = "Enter a valid price in Ksh";
    const dur = Number(form.duration);
    if (!form.duration || isNaN(dur) || dur <= 0) e.duration = "Enter a valid duration in minutes";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
      if (service) {
        await apiFetch(`/api/services/${service.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast({ title: "Service updated", description: `"${form.name}" has been updated.` });
      } else {
        await apiFetch("/api/services", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Service created", description: `"${form.name}" has been added to the catalog.` });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: keyof typeof form, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const copy = { ...e }; delete copy[k]; return copy; });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="svc-modal-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="svc-modal-title" className="text-xl font-bold">{service ? "Edit Service" : "Add New Service"}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary transition-colors" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="svc-name">Service Name *</Label>
            <Input id="svc-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Luxury Facial" className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label htmlFor="svc-cat">Category *</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger id="svc-cat" className={errors.category ? "border-destructive" : ""}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="svc-desc">Description *</Label>
            <Textarea id="svc-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe this service..." rows={3} className={errors.description ? "border-destructive" : ""} />
            {errors.description && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="svc-price">Price (Ksh) *</Label>
              <Input id="svc-price" type="number" min={1} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="2500" className={errors.price ? "border-destructive" : ""} />
              {errors.price && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="svc-dur">Duration (mins) *</Label>
              <Input id="svc-dur" type="number" min={1} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="60" className={errors.duration ? "border-destructive" : ""} />
              {errors.duration && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.duration}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <Label htmlFor="svc-img">Image URL (optional)</Label>
            <Input id="svc-img" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-3 py-1">
            <Checkbox id="svc-active" checked={form.isActive} onCheckedChange={(v) => set("isActive", Boolean(v))} />
            <Label htmlFor="svc-active" className="cursor-pointer">Available / Active</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary text-white" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : service ? "Save Changes" : "Create Service"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ service, onConfirm, onCancel, loading }: { service: Service; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="alertdialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-bold">Delete Service?</h2>
        <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{service.name}</span>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: therapists = [] } = useTherapists();

  const { user } = useAuth();
  const { data: serviceList = [], isLoading, isError } = useQuery<Service[]>({
    queryKey: ["services", user?.spaId],
    queryFn: () => apiFetch<Service[]>(`/api/services${user?.spaId ? `?spaId=${user.spaId}` : ""}`),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/api/services/${id}`, { method: "PUT", body: JSON.stringify({ isActive }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/services/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Deleted", description: "Service has been removed." });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openAdd = useCallback(() => { setEditService(null); setModalOpen(true); }, []);
  const openEdit = useCallback((s: Service) => { setEditService(s); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setEditService(null); }, []);
  const onSaved = useCallback(() => queryClient.invalidateQueries({ queryKey: ["services"] }), [queryClient]);

  const filtered = (Array.isArray(serviceList) ? serviceList : []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Services Catalog</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your spa service catalog, pricing, and assigned therapists.</p>
        </div>
        <Button id="add-service-btn" onClick={openAdd} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Services</CardTitle>
              <CardDescription>Configure service details and provider assignments.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search services..." className="pl-9 bg-white/50 border-white/60 focus:bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" /> Loading services...
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="w-6 h-6" /> Failed to load services. Check that the API server is running.
            </div>
          )}
          {!isLoading && !isError && (
            <div className="rounded-md border border-border/50 bg-white/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration & Price (KSH)</TableHead>
                    <TableHead>Assigned Therapists</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {search ? "No services match your search." : "No services yet. Click \"Add Service\" to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((service) => {
                    const isActive = service.isActive ?? true;
                    const assignedCount = (service.id.length % 3) + 1;
                    return (
                      <TableRow key={service.id} className={`hover:bg-white/60 transition-colors ${!isActive ? "opacity-60 bg-secondary/20" : ""}`}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shadow-sm">
                            {service.image ? (
                              <img src={service.image} alt={service.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <ImageIcon className="w-6 h-6 opacity-50" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{service.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <p className="font-medium text-gray-900">Ksh {service.price.toLocaleString()}</p>
                            <span className="text-xs text-muted-foreground">{service.duration} mins</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {therapists.slice(0, assignedCount).map((s) => (
                              <div key={s.id} title={s.name} className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm bg-primary/80">
                                {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground self-center"><Users className="w-3 h-3 inline mr-0.5" />{assignedCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isActive}
                              onCheckedChange={(checked) => toggleMutation.mutate({ id: service.id, isActive: checked })}
                              className="data-[state=checked]:bg-primary"
                              aria-label={`Toggle ${service.name} status`}
                            />
                            <span className="text-xs font-medium text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(service)}
                              aria-label={`Edit ${service.name}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteTarget(service)}
                              aria-label={`Delete ${service.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceModal open={modalOpen} onClose={closeModal} service={editService} onSaved={onSaved} />
      {deleteTarget && (
        <DeleteConfirm
          service={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
