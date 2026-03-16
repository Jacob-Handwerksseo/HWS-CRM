import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";
import { useAppState } from "@/lib/app-state";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Erstkontakt": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  "Setting": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Closing": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Wiedervorlage": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Verlorener Lead": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function LostLeads() {
  const { leads, currentUser, users } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  const filteredLeads = leads.filter(lead => lead.status === "Verlorener Lead");

  return (
    <Layout onNewLead={() => setIsNewLeadOpen(true)}>
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Verlorene Leads</h1>
            <p className="text-muted-foreground mt-1">Übersicht der nicht erfolgreichen Leads.</p>
          </div>
        </div>

        <div className="bg-card border shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold h-12">Name & Firma</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Quelle</TableHead>
                  <TableHead className="font-semibold h-12">Zuständig</TableHead>
                  <TableHead className="font-semibold h-12 text-right">Letzter Kontakt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Keine verlorenen Leads gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const assignedUser = users.find(u => u.id === lead.assignedTo);
                    
                    return (
                      <TableRow 
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.company}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[lead.status] || ""}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent">
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignedUser ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6 border shadow-sm">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {assignedUser.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{assignedUser.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Nicht zugewiesen</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {lead.lastContact 
                              ? format(new Date(lead.lastContact), "dd.MM.yyyy HH:mm", { locale: de }) 
                              : "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
