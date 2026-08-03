import { useState } from "react";
import { Clock, Calendar as CalendarIcon, CheckCircle2, User, AlertCircle, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useBookings, useServices, useTherapists } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function TherapistDashboard() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: therapists = [], isLoading: loadingTherapists } = useTherapists();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const therapist = therapists.find(t => t.userId === user?.id);
  const [isAvailable, setIsAvailable] = useState(therapist?.isActive ?? true);

  if (loadingBookings || loadingServices || loadingTherapists) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  
  const myBookings = bookings
    .filter(b => b.therapistId === therapist?.id && b.date === todayStr)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const completedCount = myBookings.filter(b => b.status === "completed").length;
  
  // Calculate hours booked
  let minutesBooked = 0;
  myBookings.forEach(b => {
    const service = services.find(s => s.id === b.serviceId);
    if (service) minutesBooked += service.duration;
  });
  const hoursBooked = (minutesBooked / 60).toFixed(1);

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    if (therapist) {
      try {
        await customFetch(`/api/therapists/${therapist.id}`, {
          method: "PUT",
          body: JSON.stringify({ isActive: checked }),
        });
        queryClient.invalidateQueries({ queryKey: ['therapists'] });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
        setIsAvailable(!checked); // revert
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await customFetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: "Status updated", description: `Appointment marked as ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {user?.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">Here is your schedule for today, {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/80 px-4 py-3 rounded-xl border border-border/50 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">Accepting Walk-ins</span>
            <span className="text-xs text-muted-foreground">{isAvailable ? "Available" : "Busy"}</span>
          </div>
          <Switch checked={isAvailable} onCheckedChange={toggleAvailability} className="data-[state=checked]:bg-primary" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Schedule Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Today's Appointments
          </h3>
          
          <div className="space-y-3">
            {myBookings.map((apt) => {
              const service = services.find(s => s.id === apt.serviceId);
              
              return (
                <Card key={apt.id} className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 bg-secondary/30 rounded-lg p-2">
                      <Clock className="w-4 h-4 text-primary mb-1" />
                      <span className="font-semibold text-sm">{apt.timeSlot}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">Client {apt.userId}</h4>
                        <Badge variant={apt.status === "completed" ? "secondary" : apt.status === "upcoming" ? "default" : "outline"}>
                          {apt.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/80 font-medium">{service?.name || 'Service'} • {service?.duration || 60} min</p>
                    </div>
                    
                    <div className="flex-shrink-0 flex sm:flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                      {apt.status === "upcoming" && (
                        <Button size="sm" className="w-full sm:w-auto bg-primary text-white" onClick={() => handleStatusUpdate(apt.id, 'completed')}>
                          Mark Complete
                        </Button>
                      )}
                      {apt.status === "upcoming" && (
                         <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white text-red-600 hover:text-red-700" onClick={() => handleStatusUpdate(apt.id, 'no-show')}>
                           No Show
                         </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {myBookings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-white/50 rounded-lg border border-white/40">
                No appointments scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status Column */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-semibold">{myBookings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">{completedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hours Booked</span>
                <span className="font-semibold">{hoursBooked} hrs</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Service Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 rounded border-primary text-primary focus:ring-primary" />
                <span>Sanitize room before next client</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 rounded border-primary text-primary focus:ring-primary" />
                <span>Restock supplies</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 rounded border-primary text-primary focus:ring-primary" />
                <span>Submit end-of-day notes</span>
              </label>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
