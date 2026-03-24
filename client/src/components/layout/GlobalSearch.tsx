import { useState, useRef, useEffect, useCallback } from "react";
import { useAppState, type Lead } from "@/lib/app-state";
import { Search, User, Building2, Phone, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";

const statusColors: Record<string, string> = {
  "Neu": "bg-blue-100 text-blue-700 border-blue-200",
  "Erstkontakt": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Setting": "bg-purple-100 text-purple-700 border-purple-200",
  "Closing": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Wiedervorlage": "bg-orange-100 text-orange-700 border-orange-200",
  "Verlorener Lead": "bg-red-100 text-red-700 border-red-200",
};

function normalizePhone(phone: string): string {
  return phone
    .replace(/\D/g, "")
    .replace(/^0049/, "")
    .replace(/^49/, "")
    .replace(/^0/, "");
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function matchesQuery(lead: Lead, query: string): { match: boolean; score: number } {
  const q = normalize(query);
  const qPhone = normalizePhone(query);

  const name = normalize(lead.name);
  const company = normalize(lead.company || "");
  const email = normalize(lead.email || "");
  const phone = normalizePhone(lead.phone || "");

  if (!q) return { match: false, score: 0 };

  let score = 0;

  // Exact matches score highest
  if (name === q || company === q || email === q) score += 100;

  // Starts-with matches
  if (name.startsWith(q)) score += 80;
  if (company.startsWith(q)) score += 70;
  if (email.startsWith(q)) score += 60;

  // Contains matches
  if (name.includes(q)) score += 50;
  if (company.includes(q)) score += 40;
  if (email.includes(q)) score += 30;

  // Phone matching (normalized)
  if (qPhone.length >= 4) {
    if (phone === qPhone) score += 90;
    else if (phone.includes(qPhone) || qPhone.includes(phone)) score += 60;
  }

  // Fuzzy: check if all chars of query appear in name/company in order (typo tolerance)
  if (score === 0 && q.length >= 3) {
    const fields = [name, company, email];
    for (const field of fields) {
      let qi = 0;
      for (let i = 0; i < field.length && qi < q.length; i++) {
        if (field[i] === q[qi]) qi++;
      }
      if (qi === q.length) {
        score += 10;
        break;
      }
    }
  }

  return { match: score > 0, score };
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function GlobalSearch() {
  const { leads } = useAppState();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useCallback(() => {
    if (!query.trim()) return [];
    return leads
      .map(lead => ({ lead, ...matchesQuery(lead, query) }))
      .filter(r => r.match)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [leads, query])();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedLeadId(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Suchen..."
          className="w-full bg-muted/50 border-0 pl-9 pr-8 focus-visible:ring-1"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          data-testid="input-global-search"
        />
        {query && (
          <button
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {open && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-background border shadow-xl rounded-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Keine Ergebnisse für „{query}"
              </div>
            ) : (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
                  {results.length} Ergebnis{results.length !== 1 ? "se" : ""}
                </div>
                {results.map(({ lead }) => (
                  <button
                    key={lead.id}
                    className="w-full text-left px-3 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 flex items-start gap-3"
                    onClick={() => handleSelect(lead.id)}
                    data-testid={`search-result-${lead.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {highlightText(lead.name, query)}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${statusColors[lead.status] || ""}`}>
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {lead.company && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {highlightText(lead.company, query)}
                          </span>
                        )}
                        {lead.email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {highlightText(lead.email, query)}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {highlightText(lead.phone, query)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <LeadDetailDrawer
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </>
  );
}
