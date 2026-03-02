import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Settings2 } from "lucide-react";

export default function Integrations() {
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(false);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrationen</h1>
          <p className="text-muted-foreground mt-1">Verbinden Sie Ihre Marketing-Kanäle mit dem CRM.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 bg-[#4285F4]/10 rounded-xl flex items-center justify-center shrink-0">
                {/* SVG for Google G */}
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
              </div>
              <div className="flex-1">
                <CardTitle>Google Ads</CardTitle>
                <CardDescription>Automatische Lead-Erfassung aus Formularen</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="google-ads" 
                  checked={googleAdsEnabled} 
                  onCheckedChange={setGoogleAdsEnabled} 
                />
                <Label htmlFor="google-ads" className="sr-only">Aktivieren</Label>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 mb-4">
                Verbinden Sie Ihr Google Ads Konto, um Leads aus Ihren Lead-Formular-Erweiterungen 
                direkt in Nexus CRM zu importieren. Neue Leads erhalten automatisch die Quelle "Google Ads".
              </p>
              
              {googleAdsEnabled && (
                <Alert className="bg-primary/5 border-primary/20 text-primary">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Webhook Aktiv</AlertTitle>
                  <AlertDescription>
                    Später in der Entwicklung: Webhook/API ist aktiv. Neue Leads landen automatisch in der Sicht "Google Ads Leads".
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            {googleAdsEnabled && (
              <CardFooter className="bg-muted/30 border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
                  <Settings2 className="w-4 h-4" />
                  <span>Mapping der Formularfelder ist konfiguriert.</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}