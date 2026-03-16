import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Leads from "@/pages/Leads";
import Customers from "@/pages/Customers";
import EmailInbox from "@/pages/EmailInbox";
import Import from "@/pages/Import";
import Profile from "@/pages/Profile";
import ActiveLeads from "@/pages/ActiveLeads";
import LostLeads from "@/pages/LostLeads";
import { Loader2 } from "lucide-react";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/leads" />
      </Route>
      <Route path="/leads" component={Leads} />
      <Route path="/active-leads" component={ActiveLeads} />
      <Route path="/lost-leads" component={LostLeads} />
      <Route path="/customers" component={Customers} />
      <Route path="/email-inbox" component={EmailInbox} />
      <Route path="/import" component={Import} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRouter() {
  const { currentUser, isAuthLoading } = useAppState();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;
