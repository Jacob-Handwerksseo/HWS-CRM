import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAppState } from "@/lib/app-state";
import { LeadStatus } from "@/lib/mock-data";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Building2, Mail, Phone, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { USERS } from "@/lib/mock-data";

const COLUMNS: LeadStatus[] = ["Erstkontakt", "Setting", "Closing", "Wiedervorlage"];

export default function ActiveLeads() {
  const { leads, updateLeadField } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  // Group leads by status
  const leadsByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status);
    return acc;
  }, {} as Record<string, typeof leads>);

  return (
    <Layout onNewLead={() => setIsNewLeadOpen(true)}>
      <div className="p-8 h-full flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aktive Leads</h1>
            <p className="text-muted-foreground mt-1">Kanban-Board für laufende Verkaufschancen.</p>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <div key={status} className="flex-shrink-0 w-[350px] flex flex-col bg-muted/30 rounded-xl border border-border/50">
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card rounded-t-xl">
                <h3 className="font-semibold">{status}</h3>
                <Badge variant="secondary" className="bg-background">
                  {leadsByStatus[status].length}
                </Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {leadsByStatus[status].map((lead) => {
                  const assignedUser = USERS.find(u => u.id === lead.assignedTo);
                  return (
                    <Card 
                      key={lead.id} 
                      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-base truncate pr-2">{lead.name}</div>
                          {assignedUser && (
                            <Avatar className="w-6 h-6 border shadow-sm shrink-0">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {assignedUser.avatar}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate">{lead.company}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-[10px] px-1.5 h-5 bg-background">
                            {lead.source}
                          </Badge>
                        </div>
                        
                        {lead.nextFollowUp && (
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 px-2 py-1 rounded-md w-fit">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {format(new Date(lead.nextFollowUp), "dd.MM.yyyy", { locale: de })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      <NewLeadModal
        open={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
      />
    </Layout>
  );
}
