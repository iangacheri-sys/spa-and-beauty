import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Loader2, CalendarDays, LayoutGrid,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useBookings, useServices, useTherapists, Booking, Service, Therapist } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am – 8pm

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMondayOf(d: Date) {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTop(minutes: number, startHour = 8) {
  return ((minutes - startHour * 60) / 60) * 64; // 64px per hour
}

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: "bg-blue-500 border-blue-600",
  upcoming: "bg-blue-500 border-blue-600",
  COMPLETED: "bg-emerald-500 border-emerald-600",
  completed: "bg-emerald-500 border-emerald-600",
  CANCELLED: "bg-red-400 border-red-500",
  cancelled: "bg-red-400 border-red-500",
  NO_SHOW: "bg-amber-400 border-amber-500",
  "no-show": "bg-amber-400 border-amber-500",
  "NO-SHOW": "bg-amber-400 border-amber-500",
};

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-800",
  upcoming: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  NO_SHOW: "bg-amber-100 text-amber-800",
  "no-show": "bg-amber-100 text-amber-800",
};

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  weekStart, bookings, services, therapists, onSelect,
}: {
  weekStart: Date;
  bookings: Booking[];
  services: Service[];
  therapists: Therapist[];
  onSelect: (b: Booking) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = toDateStr(new Date());

  const bookingsByDay = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      {/* Header row */}
      <div className="grid border-b" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        <div className="border-r bg-muted/30" />
        {days.map(d => {
          const ds = toDateStr(d);
          const isToday = ds === today;
          return (
            <div key={ds} className={`py-3 text-center border-r last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}>
              <p className="text-xs font-medium text-muted-foreground">{DAYS[d.getDay()]}</p>
              <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-primary" : ""}`}>
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid relative" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
        {/* Hour labels */}
        <div>
          {HOURS.map(h => (
            <div key={h} className="h-16 border-b border-r px-2 flex items-start pt-1">
              <span className="text-[10px] text-muted-foreground font-medium leading-none">
                {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map(d => {
          const ds = toDateStr(d);
          const isToday = ds === today;
          const dayBookings = bookingsByDay[ds] || [];

          return (
            <div key={ds} className={`relative border-r last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}
              style={{ height: `${HOURS.length * 64}px` }}>
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} className="absolute left-0 right-0 border-b border-dashed border-muted/60"
                  style={{ top: `${(h - 8) * 64}px`, height: "64px" }} />
              ))}
              {/* Bookings */}
              {dayBookings.map(b => {
                const service = services.find(s => s.id === b.serviceId);
                const therapist = therapists.find(t => t.id === b.therapistId);
                const startMins = timeToMinutes(b.timeSlot);
                const duration = service?.duration || 60;
                const top = minutesToTop(startMins);
                const height = Math.max((duration / 60) * 64 - 4, 24);
                const colorClass = STATUS_COLOR[b.status] || STATUS_COLOR.upcoming;

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 cursor-pointer hover:brightness-110 transition-all text-white shadow-sm overflow-hidden ${colorClass}`}
                    style={{ top: `${top + 2}px`, height: `${height}px` }}
                    title={`${service?.name} – ${therapist?.name}`}
                  >
                    <p className="text-[11px] font-semibold leading-tight truncate">{service?.name}</p>
                    {height > 36 && (
                      <p className="text-[10px] opacity-80 truncate">{therapist?.name}</p>
                    )}
                    {height > 52 && (
                      <p className="text-[10px] opacity-70">{b.timeSlot}</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  year, month, bookings, onSelect,
}: {
  year: number;
  month: number;
  bookings: Booking[];
  onSelect: (b: Booking) => void;
}) {
  const today = toDateStr(new Date());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const bookingsByDay = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="min-h-[100px] border-b border-r bg-muted/20" />;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayBookings = bookingsByDay[ds] || [];
          const isToday = ds === today;

          return (
            <div key={idx} className={`min-h-[100px] p-1.5 border-b border-r last-in-row:border-r-0 flex flex-col gap-1 ${isToday ? "bg-primary/5" : ""}`}>
              <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-white" : "text-foreground"}`}>
                {day}
              </span>
              {dayBookings.slice(0, 3).map(b => (
                <div
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className={`text-[10px] font-medium text-white rounded px-1 py-0.5 cursor-pointer truncate ${STATUS_COLOR[b.status] || STATUS_COLOR.upcoming}`}
                  title={`${b.timeSlot} – ${b.serviceId}`}
                >
                  {b.timeSlot}
                </div>
              ))}
              {dayBookings.length > 3 && (
                <span className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingModal({
  booking, services, therapists, onClose,
}: {
  booking: Booking | null;
  services: Service[];
  therapists: Therapist[];
  onClose: () => void;
}) {
  if (!booking) return null;
  const service = services.find(s => s.id === booking.serviceId);
  const therapist = therapists.find(t => t.id === booking.therapistId);

  return (
    <Dialog open={!!booking} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Badge className={STATUS_BADGE[booking.status] || STATUS_BADGE.upcoming}>
              {booking.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Service</p><p className="font-semibold">{service?.name || "–"}</p></div>
            <div><p className="text-muted-foreground text-xs">Duration</p><p className="font-semibold">{service?.duration} min</p></div>
            <div><p className="text-muted-foreground text-xs">Date</p><p className="font-semibold">{booking.date}</p></div>
            <div><p className="text-muted-foreground text-xs">Time</p><p className="font-semibold">{booking.timeSlot}</p></div>
            <div><p className="text-muted-foreground text-xs">Therapist</p><p className="font-semibold">{therapist?.name || "–"}</p></div>
            <div><p className="text-muted-foreground text-xs">Price</p><p className="font-semibold">KES {booking.price?.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground text-xs">Payment</p><p className="font-semibold capitalize">{booking.paymentStatus}</p></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Calendar() {
  const { data: bookings = [], isLoading: lb } = useBookings();
  const { data: services = [], isLoading: ls } = useServices();
  const { data: therapists = [], isLoading: lt } = useTherapists();

  const today = new Date();
  const [view, setView] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState(getMondayOf(today));
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  if (lb || ls || lt) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setView("week")}
            >
              <CalendarDays className="h-4 w-4 mr-1" /> Week
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setView("month")}
            >
              <LayoutGrid className="h-4 w-4 mr-1" /> Month
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => {
              if (view === "week") setWeekStart(d => addDays(d, -7));
              else setCalMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[160px] text-center">
              {view === "week"
                ? `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].slice(0,3)} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()].slice(0,3)} ${weekEnd.getFullYear()}`
                : `${MONTHS[calMonth.month]} ${calMonth.year}`}
            </span>
            <Button variant="outline" size="icon" onClick={() => {
              if (view === "week") setWeekStart(d => addDays(d, 7));
              else setCalMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setWeekStart(getMondayOf(today));
              setCalMonth({ year: today.getFullYear(), month: today.getMonth() });
            }}>
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        {[["bg-blue-500","Upcoming"], ["bg-emerald-500","Completed"], ["bg-red-400","Cancelled"], ["bg-amber-400","No-Show"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${c}`} /> {l}
          </span>
        ))}
      </div>

      {/* Calendar */}
      {view === "week" ? (
        <WeekView
          weekStart={weekStart}
          bookings={bookings}
          services={services}
          therapists={therapists}
          onSelect={setSelectedBooking}
        />
      ) : (
        <MonthView
          year={calMonth.year}
          month={calMonth.month}
          bookings={bookings}
          onSelect={setSelectedBooking}
        />
      )}

      {/* Detail modal */}
      <BookingModal
        booking={selectedBooking}
        services={services}
        therapists={therapists}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
