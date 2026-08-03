import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, Store, Scissors, Users, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

const AMENITIES_LIST = ['Parking', 'WiFi', 'Wheelchair Access', 'Refreshments', 'Restrooms', 'Air Conditioning'];

export default function SetupWizard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Business Info
  const [brandStory, setBrandStory] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  // Step 2: First Service
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');

  // Step 3: Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  // Step 4: Payments
  const [mpesaPaybill, setMpesaPaybill] = useState('');

  // Load existing data if available
  useEffect(() => {
    if (user?.spaId) {
      fetch(`/api/spas/${user.spaId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.brandStory) setBrandStory(data.brandStory);
        if (data.amenities) setAmenities(data.amenities);
        // If they accidentally refreshed and are already set up, redirect
        if (data.setupComplete) {
          setLocation('/');
        }
      })
      .catch(console.error);
    }
  }, [user, setLocation]);

  const toggleAmenity = (am: string) => {
    setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // Refresh token first — user may have spent time on the wizard and the access token may be expired
      const { refreshAccessToken } = useAuth.getState();
      const freshToken = await refreshAccessToken();
      const token = freshToken || localStorage.getItem('admin_token');

      if (!token) {
        throw new Error('Session expired. Please log in again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      // 1. Mark Spa as setup complete
      // Use /api prefix so the Vite dev proxy handles it (VITE_API_URL is only for production builds)
      const spaRes = await fetch(`/api/spas/${user?.spaId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ brandStory, amenities, setupComplete: true })
      });
      if (!spaRes.ok) {
        const err = await spaRes.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update spa: ${spaRes.status}`);
      }

      // 2. Create Service (optional)
      if (serviceName && servicePrice) {
        await fetch(`/api/services`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: serviceName,
            price: Number(servicePrice),
            duration: Number(serviceDuration),
            categoryId: 'uncategorized'
          })
        });
      }

      // 3. Create Payment Settings (optional)
      if (mpesaPaybill) {
        await fetch(`/api/settings/payment`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            activeProvider: 'MPESA_PAYBILL',
            mpesaPaybillNumber: mpesaPaybill
          })
        });
      }

      // 4. Refresh the user object in the Zustand store so App.tsx sees spaSetupComplete=true
      // Without this, the gate in App.tsx still has the stale value and will redirect back to /setup
      const meRes = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (meRes.ok) {
        const freshUser = await meRes.json();
        const { setAuth } = useAuth.getState();
        const refreshToken = localStorage.getItem('admin_refresh_token') || '';
        setAuth(token!, refreshToken, { ...freshUser, spaSetupComplete: true });
      }

      // Navigate to dashboard
      window.location.href = '/';
    } catch (err: any) {
      console.error('Setup failed:', err);
      alert(`Failed to complete setup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { icon: Store, title: 'Business Profile' },
    { icon: Scissors, title: 'First Service' },
    { icon: Users, title: 'Team' },
    { icon: CreditCard, title: 'Payments' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
              ${step > i + 1 ? 'bg-primary border-primary text-primary-foreground' : 
                step === i + 1 ? 'border-primary text-primary' : 'border-neutral-200 text-neutral-400'}`}>
              {step > i + 1 ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium ${step >= i + 1 ? 'text-neutral-900' : 'text-neutral-400'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="w-full max-w-3xl">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Welcome to Beauty Booker</CardTitle>
              <CardDescription>Let's make your spa stand out to potential clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Brand Story / Bio</Label>
                <Textarea 
                  placeholder="Tell clients what makes your spa unique..." 
                  value={brandStory}
                  onChange={(e) => setBrandStory(e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="space-y-3">
                <Label>Amenities Available</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(am => (
                    <button
                      key={am}
                      onClick={() => toggleAmenity(am)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border
                        ${amenities.includes(am) ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary'}`}
                    >
                      {am}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Add Your First Service</CardTitle>
              <CardDescription>You can add more later. Let's get one set up so clients can book you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input placeholder="e.g. Swedish Massage" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (KES)</Label>
                  <Input type="number" placeholder="2500" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Minutes)</Label>
                  <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Add a Staff Member (Optional)</CardTitle>
              <CardDescription>Invite a therapist or receptionist to manage bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Name</Label>
                <Input placeholder="Jane Doe" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email (for their login)</Label>
                <Input type="email" placeholder="jane@example.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Note: An invite link will be sent to this email automatically.
              </p>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Accept Mobile Payments</CardTitle>
              <CardDescription>Configure Lipa na M-Pesa to accept deposits instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-4">
                <p className="text-sm text-green-800 font-medium mb-1">M-Pesa Integration</p>
                <p className="text-xs text-green-700">We will automatically prompt clients for payment using STK Push when they book online.</p>
              </div>
              <div className="space-y-2">
                <Label>M-Pesa Paybill Number (Optional)</Label>
                <Input placeholder="e.g. 123456" value={mpesaPaybill} onChange={(e) => setMpesaPaybill(e.target.value)} />
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : null} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={loading} className="gap-2">
            {step === 4 ? (loading ? 'Saving...' : 'Finish Setup') : 'Continue'}
            {step < 4 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
