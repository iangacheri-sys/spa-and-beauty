import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useBookings, useServices, useTherapists } from "@/lib/api";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const { data: bookings = [], isLoading } = useBookings();
  const { data: services = [] } = useServices();
  const { data: therapists = [] } = useTherapists();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await customFetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: "Status updated", description: `Booking marked as ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };



  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'upcoming') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'no-show') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Build lookup maps
  const users = new Map<string, string>();
  // We don't have a users API yet, so use IDs
  const serviceMap = new Map(services.map(s => [s.id, s]));
  const therapistMap = new Map(therapists.map(t => [t.id, t]));

  const filteredBookings = bookings.filter(b => {
    const service = serviceMap.get(b.serviceId);
    const therapist = therapistMap.get(b.therapistId);
    const searchStr = `${service?.name || ''} ${therapist?.name || ''} ${b.userId}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h2>
        <p className="text-muted-foreground mt-1 text-sm">Manage all your upcoming and past appointments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input 
          placeholder="Search by service or therapist..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Therapist</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Price (KSH)</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                </TableCell>
              </TableRow>
            ) : filteredBookings.map(booking => {
              const service = serviceMap.get(booking.serviceId);
              const therapist = therapistMap.get(booking.therapistId);
              
              return (
                <TableRow key={booking.id} className="hover:bg-white/60 transition-colors">
                  <TableCell className="font-medium">{booking.userId}</TableCell>
                  <TableCell>{service?.name || booking.serviceId}</TableCell>
                  <TableCell>{therapist?.name || (booking.therapistId === 'any' ? 'Best Available' : booking.therapistId)}</TableCell>
                  <TableCell>{booking.date} at {booking.timeSlot}</TableCell>
                  <TableCell className="font-semibold">KSH {booking.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      booking.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                      booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {booking.status === 'upcoming' ? (
                      <Select value={booking.status} onValueChange={(v) => handleStatusChange(booking.id, v)}>
                        <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(booking.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No-Show</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
