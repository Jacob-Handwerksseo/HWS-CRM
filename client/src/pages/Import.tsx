import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, ArrowRight } from "lucide-react";

export default function Import() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datenimport</h1>
          <p className="text-muted-foreground mt-1">Importieren Sie Leads und Kunden aus anderen Systemen.</p>
        </div>

        <Card className="border-dashed border-2 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-background rounded-full shadow-sm flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">CSV oder Excel hochladen</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Ziehen Sie Ihre Datei hierher oder klicken Sie, um eine Datei von Ihrem Computer auszuwählen.
            </p>
            <Button size="lg" className="px-8 shadow-sm hover:shadow">
              Datei auswählen
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                Schritt 1: Mapping
              </CardTitle>
              <CardDescription>Ordnen Sie die Spalten zu</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Vorname (CSV)</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-muted px-2 py-1 rounded">Name (CRM)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">E-Mail Adresse</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-muted px-2 py-1 rounded">E-Mail (CRM)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schritt 2: Import-Details</CardTitle>
              <CardDescription>Quelle und Zuweisung</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <span className="block text-muted-foreground mb-1">Standard-Quelle</span>
                <span className="font-medium">Tool-Import</span>
              </div>
              <div>
                <span className="block text-muted-foreground mb-1">Zuweisung</span>
                <span className="font-medium">Nicht zugewiesen</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}