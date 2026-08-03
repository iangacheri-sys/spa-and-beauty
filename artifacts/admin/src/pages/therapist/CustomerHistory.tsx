import { useState } from "react";
import { Search, History, FileText, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Emily Johnson",
    lastVisit: "2026-06-15",
    totalVisits: 8,
    preferences: ["Firm pressure", "Lavender oil", "Silence during session"],
    history: [
      { date: "2026-06-15", service: "Deep Tissue Massage", notes: "Tight lower back. Used arnica." },
      { date: "2026-05-02", service: "Swedish Massage", notes: "General relaxation." },
    ]
  },
  {
    id: 2,
    name: "Michael Smith",
    lastVisit: "2026-07-01",
    totalVisits: 3,
    preferences: ["Sensitive skin", "Prefers morning appointments"],
    history: [
      { date: "2026-07-01", service: "Classic Facial", notes: "Slight redness after exfoliation. Recommend gentle cleanser." },
    ]
  }
];

export default function CustomerHistory() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(MOCK_CUSTOMERS[0]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Customer History & Notes</h2>
        <p className="text-muted-foreground mt-1 text-sm">Review past treatments, preferences, and treatment notes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Customer List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-9 bg-white/50 border-white/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {MOCK_CUSTOMERS.map((customer) => (
              <Card 
                key={customer.id} 
                className={`cursor-pointer transition-all ${selectedCustomer.id === customer.id ? 'border-primary shadow-md bg-white/90' : 'bg-white/60 hover:bg-white/80 border-white/40 shadow-sm'}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold">{customer.name}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <History className="w-3 h-3" /> Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        {selectedCustomer && (
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedCustomer.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> {selectedCustomer.totalVisits} Total Visits
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="bg-white">Update Profile</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="font-semibold text-sm mb-2 uppercase tracking-wider text-muted-foreground">Client Preferences</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCustomer.preferences.map((pref, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{pref}</Badge>
                  ))}
                </div>

                <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Treatment History</h4>
                <div className="space-y-4">
                  {selectedCustomer.history.map((record, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-1 shadow-sm">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold">{record.service}</h5>
                          <span className="text-xs text-muted-foreground bg-white/50 px-2 py-0.5 rounded-full border border-border/50">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed bg-white/50 p-3 rounded-lg mt-2 border border-white">
                          {record.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
