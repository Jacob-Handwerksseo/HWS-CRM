import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Settings, Import } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      title: "Sales",
      items: [
        { href: "/leads", icon: Users, label: "Leads" },
      ]
    },
    {
      title: "Kunden",
      items: [
        { href: "/customers", icon: Users2, label: "Kunden" },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/integrations", icon: Settings, label: "Integrationen" },
        { href: "/import", icon: Import, label: "Import" },
      ]
    }
  ];

  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
              N
            </div>
            NEXUS
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
                      {item.label}
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