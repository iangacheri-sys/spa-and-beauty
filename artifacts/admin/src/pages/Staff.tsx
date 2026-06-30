import { useState } from "react";
import { Star, TrendingUp, MessageSquare, Banknote, Calendar, ChevronRight } from "lucide-react";
import { specialists, services, bookings, feedbacks, tips } from "@/data/mockData";

const today = new Date().toISOString().split("T")[0];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function Staff() {
  const [selectedId, setSelectedId] = useState("1");

  const specialist = specialists.find((s) => s.id === selectedId)!;
  const myFeedbacks = feedbacks.filter((f) => f.specialistId === selectedId);
  const myTips = tips.filter((t) => t.specialistId === selectedId);
  const myBookings = bookings.filter((b) => b.specialistId === selectedId);
  const upcomingToday = myBookings.filter((b) => b.status === "upcoming" && b.date === today);
  const completedBookings = myBookings.filter((b) => b.status === "completed");

  const avgRating =
    myFeedbacks.length > 0
      ? (myFeedbacks.reduce((sum, f) => sum + f.rating, 0) / myFeedbacks.length).toFixed(1)
      : "—";
  const totalTips = myTips.reduce((sum, t) => sum + t.amount, 0);

  function getServiceName(id: string) {
    return services.find((s) => s.id === id)?.name ?? id;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">View your feedback, tips, and appointment history.</p>
      </div>

      {/* Therapist selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {specialists.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              data-testid={`select-specialist-${s.id}`}
              onClick={() => setSelectedId(s.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-muted-foreground/40"
              }`}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: s.avatarColor }}
              >
                {s.initials}
              </span>
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Hero / identity card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5">
        <span
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
          style={{ backgroundColor: specialist.avatarColor }}
        >
          {specialist.initials}
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{specialist.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{specialist.specialty} · {specialist.experience} experience</p>
          <div className="flex items-center gap-1.5 mt-2">
            <StarRow rating={Math.round(specialist.rating)} />
            <span className="text-sm font-semibold text-foreground">{specialist.rating}</span>
            <span className="text-xs text-muted-foreground">overall rating</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Star,
            label: "Avg. Rating",
            value: avgRating,
            sub: `from ${myFeedbacks.length} reviews`,
            color: "text-amber-500",
          },
          {
            icon: MessageSquare,
            label: "Total Reviews",
            value: String(myFeedbacks.length),
            sub: `${myFeedbacks.filter((f) => f.rating === 5).length} five-star`,
            color: "text-primary",
          },
          {
            icon: Banknote,
            label: "Tips Received",
            value: formatKES(totalTips),
            sub: `${myTips.length} tips total`,
            color: "text-emerald-600",
          },
          {
            icon: Calendar,
            label: "Appointments Today",
            value: String(upcomingToday.length || completedBookings.length),
            sub: upcomingToday.length > 0 ? `${upcomingToday.length} upcoming` : "this month",
            color: "text-sky-500",
          },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} data-testid={`stat-${label}`} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Feedback — wider column */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Client Feedback
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {myFeedbacks.length} reviews
            </span>
          </div>

          {myFeedbacks.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No feedback yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  data-testid={`feedback-${fb.id}`}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                        {fb.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-none">{fb.clientName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{getServiceName(fb.serviceId)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StarRow rating={fb.rating} />
                      <span className="text-xs text-muted-foreground">{formatDate(fb.date)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed pl-10">{fb.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips — narrower column */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Tips
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
              {formatKES(totalTips)} total
            </span>
          </div>

          {myTips.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No tips yet.
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {myTips.map((tip, i) => (
                <div
                  key={tip.id}
                  data-testid={`tip-${tip.id}`}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i < myTips.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none">{tip.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{getServiceName(tip.serviceId)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-emerald-700">+{formatKES(tip.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tip.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming appointments */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                My Bookings
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {myBookings.length} total
              </span>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {myBookings.slice(0, 5).map((b, i) => (
                <div
                  key={b.id}
                  data-testid={`booking-row-${b.id}`}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < Math.min(myBookings.length, 5) - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">{b.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{getServiceName(b.serviceId)} · {b.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        b.status === "upcoming"
                          ? "bg-sky-100 text-sky-700"
                          : b.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {myBookings.length > 5 && (
                <div className="px-4 py-2.5 text-xs text-muted-foreground border-t border-border">
                  +{myBookings.length - 5} more appointments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
