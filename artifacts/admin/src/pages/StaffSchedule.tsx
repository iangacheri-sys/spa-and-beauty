import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, CalendarX, Clock } from "lucide-react";
import {
  useTherapists, useTherapistSchedule, useTimeOff,
  TherapistSchedule, TimeOff, Therapist,
  apiFetch,
} from "@/lib/api";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_SCHEDULE: Omit<TherapistSchedule, "id" | "therapistId">[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime: "17:00",
  isWorking: i >= 1 && i <= 5, // Mon-Fri by default
}));

function ScheduleEditor({ therapist, onClose }: { therapist: Therapist; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: existing = [], isLoading } = useTherapistSchedule(therapist.id);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<Omit<TherapistSchedule, "id" | "therapistId">[] | null>(null);

  // Merge existing data over defaults once loaded
  const effectiveSchedules: Omit<TherapistSchedule, "id" | "therapistId">[] = schedules ?? (
    existing.length > 0
      ? DAY_NAMES.map((_, i) => {
          const found = existing.find(s => s.dayOfWeek === i);
          return found
            ? { dayOfWeek: i, startTime: found.startTime, endTime: found.endTime, isWorking: found.isWorking }
            : { dayOfWeek: i, startTime: "09:00", endTime: "17:00", isWorking: false };
        })
      : DEFAULT_SCHEDULE
  );

  const update = (dayOfWeek: number, field: string, value: any) => {
    const next = effectiveSchedules.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    );
    setSchedules(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/schedules/therapist/${therapist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: effectiveSchedules }),
      });
      queryClient.invalidateQueries({ queryKey: ["therapistSchedule", therapist.id] });
      onClose();
    } catch (e: any) {
      alert(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure the weekly working hours for <strong>{therapist.name}</strong>.
      </p>
      <div className="space-y-2">
        {effectiveSchedules.map(s => (
          <div key={s.dayOfWeek} className="flex items-center gap-4 rounded-lg border p-3">
            <div className="w-10 font-semibold text-sm text-muted-foreground">{DAY_NAMES[s.dayOfWeek]}</div>
            <Switch
              checked={s.isWorking}
              onCheckedChange={v => update(s.dayOfWeek, "isWorking", v)}
              id={`working-${s.dayOfWeek}`}
            />
            <div className={`flex items-center gap-2 flex-1 transition-opacity ${!s.isWorking ? "opacity-30 pointer-events-none" : ""}`}>
              <Input
                type="time"
                value={s.startTime}
                onChange={e => update(s.dayOfWeek, "startTime", e.target.value)}
                className="w-36"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="time"
                value={s.endTime}
                onChange={e => update(s.dayOfWeek, "endTime", e.target.value)}
                className="w-36"
              />
            </div>
            {!s.isWorking && (
              <Badge variant="secondary">Day Off</Badge>
            )}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Schedule
        </Button>
      </DialogFooter>
    </div>
  );
}

function TimeOffSection() {
  const queryClient = useQueryClient();
  const { data: therapists = [] } = useTherapists();
  const { data: timeOffList = [], isLoading } = useTimeOff();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ therapistId: "", startDate: "", endDate: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await apiFetch("/api/schedules/timeoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: form.therapistId || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason || undefined,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["timeOff"] });
      setShowAdd(false);
      setForm({ therapistId: "", startDate: "", endDate: "", reason: "" });
    } catch (e: any) {
      alert(`Failed to add time off: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this time off block?")) return;
    await apiFetch(`/api/schedules/timeoff/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["timeOff"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><CalendarX className="h-5 w-5" /> Time Off</h3>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Time Off
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : timeOffList.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No time off configured.</p>
      ) : (
        <div className="space-y-2">
          {timeOffList.map((t: TimeOff) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex-1">
                <p className="font-medium">
                  {t.therapist ? t.therapist.name : <span className="text-orange-600">Entire Spa</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.startDate} → {t.endDate}
                  {t.reason && ` · ${t.reason}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Member</Label>
              <Select value={form.therapistId} onValueChange={v => setForm(f => ({ ...f, therapistId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All staff (entire spa)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All staff (entire spa)</SelectItem>
                  {therapists.map((t: Therapist) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Public Holiday, Sick Leave" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={add} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StaffSchedule() {
  const { data: therapists = [], isLoading } = useTherapists();
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Staff Schedules</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {therapists.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No therapists found. Add staff first.</p>
            )}
            {therapists.map((t: Therapist) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedTherapist(t)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.specialties?.join(", ")}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit Hours</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Time Off */}
        <Card>
          <CardContent className="pt-6">
            <TimeOffSection />
          </CardContent>
        </Card>
      </div>

      {/* Schedule Editor Dialog */}
      <Dialog open={!!selectedTherapist} onOpenChange={open => !open && setSelectedTherapist(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Working Hours</DialogTitle>
          </DialogHeader>
          {selectedTherapist && (
            <ScheduleEditor therapist={selectedTherapist} onClose={() => setSelectedTherapist(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
