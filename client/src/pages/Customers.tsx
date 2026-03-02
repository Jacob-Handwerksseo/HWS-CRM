import { Layout } from "@/components/layout/Layout";
import { Users2 } from "lucide-react";

export default function Customers() {
  return (
    <Layout>
      <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Kundenbereich</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Hier entsteht die Ansicht für alle gewonnenen Kunden. 
          Das Design-Pattern wird identisch zum Leads-Bereich sein (Tabelle + Detail-Drawer).
        </p>
      </div>
    </Layout>
  );
}