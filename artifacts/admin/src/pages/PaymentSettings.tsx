import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { usePaymentSettings, updatePaymentSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Building, Phone, Smartphone, CreditCard } from "lucide-react";

export default function PaymentSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = usePaymentSettings();

  const [activeProvider, setActiveProvider] = useState("MPESA_POCHI");
  const [mpesaPaybillNumber, setMpesaPaybillNumber] = useState("");
  const [mpesaAccountRef, setMpesaAccountRef] = useState("");
  const [mpesaTillNumber, setMpesaTillNumber] = useState("");
  const [mpesaPochiNumber, setMpesaPochiNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setActiveProvider(settings.activeProvider || "MPESA_POCHI");
      setMpesaPaybillNumber(settings.mpesaPaybillNumber || "");
      setMpesaAccountRef(settings.mpesaAccountRef || "");
      setMpesaTillNumber(settings.mpesaTillNumber || "");
      setMpesaPochiNumber(settings.mpesaPochiNumber || "");
      setInstructions(settings.instructions || "");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePaymentSettings({
        activeProvider,
        mpesaPaybillNumber,
        mpesaAccountRef,
        mpesaTillNumber,
        mpesaPochiNumber,
        instructions
      });
      toast({ title: "Success", description: "Payment settings updated." });
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || isLoading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Settings</h2>
          <p className="text-muted-foreground mt-2">Configure how you accept payments from customers.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>M-Pesa Integration</CardTitle>
            <CardDescription>
              Select your preferred M-Pesa payment method. This will dictate how the mobile app processes checkout for your spa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Active Payment Provider</Label>
              <Select value={activeProvider} onValueChange={setActiveProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPESA_POCHI">
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                      M-Pesa Pochi la Biashara
                    </div>
                  </SelectItem>
                  <SelectItem value="MPESA_TILL">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-green-600" />
                      Lipa na M-Pesa (Buy Goods / Till)
                    </div>
                  </SelectItem>
                  <SelectItem value="MPESA_PAYBILL">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                      M-Pesa Paybill
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DYNAMIC FORMS BASED ON PROVIDER */}
            {activeProvider === "MPESA_POCHI" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="space-y-2">
                  <Label>Phone Number (Pochi la Biashara)</Label>
                  <Input 
                    placeholder="e.g. 0712345678" 
                    value={mpesaPochiNumber} 
                    onChange={e => setMpesaPochiNumber(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">The number registered for Pochi la Biashara.</p>
                </div>
              </div>
            )}

            {activeProvider === "MPESA_TILL" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="space-y-2">
                  <Label>Till Number</Label>
                  <Input 
                    placeholder="e.g. 123456" 
                    value={mpesaTillNumber} 
                    onChange={e => setMpesaTillNumber(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {activeProvider === "MPESA_PAYBILL" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paybill Number (Business No)</Label>
                    <Input 
                      placeholder="e.g. 123456" 
                      value={mpesaPaybillNumber} 
                      onChange={e => setMpesaPaybillNumber(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Reference</Label>
                    <Input 
                      placeholder="e.g. BeautyBooker" 
                      value={mpesaAccountRef} 
                      onChange={e => setMpesaAccountRef(e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use the booking ID automatically.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 border-t pt-6">
              <Label>Custom Checkout Instructions (Optional)</Label>
              <Textarea 
                placeholder="e.g. 'Please pay using Pochi to Jane Doe. The system will verify automatically.'" 
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This message is shown to the customer on the checkout screen.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Payment Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
  );
}
