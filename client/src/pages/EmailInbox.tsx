import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mail, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailInbox() {
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Mail Postfach</h1>
          <p className="text-muted-foreground mt-1">Verbinden Sie Ihre E-Mail Adresse, um Kontaktformulare als Leads zu empfangen.</p>
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
                      <Input id="imap-server" placeholder="imap.ihr-provider.de" defaultValue="imap.ionos.de" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap-port">Port</Label>
                      <Input id="imap-port" placeholder="993" defaultValue="993" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail Adresse</Label>
                      <Input id="email" type="email" placeholder="anfragen@ihre-firma.de" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
                      <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  <Alert className="bg-primary/5 border-primary/20 text-primary mt-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Hinweis zur Verarbeitung</AlertTitle>
                    <AlertDescription>
                      Das System prüft das Postfach alle 5 Minuten. Der Name, die E-Mail und die Telefonnummer 
                      werden automatisch aus dem Text der E-Mail extrahiert, sofern vorhanden.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end pt-4">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
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