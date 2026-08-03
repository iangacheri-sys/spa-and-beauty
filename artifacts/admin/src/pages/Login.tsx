import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Zap, User, ArrowRight, Loader2 } from "lucide-react";

interface DemoAccount {
  label: string;
  sublabel: string;
  phone: string;
  password: string;
  icon: any;
  color: string;
  iconColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Platform Admin",
    sublabel: "All spas overview",
    phone: "0700000000",
    password: "password",
    icon: Shield,
    color: "from-violet-50 to-purple-50 border-violet-200 hover:border-violet-400",
    iconColor: "text-violet-600 bg-violet-100",
  },
  {
    label: "Kilifi Spa Owner",
    sublabel: "Bofa Beach Wellness",
    phone: "0712121212",
    password: "password",
    icon: Zap,
    color: "from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600 bg-blue-100",
  },
  {
    label: "Kilifi Therapist",
    sublabel: "Esther Omondi",
    phone: "0713131313",
    password: "password",
    icon: User,
    color: "from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400",
    iconColor: "text-emerald-600 bg-emerald-100",
  },
];

export default function Login() {
  const [phone, setPhone] = useState("0712121212");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e?: React.FormEvent, overridePhone?: string, overridePassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);

    const loginPhone = overridePhone ?? phone;
    const loginPassword = overridePassword ?? password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.requiresOtp) {
        setShowOtp(true);
        toast({ title: "OTP Sent", description: data.message });
        return;
      }

      await finalizeLogin(data);
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP Verification failed");

      await finalizeLogin(data);
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = async (data: any) => {
    let enrichedUser = data.user;

    // For SPA_OWNERs, fetch /me to get live approval status
    if (data.user.role === "SPA_OWNER") {
      const meRes = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        const approvalStatus = meData.ownedSpas?.[0]?.approvalStatus ?? "PENDING";
        enrichedUser = { ...enrichedUser, ownedSpas: meData.ownedSpas, spaApprovalStatus: approvalStatus };
      }
    }

    setAuth(data.accessToken, data.refreshToken, enrichedUser);
    toast({ title: "Welcome back!", description: `Signed in as ${data.user.name}` });

    if (enrichedUser.role === "THERAPIST") {
      setLocation("/therapist");
    } else {
      setLocation("/");
    }
  };

  const quickLogin = (account: DemoAccount) => {
    handleLogin(undefined, account.phone, account.password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(270,60%,96%) 0%, hsl(215,80%,96%) 50%, hsl(160,60%,96%) 100%)" }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white text-2xl font-black mb-4 shadow-lg shadow-primary/30">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Beauty Booker</h1>
          <p className="text-muted-foreground mt-1 text-sm">Admin & Business Portal · Kilifi Focus Demo</p>
        </div>

        {/* Quick Login */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Demo Login</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.phone}
                onClick={() => quickLogin(account)}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${account.color} transition-all duration-200 hover:shadow-sm text-left group disabled:opacity-50`}
              >
                <div className={`p-2 rounded-lg ${account.iconColor}`}>
                  <account.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{account.label}</p>
                  <p className="text-xs text-muted-foreground">{account.sublabel}</p>
                </div>
                {loading ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-white/60 backdrop-blur px-3 py-0.5 rounded-full">or sign in manually</span>
          </div>
        </div>

        {/* Manual Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6 space-y-4">
          {!showOtp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP sent to {phone}</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="text-center tracking-widest text-lg"
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading || otpCode.length !== 6}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Verify OTP"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowOtp(false)}>
                Back to Login
              </Button>
            </form>
          )}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Are you a Spa Owner? <Link href="/register" className="text-primary font-medium hover:underline">Register your business</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
