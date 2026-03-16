import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export const USERS: User[] = [
  { id: "user_a", name: "André", avatar: "A" },
  { id: "user_b", name: "Jacob", avatar: "J" },
];

export type LeadStatus = "Neu" | "Erstkontakt" | "Setting" | "Closing" | "Wiedervorlage" | "Verlorener Lead";
export type LeadSource = "Google Ads" | "Organisch" | "Tool-Import" | "Manuell";

export type Activity = {
  id: string;
  leadId: string;
  type: "comment" | "system";
  text: string;
  authorId: string | null;
  timestamp: string;
  updatedAt?: string | null;
};

export type Lead = {
  id: string;
  name: string;
  role?: string | null;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo: string | null;
  lastContact: string | null;
  nextFollowUp: string | null;
  phone: string;
  email: string;
  website: string;
  address: string;
  notes: string;
  createdAt: string;
};

export type LeadWithActivities = Lead & { activities: Activity[] };

type AppStateContextType = {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;

  leads: LeadWithActivities[];
  isLoading: boolean;
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  updateLeadField: (leadId: string, field: keyof Lead, value: any) => void;
  deleteLead: (leadId: string) => void;

  addActivity: (leadId: string, text: string) => void;
  updateActivity: (leadId: string, activityId: string, text: string) => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: rawLeads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity[]>>({});
  const [activityVersion, setActivityVersion] = useState(0);

  useEffect(() => {
    if (rawLeads.length > 0) {
      const fetchAllActivities = async () => {
        const map: Record<string, Activity[]> = {};
        await Promise.all(
          rawLeads.map(async (lead) => {
            try {
              const res = await fetch(`/api/leads/${lead.id}/activities`);
              if (res.ok) {
                map[lead.id] = await res.json();
              }
            } catch {
              map[lead.id] = [];
            }
          })
        );
        setActivitiesMap(map);
      };
      fetchAllActivities();
    }
  }, [rawLeads, activityVersion]);

  const leads: LeadWithActivities[] = rawLeads.map((lead) => ({
    ...lead,
    activities: activitiesMap[lead.id] || [],
  }));

  const login = (userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: Omit<Lead, "id" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/leads", leadData);
      const lead = await res.json();
      await apiRequest("POST", `/api/leads/${lead.id}/activities`, {
        leadId: lead.id,
        type: "system",
        text: `Lead erstellt (${leadData.source})`,
        authorId: currentUser?.id || null,
      });
      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setActivityVersion((v) => v + 1);
    },
  });

  const addLead = async (leadData: Omit<Lead, "id" | "createdAt">) => {
    await createLeadMutation.mutateAsync(leadData);
  };

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const fieldMap: Record<string, string> = {
        assignedTo: "assignedTo",
        lastContact: "lastContact",
        nextFollowUp: "nextFollowUp",
      };
      const apiData: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        apiData[key] = value;
      }
      const res = await apiRequest("PATCH", `/api/leads/${id}`, apiData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const updateLeadField = useCallback(
    (leadId: string, field: keyof Lead, value: any) => {
      updateLeadMutation.mutate({ id: leadId, data: { [field]: value } });
    },
    [updateLeadMutation]
  );

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const deleteLead = useCallback(
    (leadId: string) => {
      deleteLeadMutation.mutate(leadId);
    },
    [deleteLeadMutation]
  );

  const addActivityMutation = useMutation({
    mutationFn: async ({ leadId, text }: { leadId: string; text: string }) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/activities`, {
        leadId,
        type: "comment",
        text,
        authorId: currentUser?.id || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setActivityVersion((v) => v + 1);
    },
  });

  const addActivity = useCallback(
    (leadId: string, text: string) => {
      if (!currentUser) return;
      addActivityMutation.mutate({ leadId, text });
    },
    [currentUser, addActivityMutation]
  );

  const updateActivityMutation = useMutation({
    mutationFn: async ({ activityId, text }: { activityId: string; text: string }) => {
      const res = await apiRequest("PATCH", `/api/activities/${activityId}`, { text });
      return res.json();
    },
    onSuccess: () => {
      setActivityVersion((v) => v + 1);
    },
  });

  const updateActivity = useCallback(
    (leadId: string, activityId: string, text: string) => {
      updateActivityMutation.mutate({ activityId, text });
    },
    [updateActivityMutation]
  );

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        login,
        logout,
        leads,
        isLoading: leadsLoading,
        addLead,
        updateLeadField,
        deleteLead,
        addActivity,
        updateActivity,
      }}
    >
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
