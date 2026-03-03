import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/lib/app-state";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Leads from "@/pages/Leads";
import Customers from "@/pages/Customers";
import Integrations from "@/pages/Integrations";
import Import from "@/pages/Import";

import ActiveLeads from "@/pages/ActiveLeads";
import LostLeads from "@/pages/LostLeads";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/leads" />
      </Route>
      <Route path="/leads" component={Leads} />
      <Route path="/active-leads" component={ActiveLeads} />
      <Route path="/lost-leads" component={LostLeads} />
      <Route path="/customers" component={Customers} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/import" component={Import} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;