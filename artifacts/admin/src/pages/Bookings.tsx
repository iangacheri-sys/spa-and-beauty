import { useState, useEffect } from "react";
import { bookings as initialBookings, services, specialists, Booking } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Bookings() {
  const [bookingsList, setBookingsList] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem('admin_booking_overrides');
    if (saved) {
      const overrides = JSON.parse(saved);
      setBookingsList(prev => prev.map(b => overrides[b.id] ? { ...b, status: overrides[b.id] } : b));
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
    
    const saved = localStorage.getItem('admin_booking_overrides');
    const overrides = saved ? JSON.parse(saved) : {};
    overrides[id] = newStatus;
    localStorage.setItem('admin_booking_overrides', JSON.stringify(overrides));
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'upcoming') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredBookings = bookingsList.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage all your upcoming and past appointments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input 
          placeholder="Search by client name..." 
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
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Specialist</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map(booking => {
              const service = services.find(s => s.id === booking.serviceId);
              const specialist = specialists.find(s => s.id === booking.specialistId);
              
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.clientName}</TableCell>
                  <TableCell>{service?.name}</TableCell>
                  <TableCell>{specialist?.name}</TableCell>
                  <TableCell>{booking.date} at {booking.time}</TableCell>
                  <TableCell>KES {booking.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={booking.status} onValueChange={(v) => handleStatusChange(booking.id, v)}>
                      <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(booking.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
