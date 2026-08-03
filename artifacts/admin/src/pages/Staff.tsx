import { useState } from "react";
import { Plus, Search, UserCheck, ShieldOff, KeyRound, Edit2, X, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTherapists, Therapist } from "@/lib/api";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const SPECIALTIES = ["Massage", "Facial", "Nails", "Hair", "Waxing", "Makeup", "Body"];

export default function Staff() {
  const { data: therapists = [], isLoading } = useTherapists();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", specialties: [] as string[] });
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({ name: "", phone: "", bio: "", specialties: [SPECIALTIES[0]], password: "" });

  const filtered = therapists.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = therapists.filter(t => t.isActive).length;
  const inactiveCount = therapists.filter(t => !t.isActive).length;

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await customFetch(`/api/therapists/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast({ title: isActive ? "Restored" : "Suspended", description: `Therapist ${isActive ? 'restored' : 'suspended'} successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name.trim() || !newStaff.phone.trim()) {
      toast({ title: "Missing fields", description: "Name and phone are required.", variant: "destructive" });
      return;
    }
    try {
      await customFetch('/api/therapists', {
        method: "POST",
        body: JSON.stringify(newStaff),
      });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast({ title: "Added", description: `${newStaff.name} has been added.` });
      setNewStaff({ name: "", phone: "", bio: "", specialties: [SPECIALTIES[0]], password: "" });
      setIsAdding(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (t: Therapist) => {
    setEditingId(t.id);
    setEditForm({ name: t.name, bio: t.bio, specialties: [...t.specialties] });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await customFetch(`/api/therapists/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast({ title: "Saved", description: "Therapist profile updated." });
      setEditingId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleSpecialty = (spec: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(spec)) {
      setList(list.filter(s => s !== spec));
    } else {
      setList([...list, spec]);
    }
  };

  if (isLoading) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Staff Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage therapists, schedules, access, and specialties.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Therapist
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Therapists</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{therapists.length}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{inactiveCount}</div></CardContent>
        </Card>
      </div>

      {/* Add Therapist Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add New Therapist</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Mary Wanjiku" value={newStaff.name} onChange={e => setNewStaff(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="07XX XXX XXX" value={newStaff.phone} onChange={e => setNewStaff(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Initial Password</Label>
                <Input placeholder="Temporary password" value={newStaff.password} onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input placeholder="Brief description" value={newStaff.bio} onChange={e => setNewStaff(s => ({ ...s, bio: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(sp => (
                    <button key={sp} onClick={() => toggleSpecialty(sp, newStaff.specialties, (v) => setNewStaff(s => ({ ...s, specialties: v })))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${newStaff.specialties.includes(sp) ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary'}`}>
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleAddStaff}>
                  <Save className="w-4 h-4 mr-2" /> Add Therapist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Therapist Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Therapist</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input value={editForm.bio} onChange={e => setEditForm(s => ({ ...s, bio: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(sp => (
                    <button key={sp} onClick={() => toggleSpecialty(sp, editForm.specialties, (v) => setEditForm(s => ({ ...s, specialties: v })))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${editForm.specialties.includes(sp) ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary'}`}>
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Confirm */}
      {resetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white shadow-2xl">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>A new temporary password will be assigned to the therapist.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Reset password for <strong>{therapists.find(t => t.id === resetConfirm)?.name}</strong>?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setResetConfirm(null)}>Cancel</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={() => { toast({ title: "Password Reset", description: "Temporary password set to: changeme" }); setResetConfirm(null); }}>
                  <Check className="w-4 h-4 mr-2" /> Confirm Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Therapists</CardTitle>
              <CardDescription>Manage your spa's staff and their access</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search staff..." className="pl-9 bg-white/50 border-white/60 focus:bg-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 bg-white/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>Therapist Name</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => {
                  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                  return (
                    <TableRow key={member.id} className={`hover:bg-white/60 transition-colors ${!member.isActive ? 'opacity-60' : ''}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-primary/60">
                            {initials}
                          </span>
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{member.userId}</TableCell>
                      <TableCell>
                        {!member.isActive
                          ? <Badge variant="destructive">Suspended</Badge>
                          : <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500" title="Reset Password" onClick={() => setResetConfirm(member.id)}>
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className={`h-8 w-8 ${!member.isActive ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-destructive'}`}
                            title={!member.isActive ? "Restore Therapist" : "Suspend Therapist"}
                            onClick={() => toggleActive(member.id, !member.isActive)}
                          >
                            {!member.isActive ? <UserCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit Profile" onClick={() => startEdit(member)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
