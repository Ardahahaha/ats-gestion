import { useState, useEffect } from "react";
import { VehicleTable } from "@/components/VehicleTable";
import { Moon, Sun } from "lucide-react";

const Index = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-background transition-colors">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion des Véhicules
          </h1>
          <p className="text-sm text-muted-foreground">
            Tableau partagé — toutes les modifications sont visibles par tous
          </p>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={dark ? "Mode jour" : "Mode nuit"}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>
      <main className="container mx-auto py-8 px-4">
        <VehicleTable />
      </main>
    </div>
  );
};

export default Index;
