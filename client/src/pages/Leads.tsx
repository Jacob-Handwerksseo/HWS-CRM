import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";
import { useAppState } from "@/lib/app-state";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { USERS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Kontaktiert": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  "Qualifiziert": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Verhandlung": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Gewonnen": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Verloren": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function Leads() {
  const { leads, currentUser, deleteLead } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeAssigneeFilter, setActiveAssigneeFilter] = useState("all");

  const filteredLeads = leads.filter(lead => {
    // Filter by source
    if (activeTab === "google-ads" && lead.source !== "Google Ads") return false;
    if (activeTab === "import" && lead.source !== "Tool-Import") return false;
    if (activeTab === "manual" && lead.source !== "Manuell") return false;
    
    // Filter by assignee
    if (activeAssigneeFilter === "mine" && lead.assignedTo !== currentUser?.id) return false;
    if (activeAssigneeFilter === "unassigned" && lead.assignedTo !== null) return false;
    if (activeAssigneeFilter === "user_a" && lead.assignedTo !== "user_a") return false;
    if (activeAssigneeFilter === "user_b" && lead.assignedTo !== "user_b") return false;

    return true;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Sind Sie sicher, dass Sie diesen Lead unwiderruflich löschen möchten?")) {
      deleteLead(id);
    }
  };

  return (
    <Layout onNewLead={() => setIsNewLeadOpen(true)}>
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-1">Verwalten und verfolgen Sie Ihre Verkaufschancen.</p>
          </div>
        </div>

        <div className="bg-card border shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto overflow-x-auto">
              <TabsList className="bg-background border shadow-sm">
                <TabsTrigger value="all">Alle Leads</TabsTrigger>
                <TabsTrigger value="google-ads" className="flex gap-2">
                  Google Ads
                  <Badge variant="secondary" className="px-1.5 h-5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                    {leads.filter(l => l.source === "Google Ads").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="import">Tool-Import</TabsTrigger>
                <TabsTrigger value="manual">Manuell</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={activeAssigneeFilter} onValueChange={setActiveAssigneeFilter} className="w-full lg:w-auto overflow-x-auto">
              <TabsList className="bg-background border shadow-sm">
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="mine">Meine Leads</TabsTrigger>
                <TabsTrigger value="unassigned">Nicht zugewiesen</TabsTrigger>
                <TabsTrigger value="user_a">André</TabsTrigger>
                <TabsTrigger value="user_b">Jacob</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 hover:bg-muted/30">
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Name / Firma <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Zuweisung</TableHead>
                  <TableHead>Letzter Kontakt</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Keine Leads in dieser Ansicht gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const assignee = USERS.find(u => u.id === lead.assignedTo);
                    
                    return (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">{lead.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{lead.company}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[lead.status] || ""}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{lead.source}</span>
                        </TableCell>
                        <TableCell>
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6 border">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {assignee.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-[120px]">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.lastContact 
                            ? format(new Date(lead.lastContact), "dd.MM.yy HH:mm", { locale: de }) 
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.createdAt), "dd.MM.yy", { locale: de })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-background"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedLeadId(lead.id)}>
                                Ansehen & Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleDelete(e as any, lead.id)}
                              >
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
            <span>{filteredLeads.length} Leads in dieser Ansicht</span>
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