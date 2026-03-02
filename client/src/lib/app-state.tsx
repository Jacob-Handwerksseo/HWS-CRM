import React, { createContext, useContext, useState } from "react";
import { User, Lead, USERS, MOCK_LEADS, Activity, LeadStatus, LeadSource } from "./mock-data";

type AppStateContextType = {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "activities">) => void;
  updateLeadField: (leadId: string, field: keyof Lead, value: any) => void;
  deleteLead: (leadId: string) => void;
  
  addActivity: (leadId: string, text: string) => void;
  updateActivity: (leadId: string, activityId: string, text: string) => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const login = (userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addLead = (leadData: Omit<Lead, "id" | "createdAt" | "activities">) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "system",
          text: `Lead erstellt (${leadData.source})`,
          authorId: currentUser?.id || null,
          timestamp: new Date().toISOString(),
        }
      ]
    };
    setLeads([newLead, ...leads]);
  };

  const updateLeadField = (leadId: string, field: keyof Lead, value: any) => {
    setLeads(currentLeads => 
      currentLeads.map(lead => {
        if (lead.id !== leadId) return lead;
        
        // Log activity for specific field changes if we want to be fancy, 
        // but for now we just update the field.
        return { ...lead, [field]: value };
      })
    );
  };

  const deleteLead = (leadId: string) => {
    setLeads(currentLeads => currentLeads.filter(lead => lead.id !== leadId));
  };

  const addActivity = (leadId: string, text: string) => {
    if (!currentUser) return;
    
    setLeads(currentLeads => 
      currentLeads.map(lead => {
        if (lead.id !== leadId) return lead;
        
        const newActivity: Activity = {
          id: `act_${Date.now()}`,
          type: "comment",
          text,
          authorId: currentUser.id,
          timestamp: new Date().toISOString(),
        };
        
        return { ...lead, activities: [...lead.activities, newActivity] };
      })
    );
  };

  const updateActivity = (leadId: string, activityId: string, text: string) => {
    setLeads(currentLeads => 
      currentLeads.map(lead => {
        if (lead.id !== leadId) return lead;
        
        return {
          ...lead,
          activities: lead.activities.map(act => {
            if (act.id !== activityId) return act;
            return {
              ...act,
              text,
              updatedAt: new Date().toISOString()
            };
          })
        };
      })
    );
  };

  return (
    <AppStateContext.Provider value={{
      currentUser, login, logout,
      leads, addLead, updateLeadField, deleteLead,
      addActivity, updateActivity
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}