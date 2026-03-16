import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mail, Save, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function EmailInbox() {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [imapServer, setImapServer] = useState("imap.ionos.de");
  const [imapPort, setImapPort] = useState("993");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/email-config", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setImapServer(data.imapServer);
          setImapPort(data.imapPort.toString());
          setEmail(data.email);
          setEmailEnabled(data.enabled);
          setHasExistingConfig(true);
        }
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!imapServer || !email || !password) {
      setMessage({ type: "error", text: "Bitte alle Felder ausfüllen" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await apiRequest("POST", "/api/email-config", {
        imapServer,
        imapPort: parseInt(imapPort, 10),
        email,
        password,
        enabled: emailEnabled,
      });
      setMessage({ type: "success", text: emailEnabled ? "Konfiguration gespeichert. E-Mail-Abruf ist aktiv." : "Konfiguration gespeichert. E-Mail-Abruf ist deaktiviert." });
      setPassword("");
      setHasExistingConfig(true);
    } catch (error: any) {
      setMessage({ type: "error", text: "Speichern fehlgeschlagen" });
    }

    setSaving(false);
  };

  const handleTest = async () => {
    if (!imapServer || !email || !password) {
      setMessage({ type: "error", text: "Bitte alle Felder ausfüllen, um die Verbindung zu testen" });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const res = await apiRequest("POST", "/api/email-config/test", {
        imapServer,
        imapPort: parseInt(imapPort, 10),
        email,
        password,
      });
      const result = await res.json();
      setMessage({ type: result.success ? "success" : "error", text: result.message });
    } catch {
      setMessage({ type: "error", text: "Verbindungstest fehlgeschlagen" });
    }

    setTesting(false);
  };

  const handleCheckNow = async () => {
    setChecking(true);
    setMessage(null);

    try {
      const res = await apiRequest("POST", "/api/email-config/check-now");
      const result = await res.json();
      setMessage({ type: "success", text: result.message });
    } catch {
      setMessage({ type: "error", text: "Prüfung fehlgeschlagen" });
    }

    setChecking(false);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Mail Postfach</h1>
          <p className="text-muted-foreground mt-1">Verbinden Sie Ihre E-Mail Adresse, um Kontaktformulare automatisch als Leads zu erfassen.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>E-Mail Integration</CardTitle>
                <CardDescription>Automatische Lead-Erfassung aus Ihrem E-Mail-Postfach</CardDescription>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Switch
                  id="email-integration"
                  data-testid="switch-email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
                <Label htmlFor="email-integration" className="sr-only">Aktivieren</Label>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 mb-6">
                Leiten Sie Kontaktformulare von Ihrer Website oder Landingpages an dieses verbundene Postfach weiter.
                Jede eingehende E-Mail wird automatisch als neuer Lead im Status "Neu" im CRM angelegt.
              </p>

              {emailEnabled && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imap-server">IMAP Server</Label>
                      <Input
                        id="imap-server"
                        data-testid="input-imap-server"
                        placeholder="imap.ihr-provider.de"
                        value={imapServer}
                        onChange={(e) => setImapServer(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap-port">Port</Label>
                      <Input
                        id="imap-port"
                        data-testid="input-imap-port"
                        placeholder="993"
                        value={imapPort}
                        onChange={(e) => setImapPort(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail Adresse</Label>
                      <Input
                        id="email"
                        data-testid="input-imap-email"
                        type="email"
                        placeholder="anfragen@ihre-firma.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
                      <Input
                        id="password"
                        data-testid="input-imap-password"
                        type="password"
                        placeholder={hasExistingConfig ? "••••••••  (nur bei Änderung)" : "Passwort eingeben"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Alert className="bg-primary/5 border-primary/20 text-primary mt-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Hinweis zur Verarbeitung</AlertTitle>
                    <AlertDescription>
                      Das System prüft das Postfach alle 5 Minuten. Der Name, die E-Mail und die Telefonnummer
                      werden automatisch aus dem Text der E-Mail extrahiert, sofern vorhanden.
                      Doppelte E-Mail-Adressen werden nicht erneut als Lead angelegt.
                    </AlertDescription>
                  </Alert>

                  {message && (
                    <Alert className={message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                      {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button variant="outline" onClick={handleTest} disabled={testing} data-testid="button-test-connection">
                      {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Verbindung testen
                    </Button>

                    {hasExistingConfig && (
                      <Button variant="outline" onClick={handleCheckNow} disabled={checking} data-testid="button-check-now">
                        {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Jetzt prüfen
                      </Button>
                    )}

                    <Button onClick={handleSave} disabled={saving} data-testid="button-save-email-config">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Verbindung speichern
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
