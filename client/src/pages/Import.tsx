import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import * as XLSX from "xlsx";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ParsedRow = Record<string, string>;

const FIELD_MAP: Record<string, string[]> = {
  name:    ["name", "vorname", "nachname", "fullname", "full name", "kontakt", "contact"],
  company: ["firma", "company", "unternehmen", "organisation", "organization"],
  email:   ["email", "e-mail", "mail", "e mail"],
  phone:   ["telefon", "phone", "tel", "mobile", "handy", "mobil"],
  website: ["website", "webseite", "url", "homepage"],
  address: ["adresse", "address", "ort", "city", "stadt"],
  notes:   ["notiz", "notes", "anmerkung", "kommentar", "comment", "beschreibung"],
};

function detectColumn(headers: string[], targets: string[]): string | null {
  for (const h of headers) {
    if (targets.includes(h.toLowerCase().trim())) return h;
  }
  return null;
}

function buildMapping(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    mapping[field] = detectColumn(headers, aliases);
  }
  return mapping;
}

function rowToLead(row: ParsedRow, mapping: Record<string, string | null>) {
  const get = (field: string) => (mapping[field] ? (row[mapping[field]!] || "").trim() : "");
  return {
    name: get("name") || "Unbekannt",
    company: get("company") || "Unbekannt",
    email: get("email"),
    phone: get("phone"),
    website: get("website"),
    address: get("address"),
    notes: get("notes"),
    source: "Tool-Import" as const,
    status: "Neu" as const,
    assignedTo: null,
  };
}

export default function Import() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const parseFile = (file: File) => {
    setError(null);
    setResults(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: ParsedRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (json.length === 0) {
          setError("Die Datei enthält keine Daten.");
          return;
        }

        const hdrs = Object.keys(json[0]);
        setHeaders(hdrs);
        setRows(json);
        setMapping(buildMapping(hdrs));
      } catch {
        setError("Datei konnte nicht gelesen werden. Bitte CSV oder Excel-Datei verwenden.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setResults(null);
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      const lead = rowToLead(row, mapping);
      try {
        await apiRequest("POST", "/api/leads", lead);
        success++;
      } catch {
        failed++;
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    setResults({ success, failed });
    setImporting(false);
  };

  const reset = () => {
    setHeaders([]);
    setRows([]);
    setMapping({});
    setFileName("");
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mappedFields = Object.entries(mapping).filter(([, v]) => v !== null);
  const hasName = !!mapping["name"];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datenimport</h1>
          <p className="text-muted-foreground mt-1">Importieren Sie Leads aus CSV oder Excel-Dateien.</p>
        </div>

        {!rows.length && (
          <Card
            className={`border-dashed border-2 transition-colors ${dragging ? "border-primary bg-primary/5" : "bg-muted/10"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-background rounded-full shadow-sm flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CSV oder Excel hochladen</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                Ziehen Sie Ihre Datei hierher oder klicken Sie, um eine Datei auszuwählen.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-import-file"
              />
              <Button size="lg" className="px-8 shadow-sm" onClick={() => fileInputRef.current?.click()} data-testid="button-select-file">
                Datei auswählen
              </Button>
              <p className="text-xs text-muted-foreground mt-4">Unterstützte Formate: .csv, .xlsx, .xls</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {rows.length > 0 && !results && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{fileName}</CardTitle>
                      <CardDescription>{rows.length} Zeilen erkannt</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={reset}>Andere Datei wählen</Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Spalten-Zuordnung</CardTitle>
                <CardDescription>Automatisch erkannte Zuordnungen — grün = erkannt, grau = nicht gefunden</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(FIELD_MAP).map(([field]) => {
                    const mapped = mapping[field];
                    const labels: Record<string, string> = {
                      name: "Name", company: "Firma", email: "E-Mail",
                      phone: "Telefon", website: "Website", address: "Adresse", notes: "Notizen"
                    };
                    return (
                      <div key={field} className={`flex items-center gap-3 p-3 rounded-lg border ${mapped ? "bg-green-50 border-green-200" : "bg-muted/30 border-dashed"}`}>
                        {mapped ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <span className="text-sm font-medium w-20 shrink-0">{labels[field]}</span>
                        {mapped ? (
                          <>
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <Badge variant="secondary" className="text-xs">{mapped}</Badge>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Nicht gefunden</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!hasName && (
                  <Alert className="mt-4 bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Keine Namensspalte erkannt. Alle Leads werden als "Unbekannt" importiert.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vorschau (erste 3 Zeilen)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="border-b">
                      {headers.slice(0, 6).map((h) => (
                        <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {headers.slice(0, 6).map((h) => (
                          <td key={h} className="py-2 pr-4 truncate max-w-[150px]">{row[h] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleImport} disabled={importing} size="lg" data-testid="button-start-import">
                {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {importing ? `Importiere...` : `${rows.length} Leads importieren`}
              </Button>
              <Button variant="outline" onClick={reset} disabled={importing}>Abbrechen</Button>
            </div>
          </div>
        )}

        {results && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-800">Import abgeschlossen!</h3>
                <p className="text-green-700 mt-1">
                  {results.success} Leads erfolgreich importiert
                  {results.failed > 0 && ` · ${results.failed} fehlgeschlagen`}
                </p>
              </div>
              <Button onClick={reset} data-testid="button-import-again">Weitere Datei importieren</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
