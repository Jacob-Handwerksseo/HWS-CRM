import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { USERS } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User as UserIcon } from "lucide-react";
import logoUrl from "@assets/Logo_1772444623720.png";

export default function Login() {
  const { login } = useAppState();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/60 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <img src={logoUrl} alt="HANDWERKS SEO | CRM Logo" className="mx-auto w-16 h-16 object-contain mb-2" />
          <div className="flex flex-col items-center">
            <CardTitle className="text-3xl font-bold tracking-tight">HANDWERKS SEO</CardTitle>
            <div className="text-lg font-medium text-muted-foreground mt-1 tracking-widest">| CRM |</div>
          </div>
          <CardDescription>
            Wähle einen Test-User, um den Prototyp zu starten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {USERS.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="w-full h-16 text-lg justify-start px-6 bg-card hover:bg-accent hover:text-accent-foreground border-border/50 transition-all hover:scale-[1.02]"
              onClick={() => login(user.id)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 font-semibold">
                {user.avatar}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground font-normal">Admin Rolle</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}