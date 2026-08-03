import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Calendar, DollarSign, Star, Phone, Loader2, ChevronDown, ChevronRight, AlertTriangle, MessageCircle, TrendingDown, Zap } from "lucide-react";
import { useBookings, useServices, useClients } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AtRiskClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  clv: number;
  completedBookings: number;
  daysSinceLastBooking: number;
  lastBookingDate: string | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

const RISK_CONFIG = {
  HIGH:   { label: "High Risk",   color: "bg-red-100 text-red-700 border-red-200" },
  MEDIUM: { label: "Medium Risk", color: "bg-amber-100 text-amber-700 border-amber-200" },
  LOW:    { label: "Low Risk",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export default function Clients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "at-risk">("all");

  // At-Risk state
  const [atRiskClients, setAtRiskClients] = useState<AtRiskClient[]>([]);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);
  const [campaignClient, setCampaignClient] = useState<AtRiskClient | null>(null);
  const [campaignMessage, setCampaignMessage] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);

  useEffect(() => {
    if (activeTab !== "at-risk") return;
    setLoadingAtRisk(true);
    fetch(`${import.meta.env.VITE_API_URL}/users/at-risk`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(data => setAtRiskClients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingAtRisk(false));
  }, [activeTab]);

  const openCampaign = async (client: AtRiskClient) => {
    setCampaignClient(client);
    setGeneratingMessage(true);
    setCampaignMessage("");
    try {
      // Use the AI Advisor to draft a personalised re-engagement message
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/ai/advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          message: `Draft a short, warm WhatsApp re-engagement message (max 2 sentences) for a client named ${client.name} who has spent KES ${client.clv.toLocaleString()} with us but hasn't booked in ${client.daysSinceLastBooking} days. Offer them a 15% discount to come back. Use a friendly tone and end with a call to action. Don't use markdown.`
        })
      });
      const data = await resp.json();
      setCampaignMessage(data.message || `Hi ${client.name}! We miss you 💆‍♀️ It's been a while since your last visit. As a valued client, here's 15% off your next booking. Reply to book now!`);
    } catch {
      setCampaignMessage(`Hi ${client.name}! We miss you 💆‍♀️ It's been a while since your last visit. As a valued client, here's 15% off your next booking. Reply to this message to book now!`);
    } finally {
      setGeneratingMessage(false);
    }
  };

  const sendCampaign = () => {
    if (!campaignClient) return;
    const encoded = encodeURIComponent(campaignMessage);
    const phone = campaignClient.phone.replace(/^\+?0?/, "254"); // Kenyan format
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    toast({ title: "Opening WhatsApp!", description: `Sending campaign to ${campaignClient.name}` });
    setCampaignClient(null);
  };

  if (loadingBookings || loadingServices || loadingClients) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const serviceMap = new Map(services.map((s) => [s.id, s]));

  const enrichedClients = clients.map((client) => {
    const clientBookings = bookings.filter((b) => b.userId === client.id);
    const completedBookings = clientBookings.filter((b) => b.status === "completed");
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0);
    const lastVisit = [...clientBookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      ...client,
      joinedDate: client.createdAt?.split("T")[0] ?? "N/A",
      loyaltyPoints: Math.floor(totalSpent / 100),
      totalBookings: clientBookings.length,
      completedBookings: completedBookings.length,
      totalSpent,
      lastVisit: lastVisit?.date ?? null,
      bookingHistory: clientBookings,
    };
  });

  const filtered = enrichedClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalClientSpend = enrichedClients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLTV = enrichedClients.length > 0 ? Math.round(totalClientSpend / enrichedClients.length) : 0;

  const highRiskCount = atRiskClients.filter(c => c.riskLevel === "HIGH").length;
  const atRiskRevenue = atRiskClients.reduce((s, c) => s + c.clv, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client CRM</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your clients, retention health, and spending patterns.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Clients", value: enrichedClients.length, icon: Users, color: "text-primary" },
          { label: "Total Client Revenue", value: `Ksh ${totalClientSpend.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
          { label: "Avg. Lifetime Value", value: `Ksh ${avgLTV.toLocaleString()}`, icon: Star, color: "text-amber-500" },
          { label: "Repeat Clients", value: enrichedClients.filter((c) => c.completedBookings > 1).length, icon: Calendar, color: "text-blue-600" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white/80 backdrop-blur border-white/40 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-bold text-lg">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          All Clients
        </button>
        <button
          onClick={() => setActiveTab("at-risk")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "at-risk" ? "border-red-500 text-red-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          At-Risk Retention
          {atRiskClients.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{atRiskClients.length}</span>
          )}
        </button>
      </div>

      {activeTab === "all" && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Loyalty Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <>
                    <TableRow
                      key={client.id}
                      className="hover:bg-secondary/20 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === client.id ? null : client.id)}
                    >
                      <TableCell>
                        {expanded === client.id
                          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.joinedDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{client.totalBookings}</span>
                          <span className="text-xs text-muted-foreground">({client.completedBookings} done)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-700">Ksh {client.totalSpent.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.lastVisit ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                          ⭐ {client.loyaltyPoints}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {expanded === client.id && (
                      <TableRow key={`${client.id}-expanded`}>
                        <TableCell colSpan={8} className="bg-secondary/10 p-0">
                          <div className="p-4 space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground mb-3">Booking History for {client.name}</p>
                            {client.bookingHistory.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No bookings yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {client.bookingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((b) => {
                                  const service = serviceMap.get(b.serviceId);
                                  return (
                                    <div key={b.id} className="flex items-center gap-4 text-sm bg-white/60 px-4 py-2 rounded-lg border border-border/40">
                                      <span className="w-24 text-muted-foreground shrink-0">{b.date}</span>
                                      <span className="font-medium flex-1">{service?.name ?? b.serviceId}</span>
                                      <span className="font-semibold text-primary">Ksh {b.price.toLocaleString()}</span>
                                      <Badge variant="secondary" className={
                                        b.status === "completed" ? "bg-green-100 text-green-700 border-green-200" :
                                        b.status === "upcoming" ? "bg-blue-100 text-blue-700 border-blue-200" :
                                        b.status === "cancelled" ? "bg-red-100 text-red-700 border-red-200" :
                                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      }>
                                        {b.status}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No clients found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {activeTab === "at-risk" && (
        <div className="space-y-4">
          {/* At-Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-700 font-medium uppercase tracking-wide">High Risk Clients</p>
                  <p className="text-2xl font-bold text-red-900">{highRiskCount}</p>
                  <p className="text-xs text-red-600">90+ days inactive</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Total At-Risk</p>
                  <p className="text-2xl font-bold text-amber-900">{atRiskClients.length}</p>
                  <p className="text-xs text-amber-600">Inactive 30+ days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Revenue at Risk</p>
                  <p className="text-2xl font-bold text-purple-900">Ksh {atRiskRevenue.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">Total CLV of inactive clients</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Table */}
          {loadingAtRisk ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : atRiskClients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">All clients are active!</h3>
                <p className="text-sm text-neutral-500">No at-risk clients detected. Keep up the great work!</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  At-Risk Clients — Sorted by Customer Lifetime Value
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Lifetime Value (CLV)</TableHead>
                    <TableHead>Completed Bookings</TableHead>
                    <TableHead>Days Inactive</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead className="text-right">Re-engage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={RISK_CONFIG[client.riskLevel].color}>
                          {RISK_CONFIG[client.riskLevel].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-700">Ksh {client.clv.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{client.completedBookings}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${client.daysSinceLastBooking >= 90 ? "text-red-600" : client.daysSinceLastBooking >= 45 ? "text-amber-600" : "text-yellow-600"}`}>
                          {client.daysSinceLastBooking} days
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.lastBookingDate ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => openCampaign(client)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* Campaign Modal */}
      <Dialog open={!!campaignClient} onOpenChange={() => setCampaignClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Send Re-engagement Campaign
            </DialogTitle>
            <DialogDescription>
              AI-drafted WhatsApp message for <strong>{campaignClient?.name}</strong> — CLV: Ksh {campaignClient?.clv.toLocaleString()}, inactive for {campaignClient?.daysSinceLastBooking} days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">Sending to:</p>
              <p className="text-sm font-semibold text-green-900">{campaignClient?.name} · {campaignClient?.phone}</p>
            </div>

            {generatingMessage ? (
              <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is drafting your message...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Message (editable)</label>
                <Textarea
                  value={campaignMessage}
                  onChange={e => setCampaignMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCampaignClient(null)}>Cancel</Button>
            <Button
              onClick={sendCampaign}
              disabled={!campaignMessage || generatingMessage}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp & Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
