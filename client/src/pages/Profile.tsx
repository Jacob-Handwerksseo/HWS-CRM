import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAppState } from "@/lib/app-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { currentUser } = useAppState();
  const queryClient = useQueryClient();

  const [name, setName] = useState(currentUser?.name || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setProfileLoading(true);

    try {
      const res = await apiRequest("PATCH", "/api/auth/profile", { name, username });
      const updated = await res.json();
      queryClient.setQueryData(["/api/auth/me"], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setProfileMsg("Profil erfolgreich aktualisiert");
    } catch (error: any) {
      const msg = error?.message?.includes("400") ? "Benutzername bereits vergeben" : "Update fehlgeschlagen";
      setProfileError(msg);
    }
    setProfileLoading(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");

    if (newPassword.length < 4) {
      setPwError("Passwort muss mindestens 4 Zeichen lang sein");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwörter stimmen nicht überein");
      return;
    }

    setPwLoading(true);
    try {
      await apiRequest("PATCH", "/api/auth/profile", { currentPassword, newPassword });
      setPwMsg("Passwort erfolgreich geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg = error?.message?.includes("400") ? "Aktuelles Passwort ist falsch" : "Passwort-Änderung fehlgeschlagen";
      setPwError(msg);
    }
    setPwLoading(false);
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-profile-name">{currentUser.name}</h1>
            <p className="text-muted-foreground">Admin</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profildaten</CardTitle>
            <CardDescription>Name und Benutzername bearbeiten</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Anzeigename</Label>
                <Input
                  id="profile-name"
                  data-testid="input-profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-username">Benutzername</Label>
                <Input
                  id="profile-username"
                  data-testid="input-profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Benutzername"
                />
              </div>

              {profileMsg && (
                <p className="text-sm text-green-600 flex items-center gap-1" data-testid="text-profile-success">
                  <Check className="w-4 h-4" /> {profileMsg}
                </p>
              )}
              {profileError && (
                <p className="text-sm text-destructive" data-testid="text-profile-error">{profileError}</p>
              )}

              <Button type="submit" disabled={profileLoading} data-testid="button-save-profile">
                {profileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Passwort ändern</CardTitle>
            <CardDescription>Aktualisiere dein Passwort für mehr Sicherheit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">Aktuelles Passwort</Label>
                <Input
                  id="current-pw"
                  data-testid="input-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Aktuelles Passwort"
                  autoComplete="current-password"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="new-pw">Neues Passwort</Label>
                <Input
                  id="new-pw"
                  data-testid="input-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Neues Passwort"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Neues Passwort bestätigen</Label>
                <Input
                  id="confirm-pw"
                  data-testid="input-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                />
              </div>

              {pwMsg && (
                <p className="text-sm text-green-600 flex items-center gap-1" data-testid="text-password-success">
                  <Check className="w-4 h-4" /> {pwMsg}
                </p>
              )}
              {pwError && (
                <p className="text-sm text-destructive" data-testid="text-password-error">{pwError}</p>
              )}

              <Button type="submit" disabled={pwLoading} data-testid="button-save-password">
                {pwLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Passwort ändern
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
