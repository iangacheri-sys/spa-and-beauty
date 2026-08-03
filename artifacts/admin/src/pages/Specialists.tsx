import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useTherapists } from "@/lib/api";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Specialists() {
  const { data: therapists = [], isLoading } = useTherapists();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      await customFetch(`/api/therapists/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Specialists</h1>
        <p className="text-muted-foreground mt-1">Manage your team members and availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map(therapist => {
          const initials = therapist.name.split(' ').map(n => n[0]).join('').toUpperCase();
          
          return (
            <Card key={therapist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{therapist.isActive ? 'Available' : 'On Leave'}</span>
                    <Switch 
                      checked={therapist.isActive}
                      onCheckedChange={(checked) => toggleStatus(therapist.id, checked)}
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold">{therapist.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{therapist.bio}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {therapist.specialties.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {therapists.length === 0 && (
          <p className="col-span-3 text-center text-muted-foreground py-12">No specialists found for this spa.</p>
        )}
      </div>
    </div>
  );
}
