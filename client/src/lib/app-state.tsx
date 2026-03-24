import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
  deleteActivity: (leadId: string, activityId: string) => void;
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

  // Ref so the useEffect can always read the current map without being in the dependency array
  const activitiesMapRef = useRef<Record<string, Activity[]>>({});
  activitiesMapRef.current = activitiesMap;

  // Only re-run when the set of lead IDs changes (new lead added / lead deleted)
  // NOT when lead data changes (e.g. lastContact update after comment)
  const leadIds = rawLeads.map(l => l.id).join(",");

  useEffect(() => {
    if (!leadIds) return;

    const missingLeads = rawLeads.filter(l => !activitiesMapRef.current[l.id]);
    if (missingLeads.length === 0) return;

    missingLeads.forEach(async (lead) => {
      try {
        const res = await fetch(`/api/leads/${lead.id}/activities`, { credentials: "include" });
        const acts = res.ok ? await res.json() : [];
        setActivitiesMap(prev => ({ ...prev, [lead.id]: acts }));
      } catch {
        setActivitiesMap(prev => ({ ...prev, [lead.id]: [] }));
      }
    });
  }, [leadIds]);

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
    setActivitiesMap({});
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
      // Invalidate leads so the new lead appears — leadIds change will trigger activity fetch for it
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
    onSuccess: (updatedLead: Lead) => {
      // Update only the affected lead in the cache — no full refetch, no activity reload
      queryClient.setQueryData(["/api/leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(l => l.id === updatedLead.id ? updatedLead : l);
      });
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
    onSuccess: (_, id) => {
      // Remove lead from cache and clean up activities map
      queryClient.setQueryData(["/api/leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.filter(l => l.id !== id);
      });
      setActivitiesMap(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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
      return res.json() as Promise<Activity>;
    },
    onSuccess: (newActivity: Activity) => {
      // Instantly add new activity to local map — no server refetch needed
      setActivitiesMap(prev => ({
        ...prev,
        [newActivity.leadId]: [newActivity, ...(prev[newActivity.leadId] || [])],
      }));
      // Update lastContact locally in the leads cache — no full refetch
      queryClient.setQueryData(["/api/leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(l =>
          l.id === newActivity.leadId
            ? { ...l, lastContact: newActivity.timestamp }
            : l
        );
      });
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
    mutationFn: async ({ leadId, activityId, text }: { leadId: string; activityId: string; text: string }) => {
      const res = await apiRequest("PATCH", `/api/activities/${activityId}`, { text });
      return res.json() as Promise<Activity>;
    },
    onSuccess: (updated: Activity, { leadId }) => {
      setActivitiesMap(prev => ({
        ...prev,
        [leadId]: (prev[leadId] || []).map(a => a.id === updated.id ? updated : a),
      }));
    },
  });

  const updateActivity = useCallback(
    (leadId: string, activityId: string, text: string) => {
      updateActivityMutation.mutate({ leadId, activityId, text });
    },
    [updateActivityMutation]
  );

  const deleteActivityMutation = useMutation({
    mutationFn: async ({ activityId }: { leadId: string; activityId: string }) => {
      await apiRequest("DELETE", `/api/activities/${activityId}`);
    },
    onSuccess: (_, { leadId, activityId }) => {
      setActivitiesMap(prev => ({
        ...prev,
        [leadId]: (prev[leadId] || []).filter(a => a.id !== activityId),
      }));
    },
  });

  const deleteActivity = useCallback(
    (leadId: string, activityId: string) => {
      deleteActivityMutation.mutate({ leadId, activityId });
    },
    [deleteActivityMutation]
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
        deleteActivity,
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
