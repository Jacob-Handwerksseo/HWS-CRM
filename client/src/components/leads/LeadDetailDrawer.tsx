import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/lib/app-state";
import type { LeadStatus, LeadSource } from "@/lib/app-state";
import { InlineEdit } from "./InlineEdit";
import { ActivityFeed } from "./ActivityFeed";
import { LeadDeadline } from "./LeadDeadline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, Mail, Phone, Globe, MapPin, 
  UserCircle2, Calendar, Edit3, Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type LeadDetailDrawerProps = {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
};

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "Erstkontakt": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  "Setting": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  "Closing": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  "Wiedervorlage": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "Verlorener Lead": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function LeadDetailDrawer({ leadId, open, onClose }: LeadDetailDrawerProps) {
  const { leads, updateLeadField, deleteLead, users } = useAppState();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const lead = leads.find(l => l.id === leadId);

  if (!lead) return null;

  const assignedUser = users.find(u => u.id === lead.assignedTo);

  const statusOptions = ["Neu", "Erstkontakt", "Setting", "Closing", "Wiedervorlage", "Verlorener Lead"].map(s => ({ label: s, value: s }));
  const userOptions = [{ label: "Nicht zugewiesen", value: "unassigned" }, ...users.map(u => ({ label: u.name, value: u.id }))];

  const handleDelete = () => {
    deleteLead(lead.id);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => {
      if (!o) {
        setIsEditingMode(false);
        onClose();
      }
    }}>
      <SheetContent className="w-full sm:max-w-[600px] md:max-w-[700px] p-0 flex flex-col border-l-0 sm:border-l shadow-2xl bg-card">
        {/* Header Section */}
        <div className="px-6 py-5 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className={`h-8 px-3 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity border-transparent ${statusColors[lead.status] || ""}`}>
                      {lead.status}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Status ändern</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((opt) => (
                      <DropdownMenuItem 
                        key={opt.value} 
                        onClick={() => updateLeadField(lead.id, "status", opt.value as LeadStatus)}
                        className={lead.status === opt.value ? "bg-muted/50 font-medium" : ""}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge variant="outline" className="h-8 px-3 text-sm font-medium border-foreground/80 text-foreground bg-background hover:bg-muted/50 transition-colors">
                  {lead.source}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="h-8 inline-flex items-center gap-2 pl-1 pr-3 rounded-full border border-border bg-background text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
                      {assignedUser ? (
                        <>
                          <Avatar className="w-6 h-6 border-none">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {assignedUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground">{assignedUser.name}</span>
                        </>
                      ) : (
                        <>
                          <UserCircle2 className="w-6 h-6 text-muted-foreground/50 ml-1" />
                          <span className="text-muted-foreground/70">Zuweisen</span>
                        </>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Zuständigkeit</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => updateLeadField(lead.id, "assignedTo", null)}
                      className={!lead.assignedTo ? "bg-muted/50 font-medium" : ""}
                    >
                      Niemand (Nicht zugewiesen)
                    </DropdownMenuItem>
                    {userOptions.filter(u => u.value !== "unassigned").map((opt) => (
                      <DropdownMenuItem 
                        key={opt.value} 
                        onClick={() => updateLeadField(lead.id, "assignedTo", opt.value)}
                        className={lead.assignedTo === opt.value ? "bg-muted/50 font-medium" : ""}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <LeadDeadline leadId={lead.id} deadline={lead.nextFollowUp} variant="picker" />
              </div>
              <SheetTitle className="text-3xl font-bold mb-1 tracking-tight">{lead.name}</SheetTitle>
              {lead.role && (
                <div className="text-sm text-muted-foreground mb-1.5 font-medium">
                  {lead.role}
                </div>
              )}
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Building2 className="w-4 h-4" />
                {lead.company}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant={isEditingMode ? "secondary" : "ghost"} 
                size="icon" 
                className={isEditingMode ? "h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20" : "h-9 w-9 text-muted-foreground hover:text-foreground"}
                onClick={() => setIsEditingMode(!isEditingMode)}
                title={isEditingMode ? "Bearbeitungsmodus beenden" : "Bearbeitungsmodus aktivieren"}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Lead unwiderruflich löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie den Lead <strong>{lead.name}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden und alle zugehörigen Daten und Aktivitäten werden entfernt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Ja, löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8 pb-20">
            
            {/* Status & Assignment Header (Edit Mode only or always shown?)
                The prompt says "Zuständig und Status soll oben neben 'neu' also lead art und leadquelle nebendran stehen."
                But they still need to be editable. Let's move the edit fields to the top.
            */}
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Building2 className="w-3.5 h-3.5" /> Unternehmen
                </label>
                <InlineEdit 
                  value={lead.company}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "company", val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <UserCircle2 className="w-3.5 h-3.5" /> Ansprechpartner
                </label>
                <InlineEdit 
                  value={lead.name}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "name", val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <UserCircle2 className="w-3.5 h-3.5" /> Rolle / Position
                </label>
                <InlineEdit 
                  value={lead.role || ""}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "role", val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Mail className="w-3.5 h-3.5" /> E-Mail
                </label>
                <InlineEdit 
                  value={lead.email}
                  type="email"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "email", val)}
                  copyable
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Phone className="w-3.5 h-3.5" /> Telefon
                </label>
                <InlineEdit 
                  value={lead.phone}
                  type="tel"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "phone", val)}
                  copyable
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> Adresse
                </label>
                <InlineEdit 
                  value={lead.address}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "address", val)}
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                {isEditingMode ? (
                  <InlineEdit
                    value={lead.website}
                    isEditingMode={isEditingMode}
                    onSave={(val) => updateLeadField(lead.id, "website", val)}
                  />
                ) : lead.website ? (
                  <a
                    href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline py-1.5 block break-all"
                  >
                    {lead.website}
                  </a>
                ) : (
                  <div className="py-1.5 text-sm text-muted-foreground italic">Leer</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Allgemeine Notizen
              </label>
              <InlineEdit 
                value={lead.notes}
                type="textarea"
                isEditingMode={isEditingMode}
                onSave={(val) => updateLeadField(lead.id, "notes", val)}
                className="text-foreground/90 whitespace-pre-wrap"
              />
            </div>

            {/* Meta Data */}
            <div className="bg-muted/20 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Erstellt am</span>
                <span className="font-medium">{format(new Date(lead.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Quelle</span>
                <span className="font-medium">{lead.source}</span>
                {isEditingMode && (
                  <span className="text-[10px] text-muted-foreground block mt-1">(Quelle ist schreibgeschützt)</span>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="mt-8 h-[500px]">
              <ActivityFeed leadId={lead.id} />
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}