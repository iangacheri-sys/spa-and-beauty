import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldAlert, CreditCard, Clock, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SpaPolicy {
  spaId: string;
  depositType: 'none' | 'fixed' | 'percentage';
  depositPercent: number;
  depositFixed: number;
  depositMinBookingValue: number;
  depositAppliesTo: 'all' | 'services' | 'classes';
  depositPolicyText: string;
  freeCancellationHours: number;
  lateCancelRetainPercent: number;
  refundPolicy: 'full' | 'partial' | 'transfer' | 'none';
  rescheduleAllowed: boolean;
  rescheduleLimitHours: number;
  cancellationPolicyText: string;
  noShowRetainPercent: number;
  noShowPolicyText: string;
}

const DEFAULT_POLICY: SpaPolicy = {
  spaId: '',
  depositType: 'none',
  depositPercent: 50,
  depositFixed: 0,
  depositMinBookingValue: 0,
  depositAppliesTo: 'all',
  depositPolicyText: 'A deposit is required to secure your booking. The remaining balance is payable at the spa.',
  freeCancellationHours: 24,
  lateCancelRetainPercent: 100,
  refundPolicy: 'none',
  rescheduleAllowed: true,
  rescheduleLimitHours: 12,
  cancellationPolicyText: 'Please cancel at least 24 hours before your appointment.',
  noShowRetainPercent: 100,
  noShowPolicyText: 'No-shows will forfeit their deposit.',
};

export default function Policies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const spaId = user?.spaId || 's5';
  
  const [activeTab, setActiveTab] = useState<'deposit' | 'cancellation' | 'noshow' | 'preview'>('deposit');
  const [policy, setPolicy] = useState<SpaPolicy>({ ...DEFAULT_POLICY, spaId });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/messages/policy?spaId=${spaId}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setPolicy(data);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [spaId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/messages/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        const updated = await res.json();
        setPolicy(updated);
        toast({ title: "Policies saved successfully", description: "Changes are now active for new bookings." });
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      toast({ title: "Failed to save policies", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'deposit', label: 'Deposits', icon: CreditCard },
    { key: 'cancellation', label: 'Cancellations', icon: Clock },
    { key: 'noshow', label: 'No-Shows', icon: ShieldAlert },
    { key: 'preview', label: 'Client Preview', icon: CheckCircle2 },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Policies</h1>
          <p className="text-muted-foreground mt-1">Configure deposits, cancellations, and no-show rules</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? 'Saving...' : 'Save Policies'}
        </Button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.key ? 'bg-white border border-b-white border-gray-200 -mb-px text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[400px]">
        {/* ── DEPOSITS TAB ────────────────────────────────────────── */}
        {activeTab === 'deposit' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <Label className="text-base font-semibold block mb-3">Deposit Requirement</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'none', label: 'No Deposit' },
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed Amount (Ksh)' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setPolicy({ ...policy, depositType: opt.value as any })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${policy.depositType === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {policy.depositType === 'percentage' && (
              <div>
                <Label className="block mb-2">Deposit Percentage</Label>
                <div className="flex flex-wrap gap-2">
                  {[20, 30, 50, 75, 100].map(pct => (
                    <button key={pct} onClick={() => setPolicy({ ...policy, depositPercent: pct })}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${policy.depositPercent === pct ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {policy.depositType === 'fixed' && (
              <div>
                <Label className="block mb-2">Fixed Deposit Amount (Ksh)</Label>
                <Input 
                  type="number" 
                  value={policy.depositFixed} 
                  onChange={e => setPolicy({ ...policy, depositFixed: Number(e.target.value) })}
                  className="max-w-xs"
                />
              </div>
            )}

            {policy.depositType !== 'none' && (
              <>
                <div>
                  <Label className="block mb-2">Minimum Booking Value (Ksh)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Deposit only applies to bookings above this amount (0 = applies to all).</p>
                  <Input 
                    type="number" 
                    value={policy.depositMinBookingValue} 
                    onChange={e => setPolicy({ ...policy, depositMinBookingValue: Number(e.target.value) })}
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <Label className="block mb-2">Applies To</Label>
                  <select 
                    value={policy.depositAppliesTo} 
                    onChange={e => setPolicy({ ...policy, depositAppliesTo: e.target.value as any })}
                    className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Services & Classes</option>
                    <option value="services">Services Only</option>
                    <option value="classes">Classes Only</option>
                  </select>
                </div>
                <div>
                  <Label className="block mb-2">Policy Text (Shown to clients)</Label>
                  <textarea 
                    value={policy.depositPolicyText} 
                    onChange={e => setPolicy({ ...policy, depositPolicyText: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CANCELLATION TAB ────────────────────────────────────── */}
        {activeTab === 'cancellation' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">These rules determine what happens to a client's deposit if they cancel their booking.</p>
            </div>

            <div>
              <Label className="block mb-2">Free Cancellation Window</Label>
              <p className="text-xs text-muted-foreground mb-2">Cancellations before this time receive a full refund.</p>
              <select 
                value={policy.freeCancellationHours} 
                onChange={e => setPolicy({ ...policy, freeCancellationHours: Number(e.target.value) })}
                className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={0}>No free cancellation (Strict)</option>
                <option value={12}>12 hours before appointment</option>
                <option value={24}>24 hours before appointment</option>
                <option value={48}>48 hours before appointment</option>
                <option value={72}>72 hours before appointment</option>
              </select>
            </div>

            <div>
              <Label className="block mb-2">Late Cancellation Penalty</Label>
              <p className="text-xs text-muted-foreground mb-2">If cancelled closer to the appointment, retain this % of the deposit.</p>
              <div className="flex flex-wrap gap-2">
                {[0, 25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setPolicy({ ...policy, lateCancelRetainPercent: pct })}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${policy.lateCancelRetainPercent === pct ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    {pct}% retained
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="block mb-2 flex items-center gap-2">
                <input type="checkbox" checked={policy.rescheduleAllowed} onChange={e => setPolicy({ ...policy, rescheduleAllowed: e.target.checked })} className="rounded text-primary focus:ring-primary" />
                Allow clients to reschedule instead of cancelling?
              </Label>
              {policy.rescheduleAllowed && (
                <div className="ml-6 mt-2">
                  <Label className="block mb-2 text-sm">Reschedule Deadline</Label>
                  <select 
                    value={policy.rescheduleLimitHours} 
                    onChange={e => setPolicy({ ...policy, rescheduleLimitHours: Number(e.target.value) })}
                    className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={0}>Up to appointment time</option>
                    <option value={12}>At least 12 hours before</option>
                    <option value={24}>At least 24 hours before</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2">Policy Text (Shown to clients)</Label>
              <textarea 
                value={policy.cancellationPolicyText} 
                onChange={e => setPolicy({ ...policy, cancellationPolicyText: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* ── NO-SHOW TAB ─────────────────────────────────────────── */}
        {activeTab === 'noshow' && (
          <div className="space-y-6 max-w-2xl">
             <div>
              <Label className="block mb-2">No-Show Penalty</Label>
              <p className="text-xs text-muted-foreground mb-2">Percentage of deposit retained if a client does not show up without cancelling.</p>
              <div className="flex flex-wrap gap-2">
                {[0, 50, 100].map(pct => (
                  <button key={pct} onClick={() => setPolicy({ ...policy, noShowRetainPercent: pct })}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${policy.noShowRetainPercent === pct ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    {pct}% retained
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="block mb-2">Policy Text (Shown to clients)</Label>
              <textarea 
                value={policy.noShowPolicyText} 
                onChange={e => setPolicy({ ...policy, noShowPolicyText: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* ── PREVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-lg">How clients see your policies</h3>
              <p className="text-sm text-muted-foreground">This is displayed in the booking flow before payment.</p>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-5 space-y-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Payment & Deposit</h4>
                  <p className="text-sm text-gray-600 mt-1">{policy.depositPolicyText}</p>
                </div>
              </div>

              <div className="w-full h-px bg-gray-200" />

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600 mt-1">{policy.cancellationPolicyText}</p>
                </div>
              </div>

              <div className="w-full h-px bg-gray-200" />

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">No-Show Policy</h4>
                  <p className="text-sm text-gray-600 mt-1">{policy.noShowPolicyText}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
