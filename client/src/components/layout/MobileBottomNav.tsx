import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Import, Plus } from "lucide-react";

interface MobileBottomNavProps {
  onNewLead?: () => void;
}

export function MobileBottomNav({ onNewLead }: MobileBottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/leads", icon: Users, label: "Leads" },
    { href: "/active-leads", icon: LayoutDashboard, label: "Aktiv" },
    { href: "/lost-leads", icon: Users2, label: "Verloren" },
    { href: "/import", icon: Import, label: "Import" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border/60 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors cursor-pointer min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {onNewLead && (
          <button
            onClick={onNewLead}
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Neu</span>
          </button>
        )}

        {!onNewLead && <div className="min-w-[56px]" />}

        {navItems.slice(2).map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors cursor-pointer min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
