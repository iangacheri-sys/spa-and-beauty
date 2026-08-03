import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    spaName: "",
    address: "",
    county: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = { ...formData };
      if (!body.email) delete body.email;

      const res = await fetch("/api/auth/register-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Don't auto-login — user must wait for approval before accessing dashboard
      toast({ title: "Application Submitted!", description: "We'll review your application shortly." });
      setStep(3);
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(270,60%,96%) 0%, hsl(215,80%,96%) 50%, hsl(160,60%,96%) 100%)" }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white text-2xl font-black mb-4 shadow-lg shadow-primary/30">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Partner Registration</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join the Beauty Booker marketplace</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6">
          {/* Step 1: Owner Details */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="name">Your Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>
              
              <Button className="w-full mt-2" type="submit">
                Continue to Spa Details <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {/* Step 2: Spa Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="spaName">Spa/Business Name</Label>
                <Input id="spaName" value={formData.spaName} onChange={handleChange} required placeholder="Glow Spa & Wellness" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County/Region</Label>
                <Input id="county" value={formData.county} onChange={handleChange} required placeholder="e.g., Kilifi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Input id="address" value={formData.address} onChange={handleChange} required placeholder="123 Beach Road, Town" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="flex-1" type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Application"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95 duration-500 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-2">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">Application Submitted!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your application is under review. Our team will approve it within <strong>1–2 business days</strong>.
                Once approved, you can log in and access your dashboard.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                You can log in to check your application status at any time.
              </div>
              <Link href="/login">
                <Button className="w-full mt-2">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {step !== 3 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
