import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Star, Shield, ArrowRight, Loader2, CreditCard, TrendingUp, Users, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useBookings, useTherapists, useSpas } from "@/lib/api";

interface PricingTier {
  name: "Free" | "Pro" | "Enterprise";
  price: number;
  description: string;
  features: string[];
  color: string;
  icon: any;
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    description: "Get started with core tools to manage your spa.",
    icon: Star,
    color: "border-gray-200 bg-white",
    features: [
      "1 therapist profile",
      "Up to 30 bookings/month",
      "Basic dashboard",
      "Client self-booking",
      "5% commission on bookings",
    ],
  },
  {
    name: "Pro",
    price: 5900,
    description: "For growing spas that need advanced tools.",
    icon: Zap,
    color: "border-primary bg-primary/5",
    badge: "Most Popular",
    features: [
      "Up to 10 therapists",
      "Unlimited bookings",
      "Advanced analytics",
      "Inventory management",
      "Promotions & discounts",
      "M-Pesa STK Push payments",
      "3% commission on bookings",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: 18900,
    description: "Full-scale power for multi-location luxury spas.",
    icon: Shield,
    color: "border-amber-300 bg-amber-50/50",
    features: [
      "Unlimited therapists",
      "Unlimited bookings",
      "Multi-location support",
      "White-label mobile app",
      "Custom integrations",
      "Dedicated account manager",
      "1.5% commission on bookings",
      "24/7 phone support",
    ],
  },
];

function formatKsh(amount: number) {
  return `Ksh ${amount.toLocaleString()}`;
}

// Billing history is SaaS metadata; not yet in the DB — shown as a stub
const BILLING_HISTORY = [
  { date: "2026-07-01", amount: 5900, status: "paid", description: "Pro Plan — July 2026", method: "M-Pesa" },
  { date: "2026-06-01", amount: 5900, status: "paid", description: "Pro Plan — June 2026", method: "M-Pesa" },
  { date: "2026-05-01", amount: 5900, status: "paid", description: "Pro Plan — May 2026", method: "Card" },
];

export default function Billing() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: therapists = [], isLoading: loadingTherapists } = useTherapists();
  const { data: spas = [], isLoading: loadingSpas } = useSpas();

  if (loadingBookings || loadingTherapists || loadingSpas) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Find the user's spa, then map its subscriptionTier to our display name
  const TIER_NAME_MAP: Record<string, string> = { FREE: 'Free', BASIC: 'Basic', PROFESSIONAL: 'Pro', ENTERPRISE: 'Enterprise' };
  const userSpa = (spas as any[]).find((s: any) => s.id === user?.spaId);
  const currentTier = userSpa ? (TIER_NAME_MAP[userSpa.subscriptionTier] ?? 'Free') : (user?.role === 'PLATFORM_ADMIN' ? 'Enterprise' : 'Free');
  const currentPlan = TIERS.find((t) => t.name === currentTier) ?? TIERS[0];

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const commissionRate = currentTier === "Enterprise" ? 0.015 : currentTier === "Pro" ? 0.03 : 0.05;
  const commissionOwed = Math.round(totalRevenue * commissionRate);
  const therapistCount = therapists.filter((t) => t.isActive).length;

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  nextBillingDate.setDate(1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your plan, view invoices, and track platform commission.
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-3 bg-primary text-white">{currentTier} Plan</Badge>
                <h2 className="text-xl font-bold">{formatKsh(currentPlan.price)}<span className="text-sm font-normal text-muted-foreground">/month</span></h2>
                <p className="text-sm text-muted-foreground mt-1">{currentPlan.description}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Next billing: {nextBillingDate.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <currentPlan.icon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {currentPlan.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 text-xs bg-white/70 border border-border/60 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> {f}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Platform Commission</span>
              </div>
              <p className="text-2xl font-bold">{formatKsh(commissionOwed)}</p>
              <p className="text-xs text-muted-foreground mt-1">{(commissionRate * 100).toFixed(1)}% of {formatKsh(totalRevenue)} revenue</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Active Therapists</span>
              </div>
              <p className="text-2xl font-bold">{therapistCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Limit: {currentTier === "Enterprise" ? "Unlimited" : currentTier === "Pro" ? "10" : "1"}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.name === currentTier;
            return (
              <Card key={tier.name} className={`relative ${tier.color} shadow-sm transition-shadow hover:shadow-md`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white shadow-md">{tier.badge}</Badge>
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <div className="flex items-center gap-2">
                    <tier.icon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {tier.price === 0 ? "Free" : formatKsh(tier.price)}
                    {tier.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-4"
                    variant={isCurrent ? "secondary" : "default"}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Current Plan" : `Upgrade to ${tier.name}`}
                    {!isCurrent && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {BILLING_HISTORY.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.date} · Paid via {item.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatKsh(item.amount)}</p>
                  <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200 text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Demo Mode</strong> — No real charges are processed. Contact us to activate live billing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
