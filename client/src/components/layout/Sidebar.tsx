import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Import } from "lucide-react";
import logoUrl from "@assets/Logo__1772444817188.png";
import { useAppState } from "@/lib/app-state";

export function Sidebar() {
  const [location] = useLocation();
  const { isPartner, notifications } = useAppState();
  const unseenCount = notifications.length;

  const navItems = [
    {
      title: "Sales",
      items: [
        { href: "/leads", icon: Users, label: "Neue Leads", partnerAllowed: true },
        { href: "/active-leads", icon: LayoutDashboard, label: "Aktive Leads", partnerAllowed: false },
        { href: "/lost-leads", icon: Users2, label: "Verlorene Leads", partnerAllowed: false },
      ]
    },
    {
      title: "Kunden",
      items: [
        { href: "/customers", icon: Users2, label: "Kunden", partnerAllowed: false },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/import", icon: Import, label: "Import", partnerAllowed: false },
      ]
    }
  ];

  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-full">
      <div className="h-28 flex items-center px-6 border-b border-border/50 py-4">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer w-full">
            <img src={logoUrl} alt="HANDWERKS SEO" className="w-44 object-contain mb-3" />
            <span className="font-black text-sm text-[#4a4a4a] tracking-widest">| CRM |</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6">
        {navItems.map((group, i) => (
          <div key={i} className="mb-8 px-4">
            <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.startsWith(item.href);
                const isLocked = isPartner && !item.partnerAllowed;

                if (isLocked) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium opacity-35 cursor-not-allowed select-none"
                      title="Kein Zugriff"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  );
                }

                const showBadge = isPartner && item.href === "/leads" && unseenCount > 0;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full" data-testid="badge-unseen-count">
                          {unseenCount > 9 ? "9+" : unseenCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
