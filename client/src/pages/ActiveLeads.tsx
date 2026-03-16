import { useState, useCallback, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAppState, LeadStatus } from "@/lib/app-state";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { LeadDeadline } from "@/components/leads/LeadDeadline";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Building2, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const COLUMNS: LeadStatus[] = ["Erstkontakt", "Setting", "Closing", "Wiedervorlage"];

export default function ActiveLeads() {
  const { leads, updateLeadField, users } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  
  // Track recently moved leads for animation
  const [recentlyMoved, setRecentlyMoved] = useState<string | null>(null);

  // Clear animation after some time
  useEffect(() => {
    if (recentlyMoved) {
      const timer = setTimeout(() => {
        setRecentlyMoved(null);
      }, 3000); // Pulse for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [recentlyMoved]);

  // Handle drag end
  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as LeadStatus;
    
    // Update lead status
    updateLeadField(draggableId, "status", newStatus);
    
    // Trigger animation
    setRecentlyMoved(draggableId);
    
  }, [updateLeadField]);

  // Group and sort leads by status and deadline
  const leadsByStatus = COLUMNS.reduce((acc, status) => {
    // Filter by status
    const statusLeads = leads.filter((l) => l.status === status);
    
    // Sort by deadline: Overdue -> Today -> Future -> No deadline
    statusLeads.sort((a, b) => {
      if (!a.nextFollowUp && !b.nextFollowUp) return 0;
      if (!a.nextFollowUp) return 1;
      if (!b.nextFollowUp) return -1;
      
      const dateA = new Date(a.nextFollowUp).getTime();
      const dateB = new Date(b.nextFollowUp).getTime();
      return dateA - dateB;
    });

    acc[status] = statusLeads;
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

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
            {COLUMNS.map((status) => (
              <div key={status} className="flex flex-col bg-muted/30 rounded-xl border border-border/50 h-full max-h-full flex-1 min-w-[250px] max-w-[400px]">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card rounded-t-xl shrink-0">
                  <h3 className="font-semibold">{status}</h3>
                  <Badge variant="secondary" className="bg-background">
                    {leadsByStatus[status].length}
                  </Badge>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      } transition-colors`}
                    >
                      {leadsByStatus[status].map((lead, index) => {
                        const assignedUser = users.find(u => u.id === lead.assignedTo);
                        const isRecentlyMoved = recentlyMoved === lead.id;
                        
                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <Card 
                                  className={`cursor-pointer transition-all duration-500 ${
                                    snapshot.isDragging ? "border-primary shadow-xl scale-105 z-50 relative rotate-2" : "hover:border-primary/50 shadow-sm"
                                  } ${isRecentlyMoved ? "ring-2 ring-primary bg-primary/10 animate-pulse scale-[1.02]" : ""}`}
                                  onClick={() => setSelectedLeadId(lead.id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="font-medium text-base truncate pr-2">{lead.name}</div>
                                      {assignedUser && (
                                        <Avatar className="w-6 h-6 border shadow-sm shrink-0">
                                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {assignedUser.name.charAt(0).toUpperCase()}
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
                                    
                                    <LeadDeadline leadId={lead.id} deadline={lead.nextFollowUp} variant="badge" className="mt-1" />
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
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
