import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, MapPin, GraduationCap, Clock, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle, UserMinus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, useClasses } from "@/lib/api";

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "enrolled" | "waitlist";
  registrationDate: string;
}

interface TrainingClass {
  id: string;
  title: string;
  instructor: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  fee: number;
  location: string;
  image?: string;
  isPublished: boolean;
  enrolled: Enrollment[];
}

const EMPTY_FORM = {
  title: "", instructor: "", description: "", date: "", startTime: "", endTime: "",
  capacity: "", fee: "", location: "", image: "", isPublished: true,
};

type ClassForm = typeof EMPTY_FORM;

function ClassModal({
  open, onClose, cls, onSaved,
}: {
  open: boolean; onClose: () => void; cls?: TrainingClass | null; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ClassForm>(
    cls
      ? {
          title: cls.title, instructor: cls.instructor, description: cls.description,
          date: cls.date, startTime: cls.startTime, endTime: cls.endTime,
          capacity: String(cls.capacity), fee: String(cls.fee),
          location: cls.location, image: cls.image || "", isPublished: cls.isPublished,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.instructor.trim()) e.instructor = "Instructor is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.date) e.date = "Date is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endTime) e.endTime = "End time is required";
    else if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      e.endTime = "End time must be after start time";
    }
    const cap = Number(form.capacity);
    if (!form.capacity || isNaN(cap) || cap < 1) e.capacity = "Enter a valid capacity (min 1)";
    const fee = Number(form.fee);
    if (!form.fee || isNaN(fee) || fee < 0) e.fee = "Enter a valid fee in Ksh (0 for free)";
    if (!form.location.trim()) e.location = "Location or online link is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        fee: Number(form.fee),
      };
      if (cls) {
        await apiFetch(`/api/classes/${cls.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast({ title: "Class updated", description: `"${form.title}" has been updated.` });
      } else {
        await apiFetch("/api/classes", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Class published!", description: `"${form.title}" is now live.` });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: keyof ClassForm, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const copy = { ...e }; delete copy[k]; return copy; });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="cls-modal-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="cls-modal-title" className="text-xl font-bold">{cls ? "Edit Class" : "Publish New Class"}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary transition-colors" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cls-title">Title *</Label>
            <Input id="cls-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Advanced Facial Techniques" className={errors.title ? "border-destructive" : ""} />
            {errors.title && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cls-instructor">Instructor *</Label>
            <Input id="cls-instructor" value={form.instructor} onChange={(e) => set("instructor", e.target.value)} placeholder="Instructor name" className={errors.instructor ? "border-destructive" : ""} />
            {errors.instructor && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.instructor}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cls-desc">Description *</Label>
            <Textarea id="cls-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={errors.description ? "border-destructive" : ""} />
            {errors.description && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cls-date">Date *</Label>
              <Input id="cls-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={errors.date ? "border-destructive" : ""} />
              {errors.date && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.date}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cls-start">Start Time *</Label>
              <Input id="cls-start" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={errors.startTime ? "border-destructive" : ""} />
              {errors.startTime && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.startTime}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cls-end">End Time *</Label>
              <Input id="cls-end" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={errors.endTime ? "border-destructive" : ""} />
              {errors.endTime && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.endTime}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cls-cap">Capacity *</Label>
              <Input id="cls-cap" type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="20" className={errors.capacity ? "border-destructive" : ""} />
              {errors.capacity && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.capacity}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cls-fee">Fee (Ksh) *</Label>
              <Input id="cls-fee" type="number" min={0} value={form.fee} onChange={(e) => set("fee", e.target.value)} placeholder="15000" className={errors.fee ? "border-destructive" : ""} />
              {errors.fee && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fee}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cls-loc">Location / Online Link *</Label>
            <Input id="cls-loc" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Nairobi Studio B or https://meet.google.com/..." className={errors.location ? "border-destructive" : ""} />
            {errors.location && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cls-img">Image URL (optional)</Label>
            <Input id="cls-img" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex items-center gap-3 py-1">
            <Checkbox id="cls-pub" checked={Boolean(form.isPublished)} onCheckedChange={(v) => set("isPublished", Boolean(v))} />
            <Label htmlFor="cls-pub" className="cursor-pointer">Publish immediately</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary text-white" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : cls ? "Save Changes" : "Publish Class"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RosterModal({ cls, onClose, onChanged }: { cls: TrainingClass; onClose: () => void; onChanged: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const removeEnrollment = async (enrollmentId: string) => {
    setRemovingId(enrollmentId);
    try {
      await apiFetch(`/api/classes/${cls.id}/roster/${enrollmentId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      onChanged();
      toast({ title: "Removed", description: "Enrollment removed." });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const promoteToEnrolled = async (enrollmentId: string) => {
    setPromotingId(enrollmentId);
    try {
      await apiFetch(`/api/classes/${cls.id}/roster/${enrollmentId}`, { method: "PUT", body: JSON.stringify({ status: "enrolled" }) });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      onChanged();
      toast({ title: "Promoted", description: "Moved from waitlist to enrolled." });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPromotingId(null);
    }
  };

  const enrolledCount = cls.enrolled.filter((e) => e.status === "enrolled").length;
  const waitlistCount = cls.enrolled.filter((e) => e.status === "waitlist").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="roster-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 id="roster-title" className="text-xl font-bold">{cls.title} — Roster</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">{enrolledCount}</span>/{cls.capacity} enrolled
              {waitlistCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {waitlistCount} waitlisted</span>}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary transition-colors" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          {cls.enrolled.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Users className="w-12 h-12 opacity-30" />
              <p>No enrollments yet for this class.</p>
            </div>
          )}
          {cls.enrolled.length > 0 && (
            <div className="space-y-3">
              {cls.enrolled.map((e) => (
                <div key={e.id} className={`flex items-center justify-between p-3 rounded-lg border ${e.status === "waitlist" ? "bg-amber-50 border-amber-200" : "bg-white border-border/50"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.email} · {e.phone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Registered: {new Date(e.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge variant={e.status === "enrolled" ? "default" : "secondary"} className={e.status === "waitlist" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-green-100 text-green-700 border-green-300"}>
                      {e.status === "enrolled" ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                      {e.status}
                    </Badge>
                    {e.status === "waitlist" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600 hover:text-amber-800" onClick={() => promoteToEnrolled(e.id)} disabled={promotingId === e.id} aria-label="Promote to enrolled">
                        {promotingId === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUp className="w-3 h-3" />}
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeEnrollment(e.id)} disabled={removingId === e.id} aria-label="Remove enrollment">
                      {removingId === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function Training() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<TrainingClass | null>(null);
  const [rosterClass, setRosterClass] = useState<TrainingClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingClass | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading, isError, error } = useClasses();

  // keep rosterClass in sync with latest data
  const freshRosterClass = rosterClass ? classes.find((c) => c.id === rosterClass.id) || rosterClass : null;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/classes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Deleted", description: "Class has been removed." });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openAdd = useCallback(() => { setEditClass(null); setModalOpen(true); }, []);
  const openEdit = useCallback((c: TrainingClass) => { setEditClass(c); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setEditClass(null); }, []);
  const onSaved = useCallback(() => queryClient.invalidateQueries({ queryKey: ["classes"] }), [queryClient]);

  const filtered = (Array.isArray(classes) ? classes : []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Training &amp; Masterclasses</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage educational sessions for staff and trainees.</p>
        </div>
        <Button id="publish-class-btn" onClick={openAdd} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Publish Class
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search classes..." className="pl-9 bg-white/50 border-white/60 focus:bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading classes...
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive text-center">
          <AlertCircle className="w-6 h-6" /> 
          <p>Failed to load classes. Check that the API server is running.</p>
          <p className="text-xs opacity-70 font-mono mt-2">{error?.message || String(error)}</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <GraduationCap className="w-12 h-12 opacity-30" />
          <p>{search ? "No classes match your search." : 'No classes yet. Click "Publish Class" to get started.'}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cls) => {
          const enrolledCount = cls.enrolled.filter((e) => e.status === "enrolled").length;
          const isFull = enrolledCount >= cls.capacity;
          return (
            <Card key={cls.id} className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col group">
              {cls.image && <img src={cls.image} alt={cls.title} className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              {!cls.image && <div className="h-2 bg-primary group-hover:bg-primary/80 transition-colors" />}
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg leading-tight">{cls.title}</CardTitle>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={isFull ? "destructive" : "secondary"}>{isFull ? "Full" : "Open"}</Badge>
                    {!cls.isPublished && <Badge variant="outline" className="text-xs">Draft</Badge>}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1 text-foreground/80">
                  <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                  {cls.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    {new Date(cls.date).toLocaleDateString("en-KE")} · {cls.startTime} – {cls.endTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{cls.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className={isFull ? "text-destructive font-medium" : ""}>{enrolledCount}/{cls.capacity} Enrolled</span>
                    {cls.enrolled.filter((e) => e.status === "waitlist").length > 0 && (
                      <span className="text-amber-600 font-medium ml-1">· {cls.enrolled.filter((e) => e.status === "waitlist").length} waiting</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-primary">Fee: Ksh {cls.fee.toLocaleString()}</div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-secondary/50" onClick={() => openEdit(cls)}>
                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setRosterClass(cls)}>
                    <Users className="w-3 h-3 mr-1" /> Roster
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(cls)} aria-label="Delete class">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ClassModal open={modalOpen} onClose={closeModal} cls={editClass} onSaved={onSaved} />

      {freshRosterClass && (
        <RosterModal
          cls={freshRosterClass}
          onClose={() => setRosterClass(null)}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ["classes"] })}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="alertdialog">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold">Delete Class?</h2>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget.title}</span>? This will remove all enrollments too.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
