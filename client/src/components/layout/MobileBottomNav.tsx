import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Import, Plus } from "lucide-react";
import { useAppState } from "@/lib/app-state";

interface MobileBottomNavProps {
  onNewLead?: () => void;
}

export function MobileBottomNav({ onNewLead }: MobileBottomNavProps) {
  const [location] = useLocation();
  const { isPartner, notifications } = useAppState();
  const unseenCount = notifications.length;

  const allNavItems = [
    { href: "/leads", icon: Users, label: "Leads", partnerAllowed: true },
    { href: "/active-leads", icon: LayoutDashboard, label: "Aktiv", partnerAllowed: false },
    { href: "/lost-leads", icon: Users2, label: "Verloren", partnerAllowed: false },
    { href: "/import", icon: Import, label: "Import", partnerAllowed: false },
  ];

  const renderNavItem = (item: typeof allNavItems[0]) => {
    const isActive = location.startsWith(item.href);
    const isLocked = isPartner && !item.partnerAllowed;
    const showBadge = isPartner && item.href === "/leads" && unseenCount > 0;

    if (isLocked) {
      return (
        <div
          key={item.href}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg min-w-[56px] opacity-30 cursor-not-allowed"
        >
          <item.icon className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        <div className={cn(
          "flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors cursor-pointer min-w-[56px] relative",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          <div className="relative">
            <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
            {showBadge && (
              <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full" data-testid="badge-mobile-notif">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            )}
          </div>
          <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border/60 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {allNavItems.slice(0, 2).map(renderNavItem)}

        {onNewLead && !isPartner ? (
          <button
            onClick={onNewLead}
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Neu</span>
          </button>
        ) : (
          <div className="min-w-[56px]" />
        )}

        {allNavItems.slice(2).map(renderNavItem)}
      </div>
    </nav>
  );
}
