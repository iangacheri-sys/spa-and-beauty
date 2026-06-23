import { useState, useEffect } from "react";
import { services } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('admin_service_status');
    if (saved) {
      setStatusOverrides(JSON.parse(saved));
    }
  }, []);

  const toggleStatus = (id: string, isActive: boolean) => {
    const next = { ...statusOverrides, [id]: isActive };
    setStatusOverrides(next);
    localStorage.setItem('admin_service_status', JSON.stringify(next));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground mt-1">Manage your spa service catalog and pricing.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price (KES)</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(service => {
              const isActive = statusOverrides[service.id] ?? true;
              
              return (
                <TableRow key={service.id} className={!isActive ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category}</Badge>
                  </TableCell>
                  <TableCell>{service.duration} mins</TableCell>
                  <TableCell>{service.price.toLocaleString()}</TableCell>
                  <TableCell>★ {service.rating} ({service.reviews})</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={isActive}
                        onCheckedChange={(checked) => toggleStatus(service.id, checked)}
                      />
                      <span className="text-xs text-muted-foreground">{isActive ? 'Active' : 'Paused'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
