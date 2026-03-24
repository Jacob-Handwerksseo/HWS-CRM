import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAppState } from "@/lib/app-state";
import Login from "@/pages/Login";

export function Layout({ children, onNewLead }: { children: ReactNode, onNewLead?: () => void }) {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onNewLead={onNewLead} />
        <main className="flex-1 overflow-auto bg-muted/10 relative pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav onNewLead={onNewLead} />
    </div>
  );
}
