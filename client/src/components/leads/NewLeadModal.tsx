import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { USERS } from "@/lib/mock-data";

type NewLeadModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewLeadModal({ open, onClose }: NewLeadModalProps) {
  const { addLead, currentUser } = useAppState();
  
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    source: "Manuell",
    assignedTo: currentUser?.id || "unassigned"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addLead({
      name: formData.name,
      company: formData.company,
      source: formData.source as any,
      status: "Neu",
      assignedTo: formData.assignedTo === "unassigned" ? null : formData.assignedTo,
      lastContact: null,
      nextFollowUp: null,
      phone: "",
      email: "",
      website: "",
      address: "",
      notes: ""
    });

    // Reset form
    setFormData({
      name: "",
      company: "",
      source: "Manuell",
      assignedTo: currentUser?.id || "unassigned"
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Lead anlegen</DialogTitle>
          <DialogDescription>
            Erfassen Sie einen neuen Lead mit den wichtigsten Basisdaten.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Kontaktperson) *</Label>
            <Input 
              id="name" 
              required
              placeholder="z.B. Max Mustermann" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Firma</Label>
            <Input 
              id="company" 
              placeholder="z.B. Mustermann GmbH" 
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Quelle</Label>
              <Select 
                value={formData.source} 
                onValueChange={(val) => setFormData({...formData, source: val})}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Quelle wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manuell">Manuell</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Tool-Import">Tool-Import</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Zugewiesen an</Label>
              <Select 
                value={formData.assignedTo} 
                onValueChange={(val) => setFormData({...formData, assignedTo: val})}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Zuweisen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                  {USERS.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={!formData.name}>Lead erstellen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}