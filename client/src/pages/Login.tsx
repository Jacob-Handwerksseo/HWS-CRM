import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";
import logoUrl from "@assets/Logo__1772444817188.png";

export default function Login() {
  const { login } = useAppState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Bitte Benutzername und Passwort eingeben");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(username, password);
    if (!result.success) {
      setError(result.message || "Login fehlgeschlagen");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30" data-testid="login-page">
      <Card className="w-full max-w-sm shadow-xl border-0 bg-background/60 backdrop-blur-xl">
        <CardHeader className="text-center pb-2 pt-8 flex flex-col items-center">
          <img src={logoUrl} alt="HANDWERKS SEO Logo" className="w-64 object-contain mb-4" data-testid="img-logo" />
          <div className="text-2xl font-black text-[#4a4a4a] tracking-widest mb-2">| CRM |</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                placeholder="Benutzername eingeben"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center" data-testid="text-login-error">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
