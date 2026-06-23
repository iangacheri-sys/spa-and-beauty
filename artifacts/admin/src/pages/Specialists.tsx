import { useState, useEffect } from "react";
import { specialists } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function Specialists() {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('admin_specialist_status');
    if (saved) {
      setStatusOverrides(JSON.parse(saved));
    }
  }, []);

  const toggleStatus = (id: string, isAvailable: boolean) => {
    const next = { ...statusOverrides, [id]: isAvailable };
    setStatusOverrides(next);
    localStorage.setItem('admin_specialist_status', JSON.stringify(next));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Specialists</h1>
        <p className="text-muted-foreground mt-1">Manage your team members and availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialists.map(specialist => {
          const isAvailable = statusOverrides[specialist.id] ?? true;
          
          return (
            <Card key={specialist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback style={{ backgroundColor: specialist.avatarColor, color: '#fff' }} className="text-xl">
                      {specialist.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isAvailable ? 'Available' : 'On Leave'}</span>
                    <Switch 
                      checked={isAvailable}
                      onCheckedChange={(checked) => toggleStatus(specialist.id, checked)}
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold">{specialist.name}</h3>
                <p className="text-muted-foreground mb-4">{specialist.specialty}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Rating</span>
                    <span className="font-medium">★ {specialist.rating}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Experience</span>
                    <span className="font-medium">{specialist.experience}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Services</span>
                    <span className="font-medium">{specialist.serviceIds.length} types</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
