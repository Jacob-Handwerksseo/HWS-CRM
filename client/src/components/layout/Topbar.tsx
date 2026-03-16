import { useAppState } from "@/lib/app-state";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

interface TopbarProps {
  onNewLead?: () => void;
}

export function Topbar({ onNewLead }: TopbarProps) {
  const { currentUser, logout } = useAppState();
  const [, navigate] = useLocation();

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Suchen nach Leads, Firmen, Kontakten..."
            className="w-full bg-muted/50 border-0 pl-9 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onNewLead && (
          <Button onClick={onNewLead} size="sm" className="hidden sm:flex shadow-sm hover:shadow">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Lead
          </Button>
        )}

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2" data-testid="button-user-menu">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none" data-testid="text-current-user">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground leading-none">Angemeldet als Admin</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")} data-testid="link-profile">
              Profil & Einstellungen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer" data-testid="button-logout">
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}