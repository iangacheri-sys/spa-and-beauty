import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Calendar as CalendarIcon, DollarSign, Users, Sparkles, Loader2, TrendingUp, TrendingDown, CheckCircle2, Clock, Store } from "lucide-react";
import { useBookings, useServices, useTherapists, useDashboardStats, useRevenueChart } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

const KPI = ({
  title, value, icon: Icon, trend, sub, color = "text-primary"
}: {
  title: string; value: string; icon: any; trend?: number; sub?: string; color?: string;
}) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
    <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm hover:shadow-md transition-shadow h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg bg-primary/10`}><Icon className={`h-4 w-4 ${color}`} /></div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {(trend !== undefined || sub) && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend !== undefined && (
            trend >= 0
              ? <TrendingUp className="w-3 h-3 text-green-500" />
              : <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          {trend !== undefined && (
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
          {sub && <span>{sub}</span>}
        </p>
      )}
    </CardContent>
    </Card>
  </motion.div>
);

const STATUS_COLORS: Record<string, string> = {
  completed: "#16A34A",
  upcoming: "#2563EB",
  cancelled: "#DC2626",
  "no-show": "#D97706",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: therapists = [], isLoading: loadingTherapists } = useTherapists();
  const { data: dashboardStats, isLoading: loadingStats } = useDashboardStats();
  const { data: revenueChart = [], isLoading: loadingChart } = useRevenueChart(30);

  if (loadingBookings || loadingServices || loadingTherapists || loadingStats || loadingChart) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";
  const todayStr = new Date().toISOString().split("T")[0];

  const todaysBookings = bookings.filter((b) => b.date === todayStr);
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");

  const totalRevenue = dashboardStats?.revenue || 0;
  const avgOrderValue = dashboardStats?.bookings ? Math.round(totalRevenue / dashboardStats.bookings) : 0;
  
  // Format revenue chart for recharts
  const formattedRevenueChart = revenueChart.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    revenue: item.amount
  }));

  // Status breakdown for pie
  const statusBreakdown = [
    { name: "Completed", value: completedBookings.length, color: STATUS_COLORS.completed },
    { name: "Upcoming", value: upcomingBookings.length, color: STATUS_COLORS.upcoming },
    { name: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length, color: STATUS_COLORS.cancelled },
    { name: "No-Show", value: bookings.filter((b) => b.status === "no-show").length, color: STATUS_COLORS["no-show"] },
  ].filter((d) => d.value > 0);

  // Top performing therapists by completed bookings
  const therapistStats = therapists.map((t) => {
    const myBookings = completedBookings.filter((b) => b.therapistId === t.id);
    const myRevenue = myBookings.reduce((sum, b) => sum + b.price, 0);
    return { ...t, count: myBookings.length, revenue: myRevenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top services
  const serviceStats = services.map((s) => {
    const count = bookings.filter((b) => b.serviceId === s.id).length;
    return { ...s, bookingCount: count };
  }).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      exit={{ opacity: 0 }}
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPlatformAdmin ? "Platform Overview" : "Spa Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isPlatformAdmin
              ? `Monitoring all ${bookings.length} bookings across the marketplace.`
              : `Welcome back, ${user?.name}. Here's how your spa is doing.`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 backdrop-blur px-3 py-2 rounded-lg border border-border/50">
          <Clock className="w-3 h-3" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Today's Appointments"
          value={String(todaysBookings.length)}
          icon={CalendarIcon}
          sub="scheduled for today"
          trend={12}
        />
        <KPI
          title="Total Revenue (KES)"
          value={`Ksh ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={8}
          sub="from completed bookings"
        />
        <KPI
          title={isPlatformAdmin ? "Active Spas" : "Active Therapists"}
          value={String(isPlatformAdmin ? (dashboardStats?.activeStaff || 0) : (dashboardStats?.activeStaff || therapists.filter((t) => t.isActive).length))}
          icon={isPlatformAdmin ? Store : Users}
          trend={isPlatformAdmin ? 40 : 0}
          sub={isPlatformAdmin ? "on the marketplace" : "on your team"}
        />
        <KPI
          title="Total Bookings (Last 30 Days)"
          value={String(dashboardStats?.bookings || 0)}
          icon={Sparkles}
          sub={`Avg value Ksh ${avgOrderValue.toLocaleString()}`}
        />
      </div>

      {/* Second row: booking completion stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50/80 backdrop-blur border-green-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-700">{completedBookings.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/80 backdrop-blur border-blue-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full"><CalendarIcon className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-blue-700">{upcomingBookings.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/80 backdrop-blur border-red-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full"><TrendingDown className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled / No-Show</p>
              <p className="text-2xl font-bold text-red-600">
                {bookings.filter((b) => b.status === "cancelled" || b.status === "no-show").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Trend */}
        <Card className="col-span-4 bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Revenue Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedRevenueChart} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`Ksh ${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Pie */}
        <Card className="col-span-3 bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle>Booking Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Top Therapists + Top Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Therapists */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Top Performing Therapists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {therapistStats.length > 0 ? therapistStats.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.specialties.join(", ")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">Ksh {t.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t.count} bookings</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">No completed bookings yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Most Booked Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} tickLine={false} axisLine={false} width={110} />
                  <Tooltip formatter={(v: number) => [v, "Bookings"]} />
                  <Bar dataKey="bookingCount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
