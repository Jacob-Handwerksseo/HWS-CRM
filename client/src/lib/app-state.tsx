import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

export type User = {
  id: string;
  username: string;
  name: string;
};

export type LeadStatus = "Neu" | "Erstkontakt" | "Setting" | "Closing" | "Wiedervorlage" | "Verlorener Lead";
export type LeadSource = "Tool-Import" | "Website Leads" | "Video-Analyse";

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
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;

  users: User[];
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
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isAuthLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!currentUser,
    queryFn: async () => {
      try {
        const res = await fetch("/api/users", { credentials: "include" });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const { data: rawLeads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: !!currentUser,
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
              const res = await fetch(`/api/leads/${lead.id}/activities`, { credentials: "include" });
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

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const user = await res.json();
      queryClient.setQueryData(["/api/auth/me"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      return { success: true };
    } catch (error: any) {
      const msg = error?.message?.includes("401") ? "Ungültige Anmeldedaten" : "Login fehlgeschlagen";
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {}
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
  };

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
      const res = await apiRequest("PATCH", `/api/leads/${id}`, data);
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
        currentUser: currentUser ?? null,
        isAuthLoading,
        login,
        logout,
        users: allUsers,
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
