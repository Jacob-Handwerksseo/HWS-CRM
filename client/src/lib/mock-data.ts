import { addDays, subDays, subHours, subMinutes } from "date-fns";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export const USERS: User[] = [
  { id: "user_a", name: "Anna Schmidt", avatar: "A" },
  { id: "user_b", name: "Ben Weber", avatar: "B" },
];

export type LeadStatus = "Neu" | "Kontaktiert" | "Qualifiziert" | "Verhandlung" | "Gewonnen" | "Verloren";
export type LeadSource = "Google Ads" | "Tool-Import" | "Manuell";

export type Activity = {
  id: string;
  type: "comment" | "system";
  text: string;
  authorId: string | null;
  timestamp: string;
  updatedAt?: string;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo: string | null; // userId or null for unassigned
  lastContact: string | null;
  nextFollowUp: string | null;
  phone: string;
  email: string;
  website: string;
  address: string;
  notes: string;
  createdAt: string;
  activities: Activity[];
};

const now = new Date();

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead_1",
    name: "Thomas Müller",
    company: "TechNova GmbH",
    status: "Neu",
    source: "Google Ads",
    assignedTo: "user_a",
    lastContact: null,
    nextFollowUp: addDays(now, 1).toISOString(),
    phone: "+49 151 1234567",
    email: "thomas.m@technova.de",
    website: "www.technova.de",
    address: "Technologiering 1, 10115 Berlin",
    notes: "Sucht nach einer neuen CRM Lösung für 50 Mitarbeiter.",
    createdAt: subDays(now, 1).toISOString(),
    activities: [
      { id: "act_1", type: "system", text: "Lead über Google Ads erfasst", authorId: null, timestamp: subDays(now, 1).toISOString() }
    ]
  },
  {
    id: "lead_2",
    name: "Sarah Becker",
    company: "WebSolutions AG",
    status: "Kontaktiert",
    source: "Tool-Import",
    assignedTo: "user_b",
    lastContact: subHours(now, 2).toISOString(),
    nextFollowUp: addDays(now, 3).toISOString(),
    phone: "+49 172 9876543",
    email: "s.becker@websolutions.com",
    website: "www.websolutions.com",
    address: "Digitalweg 5, 80331 München",
    notes: "Interessiert an Enterprise Paket.",
    createdAt: subDays(now, 5).toISOString(),
    activities: [
      { id: "act_2", type: "system", text: "Lead importiert", authorId: null, timestamp: subDays(now, 5).toISOString() },
      { id: "act_3", type: "comment", text: "Habe sie heute erreicht, Demo für nächste Woche vereinbart.", authorId: "user_b", timestamp: subHours(now, 2).toISOString() }
    ]
  },
  {
    id: "lead_3",
    name: "Michael Kraft",
    company: "Kraft & Söhne",
    status: "Neu",
    source: "Manuell",
    assignedTo: null,
    lastContact: null,
    nextFollowUp: addDays(now, 2).toISOString(),
    phone: "+49 30 555444",
    email: "info@kraft-soehne.de",
    website: "",
    address: "Handwerkergasse 12, 50667 Köln",
    notes: "Kaltakquise auf der Messe getroffen.",
    createdAt: subDays(now, 2).toISOString(),
    activities: [
      { id: "act_4", type: "comment", text: "Messekontakt von der dmexco.", authorId: "user_a", timestamp: subDays(now, 2).toISOString() }
    ]
  },
  {
    id: "lead_4",
    name: "Julia Neumann",
    company: "Nexus Design",
    status: "Qualifiziert",
    source: "Google Ads",
    assignedTo: "user_a",
    lastContact: subDays(now, 1).toISOString(),
    nextFollowUp: addDays(now, 5).toISOString(),
    phone: "+49 160 1112223",
    email: "julia@nexus-design.io",
    website: "nexus-design.io",
    address: "Kreativplatz 8, 20457 Hamburg",
    notes: "Budget ist vorhanden, Entscheidungsträgerin.",
    createdAt: subDays(now, 10).toISOString(),
    activities: [
      { id: "act_5", type: "system", text: "Lead über Google Ads erfasst", authorId: null, timestamp: subDays(now, 10).toISOString() },
      { id: "act_6", type: "comment", text: "Qualifizierungs-Call lief sehr gut. Schicke Angebot morgen.", authorId: "user_a", timestamp: subDays(now, 1).toISOString() }
    ]
  },
  {
    id: "lead_5",
    name: "Frank Hoffmann",
    company: "Hoffmann Logistics",
    status: "Verhandlung",
    source: "Tool-Import",
    assignedTo: "user_b",
    lastContact: subDays(now, 3).toISOString(),
    nextFollowUp: addDays(now, 1).toISOString(),
    phone: "+49 40 888999",
    email: "frank.h@h-logistics.de",
    website: "www.h-logistics.de",
    address: "Hafenstraße 100, 20457 Hamburg",
    notes: "Wir verhandeln über 10% Rabatt bei Jahresvertrag.",
    createdAt: subDays(now, 20).toISOString(),
    activities: []
  },
  {
    id: "lead_6",
    name: "Elena Wagner",
    company: "Green Future e.V.",
    status: "Gewonnen",
    source: "Manuell",
    assignedTo: "user_a",
    lastContact: subDays(now, 7).toISOString(),
    nextFollowUp: null,
    phone: "+49 151 777666",
    email: "ewagner@greenfuture.org",
    website: "greenfuture.org",
    address: "Ökoweg 1, 10115 Berlin",
    notes: "Vertrag ist unterschrieben!",
    createdAt: subDays(now, 30).toISOString(),
    activities: []
  },
  {
    id: "lead_7",
    name: "Dennis Richter",
    company: "Finance Direkt",
    status: "Verloren",
    source: "Google Ads",
    assignedTo: "user_b",
    lastContact: subDays(now, 14).toISOString(),
    nextFollowUp: null,
    phone: "+49 69 123123",
    email: "d.richter@finance-direkt.de",
    website: "",
    address: "Bankenviertel 5, 60311 Frankfurt",
    notes: "Haben sich für Konkurrenzprodukt entschieden (zu teuer).",
    createdAt: subDays(now, 45).toISOString(),
    activities: []
  },
  {
    id: "lead_8",
    name: "Laura Meyer",
    company: "EduTech",
    status: "Neu",
    source: "Google Ads",
    assignedTo: null,
    lastContact: null,
    nextFollowUp: null,
    phone: "+49 170 5556667",
    email: "laura@edutech.de",
    website: "edutech.de",
    address: "",
    notes: "",
    createdAt: subHours(now, 5).toISOString(),
    activities: []
  },
  {
    id: "lead_9",
    name: "Christian Wolf",
    company: "Wolf Consulting",
    status: "Kontaktiert",
    source: "Manuell",
    assignedTo: "user_a",
    lastContact: subMinutes(now, 30).toISOString(),
    nextFollowUp: addDays(now, 2).toISOString(),
    phone: "+49 89 777888",
    email: "cwolf@consulting-wolf.de",
    website: "",
    address: "",
    notes: "Erster Kontakt hergestellt. Rückruf am Freitag.",
    createdAt: subDays(now, 2).toISOString(),
    activities: []
  },
  {
    id: "lead_10",
    name: "Sophie Bauer",
    company: "HealthCare Plus",
    status: "Neu",
    source: "Tool-Import",
    assignedTo: "user_b",
    lastContact: null,
    nextFollowUp: addDays(now, 1).toISOString(),
    phone: "+49 152 3334445",
    email: "s.bauer@healthcare-plus.de",
    website: "",
    address: "Medizinring 2, 80331 München",
    notes: "Wichtiger Lead, sofort anrufen!",
    createdAt: subDays(now, 1).toISOString(),
    activities: []
  },
  {
    id: "lead_11",
    name: "Markus Lehmann",
    company: "Lehmann Bau",
    status: "Qualifiziert",
    source: "Manuell",
    assignedTo: "user_a",
    lastContact: subDays(now, 2).toISOString(),
    nextFollowUp: addDays(now, 4).toISOString(),
    phone: "+49 711 999000",
    email: "m.lehmann@lehmann-bau.de",
    website: "lehmann-bau.de",
    address: "Baustraße 4, 70173 Stuttgart",
    notes: "Suchen nach einer mobilen Lösung für Poliere.",
    createdAt: subDays(now, 12).toISOString(),
    activities: []
  },
  {
    id: "lead_12",
    name: "Nadine Koch",
    company: "Retail Partners",
    status: "Verhandlung",
    source: "Google Ads",
    assignedTo: "user_b",
    lastContact: subDays(now, 1).toISOString(),
    nextFollowUp: addDays(now, 2).toISOString(),
    phone: "+49 40 111222",
    email: "n.koch@retail-partners.de",
    website: "",
    address: "Einkaufsmeile 1, 20095 Hamburg",
    notes: "Entscheidung fällt nächste Woche.",
    createdAt: subDays(now, 25).toISOString(),
    activities: []
  },
  {
    id: "lead_13",
    name: "Simon Krause",
    company: "Smart Energy",
    status: "Neu",
    source: "Tool-Import",
    assignedTo: null,
    lastContact: null,
    nextFollowUp: null,
    phone: "+49 160 888777",
    email: "skrause@smart-energy.de",
    website: "",
    address: "",
    notes: "Importiert aus altem System.",
    createdAt: subDays(now, 3).toISOString(),
    activities: []
  },
  {
    id: "lead_14",
    name: "Tanja Schmid",
    company: "Schmid Gastro",
    status: "Kontaktiert",
    source: "Manuell",
    assignedTo: "user_a",
    lastContact: subDays(now, 4).toISOString(),
    nextFollowUp: addDays(now, 3).toISOString(),
    phone: "+49 89 555666",
    email: "t.schmid@schmid-gastro.de",
    website: "schmid-gastro.de",
    address: "Restaurantweg 8, 80331 München",
    notes: "Wartet auf Informationsmaterial.",
    createdAt: subDays(now, 6).toISOString(),
    activities: []
  },
  {
    id: "lead_15",
    name: "Oliver Jäger",
    company: "Jäger IT",
    status: "Neu",
    source: "Google Ads",
    assignedTo: "user_b",
    lastContact: null,
    nextFollowUp: addDays(now, 1).toISOString(),
    phone: "+49 171 444555",
    email: "oliver@jaeger-it.de",
    website: "jaeger-it.de",
    address: "Systemstraße 10, 10115 Berlin",
    notes: "Interessiert an API Integration.",
    createdAt: subHours(now, 12).toISOString(),
    activities: []
  }
];