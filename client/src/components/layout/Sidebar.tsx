import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Settings, Import } from "lucide-react";
import logoUrl from "@assets/Logo_1772444623720.png";

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
      <div className="h-20 flex items-center px-6 border-b border-border/50 py-3">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <img src={logoUrl} alt="HANDWERKS SEO | CRM" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-primary leading-tight">HANDWERKS SEO</span>
              <span className="font-medium text-[10px] text-muted-foreground tracking-widest text-center leading-tight mt-0.5">| CRM |</span>
            </div>
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