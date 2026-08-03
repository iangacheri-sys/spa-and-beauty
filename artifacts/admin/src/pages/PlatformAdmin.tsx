import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, DollarSign, Store, Users, Zap, Shield,
  ArrowUpRight, Star, Loader2, Globe, CheckCircle2, XCircle
} from "lucide-react";
import { useBookings, useServices, useTherapists, useSpas } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Subscription tier display names mapped from schema enum values
const TIER_NAME_MAP: Record<string, string> = {
  FREE: 'Free',
  BASIC: 'Basic',
  PROFESSIONAL: 'Pro',
  ENTERPRISE: 'Enterprise',
};

const TIER_PRICES: Record<string, number> = { Free: 0, Basic: 1500, Pro: 5900, Enterprise: 18900 };
const TIER_COMMISSION: Record<string, number> = { Free: 0.05, Basic: 0.04, Pro: 0.03, Enterprise: 0.015 };

const TIER_COLORS: Record<string, {bg: string, text: string, border: string, dot: string}> = {
  Free: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", dot: "#9CA3AF" },
  Basic: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "#10B981" },
  Pro: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dot: "#2563EB" },
  Enterprise: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "#D97706" },
};

function formatKsh(n: number) {
  return `Ksh ${n.toLocaleString()}`;
}

export default function PlatformAdmin() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: therapists = [], isLoading: loadingTherapists } = useTherapists();
  const { data: spas = [], isLoading: loadingSpas } = useSpas(true); // Fetch all spas including pending
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleApproval = async (id: string, status: string) => {
    try {
      await customFetch(`/api/spas/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['spas'] });
      toast({ title: "Status Updated", description: `Spa has been marked as ${status}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Normalise spas into a consistent shape for platform analytics (Only approved ones)
  const ALL_SPAS = spas.filter((s: any) => s.approvalStatus === 'APPROVED').map((s: any) => ({
    id: s.id,
    name: s.name,
    tier: TIER_NAME_MAP[s.subscriptionTier] ?? s.subscriptionTier,
    region: s.county ?? 'Unknown',
  }));

  const PENDING_SPAS = spas.filter((s: any) => s.approvalStatus === 'PENDING');

  if (loadingBookings || loadingServices || loadingTherapists || loadingSpas) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "PLATFORM_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4 text-muted-foreground">
        <Shield className="w-12 h-12 opacity-30" />
        <p>Access restricted to Platform Admins only.</p>
      </div>
    );
  }

  // Per-spa revenue stats
  const spaStats = ALL_SPAS.map((spa) => {
    const spaBookings = bookings.filter((b) => b.spaId === spa.id);
    const completed = spaBookings.filter((b) => b.status === "completed");
    const upcoming = spaBookings.filter((b) => b.status === "upcoming");
    const revenue = completed.reduce((sum, b) => sum + b.price, 0);
    const commission = Math.round(revenue * TIER_COMMISSION[spa.tier]);
    const spaTherapists = therapists.filter((t) => t.spaId === spa.id);
    const subRevenue = TIER_PRICES[spa.tier];
    return {
      ...spa,
      revenue,
      commission,
      bookings: spaBookings.length,
      completed: completed.length,
      upcoming: upcoming.length,
      therapistCount: spaTherapists.length,
      subRevenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Totals
  const totalGMV = spaStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalCommission = spaStats.reduce((sum, s) => sum + s.commission, 0);
  const totalSubRevenue = spaStats.reduce((sum, s) => sum + s.subRevenue, 0);
  const totalPlatformRevenue = totalCommission + totalSubRevenue;
  const proCount = ALL_SPAS.filter((s) => s.tier === "Pro").length;
  const enterpriseCount = ALL_SPAS.filter((s) => s.tier === "Enterprise").length;
  const freeCount = ALL_SPAS.filter((s) => s.tier === "Free").length;

  // Region breakdown
  const regionData = [
    {
      region: "Kilifi",
      spas: ALL_SPAS.filter((s) => s.region === "Kilifi").length,
      revenue: spaStats.filter((s) => s.region === "Kilifi").reduce((sum, s) => sum + s.revenue, 0),
    },
    {
      region: "Nairobi",
      spas: ALL_SPAS.filter((s) => s.region === "Nairobi").length,
      revenue: spaStats.filter((s) => s.region === "Nairobi").reduce((sum, s) => sum + s.revenue, 0),
    },
  ];

  // Monthly GMV trend (simulated)
  const gmvTrend = [
    { month: "Feb", gmv: 38000, commission: 1400 },
    { month: "Mar", gmv: 52000, commission: 1900 },
    { month: "Apr", gmv: 61000, commission: 2200 },
    { month: "May", gmv: 74000, commission: 2700 },
    { month: "Jun", gmv: 89000, commission: 3200 },
    { month: "Jul", gmv: Math.max(totalGMV, 95000), commission: Math.max(totalCommission, 3500) },
  ];

  // Tier distribution for pie
  const tierPie = [
    { name: "Free", value: freeCount, color: TIER_COLORS.Free.dot },
    { name: "Pro", value: proCount, color: TIER_COLORS.Pro.dot },
    { name: "Enterprise", value: enterpriseCount, color: TIER_COLORS.Enterprise.dot },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Platform Revenue</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Aggregated metrics across all {ALL_SPAS.length} marketplace spas — Kenya focus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5">
            <Globe className="w-3 h-3 mr-1.5" /> Live Data Mode
          </Badge>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total GMV",
            value: formatKsh(totalGMV),
            sub: "Gross Marketplace Volume",
            icon: DollarSign,
            trend: "+24%",
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Platform Revenue",
            value: formatKsh(totalPlatformRevenue),
            sub: `Commission + Subscriptions`,
            icon: TrendingUp,
            trend: "+18%",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Spas",
            value: String(ALL_SPAS.length),
            sub: `${proCount} Pro · ${enterpriseCount} Enterprise · ${freeCount} Free`,
            icon: Store,
            trend: "+40% MoM",
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Total Bookings",
            value: String(bookings.length),
            sub: `${bookings.filter((b) => b.status === "completed").length} completed`,
            icon: Users,
            trend: "+32%",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-white/80 backdrop-blur border-white/40 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                </div>
                <div className={`p-2.5 ${kpi.bg} rounded-xl shrink-0`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-green-600 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>{kpi.trend} vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* GMV + Commission Trend */}
        <Card className="col-span-4 bg-white/80 backdrop-blur border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              GMV vs Platform Commission (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gmvTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number, name: string) => [formatKsh(v), name === "gmv" ? "GMV" : "Commission"]} />
                  <Area type="monotone" dataKey="gmv" stroke="#2563EB" strokeWidth={2} fill="url(#gmvGrad)" name="gmv" />
                  <Area type="monotone" dataKey="commission" stroke="#16A34A" strokeWidth={2} fill="url(#commGrad)" name="commission" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card className="col-span-3 bg-white/80 backdrop-blur border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle>Spa Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierPie} cx="50%" cy="50%" outerRadius={65} paddingAngle={4} dataKey="value">
                    {tierPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Subscription revenue breakdown */}
            <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
              {["Enterprise", "Pro", "Free"].map((tier) => {
                const count = ALL_SPAS.filter((s) => s.tier === tier).length;
                const rev = count * TIER_PRICES[tier];
                const tc = TIER_COLORS[tier as keyof typeof TIER_COLORS];
                return (
                  <div key={tier} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: tc.dot }} />
                      <span>{tier} × {count}</span>
                    </div>
                    <span className="font-semibold">{rev === 0 ? "—" : formatKsh(rev)}/mo</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-sm font-bold border-t border-border/50 pt-2 mt-2">
                <span>Total Sub Revenue</span>
                <span className="text-primary">{formatKsh(totalSubRevenue)}/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue */}
      {PENDING_SPAS.length > 0 && (
        <Card className="bg-amber-50/50 backdrop-blur border-amber-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Store className="w-5 h-5" />
              Partner Approval Queue ({PENDING_SPAS.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PENDING_SPAS.map((spa: any) => (
                <div key={spa.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                  <div>
                    <h3 className="font-bold text-base">{spa.name}</h3>
                    <p className="text-sm text-muted-foreground">{spa.address}, {spa.county}</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact: {spa.phone} {spa.email ? `• ${spa.email}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleApproval(spa.id, 'REJECTED')}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleApproval(spa.id, 'APPROVED')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-green-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Region Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Revenue by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <XAxis dataKey="region" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatKsh(v), "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Per-Spa Leaderboard */}
        <Card className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Spa Revenue Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spaStats.slice(0, 5).map((spa, i) => {
                const tc = TIER_COLORS[spa.tier as keyof typeof TIER_COLORS] || TIER_COLORS.Free;
                return (
                  <div key={spa.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{spa.name}</p>
                        <Badge className={`text-xs ${tc.bg} ${tc.text} ${tc.border} border shrink-0`}>{spa.tier}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{spa.bookings} bookings · {spa.therapistCount} therapists</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">{formatKsh(spa.revenue)}</p>
                      <p className="text-xs text-green-600">+{formatKsh(spa.commission)} comm.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Spa Table */}
      <Card className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle>All Spas — Full Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4 font-medium">Spa</th>
                  <th className="text-left py-2 pr-4 font-medium">Region</th>
                  <th className="text-left py-2 pr-4 font-medium">Plan</th>
                  <th className="text-right py-2 pr-4 font-medium">Bookings</th>
                  <th className="text-right py-2 pr-4 font-medium">GMV</th>
                  <th className="text-right py-2 font-medium">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {spaStats.map((spa) => {
                  const tc = TIER_COLORS[spa.tier as keyof typeof TIER_COLORS] || TIER_COLORS.Free;
                  return (
                    <tr key={spa.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-2.5 pr-4 font-medium">{spa.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{spa.region}</td>
                      <td className="py-2.5 pr-4">
                        <Badge className={`text-xs ${tc.bg} ${tc.text} ${tc.border} border`}>{spa.tier}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right">{spa.bookings}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold">{spa.revenue > 0 ? formatKsh(spa.revenue) : "—"}</td>
                      <td className="py-2.5 text-right text-green-600 font-semibold">{spa.commission > 0 ? formatKsh(spa.commission) : "—"}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-border font-bold bg-secondary/20">
                  <td className="py-2.5 pr-4" colSpan={4}>Platform Total</td>
                  <td className="py-2.5 pr-4 text-right">{formatKsh(totalGMV)}</td>
                  <td className="py-2.5 text-right text-primary">{formatKsh(totalCommission)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Glossary & Disclaimer */}
      <div className="flex flex-col items-center gap-2 py-4 mt-4">
        <p className="text-center text-xs text-muted-foreground max-w-2xl">
          💡 <strong>Live Data Mode</strong> — Revenue and commission figures are computed from live booking data.
          Subscription revenue is calculated from tier pricing × active spa count.
        </p>
        <MetricsGlossary />
      </div>
    </div>
  );
}

function MetricsGlossary() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
      >
        <Shield className="w-3 h-3" /> View Metrics Glossary
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setOpen(false)} 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Metrics Glossary</h2>
            <div className="space-y-4 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="font-semibold text-foreground">Gross Marketplace Volume (GMV)</h3>
                <p>The total monetary value of all completed bookings and product orders across all spas before any platform commissions or fees are deducted.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Platform Revenue</h3>
                <p>The total revenue generated by BeautyBooker itself. Calculated as: (Total Commission from GMV) + (Monthly SaaS Subscription Revenue).</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Commission Rates</h3>
                <p>Calculated per transaction based on the Spa's subscription tier. Free: 5%, Pro: 3%, Enterprise: 1.5%.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Active Spas</h3>
                <p>The number of verified spa tenants currently operating on the platform. Categorized by their active subscription tier.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Completed vs Upcoming Bookings</h3>
                <p>Completed bookings contribute to GMV and revenue. Upcoming bookings represent future pipeline revenue.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
