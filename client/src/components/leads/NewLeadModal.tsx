import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";

type NewLeadModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewLeadModal({ open, onClose }: NewLeadModalProps) {
  const { addLead, currentUser, users } = useAppState();

  const [formData, setFormData] = useState({
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "",
    source: "Tool-Import",
    assignedTo: currentUser?.id || "unassigned",
  });

  const set = (field: string, val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || "Unbekannt";

    addLead({
      name: fullName,
      company: formData.company,
      source: formData.source as any,
      status: "Neu",
      assignedTo: formData.assignedTo === "unassigned" ? null : formData.assignedTo,
      lastContact: null,
      nextFollowUp: null,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      address: "",
      notes: "",
    });

    setFormData({
      company: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      website: "",
      source: "Tool-Import",
      assignedTo: currentUser?.id || "unassigned",
    });

    onClose();
  };

  const canSubmit = formData.company.trim() || formData.firstName.trim() || formData.lastName.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Lead anlegen</DialogTitle>
          <DialogDescription>
            Erfassen Sie einen neuen Lead mit den wichtigsten Basisdaten.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="company">Unternehmensname *</Label>
            <Input
              id="company"
              placeholder="z.B. Mustermann GmbH"
              value={formData.company}
              onChange={e => set("company", e.target.value)}
              autoFocus
              data-testid="input-new-lead-company"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                placeholder="z.B. Max"
                value={formData.firstName}
                onChange={e => set("firstName", e.target.value)}
                data-testid="input-new-lead-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                placeholder="z.B. Mustermann"
                value={formData.lastName}
                onChange={e => set("lastName", e.target.value)}
                data-testid="input-new-lead-lastname"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="z.B. max@mustermann.de"
              value={formData.email}
              onChange={e => set("email", e.target.value)}
              data-testid="input-new-lead-email"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 123 456789"
                value={formData.phone}
                onChange={e => set("phone", e.target.value)}
                data-testid="input-new-lead-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Webseite</Label>
              <Input
                id="website"
                placeholder="www.mustermann.de"
                value={formData.website}
                onChange={e => set("website", e.target.value)}
                data-testid="input-new-lead-website"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="source">Quelle</Label>
              <Select value={formData.source} onValueChange={val => set("source", val)}>
                <SelectTrigger id="source" data-testid="select-new-lead-source">
                  <SelectValue placeholder="Quelle wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tool-Import">Tool-Import</SelectItem>
                  <SelectItem value="Website Leads">Website Leads</SelectItem>
                  <SelectItem value="Video-Analyse">Video-Analyse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Zugewiesen an</Label>
              <Select value={formData.assignedTo} onValueChange={val => set("assignedTo", val)}>
                <SelectTrigger id="assignee" data-testid="select-new-lead-assignee">
                  <SelectValue placeholder="Zuweisen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={!canSubmit} data-testid="button-create-lead">
              Lead erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
