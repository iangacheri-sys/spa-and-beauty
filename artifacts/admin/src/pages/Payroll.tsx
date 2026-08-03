import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';
import { useCommissions, usePayrollSummary, payCommissions } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';

export default function Payroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const spaId = user?.spaId;
  const [activeTab, setActiveTab] = useState('pending');

  const { data: summary, isLoading: loadingSummary } = usePayrollSummary(spaId);
  const { data: commissions, isLoading: loadingCommissions } = useCommissions(spaId, activeTab === 'paid' ? 'PAID' : 'PENDING');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (!commissions) return;
    if (selectedIds.length === commissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(commissions.map(c => c.id));
    }
  };

  const handlePay = async () => {
    if (selectedIds.length === 0) return;
    
    setIsPaying(true);
    try {
      await payCommissions(selectedIds);
      toast({ title: "Success", description: `Marked ${selectedIds.length} commissions as paid.` });
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-summary'] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsPaying(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll & Commissions</h2>
          <p className="text-muted-foreground mt-2">Manage therapist payouts and track pending commissions.</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summary?.map(therapist => (
            <Card key={therapist.therapistId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{therapist.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(therapist.pending)}</div>
                <p className="text-xs text-muted-foreground">
                  Pending Payout
                </p>
                <div className="mt-4 text-sm">
                  <span className="text-muted-foreground">Total Paid: </span>
                  <span className="font-semibold">{formatCurrency(therapist.paid)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {summary?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No payroll data available yet.
            </div>
          )}
        </div>

        {/* TABS FOR PENDING / PAID */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Records</CardTitle>
            <CardDescription>View individual service commissions per booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                </TabsList>
                
                {activeTab === 'pending' && selectedIds.length > 0 && (
                  <Button onClick={handlePay} disabled={isPaying}>
                    Mark {selectedIds.length} as Paid
                  </Button>
                )}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeTab === 'pending' && (
                        <TableHead className="w-[50px]">
                          <input 
                            type="checkbox" 
                            checked={commissions?.length > 0 && selectedIds.length === commissions.length}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                      )}
                      <TableHead>Date</TableHead>
                      <TableHead>Therapist</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Booking Price</TableHead>
                      <TableHead className="text-right">Commission Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCommissions ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : commissions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No {activeTab} commissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      commissions?.map((c) => (
                        <TableRow key={c.id}>
                          {activeTab === 'pending' && (
                            <TableCell>
                              <input 
                                type="checkbox" 
                                checked={selectedIds.includes(c.id)}
                                onChange={() => toggleSelect(c.id)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div>{new Date(c.booking.date).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{c.booking.timeSlot}</div>
                          </TableCell>
                          <TableCell className="font-medium">{c.therapist.name}</TableCell>
                          <TableCell>{c.booking.service.name}</TableCell>
                          <TableCell>{c.booking.service.commissionPercent}%</TableCell>
                          <TableCell>{formatCurrency(c.booking.price)}</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {formatCurrency(c.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  );
}
