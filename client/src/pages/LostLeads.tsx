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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Trash2, UserCheck, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Erstkontakt": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  "Setting": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Closing": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Wiedervorlage": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Verlorener Lead": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function LostLeads() {
  const { leads, users } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sortCol, setSortCol] = useState<"lastContact" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (col: "lastContact" | "createdAt") => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: "lastContact" | "createdAt" }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const filteredLeads = leads
    .filter(lead => lead.status === "Verlorener Lead")
    .sort((a, b) => {
      const valA = a[sortCol] ? new Date(a[sortCol]!).getTime() : null;
      const valB = b[sortCol] ? new Date(b[sortCol]!).getTime() : null;
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

  const allVisibleIds = filteredLeads.map(l => l.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allVisibleIds));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedIds.size} Lead(s) unwiderruflich löschen?`)) return;
    setBulkLoading(true);
    await apiRequest("POST", "/api/leads/bulk-delete", { ids: Array.from(selectedIds) });
    await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkAssign = async (userId: string | null) => {
    setBulkLoading(true);
    await apiRequest("POST", "/api/leads/bulk-update", {
      ids: Array.from(selectedIds),
      data: { assignedTo: userId },
    });
    await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

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
          {someSelected && (
            <div className="px-4 py-2.5 bg-primary/5 border-b flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-primary">{selectedIds.size} ausgewählt</span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={bulkLoading}>
                      <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                      Zuweisen
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {users.map(u => (
                      <DropdownMenuItem key={u.id} onClick={() => handleBulkAssign(u.id)}>
                        <Avatar className="w-5 h-5 mr-2">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {u.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAssign(null)} className="text-muted-foreground">
                      Zuweisung entfernen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleBulkDelete} disabled={bulkLoading}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Löschen
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={bulkLoading}>
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Auswahl aufheben
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="font-semibold h-12">Name & Firma</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Quelle</TableHead>
                  <TableHead className="font-semibold h-12">Zuständig</TableHead>
                  <TableHead
                    className="font-semibold h-12 cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("lastContact")}
                  >
                    <div className="flex items-center gap-1">
                      Letzter Kontakt <SortIcon col="lastContact" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold h-12 cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Erstellt am <SortIcon col="createdAt" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Keine verlorenen Leads gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const assignedUser = users.find(u => u.id === lead.assignedTo);
                    const isSelected = selectedIds.has(lead.id);
                    return (
                      <TableRow
                        key={lead.id}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <TableCell
                          onClick={e => { e.stopPropagation(); toggleSelect(lead.id); }}
                          className="cursor-default"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {}}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{lead.company || lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.name}</div>
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
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {lead.lastContact
                              ? format(new Date(lead.lastContact), "dd.MM.yy HH:mm", { locale: de })
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(lead.createdAt), "dd.MM.yy", { locale: de })}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground">
            {filteredLeads.length} verlorene Leads
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
