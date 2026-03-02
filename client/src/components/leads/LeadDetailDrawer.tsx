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
import { USERS, LeadStatus, LeadSource } from "@/lib/mock-data";
import { InlineEdit } from "./InlineEdit";
import { ActivityFeed } from "./ActivityFeed";
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

type LeadDetailDrawerProps = {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
};

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Kontaktiert": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  "Qualifiziert": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Verhandlung": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Gewonnen": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Verloren": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export function LeadDetailDrawer({ leadId, open, onClose }: LeadDetailDrawerProps) {
  const { leads, updateLeadField, deleteLead } = useAppState();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const lead = leads.find(l => l.id === leadId);

  if (!lead) return null;

  const assignedUser = USERS.find(u => u.id === lead.assignedTo);

  const statusOptions = ["Neu", "Kontaktiert", "Qualifiziert", "Verhandlung", "Gewonnen", "Verloren"].map(s => ({ label: s, value: s }));
  const userOptions = [{ label: "Nicht zugewiesen", value: "unassigned" }, ...USERS.map(u => ({ label: u.name, value: u.id }))];

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
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className={statusColors[lead.status] || ""}>
                  {lead.status}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {lead.source}
                </Badge>
              </div>
              <SheetTitle className="text-2xl font-bold">{lead.name}</SheetTitle>
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Building2 className="w-4 h-4" />
                {lead.company}
              </div>
            </div>

            <div className="flex items-center gap-2">
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

          <div className="flex items-center justify-between mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-mode" 
                checked={isEditingMode} 
                onCheckedChange={setIsEditingMode} 
              />
              <Label htmlFor="edit-mode" className="flex items-center gap-1.5 cursor-pointer font-medium">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                Bearbeitungsmodus
              </Label>
            </div>
            
            {isEditingMode && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Klicke auf Felder zum Bearbeiten
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8 pb-20">
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserCircle2 className="w-3.5 h-3.5" /> Zuständig
                </label>
                <InlineEdit 
                  value={lead.assignedTo ? lead.assignedTo : "unassigned"}
                  options={userOptions}
                  type="select"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "assignedTo", val === "unassigned" ? null : val)}
                />
                {/* Visual representation when not editing */}
                {!isEditingMode && (
                  <div className="flex items-center gap-2 mt-1 absolute -translate-y-9 pointer-events-none bg-card px-1">
                    {assignedUser ? (
                      <>
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {assignedUser.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{assignedUser.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Nicht zugewiesen</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Status
                </label>
                <InlineEdit 
                  value={lead.status}
                  options={statusOptions}
                  type="select"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "status", val as LeadStatus)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> E-Mail
                </label>
                <InlineEdit 
                  value={lead.email}
                  type="email"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "email", val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefon
                </label>
                <InlineEdit 
                  value={lead.phone}
                  type="tel"
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "phone", val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                <InlineEdit 
                  value={lead.website}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "website", val)}
                  className="text-primary hover:underline"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Adresse
                </label>
                <InlineEdit 
                  value={lead.address}
                  isEditingMode={isEditingMode}
                  onSave={(val) => updateLeadField(lead.id, "address", val)}
                />
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